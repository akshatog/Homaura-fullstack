import express from "express";
import prisma from "../prisma/client.js";
import authenticateToken from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
    try {
        const addresses = await prisma.address.findMany({
            where: { userId: req.user.userId },
            orderBy: { createdAt: "desc" },
        });
        res.json(addresses);
    } catch (error) {
        console.error("Error fetching addresses:", error);
        res.status(500).json({ error: "Failed to fetch addresses" });
    }
});

router.post("/", authenticateToken, async (req, res) => {
    try {
        const { fullName, phone, email, address, city, state, pincode } = req.body;

        if (!fullName || !phone || !email || !address || !city || !state || !pincode) {
            return res.status(400).json({ error: "All fields are required" });
        }
        if (String(fullName).length > 100) return res.status(400).json({ error: "Full name must be 100 characters or fewer" });
        if (String(phone).length > 20)    return res.status(400).json({ error: "Phone must be 20 characters or fewer" });
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) return res.status(400).json({ error: "A valid email is required" });
        if (String(address).length > 500) return res.status(400).json({ error: "Address must be 500 characters or fewer" });
        if (String(city).length > 100)    return res.status(400).json({ error: "City must be 100 characters or fewer" });
        if (String(state).length > 100)   return res.status(400).json({ error: "State must be 100 characters or fewer" });
        if (!/^\d{1,10}$/.test(String(pincode))) return res.status(400).json({ error: "Pincode must be numeric and up to 10 digits" });

        const newAddress = await prisma.address.create({
            data: {
                userId: req.user.userId,
                fullName,
                phone,
                email,
                address,
                city,
                state,
                pincode,
            },
        });

        res.status(201).json(newAddress);
    } catch (error) {
        console.error("Error adding address:", error);
        res.status(500).json({ error: "Failed to add address" });
    }
});

router.put("/:id", authenticateToken, async (req, res) => {
    const addressId = parseInt(req.params.id, 10);
    if (isNaN(addressId)) return res.status(400).json({ error: "Invalid address ID" });

    try {
        const { fullName, phone, email, address, city, state, pincode } = req.body;

        if (fullName && String(fullName).length > 100) return res.status(400).json({ error: "Full name must be 100 characters or fewer" });
        if (phone && String(phone).length > 20)        return res.status(400).json({ error: "Phone must be 20 characters or fewer" });
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) return res.status(400).json({ error: "A valid email is required" });
        if (address && String(address).length > 500)   return res.status(400).json({ error: "Address must be 500 characters or fewer" });
        if (city && String(city).length > 100)         return res.status(400).json({ error: "City must be 100 characters or fewer" });
        if (state && String(state).length > 100)       return res.status(400).json({ error: "State must be 100 characters or fewer" });
        if (pincode && !/^\d{1,10}$/.test(String(pincode))) return res.status(400).json({ error: "Pincode must be numeric and up to 10 digits" });

        const existingAddress = await prisma.address.findUnique({
            where: { id: addressId },
        });

        if (!existingAddress || existingAddress.userId !== req.user.userId) {
            return res.status(404).json({ error: "Address not found or unauthorized" });
        }

        const updatedAddress = await prisma.address.update({
            where: { id: addressId },
            data: {
                fullName,
                phone,
                email,
                address,
                city,
                state,
                pincode,
            },
        });

        res.json(updatedAddress);
    } catch (error) {
        console.error("Error updating address:", error);
        res.status(500).json({ error: "Failed to update address" });
    }
});

router.delete("/:id", authenticateToken, async (req, res) => {
    const addressId = parseInt(req.params.id, 10);
    if (isNaN(addressId)) return res.status(400).json({ error: "Invalid address ID" });

    try {

        const existingAddress = await prisma.address.findUnique({
            where: { id: addressId },
        });

        if (!existingAddress || existingAddress.userId !== req.user.userId) {
            return res.status(404).json({ error: "Address not found or unauthorized" });
        }

        await prisma.address.delete({
            where: { id: addressId },
        });

        res.json({ message: "Address deleted successfully" });
    } catch (error) {
        console.error("Error deleting address:", error);
        res.status(500).json({ error: "Failed to delete address" });
    }
});

export default router;

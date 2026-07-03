import express from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import prisma from '../prisma/client.js';
import jwt from 'jsonwebtoken';
import authMiddleware from '../middleware/authMiddleware.js';
import rateLimit from 'express-rate-limit';
dotenv.config();

const router = express.Router();

// Limit login and signup attempts to 10 per 15 minutes per IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,  // Return rate limit info in RateLimit-* headers
    legacyHeaders: false,
    message: { message: 'Too many attempts, please try again after 15 minutes.' },
});

router.post("/login", authLimiter, async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { email: email }
        })
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user.id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                isAdmin: user.isAdmin
            }
        })
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Server error" });
    }
})

router.post("/signup", authLimiter, async (req, res) => {
    const { name, email, password } = req.body;

    // Input validation — checked before hitting the DB
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
        return res.status(400).json({ message: "A valid email address is required" });
    }
    if (!password || String(password).length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
    }
    if (name && String(name).length > 100) {
        return res.status(400).json({ message: "Name must be 100 characters or fewer" });
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email: email }
        })
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await prisma.user.create({
            data: {
                email: email,
                name: name,
                password: hashedPassword
            }
        })

        const token = jwt.sign(
            { userId: newUser.id, isAdmin: false },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.json({
            message: "Signup successful",
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                isAdmin: false
            }
        })
    } catch (error) {
        console.error("Error during signup:", error);
        return res.status(500).json({ message: "Server error" })
    }
})

router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                name: true
            }
        })
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.json({ user });
    } catch (error) {
        console.log("Error fetching user data:", error);
        return res.status(500).json({ message: "Server error" });
    }
})

export default router;

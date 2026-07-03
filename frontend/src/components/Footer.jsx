import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="pt-footer">
            <div className="container pt-footer__content">
                <div className="pt-footer__brand">
                    <img src="/images/logo.png" alt="Homaura Logo" style={{ height: '50px', marginBottom: '10px' }} />
                    <h3>Homaura</h3>
                    <p>Pastel-perfect keepsakes for heartfelt gifting.</p>
                </div>

                <div className="pt-footer__col">
                    <h4>Shop</h4>
                    <Link to="/shop">All Products</Link>
                    <Link to="/orders">My Orders</Link>
                    <Link to="/cart">Cart</Link>
                </div>

                <div className="pt-footer__col">
                    <h4>Support</h4>
                    <Link to="/contact">Contact Us</Link>
                    <Link to="/terms">Terms & Conditions</Link>
                </div>

                <div className="pt-footer__col">
                    <h4>Social</h4>
                    <a href="https://www.instagram.com/akshat_sanghi_/" target="_blank" rel="noreferrer">Instagram</a>
                </div>
            </div>

            <div className="pt-footer__bottom">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} Homaura. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

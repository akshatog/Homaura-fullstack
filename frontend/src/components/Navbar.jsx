import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext.jsx";
import "../styles/Navbar.css";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Products", to: "/shop" },
  { label: "My Orders", to: "/orders" },
  { label: "About Us", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Inspiration", to: "/inspiration" },
];

const LeafIcon = () => (
  <svg
    className="ha-navbar__leaf-icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 40 48"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M20 4C20 4 8 14 8 26C8 33.7 13.3 40 20 42C26.7 40 32 33.7 32 26C32 14 20 4 20 4Z"
      fill="#5C6B47"
      opacity="0.85"
    />
    <path
      d="M14 16C14 16 8 22 8 30"
      stroke="#4A5638"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.5"
    />
    <path
      d="M20 42L20 46"
      stroke="#5C6B47"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M20 18C20 18 24 24 22 32"
      stroke="#FAF7F2"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.6"
    />
    <path
      d="M9 34C9 34 6 38 8 42C10 46 14 46 16 44"
      fill="#5C6B47"
      opacity="0.5"
    />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function Navbar() {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAdmin");
    navigate("/login", { replace: true });
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="ha-navbar">
        <div className="ha-navbar__inner">

          {/* ── Brand ── */}
          <div className="ha-navbar__brand" onClick={() => navigate("/")} role="button" tabIndex={0} aria-label="Go to home">
            <LeafIcon />
            <div className="ha-navbar__brand-text">
              <span className="ha-navbar__brand-name">HomAura</span>
              <span className="ha-navbar__brand-tagline">Decor that defines you</span>
            </div>
          </div>

          {/* ── Center Nav Links ── */}
          <div className="ha-navbar__links">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `ha-navbar__link ${isActive ? "is-active" : ""}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* ── Right Actions ── */}
          <div className="ha-navbar__actions">
            <button
              className="ha-navbar__icon-btn"
              onClick={() => navigate("/shop")}
              aria-label="Search"
            >
              <SearchIcon />
            </button>

            <button
              className="ha-navbar__icon-btn"
              onClick={() => navigate("/profile")}
              aria-label="My account"
            >
              <UserIcon />
            </button>

            <button
              className="ha-navbar__icon-btn ha-navbar__cart-btn"
              onClick={() => navigate("/cart")}
              aria-label={`Cart, ${cartCount} items`}
            >
              <CartIcon />
              {cartCount > 0 && (
                <span className="ha-navbar__badge">{cartCount}</span>
              )}
            </button>

            {localStorage.getItem("token") && (
              <button className="ha-navbar__logout" onClick={handleLogout}>
                Logout
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              className="ha-navbar__toggle"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Overlay ── */}
      <div
        className={`ha-navbar__mobile-overlay ${mobileMenuOpen ? "active" : ""}`}
        onClick={closeMobileMenu}
      />

      {/* ── Mobile Drawer ── */}
      <div className={`ha-navbar__mobile-menu ${mobileMenuOpen ? "active" : ""}`}>
        <div className="ha-navbar__mobile-header">
          <div className="ha-navbar__brand" onClick={() => { navigate("/"); closeMobileMenu(); }} role="button" tabIndex={0}>
            <LeafIcon />
            <div className="ha-navbar__brand-text">
              <span className="ha-navbar__brand-name">HomAura</span>
              <span className="ha-navbar__brand-tagline">Decor that defines you</span>
            </div>
          </div>
          <button className="ha-navbar__mobile-close" onClick={closeMobileMenu} aria-label="Close menu">
            <CloseIcon />
          </button>
        </div>

        <div className="ha-navbar__mobile-links">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `ha-navbar__mobile-link ${isActive ? "is-active" : ""}`
              }
              onClick={closeMobileMenu}
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to="/profile"
            end
            className={({ isActive }) =>
              `ha-navbar__mobile-link ${isActive ? "is-active" : ""}`
            }
            onClick={closeMobileMenu}
          >
            My Account
          </NavLink>
        </div>

        <div className="ha-navbar__mobile-actions">
          <button
            className="ha-navbar__mobile-cart"
            onClick={() => { navigate("/cart"); closeMobileMenu(); }}
          >
            <CartIcon />
            Cart
            {cartCount > 0 && (
              <span className="ha-navbar__badge">{cartCount}</span>
            )}
          </button>
          {localStorage.getItem("token") && (
            <button className="ha-navbar__logout ha-navbar__mobile-logout" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </>
  );
}

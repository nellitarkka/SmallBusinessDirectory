import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "../auth/AuthContext";

const Navbar: React.FC = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const toggleLogin = () => {
    setIsLoginOpen((prev) => !prev);
    setIsSignupOpen(false);
  };

  const toggleSignup = () => {
    setIsSignupOpen((prev) => !prev);
    setIsLoginOpen(false);
  };

  const handleNavigate = (path: string) => {
    setIsLoginOpen(false);
    setIsSignupOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    setIsLoginOpen(false);
    setIsSignupOpen(false);
    navigate("/");
  };

  const handleLogoClick = () => {
    if (!user) {
      handleNavigate("/");
      return;
    }

    if (user.role === "customer") {
      handleNavigate("/customer/dashboard");
    } else if (user.role === "vendor") {
      handleNavigate("/vendor/dashboard");
    } else if (user.role === "admin") {
      handleNavigate("/admin/dashboard");
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <span
          className="navbar-logo"
          onClick={handleLogoClick}   
        >
          Local Vendor Hub
        </span>
      </div>

      <div className="navbar-right">
        {user ? (
          <>
            {/* Role-specific main button */}
            {user.role === "customer" && (
              <>
                <button
                  className="navbar-btn"
                  onClick={() => handleNavigate("/customer/my-vendors")}
                >
                  My Vendors
                </button>
                <button
                  className="navbar-btn"
                  onClick={() => handleNavigate("/customer/messages")}
                >
                  My Messages
                </button>
                <button
                  className="navbar-btn"
                  onClick={() => handleNavigate("/customer/profile")}
                >
                  My Profile
                </button>
              </>
            )}
            {user.role === "vendor" && (
              <>
                <button
                  className="navbar-btn"
                  onClick={() => handleNavigate("/vendor/dashboard")}
                >
                  My Store
                </button>

                <button
                  className="navbar-btn"
                  onClick={() => handleNavigate("/vendor/inbox")}
                >
                  My Inbox
                </button>
              </>
            )}
            {user.role === "admin" && (
              <button
                className="navbar-btn"
                onClick={() => handleNavigate("/admin/dashboard")}
              >
                Admin Dashboard
              </button>
            )}

            {/* Small user pill + logout */}
            <span className="navbar-user-pill">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
            <button className="navbar-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            {/* LOGIN DROPDOWN (only when logged OUT) */}
            <div className="navbar-dropdown">
              <button className="navbar-btn" onClick={toggleLogin}>
                Login
              </button>
              {isLoginOpen && (
                <div className="navbar-menu">
                  <button
                    className="navbar-menu-item"
                    onClick={() => handleNavigate("/login/customer")}
                  >
                    Customer Login
                  </button>
                  <button
                    className="navbar-menu-item"
                    onClick={() => handleNavigate("/login/vendor")}
                  >
                    Vendor Login
                  </button>
                  <button
                    className="navbar-menu-item"
                    onClick={() => handleNavigate("/login/admin")}
                  >
                    Admin Login
                  </button>
                </div>
              )}
            </div>

            {/* SIGNUP DROPDOWN (only when logged OUT) */}
            <div className="navbar-dropdown">
              <button
                className="navbar-btn navbar-btn--primary"
                onClick={toggleSignup}
              >
                Sign Up
              </button>
              {isSignupOpen && (
                <div className="navbar-menu">
                  <button
                    className="navbar-menu-item"
                    onClick={() => handleNavigate("/signup/customer")}
                  >
                    Customer Sign Up
                  </button>
                  <button
                    className="navbar-menu-item"
                    onClick={() => handleNavigate("/signup/vendor")}
                  >
                    Vendor Sign Up
                  </button>
                  {/* no Admin sign up – admin is predefined */}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;

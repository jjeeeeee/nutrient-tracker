import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Route, Routes, NavLink } from "react-router-dom";
import axios from "axios";
import AddFoodForm from "./AddFoodForm"; // Add Food Form
import MealBuilder from "./MealBuilder"; // Meal Builder
import Foods from "./Foods"; // Food display
import Meals from "./Meals"; // Meal display
import User from "./User";
import Login from "./Login"; // Login display
import Register from "./Register";
import "./App.css"; // Import your styles

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null); // Reference to the menu
  const navbarRef = useRef(null); // Reference to the entire navbar
  const [user, setUser] = useState(null);

  // Toggle the menu open/close
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close the menu if a click happens outside the navbar
  useEffect(() => {
    fetchUser();
    const handleClickOutside = (event) => {
      if (
        navbarRef.current &&
        !navbarRef.current.contains(event.target) &&
        isMenuOpen
      ) {
        setIsMenuOpen(false); // Close the menu if clicked outside
      }
    };

    // Add the event listener
    document.addEventListener("click", handleClickOutside);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMenuOpen]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-user`, { withCredentials: true });
      setUser(response.data.username);
    } catch (error) {
      setUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/logout`, {}, { withCredentials: true });
      setUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Router>
      {/* Navbar */}
      <div className="navbar" ref={navbarRef}>
        {/* Burger Icon or X depending on menu state */}
        <div className="burger-menu" onClick={toggleMenu}>
          {isMenuOpen ? (
            <span className="close-icon">X</span> // "X" icon when menu is open
          ) : (
            <span className="burger-icon">☰</span> // Burger icon when menu is closed
          )}
        </div>

        {/* Menu Links */}
        <div className={`menu-links ${isMenuOpen ? "open" : ""}`} ref={menuRef}>
          <NavLink to="/" onClick={() => setIsMenuOpen(false)} end>
            Home
          </NavLink>
          <NavLink to="addFood" onClick={() => setIsMenuOpen(false)} end>
            Add Food
          </NavLink>
          <NavLink to="foods" onClick={() => setIsMenuOpen(false)} end>
            Foods
          </NavLink>
          <NavLink to="meals" onClick={() => setIsMenuOpen(false)} end>
            Meals
          </NavLink>
          {user ? (
            <>
              <NavLink to="user" id="user" onClick={() => setIsMenuOpen(false)} end>
                {user}
              </NavLink>
              <NavLink to="" id="actionButton" onClick={() => { handleLogout(); setIsMenuOpen(false); }}>
                Logout
              </NavLink>
            </>
          ) : (
            <NavLink to="login" id="actionButton" onClick={() => setIsMenuOpen(false)}>
              Login
            </NavLink>
          )}
        </div>
      </div>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<MealBuilder />} />
        <Route path="addFood" element={<AddFoodForm />} />
        <Route path="foods" element={<Foods />} />
        <Route path="meals" element={<Meals />} />
        <Route path="user" element={<User />} />
        <Route path="login" element={<Login />} />
      </Routes>
    </Router>
    // Removed register for now
    // <Route path="register" element={<Register />} />
  );
};

export default App;
import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import axios from "axios";
import AddFoodForm from "./AddFoodForm"; // Add Food Form
import MealBuilder from "./MealBuilder"; // Meal Builder
import Foods from "./Foods"; // Food display
import Meals from "./Meals"; // Meal display
import Login from "./Login"; // Login display
import PersonalTracker from "./PersonalTracker"; // Personal Tracker display
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
      const response = await axios.get("https://nutrient-tracker-backend-c0o9.onrender.com/get-user", { withCredentials: true });
      setUser(response.data.username);
      console.log(response.data.username);
    } catch (error) {
      setUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("https://nutrient-tracker-backend-c0o9.onrender.com/logout", {}, { withCredentials: true });
      setUser(null);
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
          <Link to="/" onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>
          <Link to="/tracker" onClick={() => setIsMenuOpen(false)}>
            Personal Tracker
          </Link>
          <Link to="/add-food" onClick={() => setIsMenuOpen(false)}>
            Add Food
          </Link>
          <Link to="foods" onClick={() => setIsMenuOpen(false)}>
            Foods
          </Link>
          <Link to="meals" onClick={() => setIsMenuOpen(false)}>
            Meals
          </Link>
          {user ? (
            <>
              <span>{user}</span>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Link to="login" onClick={() => setIsMenuOpen(false)}>
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<MealBuilder />} />
        <Route path="tracker" element={<PersonalTracker />} />
        <Route path="/add-food" element={<AddFoodForm />} />
        <Route path="foods" element={<Foods />} />
        <Route path="meals" element={<Meals />} />
        <Route path="login" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;

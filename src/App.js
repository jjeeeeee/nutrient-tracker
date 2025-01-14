import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import AddFoodForm from "./AddFoodForm"; // Add Food Form
import MealBuilder from "./MealBuilder"; // Meal Builder
import Meals from "./Meals"; // Meal display
import "./App.css"; // Import your styles

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null); // Reference to the menu
  const navbarRef = useRef(null); // Reference to the entire navbar

  // Toggle the menu open/close
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close the menu if a click happens outside the navbar
  useEffect(() => {
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
          <Link to="/add-food" onClick={() => setIsMenuOpen(false)}>
            Add Food
          </Link>
          <Link to="meals" onClick={() => setIsMenuOpen(false)}>
            Meals
          </Link>
        </div>
      </div>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<MealBuilder />} />
        <Route path="/add-food" element={<AddFoodForm />} />
        <Route path="meals" element={<Meals />} />
      </Routes>
    </Router>
  );
};

export default App;

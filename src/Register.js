import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css"; // Import CSS file

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "https://nutrient-tracker-backend-c0o9.onrender.com/register",
        { username, password },
        { withCredentials: true }
      );

      setSuccessMessage("Registration successful! Please log in.");
      setErrorMessage("");
      setUsername("");
      setPassword("");
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(
        error.response?.data?.error || "Something went wrong. Please try again."
      );
      setSuccessMessage("");
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <div className="input-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      <button className="switch-btn" onClick={() => navigate("/login")}>
        Already have an account? Login
      </button>
    </div>
  );
};

export default Register;

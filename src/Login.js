import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css"; // Import CSS file

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "/api/login",
        { username, password },
        { withCredentials: true }
      );

      setSuccessMessage("Login successful!");
      setErrorMessage("");
      setUsername("");
      setPassword("");

      // Redirect to tracker page
      navigate("/../tracker");
      window.location.reload();
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
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
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
        <button type="submit">Login</button>
      </form>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
    </div>
  );
      /*
        // Removing link to register page for now, if putting back, put it in the div above
        <button className="switch-btn" onClick={() => navigate("/register")}>
        Don't have an account? Register
        </button>
      */
};

export default Login;

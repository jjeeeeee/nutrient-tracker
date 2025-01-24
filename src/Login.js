import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import axios from "axios";

const LoginRegister = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isRegistering ? "/register" : "/login";
    const body = { username, password };

    try {
      const response = await axios.post(
        `https://nutrient-tracker-backend-c0o9.onrender.com${endpoint}`,
        body,
        { withCredentials: true } // Ensures cookies are sent/received
      );

      setSuccessMessage(isRegistering ? "Registration successful!" : "Login successful!");
      setErrorMessage("");
      setUsername("");
      setPassword("");

      if (!isRegistering) {
        // Redirect user to tracker page after successful login
        navigate("/../tracker");
      }
    } catch (error) {
      console.error("Error:", error);

      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }

      setSuccessMessage("");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h2>{isRegistering ? "Register" : "Login"}</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginBottom: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginBottom: "5px" }}
          />
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          {isRegistering ? "Register" : "Login"}
        </button>
      </form>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      <button
        onClick={() => setIsRegistering(!isRegistering)}
        style={{
          marginTop: "10px",
          width: "100%",
          padding: "10px",
          backgroundColor: "#6c757d",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        {isRegistering ? "Already have an account? Login" : "Don't have an account? Register"}
      </button>
    </div>
  );
};

export default LoginRegister;

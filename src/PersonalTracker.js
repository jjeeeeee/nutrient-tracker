import React, { useState, useEffect } from "react";
import axios from "axios";

const PersonalTracker = () => {
  const [nutrients, setNutrients] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchNutrients = async () => {
      try {
        const response = await axios.get(
          "https://nutrient-tracker-backend-c0o9.onrender.com/nutrients",
          { withCredentials: true } // Ensures cookies are included in the request
        );
        setNutrients(response.data);
      } catch (error) {
        console.error("Error fetching nutrients:", error);
        setErrorMessage(
          error.response?.data?.error || "You must be logged in to view this page"
        );
      }
    };

    fetchNutrients();
  }, []);

  return (
    <div>
      <h2>Nutrient Tracker</h2>
      {errorMessage ? (
        <p style={{ color: "red" }}>{errorMessage}</p>
      ) : nutrients ? (
        <div>
          <p>{nutrients.message}</p>
          {/* Render nutrient data */}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default PersonalTracker;

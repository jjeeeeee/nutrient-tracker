import React, { useState, useEffect } from "react";
import axios from "axios";

const NutrientTracker = () => {
  const [nutrients, setNutrients] = useState(null);

  useEffect(() => {
    const fetchNutrients = async () => {
      try {
        const response = await axios.get("https://nutrient-tracker-backend-c0o9.onrender.com/nutrients", {
          withCredentials: true,
        });
        setNutrients(response.data);
      } catch (error) {
        console.error("Error fetching nutrients:", error);
        alert("You must be logged in to view this page");
      }
    };

    fetchNutrients();
  }, []);

  return (
    <div>
      <h2>Nutrient Tracker</h2>
      {nutrients ? (
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

export default NutrientTracker;

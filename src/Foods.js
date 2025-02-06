import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Foods.css"; // Import the styles

const Foods = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all foods
  useEffect(() => {
    axios
      .get("https://nutrient-tracker-backend-c0o9.onrender.com/foods")
      .then((response) => setFoods(response.data))
      .catch((error) => console.error("Error fetching foods:", error))
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading Food...</p>;
  }

  return (
    <div className="app-container">
      <h1>Saved Foods</h1>
      <div className="food-list">
        {foods.length === 0 ? (
          <p>No foods saved yet.</p>
        ) : (
          foods.map((food) => (
            <div key={food.id} className="food-item">
              <h2>{food.name}</h2>
              <ul>
                <li><strong>Serving Amount:</strong> {food.serving_amount}</li>
                <li><strong>Measurement Unit:</strong> {food.measurement_unit}</li>
                <li><strong>Calories:</strong> {food.calories} kcal</li>
                <li><strong>Carbs:</strong> {food.carbs} g</li>
                <li><strong>Fat:</strong> {food.fat} g</li>
                <li><strong>Protein:</strong> {food.protein} g</li>
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Foods;

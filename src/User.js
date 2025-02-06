import React, { useState, useEffect } from "react";
import axios from "axios";
import "./User.css";

const User = () => {
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    axios
      .get("https://nutrient-tracker-backend-c0o9.onrender.com/get-user", { withCredentials: true }) 
      .then((response) => {
        setUsername(response.data.username); 
      })
      .catch(() => {
        setUsername(null); // Ensure unauthorized users are blocked
      })
      .finally(() => {
        setLoading(false);
      });

    axios
      .get("https://nutrient-tracker-backend-c0o9.onrender.com/user-progress", {withCredentials: true})
      .then((response) => setWeeklyProgress(response.data))
      .catch((error) => console.error("Error fetching weekly progress:", error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p>Loading Weekly Progress...</p>;
  }

  return (
    <div className="app-container">
      <h1>{username}'s Weekly Progress</h1>
      <div className="food-list">
        {weeklyProgress.length === 0 ? (
          <p>No progress data available.</p>
        ) : (
          weeklyProgress.map((entry) => (
            <div key={entry.day_of_week} className="food-item">
              <h2>{entry.day_of_week}</h2>
              <ul>
                <li><strong>Calories:</strong> {entry.calories} kcal</li>
                <li><strong>Carbs:</strong> {entry.carbs} g</li>
                <li><strong>Fat:</strong> {entry.fat} g</li>
                <li><strong>Protein:</strong> {entry.protein} g</li>
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default User;

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./User.css";

const User = () => {
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState(null);
  const [tempGoal, setTempGoal] = useState({ calories: "", carbs: "", fat: "", protein: ""});

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

  const handleGoalSubmit = async (e) => {
    e.preventDefault();

    // Convert tempGoal values to numbers before updating goal
    const numericGoal = Object.fromEntries(
      Object.entries(tempGoal).map(([key, value]) => [key, Number(value) || 0]) // Convert to number, default to 0 if empty
    );

    try {
      await axios.post("https://nutrient-tracker-backend-c0o9.onrender.com/update-user-goals", numericGoal, { withCredentials: true });
      fetchUserGoals(); // Refresh goals

      // Clear the form inputs 
      setTempGoal({ calories: "", carbs: "", fats: "", protein: "" }); 
    } catch (error) {
      console.error("Error updating goals:", error);
      setErrorMessage("Failed to update goals.");
    }
  };

  const getDayOfWeek = (index) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[index];
  };

  if (loading) {
    return <p>Loading Weekly Progress...</p>;
  }

  if(!username) {
    return <p>Please Log In To See User Page</p>
  }

  return (
    <div className="app-container">
      <h1>{username}'s Weekly Progress</h1>
      <div className="food-list">
        {weeklyProgress.length === 0 ? (
          <p>No progress data available.</p>
        ) : (
          weeklyProgress.map((entry) => (
            <div key={getDayOfWeek(entry.day_of_week)} className="food-item">
              <h2>{getDayOfWeek(entry.day_of_week)}</h2>
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

      <div className="goal-container">
        <h3>Update Daily Goals</h3>
        <form onSubmit={handleGoalSubmit}>
          {Object.keys(tempGoal).map((key, index) => (
            <input
              key={key}
              type="number"
              value={tempGoal[key]} // Bind the value to state
              onChange={(e) => setTempGoal({ ...tempGoal, [key]: Number(e.target.value) })}
              placeholder={placeholders[index]}
              required 
            />
          ))}
          <button type="submit">Update Goals</button>
        </form>
      </div>
    </div>
  );
};

export default User;

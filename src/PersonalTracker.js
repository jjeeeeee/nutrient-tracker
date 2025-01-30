import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PersonalTracker.css"; // Import the external CSS file

const PersonalTracker = () => {
  const [nutrients, setNutrients] = useState({ calories: 0, carbs: 0, fat: 0, protein: 0 });
  const [goal, setGoal] = useState({ calories: 2000, carbs: 300, fat: 70, protein: 150 });
  const [errorMessage, setErrorMessage] = useState("");
  const [meals, setMeals] = useState([]);
  const [newMeal, setNewMeal] = useState({ name: "", calories: 0, carbs: 0, fat: 0, protein: 0 });

  useEffect(() => {
    const fetchNutrients = async () => {
      try {
        const response = await axios.get("https://nutrient-tracker-backend-c0o9.onrender.com/nutrients", { withCredentials: true });
        setNutrients(response.data.data);
      } catch (error) {
        console.error("Error fetching nutrients:", error);
        setErrorMessage(error.response?.data?.error || "You must be logged in to view this page");
      }
    };

    const fetchMeals = async () => {
      try {
        const response = await axios.get("https://nutrient-tracker-backend-c0o9.onrender.com/get-user-meals", { withCredentials: true });
        setMeals(response.data.meals);
      } catch (error) {
        console.error("Error fetching meals:", error);
        setErrorMessage("Failed to load meals.");
      }
    };

    fetchNutrients();
    fetchMeals();
  }, []);

  const handleMealSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://nutrient-tracker-backend-c0o9.onrender.com/add-user-meals", newMeal, { withCredentials: true });
      setMeals(response.data.meals);
      setNewMeal({ name: "", calories: 0, carbs: 0, fat: 0, protein: 0 });
    } catch (error) {
      console.error("Error adding meal:", error);
      setErrorMessage("Failed to add meal.");
    }
  };

  return (
    <div className="tracker-container">
      <h2>Nutrient Tracker</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {!errorMessage && (
        <>
          <div className="progress-container">
            <h3>Daily Progress</h3>
            {Object.keys(nutrients).map((nutrient) => (
              <div key={nutrient} className="progress-bar">
                <label>
                  {nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}: {nutrients[nutrient]} / {goal[nutrient]}
                </label>
                <div className="progress">
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.min((nutrients[nutrient] / goal[nutrient]) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleMealSubmit} className="meal-form">
            <h3>Add a Meal</h3>
            {Object.keys(newMeal).map((key) => (
              key !== "name" ? (
                <input key={key} type="number" placeholder={key} value={newMeal[key]} onChange={(e) => setNewMeal({ ...newMeal, [key]: e.target.value })} required />
              ) : (
                <input key={key} type="text" placeholder="Meal Name" value={newMeal[key]} onChange={(e) => setNewMeal({ ...newMeal, [key]: e.target.value })} required />
              )
            ))}
            <button type="submit">Add Meal</button>
          </form>
          <div className="meals-list">
            <h3>Meals for the Day</h3>
            {meals.length > 0 ? (
              <ul>
                {meals.map((meal, index) => (
                  <li key={index}>{meal.name}: {meal.calories} cal, {meal.carbs}g carbs, {meal.fat}g fat, {meal.protein}g protein</li>
                ))}
              </ul>
            ) : (
              <p>No meals added yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PersonalTracker;

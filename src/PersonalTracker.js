import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PersonalTracker.css";

const PersonalTracker = () => {
  const [nutrients, setNutrients] = useState({ calories: 0, carbs: 0, fat: 0, protein: 0 });
  const [goal, setGoal] = useState({ calories: 2000, carbs: 300, fat: 70, protein: 150 });
  const [errorMessage, setErrorMessage] = useState("");
  const [meals, setMeals] = useState([]);
  const [newMeal, setNewMeal] = useState({ name: "", calories: 0, carbs: 0, fat: 0, protein: 0 });

  useEffect(() => {
    fetchNutrients();
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      const response = await axios.get("https://nutrient-tracker-backend-c0o9.onrender.com/get-user-meals", { withCredentials: true });
      setMeals(response.data.meals);
    } catch (error) {
      console.error("Error fetching meals:", error);
      setErrorMessage("Failed to load meals.");
    }
  };

  const handleMealSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Submitting meal:", newMeal);
  
      const response = await axios.post(
        "https://nutrient-tracker-backend-c0o9.onrender.com/add-user-meals",
        newMeal,
        { withCredentials: true }
      );
  
      console.log("Response received:", response.data);
  
      if (response.data && response.data.meals) {
        setMeals(response.data.meals);
      } else {
        console.warn("Unexpected response format:", response.data);
        setErrorMessage("Unexpected response from server.");
      }
  
      setNewMeal({ name: "", calories: 0, carbs: 0, fat: 0, protein: 0 });
  
      await fetchNutrients(); // Update nutrients after adding a meal
    } catch (error) {
      console.error("Error adding meal:", error);
      setErrorMessage(error.response?.data?.error || "Failed to add meal.");
    }
  };  

  const handleClearMeals = async () => {
    try {
      await axios.delete("https://nutrient-tracker-backend-c0o9.onrender.com/clear-user-meals", { withCredentials: true });
      setMeals([]);
      setNutrients({ calories: 0, carbs: 0, fat: 0, protein: 0 });
    } catch (error) {
      console.error("Error clearing meals:", error);
      setErrorMessage("Failed to clear meals.");
    }
  };

  return (
    <div className="tracker-container">
      <h2>Nutrient Tracker</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {!errorMessage && (
        <>
          <div className="goal-container">
            <h3>Set Daily Goals</h3>
            {Object.keys(goal).map((key) => (
              <input
                key={key}
                type="number"
                value={goal[key]}
                onChange={(e) => setGoal({ ...goal, [key]: Number(e.target.value) })}
                placeholder={`Set ${key} goal`}
              />
            ))}
          </div>

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
                <input key={key} type="number" placeholder={key} value={newMeal[key]} onChange={(e) => setNewMeal({ ...newMeal, [key]: Number(e.target.value) })} required />
              ) : (
                <input key={key} type="text" placeholder="Meal Name" value={newMeal[key]} onChange={(e) => setNewMeal({ ...newMeal, [key]: e.target.value })} required />
              )
            ))}
            <button type="submit">Add Meal</button>
          </form>

          <div className="meals-list">
            <h3>Meals for the Day</h3>
            {meals.length > 0 ? (
              <>
                <ul>
                  {meals.map((meal, index) => (
                    <li key={index}>{meal.name}: {meal.calories} cal, {meal.carbs}g carbs, {meal.fat}g fat, {meal.protein}g protein</li>
                  ))}
                </ul>
                <button onClick={handleClearMeals} className="clear-button">Clear Meals</button>
              </>
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
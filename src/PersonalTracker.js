import React, { useState, useEffect } from "react";
import axios from "axios";

const PersonalTracker = () => {
  const [nutrients, setNutrients] = useState({
    calories: 0,
    carbs: 0,
    fat: 0,
    protein: 0,
  });
  const [goal, setGoal] = useState({
    calories: 2000,
    carbs: 300,
    fat: 70,
    protein: 150,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [meals, setMeals] = useState([]); // List of meals for the day
  const [newMeal, setNewMeal] = useState({
    name: "",
    calories: 0,
    carbs: 0,
    fat: 0,
    protein: 0,
  });

  useEffect(() => {
    // Fetch initial data (e.g., nutrients and meals for the day)
    const fetchNutrients = async () => {
      try {
        const response = await axios.get(
          "https://nutrient-tracker-backend-c0o9.onrender.com/nutrients",
          { withCredentials: true } // Ensures cookies are included in the request
        );
        setNutrients(response.data.data); // Assuming backend sends nutrient totals
      } catch (error) {
        console.error("Error fetching nutrients:", error);
        setErrorMessage(
          error.response?.data?.error || "You must be logged in to view this page"
        );
      }
    };

    fetchNutrients();
  }, []);

  const handleMealSubmit = (e) => {
    e.preventDefault();
    // Add the new meal to the list
    setMeals([...meals, newMeal]);

    // Update total nutrients
    setNutrients({
      calories: nutrients.calories + parseInt(newMeal.calories),
      carbs: nutrients.carbs + parseInt(newMeal.carbs),
      fat: nutrients.fat + parseInt(newMeal.fat),
      protein: nutrients.protein + parseInt(newMeal.protein),
    });

    // Clear the meal form
    setNewMeal({
      name: "",
      calories: 0,
      carbs: 0,
      fat: 0,
      protein: 0,
    });
  };

  const calculateProgress = (current, goal) => {
    return Math.min((current / goal) * 100, 100).toFixed(1);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Nutrient Tracker</h2>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      
      {!errorMessage && (
        <>
          {/* Progress Bars */}
          <div>
            <h3>Daily Progress</h3>
            {["calories", "carbs", "fat", "protein"].map((nutrient) => (
              <div key={nutrient} style={{ marginBottom: "10px" }}>
                <label>
                  {nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}:{" "}
                  {nutrients[nutrient]} / {goal[nutrient]} ({calculateProgress(nutrients[nutrient], goal[nutrient])}%)
                </label>
                <div
                  style={{
                    width: "100%",
                    backgroundColor: "#e0e0e0",
                    borderRadius: "5px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${calculateProgress(nutrients[nutrient], goal[nutrient])}%`,
                      backgroundColor: "#007bff",
                      height: "20px",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Meal Input */}
          <form onSubmit={handleMealSubmit} style={{ marginTop: "20px" }}>
            <h3>Add a Meal</h3>
            <input
              type="text"
              placeholder="Meal Name"
              value={newMeal.name}
              onChange={(e) =>
                setNewMeal({ ...newMeal, name: e.target.value })
              }
              required
              style={{ width: "100%", marginBottom: "10px" }}
            />
            <input
              type="number"
              placeholder="Calories"
              value={newMeal.calories}
              onChange={(e) =>
                setNewMeal({ ...newMeal, calories: e.target.value })
              }
              required
              style={{ width: "100%", marginBottom: "10px" }}
            />
            <input
              type="number"
              placeholder="Carbs (g)"
              value={newMeal.carbs}
              onChange={(e) =>
                setNewMeal({ ...newMeal, carbs: e.target.value })
              }
              required
              style={{ width: "100%", marginBottom: "10px" }}
            />
            <input
              type="number"
              placeholder="Fat (g)"
              value={newMeal.fat}
              onChange={(e) =>
                setNewMeal({ ...newMeal, fat: e.target.value })
              }
              required
              style={{ width: "100%", marginBottom: "10px" }}
            />
            <input
              type="number"
              placeholder="Protein (g)"
              value={newMeal.protein}
              onChange={(e) =>
                setNewMeal({ ...newMeal, protein: e.target.value })
              }
              required
              style={{ width: "100%", marginBottom: "10px" }}
            />
            <button type="submit" style={{ padding: "10px", width: "100%" }}>
              Add Meal
            </button>
          </form>

          {/* List of Meals */}
          <div style={{ marginTop: "20px" }}>
            <h3>Meals for the Day</h3>
            {meals.length > 0 ? (
              <ul>
                {meals.map((meal, index) => (
                  <li key={index}>
                    {meal.name}: {meal.calories} cal, {meal.carbs}g carbs,{" "}
                    {meal.fat}g fat, {meal.protein}g protein
                  </li>
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

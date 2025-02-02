import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PersonalTracker.css";

const PersonalTracker = () => {
  const [nutrients, setNutrients] = useState({ calories: 0, carbs: 0, fat: 0, protein: 0 });
  const [tempGoal, setTempGoal] = useState({ calories: "", carbs: "", fat: "", protein: ""});
  const [goal, setGoal] = useState({ calories: 1, carbs: 1, fat: 1, protein: 1 });
  const [errorMessage, setErrorMessage] = useState("");
  const [meals, setMeals] = useState([]);
  const [storedMeals, setStoredMeals] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState("");
  const [newMeal, setNewMeal] = useState({ name: "", calories: 0, carbs: 0, fat: 0, protein: 0 });
  const placeholders = ['Calories (kcal)', 'Carbs (g)', 'Fats (g)', 'Protein (g)'];

  useEffect(() => {
    fetchMeals();
    fetchUserGoals();
    fetchStoredMeals();
  }, []);

  const fetchUserGoals = async () => {
    try {
      const response = await axios.get("https://nutrient-tracker-backend-c0o9.onrender.com/get-user-goals", { withCredentials: true });
      setGoal(response.data);
    } catch (error) {
      console.error("Error fetching user goals:", error);
      setErrorMessage("Failed to load goals.");
    }
  };

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

  const fetchMeals = async () => {
    try {
      const response = await axios.get("https://nutrient-tracker-backend-c0o9.onrender.com/get-user-meals", { withCredentials: true });
      const fetchedMeals = response.data.meals || [];
      setMeals(fetchedMeals);

      const totalNutrients = fetchedMeals.reduce((acc, meal) => {
        return {
          calories: acc.calories + Number(meal.calories),
          carbs: acc.carbs + Number(meal.carbs),
          fat: acc.fat + Number(meal.fat),
          protein: acc.protein + Number(meal.protein),
        };
      }, { calories: 0, carbs: 0, fat: 0, protein: 0 });      

      setNutrients(totalNutrients);
    } catch (error) {
      console.error("Error fetching meals:", error);
      setErrorMessage("Failed to load meals.");
    }
  };

  const fetchStoredMeals = async () => {
    try {
      const response = await axios.get("https://nutrient-tracker-backend-c0o9.onrender.com/meals");
      setStoredMeals(response.data);
    } catch (error) {
      console.error("Error fetching stored meals:", error);
    }
  };

  const handleMealSubmit = async (e) => {
    e.preventDefault();
    try {  
      const response = await axios.post(
        "https://nutrient-tracker-backend-c0o9.onrender.com/add-user-meals",
        newMeal,
        { withCredentials: true }
      );

      setNewMeal({ name: "", calories: 0, carbs: 0, fat: 0, protein: 0 });
      fetchMeals(); // Refresh meals and nutrients
    } catch (error) {
      console.error("Error adding meal:", error);
      setErrorMessage(error.response?.data?.error || "Failed to add meal.");
    }
  };  

  const handleSelectMeal = (e) => {
    const mealName = e.target.value;
    setSelectedMeal(mealName);
    const meal = storedMeals.find((m) => m.name === mealName);
    if (meal) {
      setNewMeal({
        name: meal.name,
        calories: meal.calories,
        carbs: meal.carbs,
        fat: meal.fat,
        protein: meal.protein,
      });
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
    <div className="app-container">
      <h2>Nutrient Tracker</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {!errorMessage && (
        <>
          <div className="progress-container">
            <h3>Daily Progress</h3>
            {Object.keys(nutrients).map((nutrient) => (
              <div key={nutrient} className="progress-bar">
                <label>
                  {nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}: {` ${nutrients[nutrient].toFixed(2)} / ${goal[nutrient].toFixed(2)}`}
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

          <div className="meals-list">
            <h3>Meals for the Day</h3>
            {meals.length > 0 ? (
              <>
                <ul>
                  {meals.map((meal, index) => (
                    <li key={index}>
                      <span className="meal-name">{meal.name}</span>
                      <span className="nutrient-info">
                        {meal.calories} Calories, {meal.carbs}g Carbs, {meal.fat}g Fat, {meal.protein}g Protein
                      </span>
                    </li>
                  ))}
                </ul>
                <button onClick={handleClearMeals} className="clear-button">Clear Meals</button>
              </>
            ) : (
              <p>No meals added yet.</p>
            )}
          </div>

          <form onSubmit={handleMealSubmit} className="meal-form">
            <h3>Add a Meal</h3>
            <select value={selectedMeal} onChange={handleSelectMeal}>
              <option value="">Select a stored meal</option>
              {storedMeals.map((meal) => (
                <option key={meal.name} value={meal.name}>{meal.name}</option>
              ))}
            </select>
            {Object.keys(newMeal).map((key) => (
              key !== "name" ? (
                <input key={key} type="number" placeholder={key} value={newMeal[key]} onChange={(e) => setNewMeal({ ...newMeal, [key]: Number(e.target.value) })} required />
              ) : (
                <input key={key} type="text" placeholder="Meal Name" value={newMeal[key]} onChange={(e) => setNewMeal({ ...newMeal, [key]: e.target.value })} required />
              )
            ))}
            <button type="submit">Add Meal</button>
          </form>

          <div className="goal-container">
            <h3>Set Daily Goals</h3>
            <form onSubmit={handleGoalSubmit}>
              {Object.keys(tempGoal).map((key, index) => (
                <input
                  key={key}
                  type="number"
                  value={tempGoal[key]} // Bind the value to state
                  onChange={(e) => setTempGoal({ ...tempGoal, [key]: Number(e.target.value) })}
                  placeholder={placeholders[index]}
                />
              ))}
              <button type="submit">Update Goals</button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default PersonalTracker;
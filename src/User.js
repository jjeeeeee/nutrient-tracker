import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axios from "axios";
import "./User.css";

const User = () => {
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const placeholders = ['Calories (kcal)', 'Carbs (g)', 'Fats (g)', 'Protein (g)'];
  const [tempGoal, setTempGoal] = useState({ calories: "", carbs: "", fat: "", protein: ""});
  const [nutrients, setNutrients] = useState({ calories: 0, carbs: 0, fat: 0, protein: 0 });
  const [goal, setGoal] = useState({ calories: 1, carbs: 1, fat: 1, protein: 1 });
  const [meals, setMeals] = useState([]);
  const [storedMeals, setStoredMeals] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState("");
  const [newMeal, setNewMeal] = useState({ name: "", calories: "", carbs: "", fat: "", protein: "" });
  const data = {};

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
      .then((response) => {
        setWeeklyProgress(response.data);
        data = weeklyProgress.map(entry => ({
          day: getDayOfWeek(entry.day_of_week),
          Calories: parseFloat(entry.calories).toFixed(2),
          Carbs: parseFloat(entry.carbs).toFixed(2),
          Fat: parseFloat(entry.fat).toFixed(2),
          Protein: parseFloat(entry.protein).toFixed(2),
        }));
      })
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

    fetchUserMeals();
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

  const fetchUserMeals = async () => {
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

    // Convert tempGoal values to numbers before updating goal
    const numericMeal = Object.fromEntries(
      Object.entries(newMeal).map(([key, value]) => {
        // Convert only calories, carbs, fat, and protein to numbers, leave name as a string
        if (key === "calories" || key === "carbs" || key === "fat" || key === "protein") {
          return [key, Number(value) || 0]; // Convert to number, default to 0 if empty
        }
        return [key, value];
      })
    );
    try {  
      const response = await axios.post(
        "https://nutrient-tracker-backend-c0o9.onrender.com/add-user-meals",
        numericMeal,
        { withCredentials: true }
      );

      setNewMeal({ name: "", calories: "", carbs: "", fat: "", protein: "" });
      fetchUserMeals(); // Refresh meals and nutrients
      setSelectedMeal("");
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

  const handleRemoveMeal = async (mealId) => {
    try {
      await axios.delete("https://nutrient-tracker-backend-c0o9.onrender.com/delete-user-meal",
        {
          data: { mealId },
          withCredentials: true
        })
      .then(() => {
        fetchUserMeals();
      })
    } catch (error) {
      console.error("Error removing meal:", error);
    }
  };

  const handleSaveWeeklyInfo = async () => {
    const dayOfWeek = new Date().getDay();
    const requestBody = { ...nutrients, day_of_week: dayOfWeek };

    try {
      await axios.post("https://nutrient-tracker-backend-c0o9.onrender.com/update-progress", 
        requestBody,
        { withCredentials: true })
      .then(alert("Saved to Weekly Log!"));
    } catch (error) {
      console.error("Error adding meal to weekly log:", error);
      alert("Failed to Add to Weekly Log");
    }
  }

  if (loading) {
    return <p>Loading Weekly Progress...</p>;
  }

  if(!username) {
    return <p>Please Log In To See User Page</p>
  }

  return (
    <div className="app-container">
      <h1>{username}'s Profile</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {!errorMessage && (
        <>
          <div className="progress-container">
            <h2>Today's Progress</h2>
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
            <button onClick={handleSaveWeeklyInfo} className="save-weekly-info-button">Save To Weekly Log</button>
          </div>
          <form onSubmit={handleMealSubmit} className="meal-form">
            <h2>Quick Add Meal</h2>
            
            {/* Dropdown for Stored Meals */}
            <select 
              value={selectedMeal} 
              onChange={handleSelectMeal} 
              className="meal-select"
            >
              <option value="">Select A Stored Meal</option>
              {storedMeals.map((meal) => (
                <option key={meal.name} value={meal.name}>{meal.name}</option>
              ))}
            </select>
            
            {/* Input Fields for Meal Info */}
            {Object.keys(newMeal).map((key, index) => (
              key !== "name" ? (
                <input 
                  key={key} 
                  type="number" 
                  placeholder={placeholders[index - 1]}
                  value={newMeal[key]} 
                  onChange={(e) => setNewMeal({ ...newMeal, [key]: Number(e.target.value) })} 
                  required 
                  className="meal-input"
                />
              ) : (
                <input 
                  key={key} 
                  type="text" 
                  placeholder="Meal Name" 
                  value={newMeal[key]} 
                  onChange={(e) => setNewMeal({ ...newMeal, [key]: e.target.value })} 
                  required 
                  className="meal-input"
                />
              )
            ))}
            <button type="submit" className="meal-button">Add Meal</button>
          </form>
          <div className="meals-list">
            <h2>Meals Consumed Today</h2>
            {meals.length > 0 ? (
              <>
                <ul>
                  {meals.map((meal, index) => (
                    <li key={index}>
                      <span className="meal-name">{meal.name}</span>
                      <span className="nutrient-info">
                        {meal.calories} Calories, {meal.carbs}g Carbs, {meal.fat}g Fat, {meal.protein}g Protein
                      </span>
                      <button onClick={() => handleRemoveMeal(meal.id)} className="remove-meal-button">
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
                <button onClick={handleClearMeals} className="clear-button">Clear All</button>
              </>
            ) : (
              <p>No Meals Added Yet.</p>
            )}
          </div>
          <div className="goal-container">
            <h2>Update Goals</h2>
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
          <div className="user-log-list">
            <h2>Weekly Log</h2>
            {weeklyProgress.length === 0 ? (
              <p>No progress data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Calories" fill="#8884d8" />
                  <Bar dataKey="Carbs" fill="#82ca9d" />
                  <Bar dataKey="Fat" fill="#ffc658" />
                  <Bar dataKey="Protein" fill="#ff7300" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default User;

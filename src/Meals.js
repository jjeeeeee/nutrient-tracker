import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Meals.css"; // Import the styles

const Meals = () => {
  const [meals, setMeals] = useState([]);

  // Fetch all meals
  useEffect(() => {
    axios
      .get("https://nutrient-tracker-backend-c0o9.onrender.com/meals")
      .then((response) => setMeals(response.data))
      .catch((error) => console.error("Error fetching meals:", error));
  }, []);

  return (
    <div className="app-container">
      <h1>Saved Meals</h1>
      <div className="meal-list">
        {meals.length === 0 ? (
          <p>No meals saved yet. Add some in the Meal Builder!</p>
        ) : (
          meals.map((meal) => (
            <div key={meal.id} className="meal-item-display">
              <h2>{meal.name}</h2>
              <ul>
                {Array.isArray(meal.MealIngredients) && meal.MealIngredients.length > 0 ? (
                  meal.MealIngredients.map((ingredient, index) => (
                    <li key={index}>
                      {ingredient.ingredient_name}: {ingredient.amount} {ingredient.Food.measurement_unit}
                    </li>
                  ))
                ) : (
                  <li>No ingredients available</li>
                )}
                <li><strong>Calories:</strong> {meal.calories} kcal</li>
                <li><strong>Carbs:</strong> {meal.carbs} g</li>
                <li><strong>Fat:</strong> {meal.fat} g</li>
                <li><strong>Protein:</strong> {meal.protein} g</li>
              </ul>
            </div>
          ))          
        )}
      </div>
    </div>
  );
};

export default Meals;

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MealBuilder.css"; // Import custom styles

const MealBuilder = () => {
  const [ingredients, setIngredients] = useState([]); // List of ingredients fetched from the database
  const [meal, setMeal] = useState([]); // Ingredients added to the meal
  const [selectedIngredient, setSelectedIngredient] = useState(""); // Selected ingredient from the dropdown
  const [weight, setWeight] = useState(""); // Weight input for the selected ingredient
  const [totalNutrients, setTotalNutrients] = useState(null); // Displayed nutrient totals
  const [originalNutrients, setOriginalNutrients] = useState(null); // Original calculated nutrient totals
  const [portions, setPortions] = useState(1); // Number of portions
  const [errorMessage, setErrorMessage] = useState(""); // Error message for duplicate ingredients
  const [storedMeals, setStoredMeals] = useState([]); // Stored meals fetched from the backend
  const [selectedMealId, setSelectedMealId] = useState(""); // Selected meal ID from dropdown

  // Fetch ingredients and stored meals from the backend
  useEffect(() => {
    axios
      .get("https://nutrient-tracker-backend-c0o9.onrender.com/foods")
      .then((response) => setIngredients(response.data))
      .catch((error) => console.error("Error fetching ingredients:", error));

    axios
      .get("https://nutrient-tracker-backend-c0o9.onrender.com/meals")
      .then((response) => setStoredMeals(response.data))
      .catch((error) => console.error("Error fetching stored meals:", error));
  }, []);

  // Import a stored meal and display its information
  const importMeal = () => {
    if (!selectedMealId) {
      alert("Please select a meal to import.");
      return;
    }

    const mealToImport = storedMeals.find((meal) => meal.id === parseInt(selectedMealId));

    if (mealToImport) {
      setMeal(
        mealToImport.MealIngredients.map((item) => ({
          name: item.ingredient_name,
          weight: parseFloat(item.amount),
          unit: ingredients.find((ing) => ing.name === item.ingredient_name)?.measurement_unit || "",
        }))
      );
      setTotalNutrients(null); // Clear nutrient calculation when a new meal is imported
    } else {
      alert("Selected meal could not be found.");
    }
  };

  // Existing functions (addIngredient, updateWeight, removeIngredient, etc.) remain unchanged

  return (
    <div className="app-container">
      <h1>Food Nutrient Calculator</h1>
      <div className="meal-builder">
        <h2>Build Your Meal</h2>

        {/* Error Message */}
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        {/* Import Meal Section */}
        <div className="import-meal">
          <select
            value={selectedMealId}
            onChange={(e) => setSelectedMealId(e.target.value)}
          >
            <option value="">Select a stored meal...</option>
            {storedMeals.map((meal) => (
              <option key={meal.id} value={meal.id}>
                {meal.name}
              </option>
            ))}
          </select>
          <button onClick={importMeal}>Import Meal</button>
        </div>

        <div className="add-ingredient">
          <select
            value={selectedIngredient}
            onChange={(e) => setSelectedIngredient(e.target.value)}
          >
            <option value="">Select an ingredient...</option>
            {ingredients.map((ingredient) => (
              <option key={ingredient.id} value={ingredient.name}>
                {ingredient.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Amount"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
          <button onClick={addIngredient}>+</button>
        </div>

        <div className="meal-list">
          {meal.map((item, index) => (
            <div key={index} className="meal-item">
              <span>{item.name}</span>
              <input
                type="number"
                value={item.weight}
                onChange={(e) => updateWeight(index, e.target.value)}
              />
              <span>{item.unit}</span> {/* Display the measurement unit */}
              <button onClick={() => removeIngredient(index)}>Remove</button>
            </div>
          ))}
        </div>

        <div className="portion-controls">
          <input
            type="number"
            placeholder="Portions"
            value={portions}
            onChange={(e) => setPortions(e.target.value)}
          />
          <button className="divide-button" onClick={divideByPortions}>
            Divide by Portions
          </button>
        </div>

        <button className="save-meal-button" onClick={saveMeal}>
          Save Meal
        </button>

        <button className="calculate-button" onClick={calculateNutrients}>
          Calculate Nutrients
        </button>

        {/* Clear All button */}
        <button className="clear-all-button" onClick={clearAll}>
          Clear All
        </button>
      </div>

      {totalNutrients && (
        <div className="total-nutrients">
          <h2>Total Nutrients</h2>
          <p>Calories: {totalNutrients.calories.toFixed(2)} kcal</p>
          <p>Carbs: {totalNutrients.carbs.toFixed(2)} g</p>
          <p>Fat: {totalNutrients.fat.toFixed(2)} g</p>
          <p>Protein: {totalNutrients.protein.toFixed(2)} g</p>
        </div>
      )}
    </div>
  );
};

export default MealBuilder;

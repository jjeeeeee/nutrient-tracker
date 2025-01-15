import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MealBuilder.css"; // Import custom styles

const MealBuilder = () => {
  const [ingredients, setIngredients] = useState([]); // List of ingredients fetched from the database
  const [meal, setMeal] = useState([]); // Ingredients added to the meal
  const [selectedIngredient, setSelectedIngredient] = useState(""); // Selected ingredient from the dropdown
  const [amount, setAmount] = useState(""); // Amount input for the selected ingredient
  const [totalNutrients, setTotalNutrients] = useState(null); // Displayed nutrient totals
  const [originalNutrients, setOriginalNutrients] = useState(null); // Original calculated nutrient totals
  const [portions, setPortions] = useState(1); // Number of portions
  const [errorMessage, setErrorMessage] = useState(""); // Error message for duplicate ingredients
  const [storedMeals, setStoredMeals] = useState([]);
  const [selectedMealId, setSelectedMealId] = useState(1);

  // Fetch ingredients from the backend
  useEffect(() => {
    axios
      .get("https://nutrient-tracker-backend-c0o9.onrender.com/foods")
      .then((response) => setIngredients(response.data))
      .catch((error) => console.error("Error fetching ingredients:", error));

    axios
      .get("https://nutrient-tracker-backend-c0o9.onrender.com/meals")
      .then((response) => setStoredMeals(response.data))
      .catch((error) => console.error("Error fetching meals:", error));
  }, []);

  const importMeal = () => {
    if (!selectedMealId) {
      alert("Please select a meal to import.");
      return;
    }

    const mealToImport = storedMeals.find(meal => meal.id === parseInt(selectedMealId));

    if (mealToImport) {
      clearAll();

      mealToImport.MealIngredients.forEach((item) => {
        const existingIngredient = meal.find((ingredient) => ingredient.name === item.ingredient_name);
  
        if (existingIngredient) {
          setErrorMessage(`The ingredient "${item.ingredient_name}" is already in the meal.`);
          return;
        }
  
        const ingredient = ingredients.find((ing) => ing.name === item.ingredient_name);
  
        if (ingredient) {
          setMeal((prevMeal) => [
            ...prevMeal,
            {
              id: ingredient.id,
              name: ingredient.name,
              amount: parseFloat(item.amount),
              unit: ingredient.measurement_unit || "", // Store the measurement unit
            },
          ]);
        } else {
          console.error(`Ingredient "${item.ingredient_name}" not found in the ingredient list.`);
        }
      });
  
      setErrorMessage(""); // Clear any error messages
    } else {
      alert("Selected meal could not be found.");
    }
  }

  // Add an ingredient to the meal
  const addIngredient = () => {
    if (!selectedIngredient || !amount) {
      setErrorMessage("Please select an ingredient and enter a valid amount.");
      return;
    }

    const existingIngredient = meal.find((item) => item.name === selectedIngredient);

    if (existingIngredient) {
      setErrorMessage("This ingredient has already been added to the meal.");
      return;
    }

    const ingredient = ingredients.find((item) => item.name === selectedIngredient);

    setMeal([
      ...meal,
      {
        id: ingredient.id,
        name: ingredient.name,
        amount: parseFloat(amount),
        unit: ingredient.measurement_unit, // Store the measurement unit from the ingredient
      },
    ]);

    setSelectedIngredient("");
    setAmount("");
    setErrorMessage(""); // Clear error message
  };

  // Update the amount of an ingredient
  const updateAmount = (index, newAmount) => {
    const updatedMeal = [...meal];
    updatedMeal[index].amount = parseFloat(newAmount) || 0;
    setMeal(updatedMeal);
  };

  // Remove an ingredient from the meal
  const removeIngredient = (index) => {
    const updatedMeal = [...meal];
    updatedMeal.splice(index, 1);
    setMeal(updatedMeal);
  };

  // Calculate total nutrients
  const calculateNutrients = () => {
    axios
      .post("https://nutrient-tracker-backend-c0o9.onrender.com/calculate", { ingredients: meal })
      .then((response) => {
        setTotalNutrients(response.data);
        setOriginalNutrients(response.data); // Save original totals
      })
      .catch((error) => console.error("Error calculating total nutrients:", error));
  };

  // Divide amounts by portions
  const divideByPortions = () => {
    if (portions <= 0) {
      alert("Please enter a valid number of portions (greater than 0).");
      return;
    }

    if (originalNutrients) {
      setTotalNutrients({
        calories: originalNutrients.calories / portions,
        carbs: originalNutrients.carbs / portions,
        fat: originalNutrients.fat / portions,
        protein: originalNutrients.protein / portions,
      });
    }
  };

  // Clear all ingredients and reset calculations
  const clearAll = () => {
    setMeal([]);
    setTotalNutrients(null);
    setPortions(1);
    setErrorMessage(""); // Clear any error messages
  };

  // Add Save Meal Function
  const saveMeal = () => {
    const mealName = prompt("Enter a name for this meal:");
    if (!mealName) return;

    axios
      .post("https://nutrient-tracker-backend-c0o9.onrender.com/meals", {
        name: mealName,
        ingredients: meal.map((item) => ({
          ingredient_name: item.name,
          amount: item.amount,
        })),
      })
      .then(() => {
        alert("Meal saved successfully!");
        clearAll();
      })
      .catch((error) => {
        console.error("Error saving meal:", error);
      });
  };


  return (
    <div className="app-container">
      <h1>Food Nutrient Calculator</h1>
      <div className="meal-builder">
        <h2>Build Your Meal</h2>

        {/* Error Message */}
        {errorMessage && <div className="error-message">{errorMessage}</div>}

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
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={addIngredient}>+</button>
        </div>

        <div className="meal-list">
          {meal.map((item, index) => (
            <div key={index} className="meal-item">
              <span>{item.name}</span>
              <input
                type="number"
                value={item.amount}
                onChange={(e) => updateAmount(index, e.target.value)}
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

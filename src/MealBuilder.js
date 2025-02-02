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
  const [portions, setPortions] = useState(""); // Number of portions
  const [errorMessage, setErrorMessage] = useState(""); // Error message for duplicate ingredients
  const [storedMeals, setStoredMeals] = useState([]);
  const [selectedMealId, setSelectedMealId] = useState("");

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

  const importMeal = async () => {
    if (!selectedMealId) {
      alert("Please select a meal to import.");
      return;
    }
  
    const mealToImport = storedMeals.find((meal) => meal.id === parseInt(selectedMealId));
  
    if (mealToImport) {
      setMeal(() => {
        let newMeal = []; // Start with an empty meal for this import
  
        mealToImport.MealIngredients.forEach((item) => {
          // Check for duplicates in newMeal (the in-progress list)
          if (newMeal.find((ingredient) => ingredient.name === item.ingredient_name)) {
            setErrorMessage(`The ingredient "${item.ingredient_name}" is already in the meal.`);
            return;
          }
  
          const ingredient = ingredients.find((ing) => ing.name === item.ingredient_name);
  
          if (ingredient) {
            newMeal.push({
              id: ingredient.id,
              name: ingredient.name,
              amount: parseFloat(item.amount),
              unit: ingredient.measurement_unit || "",
            });
          } else {
            console.error(`Ingredient "${item.ingredient_name}" not found in the ingredient list.`);
          }
        });

        // Update total nutrients state
        setTotalNutrients({
          calories: parseFloat(mealToImport.calories).toFixed(2),
          carbs: parseFloat(mealToImport.carbs).toFixed(2),
          fat: parseFloat(mealToImport.fat).toFixed(2),
          protein: parseFloat(mealToImport.protein).toFixed(2),
        });
      
        // Update original nutrients state with two decimal places
        setOriginalNutrients({
          calories: (parseFloat(mealToImport.calories) * mealToImport.portionAmount).toFixed(2),
          carbs: (parseFloat(mealToImport.carbs) * mealToImport.portionAmount).toFixed(2),
          fat: (parseFloat(mealToImport.fat) * mealToImport.portionAmount).toFixed(2),
          protein: (parseFloat(mealToImport.protein) * mealToImport.portionAmount).toFixed(2),
        });

        setPortions(mealToImport.portionAmount);
  
        setErrorMessage(""); // Clear error message after successful import
        setSelectedMealId("");
        return newMeal; // Update the meal state with the final array
      });
    } else {
      alert("Selected meal could not be found.");
    }
  };
  
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

  useEffect(() => {
    const fetchData = async () => {
      if (meal.length > 0) {
        await calculateNutrients();  // Wait for calculateNutrients to finish
        divideByPortions();
      }
    };
  
    fetchData();
  }, [meal]);

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

  const calculateNutrients = async () => {
    try {
      const response = await axios.post(
        "https://nutrient-tracker-backend-c0o9.onrender.com/calculate",
        { ingredients: meal }
      );
      setTotalNutrients({
        calories: parseFloat(response.data.calories).toFixed(2),
        carbs: parseFloat(response.data.carbs).toFixed(2),
        fat: parseFloat(response.data.fat).toFixed(2),
        protein: parseFloat(response.data.protein).toFixed(2),
      });
    
      // Update original nutrients state with two decimal places
      setOriginalNutrients({
        calories: parseFloat(response.data.calories).toFixed(2),
        carbs: parseFloat(response.data.carbs).toFixed(2),
        fat: parseFloat(response.data.fat).toFixed(2),
        protein: parseFloat(response.data.protein).toFixed(2),
      });

    } catch (error) {
      console.error("Error calculating total nutrients:", error);
    }
  };  

  // Divide amounts by portions
  const divideByPortions = () => {
    if (Number(portions) <= 0) {
      alert("Please enter a valid number of portions (greater than 0).");
      return;
    }

    if (originalNutrients) {
      setTotalNutrients({
        calories: (originalNutrients.calories / Number(portions)).toFixed(2),
        carbs: (originalNutrients.carbs / Number(portions)).toFixed(2),
        fat: (originalNutrients.fat / Number(portions)).toFixed(2),
        protein: (originalNutrients.protein / Number(portions)).toFixed(2),
      });
    }
  };

  // Clear all ingredients and reset calculations
  const clearAll = () => {
    setMeal([]);
    setTotalNutrients(null);
    setPortions("");
    setErrorMessage(""); // Clear any error messages
  };

  // Add Save Meal Function
const saveMeal = async () => {
  await calculateNutrients();
  const mealName = prompt("Enter a name for this meal:");
  if (!mealName) return;

  axios
    .post("https://nutrient-tracker-backend-c0o9.onrender.com/meals", {
      name: mealName,
      ingredients: meal.map((item) => ({
        ingredient_name: item.name,
        amount: item.amount,
      })),
      calories: totalNutrients.calories,
      carbs: totalNutrients.carbs,
      fat: totalNutrients.fat,
      protein: totalNutrients.protein,
      portionAmount: portions,
    })
    .then(() => {
      alert("Meal saved successfully!");
      clearAll();
    })
    .catch((error) => {
      if (error.response && error.response.status === 409) {
        // Handle conflict (meal already exists)
        alert("This meal already exists in the database.");
      } else {
        // Handle other errors
        console.error("Error saving meal:", error);
        alert("An error occurred while saving the meal. Please try again.");
      }
    });
};

  return (
    <div className="app-container">
      <h1>Build Your Meal</h1>
      <div className="meal-builder">
        <div className="import-meal">
          <h3>Import A Meal</h3>
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
          <h3>Ingredients</h3>
          <div className="ingredient-inputs">
            <select
              value={selectedIngredient}
              onChange={(e) => setSelectedIngredient(e.target.value)}
              className="meal-select"
            >
              <option value="">Select an ingredient...</option>
              {ingredients.map((ingredient) => (
                <option key={ingredient.id} value={ingredient.name}>
                  {ingredient.name}
                </option>
              ))}
            </select>
            <div className="amount-input">
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="meal-input"
              />
              {selectedIngredient && (
                <span className="measurement-unit">
                  {ingredients.find((ing) => ing.name === selectedIngredient)?.measurement_unit || ""}
                </span>
              )}
            </div>
          </div>
          <button onClick={addIngredient} className="meal-button">
            Add Ingredient
          </button>
        </div>

        <div className="meal-list-display">
          {meal.map((item, index) => (
            <div key={index} className="meal-list-item">
              <span>{item.name}</span>
              <input
                type="number"
                value={item.amount}
                onChange={(e) => updateAmount(index, e.target.value)}
                onBlur={calculateNutrients}
              />
              <span>{item.unit}</span> {/* Display the measurement unit */}
              <button onClick={() => removeIngredient(index)}>Remove</button>
            </div>
          ))}
          {/* Clear All button */}
          {meal.length > 0 && (
            <button className="clear-all-button" onClick={clearAll}>
              Clear All
            </button>
          )}
        </div>

        {meal.length > 0 && (
          <div className="portion-controls">
            <input
              type="number"
              placeholder="Portions"
              value={portions}
              onChange={(e) => setPortions(e.target.value)}
            />
            <button className="divide-button" onClick={divideByPortions}>
              Divide
            </button>
          </div>
        )}

        {meal.length > 0 && (
          <div className="save-button-div">
            <button className="save-meal-button" onClick={saveMeal}>
              Save Meal
            </button>
          </div>
        )}
      </div>

      {totalNutrients && meal.length > 0 &&  (
        <div className="total-nutrients">
          <h2>Total Nutrients</h2>
          <p>Calories: {totalNutrients.calories} kcal</p>
          <p>Carbs: {totalNutrients.carbs} g</p>
          <p>Fat: {totalNutrients.fat} g</p>
          <p>Protein: {totalNutrients.protein} g</p>
        </div>
      )}
    </div>
  );
};

export default MealBuilder;

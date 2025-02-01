import React, { useState } from "react";
import axios from "axios";
import "./AddFoodForm.css";

const AddFoodForm = () => {
  const [name, setName] = useState("");
  const [serving_amount, setServing_amount] = useState("");
  const [measurement_unit, setMeasurement_unit] = useState("");
  const [calories, setCalories] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [protein, setProtein] = useState("");
  const [notification, setNotification] = useState(null); // For notifications

  useEffect(() => {
    // Fetch the logged-in user
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
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (username !== "Jason") {
    return <p>Access Denied</p>;
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    const foodData = {
      name,
      serving_amount: parseFloat(serving_amount),
      measurement_unit, 
      calories: parseFloat(calories),
      carbs: parseFloat(carbs),
      fat: parseFloat(fat),
      protein: parseFloat(protein),
    };

    // POST request to insert into the database
    axios
    .post("https://nutrient-tracker-backend-c0o9.onrender.com/foods", foodData)
    .then((response) => {
      setNotification({
        message: "Food added successfully!",
        type: "success",
      });
      // Reset form fields
      setName("");
      setServing_amount("");
      setMeasurement_unit("");
      setCalories("");
      setCarbs("");
      setFat("");
      setProtein("");
    })
    .catch((error) => {
      console.error("Error adding food:", error);
      
      // Handle the error properly by checking if the message is in the error response
      const errorMessage = error.response?.data?.message || "An unexpected error occurred.";

      setNotification({
        message: errorMessage,
        type: "error",
      });
    });

  };

  return (
    <div className="add-food-form-container">
      <h2>Add a New Food</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Food Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Serving Amount"
          value={serving_amount}
          onChange={(e) => setServing_amount(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Measurement Unit"
          value={measurement_unit}
          onChange={(e) => setMeasurement_unit(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Calories"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Carbs (g)"
          value={carbs}
          onChange={(e) => setCarbs(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Fat (g)"
          value={fat}
          onChange={(e) => setFat(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Protein (g)"
          value={protein}
          onChange={(e) => setProtein(e.target.value)}
          required
        />
        <button type="submit">Add Food</button>
      </form>

      {notification && (
        <div
          className={`notification ${notification.type}`}
          style={{ display: "block" }}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default AddFoodForm;

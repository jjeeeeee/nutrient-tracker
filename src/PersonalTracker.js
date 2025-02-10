import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PersonalTracker.css";

const PersonalTracker = () => {
  

  

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!username) {
    return <p>Please Log In To See Personal Tracker Page</p>;
  }

  return (
    <div className="app-container">
      
    </div>
  );
};

export default PersonalTracker;
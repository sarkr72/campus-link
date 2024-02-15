// Import necessary dependencies
"use client";


import React, { useState, useEffect } from "react";

const HomePage = () => {
    
    const [users, setUsers] = useState([]);
    let id = 2
  
   // useEffect declaration
   useEffect(() => {
      fetch(`/api/users/${id}`)
        .then((response) => response.json())
        .then((data) => setUsers(data))
        .catch((error) => console.error("Error fetching users:", error));
    }, []);


    return (
        <>
        <p>Homeee</p>
        {console.log("ssss2ss", users)}
        </>
    )
};

export default HomePage;
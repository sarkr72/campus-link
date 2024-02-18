// Import necessary dependencies
"use client";
import Header from "../../components/Header"
import Footer from "../../components/Footer"


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
        <div>
          <Header />
          <h1 className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>Home Page for Campus Link</h1>
          <Footer />
        </div>
      );
};

export default HomePage;
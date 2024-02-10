// components/UserForm.js
"use client";
import React, { useState } from "react";

const RegisterForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch(`/api/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email }),
          });

      if (response.ok) {
        console.log("Data inserted successfully");
      } else {
        console.error("Error inserting data:");
      }
    } catch (error) {
      console.error("Error inserting data:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* <label>testing</label> */}
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">Create User</button>
    </form>
  );
};

export default RegisterForm;

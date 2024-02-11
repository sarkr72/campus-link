"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "react-bootstrap";

export default function Home() {
  const [users, setUsers] = useState([]);
  let id = 2

  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  return (
    <div>
      <label>home</label>
      {console.log("ssss", users)}
      {/* <Button variant="primary">Primary Button</Button> */}
      <p></p>
      <Link href="/pages/register">go to register</Link>
    </div>
  );
}

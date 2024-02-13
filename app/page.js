"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "react-bootstrap";



export default function Home() {
  const [users, setUsers] = useState([]);
  let id = 2

  return (
    <div>
      <label>home</label>
      {console.log("ssss", users)}
      {/* <Button variant="primary">Primary Button</Button> */}
      <p></p>
      <Link href="/pages/logIn">go to login</Link>
    </div>
  );
}

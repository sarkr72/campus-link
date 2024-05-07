
"use client";


import GrowSpinner from "../../components/Spinner";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Home from "@/app/page";

const HomePage2 = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState("");
  const [signed, setSigned] = useState(false);
  const [user, setUser] = useState("");
  const [currnetEmail, setCurrentEmail] = useState("");



  if (isLoading) {
    return <GrowSpinner />;
  }

  return (
    <div>
      <Home />
    </div>
  );
};

export default HomePage2;

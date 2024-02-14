"use client";

import Link from "next/link";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataObj = {
        email: email,
        password: password,
      };

      const formData = new FormData();
      Object.entries(formDataObj).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await fetch(`/api/logIn`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        // router.push("/pages/register");
        toast.error("Email or password not provided");
        console.error("Error inserting data:");
      }
      const data = await response.json();

      if (data && data.message === "Login successful") {
        router.push("/pages/register");
      } else if (data && data.error === "Email or password not provided") {
        toast.error("Email or password not provided");
      } else {
        console.log("Login failed or unexpected response:", data);
        toast.error("LogIn failed!");
      }
    } catch (error) {
      console.error("Error inserting data:", error);
    }
  };

  return (
    <div className="container-fluid" style={{ minHeight: "100vh" }}>
      <div
        className="row justify-content-center align-items-center"
        style={{ height: "100%" }}
      >
        {/* Left */}
        <div
          className="col-md-6 col-lg-5 rounded-4 left-box p-4"
          style={{ background: "#103cbe", color: "white" }}
        >
          <div className="text-center mb-3">
            <Image
              src="/images/person.svg"
              alt="Person"
              width={200}
              height={200}
            />
          </div>
          <h1 className="text-center">Campus Link</h1>
          <p className="text-center mb-2">
            Your learning adventure begins here!
          </p>
          <p className="text-center mb-4">Please log in to get started.</p>
        </div>
        {/* Right */}
        <div className="col-md-6 col-lg-4 right-box p-4">
          <div className="text-center mb-3">
            <h2>Welcome back to Campus Link</h2>
          </div>
          {/* Enter email and password */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                name="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {/* Remember me, does not work yet */}
            <div className="mb-3 d-flex justify-content-between align-items-center">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="rememberCheck"
                />
                <label htmlFor="rememberCheck" className="form-check-label">
                  Remember Me
                </label>
              </div>
              {/* Forgot password, does not work yet */}
              <div>
                <small>
                  <a href="./recoverPassword.html">Forgot Password?</a>
                </small>
              </div>
            </div>
            {/* Login button */}
            <div className="mb-3">
              <button type="submit" className="btn btn-primary w-100">
                Login
              </button>
            </div>
            <div className="text-center">
              <small>
                Don&apos;t have an account? <Link href="/pages/register">Sign Up</Link>
              </small>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;

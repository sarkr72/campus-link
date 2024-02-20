"use client";

import Link from "next/link";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Auth } from "aws-amplify";
import { signIn } from "aws-amplify/auth";
import "../../utils/configureAmplify";
import styles from "/styles/authentification.css";
import img from "next/image";
import logoImage from "../resources/images/logo.png";
import GrowSpinner from "./Spinner";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // try {
    //   const formDataObj = {
    //     email: email,
    //     password: password,
    //   };

    //   const formData = new FormData();
    //   Object.entries(formDataObj).forEach(([key, value]) => {
    //     formData.append(key, value);
    //   });

    //   const response = await fetch(`/api/logIn`, {
    //     method: "POST",
    //     body: formData,
    //   });

    //   if (!response.ok) {
    //     // router.push("/pages/register");
    //     toast.error("Email or password not provided");
    //     console.error("Error inserting data:");
    //   }
    //   const data = await response.json();

    //   if (data && data.message === "Login successful") {

    //     router.push("/pages/register");
    //   } else if (data && data.error === "Email or password not provided") {
    //     toast.error("Email or password not provided");
    //   } else {
    //     console.log("Login failed or unexpected response:", data);
    //     toast.error("LogIn failed!");
    //   }
    // } catch (error) {
    //   console.error("Error inserting data:", error);
    // }
    const queryParams = new URLSearchParams();
    queryParams.append('username', email);
    queryParams.append('password', password);

    await signIn(queryParams)
      .then((user) => {
        console.log("User signed in successfully2:", user);
        router.push('/pages/home/[slug]', `/pages/home/${email}`);
      })
      .catch((error) => {
        console.error("Error signing in:", error);
      });
      setIsLoading(false);
  };

  if (isLoading) {
    return <GrowSpinner />;
  }
  
  return (
    <div
      className={`auth-container ${styles.footer}`}
      style={{ minHeight: "100vh" }}
    >
      <div className="row border rounded-5 p-3 bg-white shadow box-area">
        {/* Left */}
        <div className="col-md-6 rounded-4 left-box">
          {/* Logo of our site goes here */}
          <div>
            <Image
              className="featured-image"
              src={logoImage} // path to your logo file
              alt="Logo"
              width={250}
              height={250}
            />
          </div>
          <h1>Campus Link</h1>
          <small className="welcome-msg">
            Your learning adventure begins here!
          </small>
          <small className="welcome-msg">Please log in to get started.</small>
        </div>
        {/* Right */}
        <div className="col-md-6 right-box">
          <div className="row">
            <div className="header-text mb-4"></div>
            <p id="welcome">Welcome back to Campus Link</p>
          </div>
          {/* Enter email and password */}
          <form onSubmit={handleSubmit} className="input-group">
            <div className="input-group">
              <input
                type="email"
                className="form-control"
                name="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-group">
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
            <div className="input-group form-check remember-box">
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
            <div className="input-group">
              <button type="submit" className="btn btn-primary w-100">
                Login
              </button>
            </div>
            <div className="input-group d-flex align-items-center justify-content-center">
              <small>
                Don&apos;t have an account?{" "}
                <Link href="/pages/register">Sign Up</Link>
              </small>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;

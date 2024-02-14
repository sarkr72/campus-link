// components/UserForm.js
"use client";
import Link from "next/link";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const RegisterForm = () => {
  const router = useRouter();
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    major: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "confirmPassword") {
      if (value !== data.password) {
        setError("Passwords do not match");
      } else {
        setError("");
      }
    }

    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataObj = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        major: data.major,
      };

      const formData = new FormData();
      Object.entries(formDataObj).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await fetch(`/api/users`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        router.push("/pages/logIn");
        console.log("Data inserted successfully");
      } else {
        console.error("Error inserting data:");
      }
    } catch (error) {
      console.error("Error inserting data:", error);
    }
  };

  return (
    <div className="container py-5">
      <div className="row border rounded-5 p-3 bg-white shadow box-area">
        {/* Left */}
        <div
          className="col-md-6 rounded-4 left-box d-flex flex-column justify-content-center align-items-center"
          style={{ background: "#103cbe" }}
        >
          <div className="mb-4">
            {/* <Image
              src="/images/person.svg"
              alt="Person"
              width={250}
              height={250}
            /> */}
          </div>
          <h1 className="text-light">Campus Link</h1>
          <p className="text-light fs-5 mb-0">
            Your learning adventure begins here!
          </p>
          <p className="text-light fs-5">Please sign up to get started.</p>
        </div>
        {/* Right */}
        <div className="col-md-6 right-box">
          <h2 className="text-center mb-4">Sign Up</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                name="firstName"
                placeholder="Enter your first name"
                value={data.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                name="lastName"
                placeholder="Enter your last name"
                value={data.lastName}
                onChange={handleChange}
              />
            </div>
            {/* <div className="mb-3">
              <input
                type="text"
                className="form-control"
                name="schoolID"
                placeholder="Enter your school ID"
                value={data.schoolID}
                onChange={handleChange}
              />
            </div> */}
            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                name="email"
                placeholder="Enter your email"
                value={data.email}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <input
                type="age"
                className="form-control"
                name="age"
                placeholder="Enter your age"
                value={data.age}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <input
                type="major"
                className="form-control"
                name="major"
                placeholder="Enter your major"
                value={data.major}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="Enter password"
                value={data.password}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                name="confirmPassword"
                placeholder="Confirm password"
                value={data.confirmPassword}
                onChange={handleChange}
              />
              {error && (
                <p className="alert alert-danger py-1" role="alert">
                  {error}
                </p>
              )}
            </div>
            <div className="mb-3 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="rememberCheck"
              />
              <label htmlFor="rememberCheck" className="form-check-label">
                Remember Me
              </label>
            </div>
            <button type="submit" className="btn btn-lg btn-primary w-100">
              Signup
            </button>
            <div className="text-center mt-3">
              <small>
                Already Have an Account?{" "}
                <Link href="/pages/logIn">Log In</Link>
              </small>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;

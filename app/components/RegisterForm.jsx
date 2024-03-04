// components/UserForm.js
"use client";
// import { withAuthenticator } from "@aws-amplify/ui-react";
import Link from "next/link";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signUp } from "aws-amplify/auth";
import "../../utils/configureAmplify";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal, Button } from "react-bootstrap";
import GrowSpinner from "./Spinner";
import styles from "/styles/authentification.css";
import logoImage from "../resources/images/logo.png";
// import { Auth } from "aws-amplify";
import { confirmSignUp } from "aws-amplify/auth";
import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { db } from "../../firebase";
import {
  collection,
  deleteDoc,
  doc,
  documentId,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const RegisterForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    profilePicture: "",
    bio: "",
    major: "",
    minor: "",
    tutor: false,
    role: "",
  });
  const [error, setError] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    if (name === "confirmPassword") {
      if (value !== data?.password) {
        setError("Passwords do not match");
      } else {
        setError("");
      }
    }

    if (type === "file") {
      const newProfilePicture = e.target.files[0];
      if (newProfilePicture) {
        setImage(newProfilePicture);
        const reader = new FileReader();
        reader.onload = (event) => {
          setSelectedImage(reader.result);
          const fileData = event.target.result;
          setData((prevData) => ({
            ...prevData,
            profilePicture: fileData,
          }));
        };
        reader.readAsDataURL(newProfilePicture);
      }
    } else {
      setData((prevData) => ({
        ...prevData,
        [name]: newValue,
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.checked,
    });
  };

  if (isLoading) {
    return <GrowSpinner />;
  }

  const handleImageUpload = async () => {
    // Upload image to Firebase Storage
    const storage = getStorage();
    const storageRef = ref(storage, `images/profilepicture/${image.name}`);
    await uploadBytes(storageRef, image);

    // Get download URL of the uploaded image
    const imageUrl = await getDownloadURL(storageRef);
    // setImageUrl(imageUrl);

    // Update user document with image URL and path
    const usersCollection = collection(db, "users");
    const userQuery = query(usersCollection, where("email", "==", data.email));
    const querySnapshot = await getDocs(userQuery);
    querySnapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, {
        image: {
          name: image.name,
          url: imageUrl,
          path: `images/profilepicture/${image.name}`,
        },
      });
    });

    setImage(null); // Clear the input field after upload
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(false);
    // if (data?.password !== data?.confirmPassword) {
    //   setError("Passwords do not match");
    // } else {
    //   setError("");
    // }
    const { password, confirmPassword } = data;

    if (password !== confirmPassword) {
      // Handle password mismatch error
      toast.error("Passwords do not match");
      console.log("Passwords do not match");
      return;
    }

    if (!error) {
      const { password, confirmPassword } = data;
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        console.log("Passwords do not match");
        return;
      }

      try {
        setIsLoading(true);
        // const formDataObj = {
        //   email: data?.email,
        //   password: data?.password,
        //   firstName: data?.firstName,
        //   lastName: data?.lastName,
        //   major: data?.major,
        //   phone: data?.phone,
        //   role: data?.role,
        //   profilePicture: data?.profilePicture,
        //   bio: data?.bio,
        //   minor: data?.minor,
        //   isTutor: data?.isTutor,
        // };

        // const formData = new FormData();
        // Object.entries(formDataObj).forEach(([key, value]) => {
        //   formData.append(key, value);
        // });

        // await signUp({
        //   username: data.email,
        //   password: data.password,
        //   attributes: {
        //     firstName: data.firstName,
        //     lastName: data.lastName,
        //     email: data.email,
        //     phone_number: data.phone,
        //   },
        // });

        const auth = getAuth();
        // Adds user to authenticated accounts
        const userCredentials = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );
        console.log(
          "Success. The user is created in Firebase",
          userCredentials
        );

        if (userCredentials.user) {
          updateProfile(auth.currentUser, {
            displayName: data.firstName + data.lastName,
          });
          const user = userCredentials.user;
          const formDataCopy = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            role: data.role,
          };

          delete formDataCopy.password;
          formDataCopy.timestamp = serverTimestamp();
          await setDoc(doc(db, "users", user.uid), formDataCopy);

          const response = await fetch(`/api/users`, {
            method: "POST",
            headers: {
              "Content-type": "application/json",
            },
            body: JSON.stringify(data),
          });

          if (response.ok) {
            const responseData = await response.json();
            if (responseData.message === "Email already exists") {
              toast.error("Email already exists!");
            } else {
              await handleImageUpload();

              router.push("/pages/mainTimeline");
              // setShowConfirmationModal(true);
              console.log("called");
            }
          } else {
            toast.error("Failed to create user");
          }
        } else {
        }
      } catch (error) {
        console.error("Error creating user:", error);
        if (error.message.includes("Password must have uppercase characters")) {
          toast.error("Password must have uppercase characters!");
        } else if (error.message.includes("Password not long enough")) {
          toast.error("Password must be at least 8 characters long!");
        } else if (
          error.message.includes("Password must have numeric characters")
        ) {
          toast.error("Password must have numeric characters!");
        } else if (
          error.message.includes("Password must have symbol characters")
        ) {
          toast.error("Password must have symbol characters!");
        } else if (error.message.includes("auth/email-already-in-use")) {
          toast.error("Email already exists!");
        } else if (
          error.message.includes("Password should be at least 6 characters")
        ) {
          toast.error("Password should be at least 6 characters!");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  // const handleChangeConfirmationCode = (e) => {
  //   const { value } = e.target;
  //   setConfirmationCode(value);
  // };

  // const handleConfirm = async (e) => {
  //   e.preventDefault();
  //   try {
  //     console.log("email", data.email);
  //     const { isSignUpComplete, nextStep } = await confirmSignUp({
  //       username: data.email,
  //       confirmationCode,
  //     });
  //     if (isSignUpComplete) {
  //       router.push("/pages/mainTimeline");
  //     } else {
  //       toast.error("Wrong credentials");
  //     }
  //   } catch (error) {
  //     console.error("Error confirming sign up:", error);
  //     toast.error("Wrong confirmation code!");
  //   }
  // };

  return (
    <div>
      {!showConfirmationModal && (
        <div
          className={`auth-container ${styles.footer}`}
          style={{ minHeight: "100vh" }}
        >
          <div className={`row border rounded-5 p-3 bg-white shadow }`}>
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
              <small className="welcome-msg">
                Please signup to get started.
              </small>
            </div>
            {/* Right */}
            <div className="col-md-6 right-box">
              <div className="row">
                <div className="header-text">
                  <p id="welcome">Welcome to Campus Link</p>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="input-group">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    name="firstName"
                    placeholder="Enter your first name"
                    value={data.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    name="lastName"
                    placeholder="Enter your last name"
                    value={data.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    placeholder="Enter your email"
                    value={data.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    placeholder="Enter your password"
                    value={data.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <input
                    type="password"
                    className="form-control"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={data.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={data.phone}
                    onChange={handleChange}
                  />
                </div>
                <div style={{marginBottom: "10px"}}>
                  <input
                    type="file"
                    className="form-control"
                    name="profilePicture"
                    onChange={handleChange}
                  />
                   {selectedImage && (
                  <div style={{marginTop: "10px"}}>
                    <Image
                      src={selectedImage}
                      alt="Selected Image"
                      height={80}
                      width={80}
                    />
                  </div>
                )}
                </div>
                <div className="input-group">
                  <textarea
                    className="form-control"
                    name="bio"
                    placeholder="Enter your bio"
                    value={data.bio}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    name="major"
                    placeholder="Enter your major"
                    value={data.major}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    name="minor"
                    placeholder="Enter your minor"
                    value={data.minor}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group">
                  <select
                    className="form-select"
                    name="role"
                    value={data.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select your role</option>
                    <option value="student">Student</option>
                    <option value="professor">Professor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="input-group">
                  <input
                    type="checkbox"
                    className={`form-check-input mr-${10}`}
                    style={{ marginRight: "10px" }}
                    name="tutor"
                    checked={data.tutor}
                    onChange={handleCheckboxChange}
                  />
                  <label className="form-check-label" htmlFor="isTutor">
                    Are you a tutor?
                  </label>
                </div>
                <div className="input-group">
                  <button type="submit" className="btn btn-primary w-100">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showConfirmationModal && (
        <div style={{ minHeight: "100vh" }}>
          <div className=" top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
            <div className="container position-relative">
              <div className="d-flex flex-column justify-content-center align-items-center confirmation-box bg-light p-4 rounded shadow">
                <h1 className="text-center">Confirmation Page</h1>
                <p className="text-center">Are you sure you want to proceed?</p>
                <div className="mb-3">
                  <label htmlFor="confirmationCode" className="form-label">
                    {" "}
                    <span style={{ marginLeft: "30px" }}>
                      Confirmation Code
                    </span>
                    <input
                      type="text"
                      style={{ width: "200px" }}
                      className="form-control"
                      id="confirmationCode"
                      value={confirmationCode}
                      onChange={handleChangeConfirmationCode}
                    />
                  </label>
                </div>
                <div className="d-flex justify-content-center">
                  <Button
                    variant="primary"
                    onClick={handleConfirm}
                    className="mx-2"
                  >
                    Confirm
                  </Button>
                  <Button
                    variant="danger"
                    onClick={(e) => setShowConfirmationModal(false)}
                    className="mx-2"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;

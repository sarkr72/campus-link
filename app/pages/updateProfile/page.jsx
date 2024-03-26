// Import necessary dependencies
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import React, { useState } from "react";
import Image from "next/image";
import GrowSpinner from "../../components/Spinner";
import styles from "../../../styles/updateProfile.css";
import { db } from "../../../utils/firebase";
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
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import defaultProfilePicture from "../../resources/images/default-profile-picture.jpeg";

const UpdateProfilePage = () => {
  // const [currnetEmail, setCurrentEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState("");
  const [image, setImage] = useState(null);
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    profilePicture: "",
    bio: "",
    major: "",
    isTutor: "",
    role: "",
  });
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");
  const [currnetEmail, setCurrentEmail] = useState("");
  const auth = getAuth();
  const [imageUrl, setImageUrl] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);

        if (user?.email) {
          setUser(data);
          const usersCollection = collection(db, "users");
          const userQuery = query(
            usersCollection,
            where("email", "==", user.email)
          );
          const querySnapshot = await getDocs(userQuery);

          querySnapshot?.forEach((doc) => {
            const userData = doc?.data();
            if (userData) {
              setData({
                firstName: userData?.firstName || "",
                lastName: userData?.lastName || "",
                email: userData?.email || "",
                password: userData?.password || "",
                phone: userData?.phone || "",
                profilePicture: userData?.profilePicture?.url || "",
                bio: userData?.bio || "",
                major: userData?.major || "",
                isTutor: userData?.isTutor || false,
                role: userData?.role || "",
              });
            }
          });
        } else {
          console.log("Failed to fetch user data update page:", response);
        }
      }
    });
  }, []);

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
        };
        reader.readAsDataURL(newProfilePicture); // You can also use readAsArrayBuffer() for a blob
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (image) {
      const storage = getStorage();
      const storageRef = ref(storage, `images/profilepicture/${image?.name}`);
      await uploadBytes(storageRef, image);
      const imageUrl = await getDownloadURL(storageRef);
      const image2 = {
        url: imageUrl,
        path: `images/profilepicture/${image?.name}`,
      };
      data.profilePicture = image2;
    }
    await updateDoc(doc(db, "users", userId), {
      firstName: data?.firstName,
      lastName: data?.lastName,
      email: data?.email,
      password: data?.password,
      phone: data?.phone,
      profilePicture: image
        ? data?.profilePicture
        : { url: data?.profilePicture },
      bio: data?.bio,
      major: data?.major,
      isTutor: data?.isTutor,
      role: data?.role,
    });
    router.push("/pages/profile/");
    setIsLoading(false);
  };

  return (
    <div>
      <div
        className={`auth-container ${styles.footer}`}
        style={{ minHeight: "100vh" }}
      >
        <div className={`row border rounded-5 p-3 bg-white shadow }`}>
          {/* Left */}
          <div className="col-md-6 rounded-4 left-box">
            <div>
              <Image
                src={data.profilePicture || defaultProfilePicture}
                alt="Profile Picture"
                className="profile-pic"
                width={300}
                height={300}
              />
            </div>
          </div>
          {/* Right */}
          <div className="col-md-6 right-box">
            <form onSubmit={handleSubmit} className="input-group">
              <div className="input-group">
                <label style={{ marginRight: "10px", marginTop: "5px" }}>
                  First Name:{" "}
                  <input
                    type="text"
                    className="form-control"
                    name="firstName"
                    placeholder="Enter your first name"
                    value={data.firstName}
                    onChange={handleChange}
                    required
                  />{" "}
                </label>
              </div>
              <div className="input-group">
                <label style={{ marginRight: "10px", marginTop: "5px" }}>
                  Last Name:{" "}
                  <input
                    type="text"
                    className="form-control"
                    name="lastName"
                    placeholder="Enter your last name"
                    value={data.lastName}
                    onChange={handleChange}
                    required
                  />{" "}
                </label>
              </div>
              <div className="input-group">
                <label style={{ marginRight: "10px", marginTop: "5px" }}>
                  Email:{" "}
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    placeholder="Enter your email"
                    value={data.email}
                    onChange={handleChange}
                    disabled
                  />{" "}
                </label>
              </div>

              <div className="input-group">
                <label style={{ marginRight: "10px", marginTop: "5px" }}>
                  Phone:{" "}
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={data.phone}
                    onChange={handleChange}
                  />{" "}
                </label>
              </div>
              <div>
                <label style={{ marginRight: "10px", marginTop: "5px" }}>
                  Profile Picture:{" "}
                  <input
                    type="file"
                    className="form-control"
                    name="profilePicture"
                    onChange={handleChange}
                  />{" "}
                </label>
                {selectedImage && (
                  <div style={{ marginTop: "10px" }}>
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
                <label style={{ marginRight: "10px", marginTop: "5px" }}>
                  Bio:{" "}
                  <textarea
                    className="form-control"
                    name="bio"
                    placeholder="Enter your bio"
                    value={data.bio}
                    onChange={handleChange}
                  />
                </label>
              </div>
              <div className="input-group">
                <label style={{ marginRight: "10px", marginTop: "5px" }}>
                  Major:{" "}
                  <input
                    type="text"
                    className="form-control"
                    name="major"
                    placeholder="Enter your major"
                    value={data.major}
                    onChange={handleChange}
                  />{" "}
                </label>
              </div>

              <div className="input-group">
                <label style={{ marginRight: "10px", marginTop: "5px" }}>
                  Role:{" "}
                  <input
                    className="form-control"
                    type="text"
                    name="role"
                    value={data.role}
                    onChange={handleChange}
                    placeholder="Role"
                    disabled
                  />
                </label>
              </div>
              <div className="input-group">
                <label style={{ marginRight: "10px", marginTop: "5px" }}>
                  {" "}
                  <input
                    type="checkbox"
                    className={`form-check-input mr-${10}`}
                    style={{ marginRight: "10px" }}
                    name="isTutor"
                    checked={data.isTutor}
                    onChange={handleCheckboxChange}
                  />{" "}
                </label>
                <label className="form-check-label" htmlFor="isTutor">
                  Are you a tutor?
                </label>
              </div>

              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfilePage;

// Import necessary dependencies
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import React, { useState } from "react";
import Image from "next/image";
import GrowSpinner from "../../components/Spinner";
import styles from "../../../styles/authentification.css";
// import { fetchUserData } from "../../../utils/fetchUserData";
// import currentUser from "../../../utils/checkSignIn";
import { db } from "../../../firebase";
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
    minor: "",
    tutor: "",
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
        const email = await getUserEmailById(user.uid);
        console.log("id2: ", user.email);
        setEmail(user.email);
        if (email) {
          const response = await fetch(`/api/users/${email}`, {
            cache: "no-store",
          });
          // console.log("response: ", response);
          if (response.ok) {
            const data = await response.json();
            setData((prevData) => ({
              ...prevData,
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              password: data.password,
              phone: data.phone,
              profilePicture: data.profilePicture,
              bio: data.bio,
              major: data.major,
              minor: data.minor,
              tutor: data.isTutor,
              role: data.role,
            }));

            setUser(data);
            console.log("User data updatepage:", data);
            const usersCollection = collection(db, "users");
            const userQuery = query(
              usersCollection,
              where("email", "==", email)
            );
            const querySnapshot = await getDocs(userQuery);

            querySnapshot.forEach((doc) => {
              const userData = doc.data();
              console.log("url2: ");
              if (userData.image && userData.image.url) {
                setImageUrl(userData.image.url);
                console.log("url: ", userData.image.url);
              }
            });
          } else {
            console.log("Failed to fetch user data update page:", response);
          }
        }
      }
    });
  }, []);

  // useEffect(() => {
  //   const fetchImage = async () => {
  //     try {
  //       const usersCollection = collection(db, 'users');
  //       const userQuery = query(usersCollection, where('email', '==', email));
  //       const querySnapshot = await getDocs(userQuery);

  //       querySnapshot.forEach((doc) => {
  //         const userData = doc.data();
  //         console.log("url2: ")
  //         if (userData.image && userData.image.url) {
  //           setImageUrl(userData.image.url);
  //           console.log("url: ", userData.image.url)
  //         }
  //       });
  //     } catch (error) {
  //       console.error('Error fetching image:', error);
  //     }
  //   };

  //   fetchImage();
  // }, []);

  // useEffect(() => {
  //   setIsLoading(true);
  //   const fetchCurrentUser = async () => {
  //     try {
  //       const email = await currentUser();
  //       setCurrentEmail(email);

  //       if (email) {
  //         const response = await fetch(`/api/users/${email}`, {
  //           cache: "no-store",
  //         });
  //         console.log("response: ", response);
  //         if (response.ok) {
  //           const data = await response.json();
  //           setData((prevData) => ({
  //             ...prevData,
  //             firstName: data.firstName,
  //             lastName: data.lastName,
  //             email: data.email,
  //             password: data.password,
  //             phone: data.phone,
  //             profilePicture: data.profilePicture,
  //             bio: data.bio,
  //             major: data.major,
  //             minor: data.minor,
  //             tutor: data.isTutor,
  //             role: data.role,
  //           }));

  //           setUser(data);
  //           console.log("User data updatepage:", data);
  //         } else {
  //           console.log("Failed to fetch user data update page:", response);
  //         }
  //       } else {
  //         console.log("User is not signed in");
  //       }
  //     } catch (error) {
  //       console.error("Error getting current user:", error);
  //     } finally {
  //       setIsLoading(false);
  //       // setIsEmailSet(true);
  //     }
  //   };

  //   fetchCurrentUser();
  // }, []);

  const getUserEmailById = async (userId) => {
    try {
      console.log("id: ", userId);
      const userDocRef = doc(db, "users", userId);
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        const userEmail = userData.email;
        setCurrentEmail(userEmail);
        return userEmail;
      } else {
        throw new Error("User document not found");
      }
    } catch (error) {
      console.error("Error retrieving user email:", error);
    }
  };

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
        // Read the file as a data URL or a blob object
        const reader = new FileReader();
        reader.onload = (event) => {
          setSelectedImage(reader.result);
          const fileData = event.target.result;
          setData((prevData) => ({
            ...prevData,
            profilePicture: fileData, // Save the file data to the state
          }));
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

  // useEffect(() => {
  //   // setIsLoading(true);
  //   const fetchCurrentUser = async () => {
  //     try {
  //       const response = await fetch(`/api/users`);
  //       if (response.ok) {
  //         const data2 = await response.json();
  //         const extractedData = data2.map(user => ({
  //           firstName: user.firstName,
  //           lastName: user.lastName,
  //           email: user.email,
  //           password: user.password,
  //           phone: user.phone,
  //           profilePicture: user.profilePicture,
  //           bio: user.bio,
  //           major: user.major,
  //           minor: user.minor,
  //           isTutor: user.isTutor,
  //           role: user.role
  //         }));

  //         setData(extractedData[0]);
  //         setUser(data);
  //         console.log("ssss", data);
  //         setIsLoading(false);
  //         console.log("User data:", data);
  //       } else {
  //         console.log("Failed to fetch user data:", response.statusText);
  //       }
  //     } catch (error) {
  //       console.error("Error getting current user:", error);
  //     } finally {
  //     }
  //   };

  //   fetchCurrentUser();
  // }, []);

  const handleCheckboxChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.checked,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // setIsLoading(true);

    try {
      // const formDataObj = {
      //   email: data?.email,
      //   password: data?.password,
      //   firstName: data?.firstName,
      //   lastName: data?.lastName,
      //   major: data?.major,
      //   phone: data?.phone,
      //   role: data?.role,
      //   // profilePicture: 'defaultpicture',
      //   bio: data?.bio,
      //   minor: data?.minor,
      //   isTutor: data?.isTutor,
      // };

      // const formData = new FormData();
      // Object.entries(formDataObj).forEach(([key, value]) => {
      //   formData.append(key, value);
      // });

      const response = await fetch(`/api/users/${currnetEmail}`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await handleImageUpload();
        console.log("returned");
        window.location.reload();
        // router.refresh();
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setIsLoading(false); // Move setIsLoading inside the try block
    }
  };

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

  // if (isLoading) {
  //   return <GrowSpinner />;
  // }

  // useEffect(() => {
  //   if (imageUrl) {
  //     // Create a new image element to calculate the image's width
  //     const img = new Image();
  //     img.onload = () => {
  //       setImageWidth(img.width); // Set the image width
  //     };
  //     img.src = imageUrl; // Load the image
  //   }
  // }, [imageUrl]);

  return (
    <div>
      <div
        className={`auth-container ${styles.footer}`}
        style={{ minHeight: "100vh" }}
      >
        <div className={`row border rounded-5 p-3 bg-white shadow }`}>
          {/* Left */}
          <div className="col-md-6 rounded-4 left-box">
            {imageUrl && (
              <div>
                {console.log("urllll", imageUrl)}
                <Image
                  className="rounded-4 "
                  src={imageUrl}
                  alt="User"
                  height={400}
                  width={400}
                />
              </div>
            )}
          </div>
          {/* Right */}
          <div className="col-md-6 right-box">
            <div className="row"></div>
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
              <div >
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
                  Minor:{" "}
                  <input
                    type="text"
                    className="form-control"
                    name="minor"
                    placeholder="Enter your minor"
                    value={data.minor}
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
                    name="tutor"
                    checked={data.tutor}
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

// Import necessary dependencies
"use client";

// import '../../../utils/configureAmplify';
import { Amplify } from "aws-amplify";
import config from "../../../../aws-exports";
import "@aws-amplify/ui-react/styles.css";
Amplify.configure(config);

import GrowSpinner from "../../../components/Spinner";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

// import { getCurrentUser } from "aws-amplify/auth";
import currentUser from "../../../../utils/checkSignIn";

const HomePage2 = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  // const slug = router.query.slug;
  const [role, setRole] = useState("");
  const [signed, setSigned] = useState(false);
  const [user, setUser] = useState("");
  const [currnetEmail, setCurrentEmail] = useState("");
  // useEffect(() => {
  //   const fetchuser = async () => {
  //     if (slug) {
  //       const response = fetch(`/api/users/${slug}`, {
  //         method: "GET",
  //       });
  //       let data = "";
  //       if (response.ok) {
  //         data = await response?.json();
  //         setUser(data);
  //         console.log("data:", data)
  //         console.log("user:", user)
  //       }
  //     }
  //   };

  //   fetchuser();
  // }, [user, slug]);

  // useEffect(() => {
  //   fetch(`/api/users/${id}`, {
  //     method: "GET",
  //   })
  //     .then((response) => {
  //       if (response.ok) {
  //         return response.json();
  //       } else {
  //           toast.error('faild')
  //       }
  //     })
  //     .then((data) => {
  //       console.log("User data:", data);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching user data:", error);
  //     });
  // }, []);

  // useEffect(() => {
  //   const authenticateSignin = () => {
  //     let getCurrentEmail = '';
  //     getCurrentUserEmail().then((email) => {
  //       getCurrentEmail = email;
  //       console.log('ema', email)
  //     }).catch((error) => {
  //       console.error(error);
  //     });
  //     console.log('uuu', getCurrentEmail)
  //     if (getCurrentEmail) {
  //       fetch(`/api/users/${getCurrentEmail}`, {
  //         method: "GET",
  //       })
  //         .then((response) => {
  //           if (response.ok) {
  //             return response.json();
  //           } else {
  //             throw new Error("Failed to fetch user data");
  //           }
  //         })
  //         .then((userData) => {
  //           setUser(userData);
  //         })
  //         .catch((error) => {
  //           console.error("Error fetching user data:", error);
  //           toast.error("Failed to fetch user data");
  //         });
  //     }
  //   };

  //   authenticateSignin();
  // }, [user, role, signed]);

 

  useEffect(() => {
    const fetchCurrentUser = async () => {
      setIsLoading(true)
      try {
        currentUser()
          .then((email) => {
            setCurrentEmail(email);
          })
          .catch((error) => {
            console.error("Error getting user email:", error);
          });

        if (currnetEmail) {
          const response = await fetch(`/api/users/${email}`, {
            method: "GET",
          });
          if (response.ok) {
            const data = await response.json();
            setUser(data);
            // console.log("User data:", data);
          } else {
            console.log("Failed to fetch user data:", response.statusText);
          }
        } else {
          console.log("User is not signed in");
        }
       
      } catch (error) {
        console.error("Error getting current user:", error);
      }
    };
    fetchCurrentUser();
    setIsLoading(false)
  }, []);

  if (isLoading) {
    // window.location.reload();
    return <GrowSpinner />;
  }

  return (
    <div>
      {/* <Header /> */}
      <h1
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh" }}
      >
        Home Page for Campus Link
      </h1>
      <p>{user}</p>
      {/* <Footer /> */}
    </div>
  );
};

export default HomePage2;

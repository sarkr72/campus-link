"use client";
import {
  useParams,
} from "next/navigation";
import { useState, useEffect } from "react";
import {
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../utils/firebase";
import Link from "next/link";
import Image from "next/image";
import defaultProfilePicture from "../../../resources/images/default-profile-picture.jpeg";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const Followers2 = () => {
  const { id } = useParams();
  const [followers, setFollowers] = useState([]);
  const [userId, setUserId] =  useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (id) {
          const auth = getAuth();
          onAuthStateChanged(auth, async (user) => {
            setUserId(user?.uid);
            const userRef = doc(db, "users", id);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
              setFollowers(userDoc?.data()?.followers);
            }
          });
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);


  return (
    <div style={{ minHeight: "100vh", maxWidth: "800px", margin: "0 auto" }}>
      <h4>Followers</h4>
      <ul className="list-group">
        {followers?.map((user, index) => (
          <li
            key={index}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            {console.log("dddd", user)}
            <Link
              href={
                user?.id === userId
                  ? `/pages/profile`
                  : `/pages/profile/${encodeURIComponent(user?.id)}`
              }
              style={{ textDecoration: "none" }}
              className="d-flex align-items-center"
            >
              {user?.profilePicture ? (
                <Image
                  src={user?.profilePicture}
                  alt="Profile pic"
                  className="profile-pic rounded-5"
                  width={50}
                  height={50}
                />
              ) : (
                <Image
                  src={defaultProfilePicture}
                  alt="Default pic"
                  className="rounded-5"
                  width={50}
                  height={50}
                />
              )}
              <span className="ms-2 text-black">{user?.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Followers2;

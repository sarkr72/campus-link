'use client'
import {
  useRouter,
  useParams,
  useSearchParams,
  usePathname,
} from "next/navigation";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { Row, Breadcrumb, Card, Button } from "react-bootstrap";
import { db } from "../../../../utils/firebase";
import Link from "next/link";
import Image from "next/image";
import defaultProfilePicture from "../../../resources/images/default-profile-picture.jpeg";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
const Followers = () => {
    const { id } = useParams();
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState(id || "");
    const [user, setUser] = useState(null);
    const router = useRouter();
    const [userId, setUserId] = useState("");
    const [sentRequests, setSentRequests] = useState([]);
    const usersRef = collection(db, "users");
  
    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const auth = getAuth();
          onAuthStateChanged(auth, async (user) => {
            if (user) {
              setUserId(user.uid);
              const userRef = doc(db, "users", user.uid);
              const userDoc = await getDoc(userRef);
              if (userDoc.exists()) {
                const updatedFriendRequests = userDoc?.data()?.friendRequestsSent.map((request) => {
                  const [, requestUserId] = request.split(",");
                  return requestUserId;
                });
                setSentRequests(updatedFriendRequests || []);
              }
              const searchTerm = searchQuery.trim().toLowerCase();
  
              const firstNameQuerySnapshot = await getDocs(
                query(
                  usersRef,
                  where("firstName", ">=", searchTerm),
                  orderBy("firstName")
                )
              );
  
              const lastNameQuerySnapshot = await getDocs(
                query(
                  usersRef,
                  where("lastName", ">=", searchTerm),
                  orderBy("lastName")
                )
              );
  
              const filteredUsersSet = new Set();
              let filteredUsers = [];
              try {
                firstNameQuerySnapshot.forEach((doc) => {
                  const userData = doc?.data();
                  const fullName =
                    `${userData?.firstName} ${userData?.lastName}`.toLowerCase();
                  if (
                    fullName.includes(searchTerm) &&
                    !filteredUsersSet.has(userData.id)
                  ) {
                    filteredUsersSet.add(userData.id);
                    filteredUsers.push(userData);
                  }
                });
  
                lastNameQuerySnapshot.forEach((doc) => {
                  const userData = doc?.data();
                  const fullName =
                    `${userData?.firstName} ${userData?.lastName}`.toLowerCase();
                  if (
                    fullName.includes(searchTerm) &&
                    !filteredUsersSet.has(userData.id)
                  ) {
                    filteredUsersSet.add(userData.id);
                    filteredUsers.push(userData);
                  }
                });
              } catch (error) {
                console.error("Error fetching users:", error);
              }
  
              setSearchResults(filteredUsers);
            }
          });
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };
  
      fetchUsers();
    }, []);
  return (
    <div>
      
    </div>
  )
}

export default Followers;

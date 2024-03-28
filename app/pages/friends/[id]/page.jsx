"use client";
import {
  useRouter,
  useParams,
  useSearchParams,
  usePathname,
} from "next/navigation";
import { BsCheck } from "react-icons/bs";
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
  arrayUnion,
} from "firebase/firestore";
import { Row, Breadcrumb, Card, Button } from "react-bootstrap";
import { db } from "../../../../utils/firebase";
import Link from "next/link";
import Image from "next/image";
import defaultProfilePicture from "../../../resources/images/default-profile-picture.jpeg";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
const FriendRequests = () => {
  const { id } = useParams();
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [requests, setRequests] = useState([]);
  const [retrivedRequests, setRetrivedRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState("");
  const [toogle, setToggle] = useState(false);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      if (id) {
        try {


              const userRef = doc(db, "users", id);
              const userDoc = await getDoc(userRef);
              const userData = userDoc?.data();
            //   setCurrentUser(userData);
              setFriends(userData?.friends);
        
   
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      }
    };

    fetchUser();
  }, [id]);

  return (
    <div style={{ minHeight: "100vh", maxWidth: "800px", margin: "0 auto" }}>
      <h4>Friends</h4>
      <ul className="list-group">
        {friends?.map((user, index) => (
          <li
            key={index}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <Link
              href={`/pages/profile/${encodeURIComponent(user?.id)}`}
              style={{ textDecoration: "none" }}
              className="d-flex align-items-center text-black"
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
              <span className="ms-2">
                {user?.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendRequests;

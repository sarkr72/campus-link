"use client";
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
  arrayUnion,
  serverTimestamp
} from "firebase/firestore";
import { Row, Breadcrumb, Card, Button } from "react-bootstrap";
import { db } from "../../../utils/firebase";
import Link from "next/link";
import Image from "next/image";
import defaultProfilePicture from "../../resources/images/default-profile-picture.jpeg";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const FriendRequests = () => {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [requests, setRequests] = useState([]);
  const [retrivedRequests, setRetrivedRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState("");
  const [toogle, setToggle] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            setUserId(user.uid);
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);
            setUser(userDoc?.data());
            let updatedFriendRequests = [];
            let retrivedRequestsArray = [];
            if (userDoc.exists()) {
              updatedFriendRequests = userDoc
                ?.data()
                ?.friendRequests?.map((request) => {
                  retrivedRequestsArray.push(request);
                  const [, requestUserId] = request.split(",");
                  return requestUserId;
                });
              setRetrivedRequests(retrivedRequestsArray);
              setRequests(updatedFriendRequests || []);
              const fetchedRequests = [];
              if (updatedFriendRequests?.length > 0) {
                for (const requestUserId of updatedFriendRequests) {
                  const requestUserRef = doc(db, "users", requestUserId);
                  const requestUserDoc = await getDoc(requestUserRef);
                  if (requestUserDoc.exists()) {
                    fetchedRequests.push(requestUserDoc?.data());
                  }
                }
              }
              setUsers(fetchedRequests || []);
            }
          }
        });
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleConfirm = async (e, id, name, profilePicture) => {
    e.preventDefault();
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    const updatedFriendRequests = retrivedRequests?.filter((request) => {
      const [, requestUserId] = request.split(",");
      return requestUserId !== id;
    });
    handleSendEmail(e);
    setRetrivedRequests(updatedFriendRequests);
    await updateDoc(
      userDoc.ref,
      {
        friends: arrayUnion({
          name: name,
          id: id,
          profilePicture: profilePicture?.url || null,
          timestamp: new Date(),
        }),
        friendRequests: updatedFriendRequests,
      },
      { merge: true }
    );

    const userrRef = doc(db, "users", id);
    const userrDoc = await getDoc(userrRef);
    const sentRequests = userrDoc?.data()?.friendRequestsSent;
    const updateddFriendRequests2 = sentRequests?.filter((request) => {
      const [, requestUserId] = request.split(",");
      return requestUserId !== userId;
    });
    await updateDoc(
      userrDoc.ref,
      {
        friends: arrayUnion({
          name: user?.firstName + " " + user?.lastName,
          id: userId,
          profilePicture: user?.profilePicture?.url || null,
          timestamp: new Date(),
        }),
        friendRequestsSent: updateddFriendRequests2,
      },
      { merge: true }
    );
    console.log("Friend request accepted successfully.");
  };

  const handleRemove = async (e, id) => {
    e.preventDefault();
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    const updatedFriendRequests = retrivedRequests?.filter((request) => {
      const [, requestUserId] = request.split(",");
      return requestUserId !== id;
    });
    setRetrivedRequests(updatedFriendRequests);
    await updateDoc(userDoc.ref, {
      friendRequests: updatedFriendRequests,
    });
    const userrRef = doc(db, "users", id);
    const userrDoc = await getDoc(userrRef);
    const sentRequests = userrDoc?.data()?.friendRequestsSent;
    const updateddFriendRequests = sentRequests?.filter((request) => {
      const [, requestUserId] = request.split(",");
      return requestUserId !== userId;
    });
    await updateDoc(userrDoc.ref, {
      friendRequestsSent: updateddFriendRequests,
    });
    console.log("Friend request canceled successfully.");
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    const emailTo = "rinkusarkar353@gmail.com";
    const message = `${user?.firstName} ${user?.lastName} has sent you a friend request!`;
    const data = { message, emailTo };
    try {
      const response = await fetch("/api/sendEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("Error sending email:", error, response);
    }
  };

  return (
    <div style={{ minHeight: "100vh", maxWidth: "800px", margin: "0 auto" }}>
      <h4>FriendRequests</h4>
      <ul className="list-group">
        {users.map((user, index) => (
          <li
            key={index}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <Link
              href={`/pages/profile/${encodeURIComponent(user?.id)}`}
              style={{ textDecoration: "none" }}
              className="d-flex align-items-center"
            >
              {user?.profilePicture?.url ? (
                <Image
                  src={user?.profilePicture?.url}
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
                {user.firstName} {user.lastName}
              </span>
            </Link>
            {user?.id !== userId && (
              <div style={{ display: "flex", flexDirection: "row" }}>
                {retrivedRequests?.map((request, index) => {
                  const [, requestId] = request.split(",");
                  return requestId === user.id ? (
                    <Button
                      key={`${index}-cancel`}
                      onClick={(e) => handleRemove(e, user.id)}
                      style={{
                        backgroundColor: "#1ec8ff",
                        color: "white",
                        border: "none",
                        marginRight: "15px",
                      }}
                    >
                      Remove
                    </Button>
                  ) : null;
                })}
                {retrivedRequests?.map((request, index) => {
                  const [, requestId] = request.split(",");
                  return requestId === user.id ? (
                    <Button
                      key={`${index}-confirm`}
                      onClick={(e) =>
                        handleConfirm(
                          e,
                          user?.id,
                          user?.firstName + " " + user?.lastName,
                          user?.profilePicture
                        )
                      }
                      style={{
                        backgroundColor: "green",
                        color: "white",
                        border: "none",
                      }}
                    >
                      Confirm
                    </Button>
                  ) : null;
                })}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendRequests;

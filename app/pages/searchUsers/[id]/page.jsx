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
} from "firebase/firestore";
import { Row, Breadcrumb, Card, Button } from "react-bootstrap";
import { db } from "../../../../utils/firebase";
import Link from "next/link";
import Image from "next/image";
import defaultProfilePicture from "../../../resources/images/default-profile-picture.jpeg";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const SearchPage = () => {
  const { id } = useParams();
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState(id || "");
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [sentRequests, setSentRequests] = useState([]);
  const usersRef = collection(db, "users");
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            setUserId(user.uid);
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);
            const userData = userDoc?.data();
            setFriends(userData?.friends);
            setUser(userData);
            if (userDoc.exists()) {
              const updatedFriendRequests = userData?.friendRequestsSent?.map(
                (request) => {
                  const [, requestUserId] = request.split(",");
                  return requestUserId;
                }
              );
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

  const handleSearchInputChange = (e) => {
    e.preventDefault();
    setSearchQuery(e.target.value);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim().length < 1) {
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
    } else {
      setSearchResults([]);
    }
  };

  const handleSendEmail = async (emailTo) => {
    // e.preventDefault();
    // const emailTo = "rinkusarkar353@gmail.com";
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

  const sendRequest = async (reciverId, name) => {
    try {
      const usersRef = doc(db, "users", reciverId);
      const usersDoc = await getDoc(usersRef);

      if (usersDoc.exists()) {
        const data = usersDoc?.data();
        handleSendEmail(data?.email);
        const friendRequests = data?.friendRequests || [];
        const isRequestFound = friendRequests.some((request) => {
          const [, requestUserId] = request.split(",");
          return requestUserId === userId;
        });

        if (isRequestFound) {
          const updatedFriendRequests = friendRequests.filter((request) => {
            const [, requestUserId] = request.split(",");
            return requestUserId !== userId;
          });
          

          await updateDoc(usersDoc.ref, {
            friendRequests: updatedFriendRequests,
          });
          console.log("Friend request canceled successfully.");
        } else {
          console.log("namess", user.firstName, user.lastName, userId);
          const updatedFriendRequests = [
            ...friendRequests,
            `${user?.firstName} ${user?.lastName},${userId}`,
          ];
          await updateDoc(usersDoc.ref, {
            friendRequests: updatedFriendRequests,
          });
          console.log("Friend request sent successfully.");
        }
      } else {
        console.log("No user found with the specified ID.");
      }

      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const friendRequestsSent = userDoc?.data()?.friendRequestsSent || [];
        const isRequestFound = friendRequestsSent.some((request) => {
          const [, requestUserId] = request.split(",");
          return requestUserId === reciverId;
        });

        if (isRequestFound) {
          const updatedFriendRequests = friendRequestsSent.filter((request) => {
            const [, requestUserId] = request.split(",");
            return requestUserId !== reciverId;
          });
          await updateDoc(userDoc.ref, {
            friendRequestsSent: updatedFriendRequests,
          });
          console.log("Friend request canceled successfully.");
        } else {
          const updatedFriendRequests = [
            ...friendRequestsSent,
            `${name},${reciverId}`,
          ];
          await updateDoc(userDoc.ref, {
            friendRequestsSent: updatedFriendRequests,
          });

          console.log("Friend request sent successfully.");
        }
      } else {
        console.log("User document not found.");
      }
    } catch (error) {
      console.error("Error sending/canceling friend request:", error);
    }
  };

  const handleSendRequest = async (e, receiverId, name) => {
    e.preventDefault();
    if (
      friends?.some((request) => {
        const [, requestId] = request.split(",");
        return requestId === receiverId;
      })
    ) {

    } else {
      await sendRequest(receiverId, name);
      if (sentRequests?.some((item) => item === receiverId)) {
        setSentRequests((prevSentRequests) =>
          prevSentRequests.filter((id) => id !== receiverId)
        );
      } else {
        setSentRequests((prevSentRequests) => [
          ...prevSentRequests,
          receiverId,
        ]);
      }
    }
  };

  return (
    <div style={{ minHeight: "100vh", maxWidth: "800px", margin: "0 auto" }}>
      <h4>Search results:</h4>
      <form onSubmit={handleSearch}>
        <div className="input-group mb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchInputChange}
            className="form-control"
            style={{ width: "200px" }}
            placeholder="Search by firstName, lastName, or firstName + lastName"
          />
          <button className="btn btn-primary" type="submit">
            Search
          </button>
        </div>
      </form>
      <ul className="list-group">
        {searchResults.map((user, index) => (
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
              <>
                <Button
                  key={index}
                  onClick={(e) =>
                    handleSendRequest(
                      e,
                      user?.id,
                      user?.firstName + " " + user?.lastName
                    )
                  }
                  style={{
                    backgroundColor: sentRequests.some((item) =>
                      item.includes(user?.id)
                    )
                      ? "gray"
                      : "green",
                    color: "white",
                    border: "none",
                  }}
                >
                  {friends?.some((request) => {
                    const [, requestId] = request.split(",");
                    return requestId === user.id;
                  })
                    ? "Friend"
                    : sentRequests?.some((item) => item.includes(user?.id))
                    ? "Cancel"
                    : "Send Request"}
                </Button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchPage;

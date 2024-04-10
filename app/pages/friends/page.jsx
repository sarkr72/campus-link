"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  getDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../../utils/firebase";
import Link from "next/link";
import Image from "next/image";
import defaultProfilePicture from "../../resources/images/default-profile-picture.jpeg";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const FriendRequests = () => {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFriends, setFilteredFriends] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            setUserId(user.uid);
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);
            const userData = userDoc?.data();
            setFriends(userData?.friends);
          }
        });
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    filterFriends();
  };

  const filterFriends = () => {
    if (searchTerm.trim() === "") {
      setFilteredFriends([...friends]);
    } else {
      const filtered = friends.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const unFiltered = friends.filter(
        (user) => !user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const sortedFiltered = filtered.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setFilteredFriends([...sortedFiltered, ...unFiltered]);
    }
  };

  // useEffect to filter friends when searchTerm changes
  useEffect(() => {
    filterFriends();
  }, [searchTerm, friends]);

  const handleSearchInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div style={{ minHeight: "100vh", maxWidth: "500px", marginLeft: "20px" }}>
      <h4 style={{ marginTop: "10px" }}>Friends</h4>
      <form onSubmit={handleSearchSubmit}>
        <div className="input-group">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchInputChange}
            className="form-control rounded-5"
            placeholder="Search"
          />
          {searchTerm.trim().length > 0 && (
            <div className="input-group-append">
              <button className="btn btn-primary rounded-5" type="submit">
                Search
              </button>
            </div>
          )}
        </div>
      </form>
      <ul className="list-group mt-3">
        {filteredFriends.map((user, index) => (
          <li
            key={index}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <Link
              href={`/pages/profile/${encodeURIComponent(user?.id)}`}
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

export default FriendRequests;

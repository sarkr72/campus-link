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
  serverTimestamp,
} from "firebase/firestore";
import { Row, Breadcrumb, Card, Button } from "react-bootstrap";
import { db } from "../../../utils/firebase";
import Link from "next/link";
import Image from "next/image";
import defaultProfilePicture from "../../resources/images/default-profile-picture.jpeg";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const Followers = () => {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [followers, setFollowers] = useState([]);
  const [user, setUser] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFriends, setFilteredFriends] = useState([]);

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
            if (userDoc.exists()) {
              setFollowers(userDoc?.data()?.followers);
            }
          }
        });
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const remove = async (e, id) => {
    e.preventDefault();
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    const userRef2 = doc(db, "users", id);
    const userDoc2 = await getDoc(userRef2);

    const exists = followers?.some((follower) => follower.id === id);

    if (exists) {
      const updatedfollowers = followers?.filter((friend) => {
        const friendId = friend?.id;
        return friendId !== id;
      });

      setFollowers(updatedfollowers);
      await updateDoc(userDoc.ref, {
        followers: updatedfollowers,
      });

      const updatedFollowing = userDoc2?.data()?.following?.filter((friend) => {
        const friendId = friend?.id;
        return friendId !== userId;
      });

      await updateDoc(userDoc2.ref, {
        following: updatedFollowing,
      });
    }
  };

  const handleSearchInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    filterFriends();
  };

  const filterFriends = () => {
    if (searchTerm.trim() === "") {
      setFilteredFriends([...followers]);
    } else {
      const filtered = followers.filter((user) =>
        user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const unFiltered = followers.filter(
        (user) => !user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const sortedFiltered = filtered.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setFilteredFriends([...sortedFiltered, ...unFiltered]);
    }
  };

  useEffect(() => {
    filterFriends();
  }, [searchTerm, followers]);


  return (
    <div style={{ minHeight: "100vh", maxWidth: "800px", margin: "0 auto" }}>
      <h4>Followers</h4>
      <form onSubmit={handleSearchSubmit} style={{marginBottom: "10px"}}>
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
      <ul className="list-group">
        {filteredFriends?.map((user, index) => (
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
            <Button
              style={{ alignSelf: "flex-end" }}
              className="align-self-center"
              onClick={(e) => remove(e, user?.id)}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Followers;

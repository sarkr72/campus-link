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
  const [following, setFollowing] = useState([]);
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
              setFollowing(userDoc?.data()?.following);
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

    const exists = following?.some((follower) => follower.id === id);

    if (exists) {
      const updatedFollowing = following?.filter((friend) => {
        const friendId = friend?.id;
        return friendId !== id;
      });

      setFollowing(updatedFollowing);
      await updateDoc(userDoc.ref, {
        following: updatedFollowing,
      });

      const updatedFollowers = userDoc2?.data()?.followers?.filter((friend) => {
        const friendId = friend?.id;
        return friendId !== userId;
      });

      await updateDoc(userDoc2.ref, {
        followers: updatedFollowers,
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
      setFilteredFriends([...following]);
    } else {
      const filtered = following.filter((user) =>
        user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const unFiltered = following.filter(
        (user) => !user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const sortedFiltered = filtered.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setFilteredFriends([...sortedFiltered, ...unFiltered]);
    }
  };

  // useEffect to filter following when searchTerm changes
  useEffect(() => {
    filterFriends();
  }, [searchTerm, following]);

  return (
    <div style={{ minHeight: "100vh", maxWidth: "800px", margin: "0 auto" }}>
      <h4>Following</h4>
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

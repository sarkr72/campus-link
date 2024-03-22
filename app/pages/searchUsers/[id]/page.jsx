"use client";
import {
  useRouter,
  useParams,
  useSearchParams,
  usePathname,
} from "next/navigation";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../../../utils/firebase";
import Link from "next/link";
import Image from "next/image";
import defaultProfilePicture from "../../../resources/images/default-profile-picture.jpeg";

const SearchPage = () => {
  const { id } = useParams();
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState(id || "");
  const [users, setUsers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        const querySnapshot = await getDocs(usersRef);
        const fetchedUsers = [];
        querySnapshot.forEach((doc) => {
          fetchedUsers.push({ id: doc.id, ...doc.data() });
        });
        setUsers(fetchedUsers);
        const searchTerm = id?.trim().toLowerCase();
        const filteredUsers = users.filter((user) => {
          const fullName = `${user?.firstName} ${user?.lastName}`.toLowerCase();
          return fullName.includes(searchTerm);
        });
        setSearchResults(filteredUsers);
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim().length < 1) {
      const searchTerm = searchQuery.toLowerCase();
      const filteredUsers = users.filter((user) => {
        const fullName = `${user?.firstName} ${user?.lastName}`.toLowerCase();
        return fullName.includes(searchTerm);
      });
      setSearchResults(filteredUsers);
    } else {
      setSearchResults([]);
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
              href={`/pages/profile/${encodeURIComponent(user?.email)}`}
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
            <button className="btn  btn-success">Send Request</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchPage;

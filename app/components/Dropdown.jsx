import { useEffect, useRef, useState } from "react";
import GrowSpinner from "./Spinner";
import { collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../utils/firebase";

const Dropdown = ({ userId }) => {
  const [isLoading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchUser = async () => {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFormData(docSnap.data());
      }
      setLoading(false);
    };
    fetchUser();
  }, [userId]);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleOutsideClick = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const onChange = (role) => {
    setFormData((prevData) => ({
      ...prevData,
      role,
    }));
    setIsOpen(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const docRef = doc(db, "users", userId);
      await updateDoc(docRef, formData);
      setLoading(false);
    } catch (error) {
      console.error("Error updating user:", error);
      setLoading(false);
    }
  };

  return (
    <div>
      {isLoading ? (
        <GrowSpinner />
      ) : (
        <div>
          <form onSubmit={onSubmit}>
            {/* Dropdown button */}
            <div className="dropdown">
              <button
                className="btn btn-primary dropdown-toggle"
                type="button"
                onClick={toggleDropdown}
              >
                {formData.role}
              </button>

              {/* Dropdown menu */}
              <div
                className={`dropdown-menu${isOpen ? " show" : ""}`}
                ref={dropdownRef}
                aria-labelledby="dropdownMenuButton"
              >
                <button
                  className="dropdown-item"
                  onClick={() => onChange("admin")}
                >
                  Admin
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => onChange("professor")}
                >
                  Professor
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => onChange("student")}
                >
                  Student
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => onChange("tutor")}
                >
                  Tutor
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Dropdown;

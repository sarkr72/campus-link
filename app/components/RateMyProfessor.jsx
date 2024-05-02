import { db } from "../utils/firebase";
import { Modal, Button, Form } from "react-bootstrap";
import { FaStar } from "react-icons/fa";
import {
  collection,
  deleteDoc,
  doc,
  documentId,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useState, useEffect, useRef } from "react";
import Rating from "./Rating";
import { useRouter } from "next/navigation"; 

const RateMyProfessor = ({ professor }) => {
  const router = useRouter();
  const difficultyLevels = [
    { level: "Very Easy", value: 1 },
    { level: "Easy", value: 2 },
    { level: "Average", value: 3 },
    { level: "Difficult", value: 4 },
    { level: "Very Difficult", value: 5 },
  ];
  const ratings = [
    { value: 1, level: "Awful" },
    { value: 2, level: "Ok" },
    { value: 3, level: "Good" },
    { value: 4, level: "Great" },
    { value: 5, level: "Awesome" },
  ];

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [difficulty, setDifficulty] = useState(0);
  const [takeAgain, setTakeAgain] = useState("");
  const [forCredit, setForCredit] = useState("");
  const [courseCodes, setCourseCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
          if (user) {
           setUser(user?.displayName);
            const docRef2 = doc(db, "courses", process.env.NEXT_PUBLIC_docId);
            const docSnapshot2 = await getDoc(docRef2);
            if (docSnapshot2.exists()) {
              const retrievedCourses = docSnapshot2.data();
              const filteredResults = Object.entries(retrievedCourses).filter(
                ([courseId, courseData]) => {
                  const { professors } = courseData;
                  const professorMatch = professors?.some(
                    (professor1) =>
                      professor1.toLowerCase() === professor.toLowerCase()
                  );
                  return professorMatch;
                }
              );
              const courseIds = filteredResults.map(([courseId]) => courseId);
              setCourseCodes(courseIds);
              setLoading(false);
            }
          }
        });
      } catch (error) {
        console.error("Error fetching professors:", error);
        setError(
          "An error occurred while fetching course data. Please try again later."
        );
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRatingClick = (value) => {
    setRating(value);
  };

  const handleDifficultyClick = (value) => {
    setDifficulty(value);
  };

  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!courseCode || !rating || !takeAgain || !forCredit) {
      setError("Please fill out all required fields.");
      return;
    }
  
    try {
      const docRef = doc(
        db,
        "professors",
        process.env.NEXT_PUBLIC_docId2
      );
  
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        const professorsData = docSnapshot.data();
        const updatedProfessors = professorsData.professors.map((prof) => {
          if (prof.name.toLowerCase() === professor.toLowerCase()) {
            const updatedRatings = prof.ratings ? [...prof.ratings] : [];
            return {
              ...prof,
              ratings: [
                ...updatedRatings,
                {
                  rating,
                  feedback,
                  difficulty,
                  takeAgain,
                  forCredit,
                  courseCode,
                  rater: user,
                },
              ],
            };
          } else {
            return prof;
          }
        });
  
        await updateDoc(docRef, { professors: updatedProfessors });
  
        alert("Rating submitted successfully!");
        router.push("/pages/rateMyProfessor");
      } else {
        console.error("Professors document does not exist.");
        setError("An error occurred while submitting your rating.");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      setError(
        "An error occurred while submitting your rating. Please try again later."
      );
    }
  };
  
  
  

  return (
    <div className="container">
      <h1>Rate Your Professor</h1>
      <h3>{professor}</h3>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="courseCode" className="form-label">
              Select Course Code*
            </label>
            <select
              className="form-select"
              id="courseCode"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              required
            >
              <option value="">Select Course Code</option>
              {courseCodes?.map((courseId) => (
                <option key={courseId} value={courseId}>
                  {courseId}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="professorRating" className="form-label">
              Rate your professor*
            </label>
            <div className="d-flex align-items-center">
              <Rating
                value={rating}
                color="#f8e825"
                size="32px"
                onRatingChange={handleRatingClick}
                difficultyLevels={ratings}
              />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="professorDifficulty" className="form-label">
              How difficult was this professor?*
            </label>
            <div className="d-flex align-items-center">
              <Rating
                value={difficulty}
                color="#f8e825"
                size="32px"
                onRatingChange={handleDifficultyClick}
                difficultyLevels={difficultyLevels}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">
              Would you take this professor again?*
            </label>
            <div>
              <input
                type="radio"
                name="takeAgain"
                id="takeAgainYes"
                value="Yes"
                checked={takeAgain === "Yes"}
                onChange={() => setTakeAgain("Yes")}
                required
              />
              <label htmlFor="takeAgainYes" className="form-check-label">
                Yes
              </label>
            </div>
            <div>
              <input
                type="radio"
                name="takeAgain"
                id="takeAgainNo"
                value="No"
                checked={takeAgain === "No"}
                onChange={() => setTakeAgain("No")}
              />
              <label htmlFor="takeAgainNo" className="form-check-label">
                No
              </label>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">
              Was this class taken for credit?
            </label>
            <div>
              <input
                type="radio"
                name="forCredit"
                id="forCreditYes"
                value="Yes"
                checked={forCredit === "Yes"}
                onChange={() => setForCredit("Yes")}
              />
              <label htmlFor="forCreditYes" className="form-check-label">
                Yes
              </label>
            </div>
            <div >
              <input
                type="radio"
                name="forCredit"
                id="forCreditNo"
                value="No"
                checked={forCredit === "No"}
                onChange={() => setForCredit("No")}
              />
              <label htmlFor="forCreditNo" className="form-check-label">
                No
              </label>
            </div>
            <div style={{marginTop: "20px"}}>
            <Form.Group  controlId="feedback">
              <Form.Label>Feedback</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter your feedback"
              />
            </Form.Group>
            </div>
          </div>

          {error && <p className="text-danger">{error}</p>}

          <button  type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default RateMyProfessor;

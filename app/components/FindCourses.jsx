import React, { useState, useEffect } from "react";
import { db } from "../utils/firebase"; // Assuming you've already initialized Firebase and exported the Firestore instance as 'db'
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  query,
  where,
  Timestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Modal, Button, Form } from "react-bootstrap";

const FindCourses = () => {
  const [courses, setCourses] = useState([]);
  const [courseId2, setCourseId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const[signedIn, setSignedIn] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            const docRef = doc(db, "users", user.uid);
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
              setSignedIn(true);
            }
          }
        });
        const docRef = doc(db, "courses", process.env.NEXT_PUBLIC_docId);
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
          setCourses(docSnapshot.data());
        } else {
          console.log(`Document with ID  does not exist.`);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchData();
  }, []);

  const [selectedCourse, setSelectedCourse] = useState(null);

  const handleCourseSelect = (courseId) => {
    setCourseId(courseId);
    console.log(courseId);
    setSelectedCourse(courses[courseId]);
  };

  const handleCloseModal = () => {
    setSelectedCourse(null);
    setCourseId("");
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const filteredResults = Object.entries(courses).filter(
      ([courseId, courseData]) => {
        const { CourseName, professors } = courseData;
        return (
          courseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          CourseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          professors?.some((professor) =>
            professor.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      }
    );
    setSearchResults(filteredResults);
  };

  return (
    <div className="container">
      <h1>Courses</h1>
      <Form.Group controlId="searchForm" style={{ marginBottom: "10px" }}>
        <Form.Control
          type="text"
          placeholder="Search by Course ID, Name, or Professor"
          value={searchTerm}
          onChange={handleSearch}
        />
      </Form.Group>
      <div className="row">
        {searchResults.map(([courseId, courseData]) => (
          <div key={courseId} className="col-md-4 mb-3">
            <div className="card" onClick={() => handleCourseSelect(courseId)}>
              <div className="card-body">
                <h5 className="card-title">{courseId}</h5>
                <p className="card-text">{courseData.CourseName}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Modal show={selectedCourse} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Course Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCourse && (
            <>
              <p>
                <strong>Course ID:</strong> {Object.keys(selectedCourse)[0]}
              </p>
              <p>
                <strong>Course Name:</strong> {selectedCourse.CourseName}
              </p>
              <p>
                <strong>Course Description:</strong>{" "}
                {selectedCourse.CourseDescription}
              </p>
              <p>
                <strong>Building:</strong> {selectedCourse.Building}
              </p>
              <p>
                <strong>Room Number:</strong> {selectedCourse.roomNumber}
              </p>
              <p>
                <strong>Professors:</strong>{" "}
                {selectedCourse.professors.join(", ")}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FindCourses;

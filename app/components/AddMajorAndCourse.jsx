import { db } from "../../firebase";
import { useState, useEffect } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { getAuth, onAuthStateChanged } from "firebase/auth";
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

export default function AddCoursePage() {
  const [professors, setProfessors] = useState([]);
  const [userId, setUserId] = useState("");
  const [courseData, setCourseData] = useState({
    courseNumber: "",
    building: "",
    courseDescription: "",
    courseName: "",
    professors: [],
    roomNumber: "",
  });

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      }
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData({ ...courseData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userCollectionRef = collection(db, "courses");
    try {
      const querySnapshot = await getDocs(userCollectionRef);
      if (!querySnapshot.empty) {
        const courseDocRef = querySnapshot.docs[0].ref;

        // Update the document using its reference
        await updateDoc(courseDocRef, {
          [courseData?.courseNumber]: {
            Building: courseData.building,
            CourseDescription: courseData.courseDescription,
            CourseName: courseData.courseName,
            professors: courseData.professors,
            roomNumber: courseData.roomNumber,
          },
        });
        setCourseData({
          CourseName: "",
          CourseDescription: "",
          Building: "",
          RoomNumber: "",
          Professors: professors,
        });
      } else {
        console.error("No documents found in the 'courses' collection.");
      }

      console.log("Course added successfully!");
      toast.success("Course added successfully!");
    } catch (error) {
      console.error("Error adding course: ", error);
    }
  };

  const handleProfessorChange = (e, index) => {
    const newProfessors = [...courseData.professors];
    newProfessors[index] = e.target.value;
    setCourseData({ ...courseData, professors: newProfessors });
  };

  // Initialize the professors array with an empty string if it's undefined
  const professorsArray = courseData.professors || [];

  return (
    <div className="container mt-5">
      <h2>Add Course</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="courseNumber" className="form-label">
            Course Number
          </label>
          <input
            type="text"
            className="form-control"
            id="courseNumber"
            name="courseNumber"
            value={courseData.courseNumber}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="building" className="form-label">
            Building
          </label>
          <input
            type="text"
            className="form-control"
            id="building"
            name="building"
            value={courseData.building}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="courseDescription" className="form-label">
            Course Description
          </label>
          <textarea
            className="form-control"
            id="courseDescription"
            name="courseDescription"
            value={courseData.courseDescription}
            onChange={handleInputChange}
            required
          ></textarea>
        </div>
        <div className="mb-3">
          <label htmlFor="courseName" className="form-label">
            Course Name
          </label>
          <input
            type="text"
            className="form-control"
            id="courseName"
            name="courseName"
            value={courseData.courseName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="professors" className="form-label">
            Professors
          </label>
          {professorsArray?.map((professor, index) => (
            <input
              type="text"
              className="form-control mb-2"
              key={index}
              value={professor}
              onChange={(e) => handleProfessorChange(e, index)}
            />
          ))}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              setCourseData({
                ...courseData,
                professors: [...professorsArray, ""],
              })
            }
          >
            Add Professor
          </button>
        </div>
        <div className="mb-3">
          <label htmlFor="roomNumber" className="form-label">
            Room Number
          </label>
          <input
            type="text"
            className="form-control"
            id="roomNumber"
            name="roomNumber"
            value={courseData.roomNumber}
            onChange={handleInputChange}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
}

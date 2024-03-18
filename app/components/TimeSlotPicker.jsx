import { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
  arrayUnion,
} from "firebase/firestore";
import { db } from "../../firebase";
import styles from "../../styles/timeSlot.css";
import { toast } from "react-toastify";
import styless from "../../styles/timeSlot.css";

const TimeSlotPicker = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [userTimeSlots, setUserTimeSlots] = useState([]);

  useEffect(() => {
    // Fetch user time slots
    const fetchUserTimeSlots = async () => {
      const auth = getAuth();
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          setUserId(user.uid);
          setEmail(user.email);
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userTimeSlots = userData.sessions
              .map((session) => session)
              .flat();
            setUserTimeSlots(userTimeSlots);
          }
        }
      });
    };

    fetchUserTimeSlots();
  }, []);

  useEffect(() => {
    fetchTimeSlots();
  }, [userTimeSlots, selectedDate, userTimeSlots]);

  useEffect(() => {
    // Fetch courses
    const fetchCourses = async () => {
      const coursesCollectionRef = collection(db, "courses");
      const querySnapshot = await getDocs(coursesCollectionRef);
      const courseInfo = querySnapshot.docs.flatMap((doc) => {
        return Object.entries(doc.data()).map(([key, value]) => ({
          key: key,
          CourseName: value.CourseName,
        }));
      });
      setCourses(courseInfo);
    };

    // Fetch professors
    const fetchProfessors = async () => {
      const professorsCollectionRef = collection(db, "professors");
      const querySnapshot = await getDocs(professorsCollectionRef);
      const fetchedProfessors = querySnapshot.docs.map((doc) => doc.data());
      setProfessors(fetchedProfessors);
    };

    fetchCourses();
    fetchProfessors();
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    fetchTimeSlots();
  };

  const fetchTimeSlots = () => {
    const mockTimeSlots = Array.from({ length: 24 }, (_, index) => {
      let startTime, endTime;

      if (index === 0) {
        // 11 AM to 12 PM
        startTime = "12:00 PM";
        endTime = "01:00 AM";
      } else if (index === 11) {
        // 11 AM to 12 PM
        startTime = "11:00 AM";
        endTime = "12:00 PM";
      } else if (index === 12) {
        // 11 PM to 12 AM
        startTime = "12:00 PM";
        endTime = "01:00 PM";
      } else if (index === 23) {
        // 11 PM to 12 AM
        startTime = "11:00 PM";
        endTime = "12:00 AM";
      } else if (index < 11) {
        // AM slots
        startTime = `${index.toString().padStart(2, "0")}:00 AM`;
        endTime = `${(index + 1).toString().padStart(2, "0")}:00 AM`;
      } else if (index < 23) {
        // PM slots
        startTime = `${(index - 12).toString().padStart(2, "0")}:00 PM`;
        endTime = `${(index - 11).toString().padStart(2, "0")}:00 PM`;
      } else {
        // 12 PM to 1 AM
        startTime = "12:00 PM";
        endTime = "01:00 AM";
      }
      return { startTime, endTime };
    });

    const filteredSet = new Set();

    for (let i = 0; i < mockTimeSlots.length; i++) {
      const slot = mockTimeSlots[i];
      let isDuplicate = false;

      for (let j = 0; j < userTimeSlots.length; j++) {
        const userSlot = userTimeSlots[j];
        const { timeSlots } = userSlot;
        const userSlotDateObj = userSlot.date.toDate();
        const userSlotYear = userSlotDateObj.getFullYear();
        const userSlotMonth = userSlotDateObj.getMonth() + 1;
        const userSlotDay = userSlotDateObj.getDate();

        const selectedYear = selectedDate.getFullYear();
        const selectedMonth = selectedDate.getMonth() + 1;
        const selectedDay = selectedDate.getDate();

        if (
          selectedYear === userSlotYear &&
          selectedMonth === userSlotMonth &&
          selectedDay === userSlotDay
        ) {
          for (let k = 0; k < timeSlots.length; k++) {
            const timeSlot = timeSlots[k];
            if (slot.startTime === timeSlot.startTime) {
              isDuplicate = true;
              break;
            }
          }
        }
      }
      if (!isDuplicate) {
        filteredSet.add(slot);
      }
    }

    const filteredArray = Array.from(filteredSet);

    setTimeSlots(filteredArray);
  };

  const handleSlotSelect = (e, slot) => {
    e.preventDefault();

    const isSelected = selectedTimes.includes(slot);
    if (isSelected) {
      setSelectedTimes(
        selectedTimes.filter((selectedSlot) => selectedSlot !== slot)
      );
    } else {
      setSelectedTimes([...selectedTimes, slot]);
    }
  };

  const handleSaveSession = async () => {
    const session = {
      timeSlots: selectedTimes,
      date: selectedDate,
      active: "true",
    };

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      sessions: arrayUnion(session),
    });
    setTimeSlots([]);
    setSelectedTimes([]);
    window.location.reload();

    setTimeout(() => {
      toast.success("Session saved successfully!");
    }, 5000);
  };

  const handleCourseSelect = (e) => {
    const selectedOption = {
      key: e.target.selectedOptions[0].getAttribute("data-key"),
      CourseName: e.target.value,
    };
    console.log("ddd", selectedOption);
    setSelectedCourse(selectedOption);
  };

  return (
    <Container>
      <Row className="mb-3">
        <Col>
          <h1>Select Available Time Slot</h1>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          <Form.Group>
            <div>
              <Form.Label>Select Date:</Form.Label>
            </div>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="MMMM d, yyyy"
            />
          </Form.Group>
        </Col>
      </Row>
      {/* )} */}
      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>Select Courses:</Form.Label>
            <Form.Control
              as="select"
              onChange={handleCourseSelect}
              multiple={false}
            >
              {courses.map((course, index) => (
                <option
                  key={index}
                  value={course.CourseName}
                  data-key={course.key}
                >
                  {course.key} {"("}
                  {course.CourseName} {")"}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        {timeSlots.map((slot, index) => (
          <Col key={index} xs={6} md={3} className="mb-2">
            <Button
              onClick={(e) => handleSlotSelect(e, slot)}
              className={
                selectedTimes.includes(slot) ? "selected-button" : "undo-button"
              }
            >
              {slot.startTime} - {slot.endTime}
            </Button>
          </Col>
        ))}
      </Row>
      {selectedTimes.length > 0 && (
        <>
          <Row className="mt-3">
            <Col>
              <Button variant="success" onClick={handleSaveSession}>
                Save Session
              </Button>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default TimeSlotPicker;

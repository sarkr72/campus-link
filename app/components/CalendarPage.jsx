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
import { db } from "../../utils/firebase";
import styles from "../../styles/timeSlot.css";
import { toast } from "react-toastify";
import styless from "../../styles/timeSlot.css";

const CalanderPage = ({ id }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [userId, setUserId] = useState("");
  const [user, setUser] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [userTimeSlots, setUserTimeSlots] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  useEffect(() => {
    // Fetch user time slots
    const fetchUserTimeSlots = async () => {
      const auth = getAuth();
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          setUserId(user.uid);
          if (!id) {
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUser(userData);
              const userTimeSlots = userData.sessions
                ?.map((session) => session)
                .flat();
              setUserTimeSlots(userTimeSlots);
            }
          } else {
            const email = id.replace("%40", "@");
            const usersCollection = collection(db, "users");
            const userQuery = query(
              usersCollection,
              where("email", "==", email)
            );
            const querySnapshot = await getDocs(userQuery);

            const userTimeSlots = [];
            querySnapshot?.forEach((doc) => {
              setProfessorId(doc?.id);
              const userData = doc?.data();
              setUser(userData);
              const sessions = userData.sessions
                ?.map((session) => session)
                .flat();
              console.log("sessions", sessions);
              userTimeSlots.push(...sessions);
              setUserTimeSlots(userTimeSlots);
            });
            setUserTimeSlots(userTimeSlots);
          }
        }
      });
    };

    fetchUserTimeSlots();
  }, [id]);

  useEffect(() => {
    fetchTimeSlots();
  }, [userTimeSlots, selectedDate, userTimeSlots]);

  useEffect(() => {
    const fetchProfessors = async () => {
      const professorsCollectionRef = collection(db, "professors");
      const querySnapshot = await getDocs(professorsCollectionRef);
      const fetchedProfessors = querySnapshot.docs.map((doc) => doc.data());
      setProfessors(fetchedProfessors);
    };

    // fetchCourses();
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
      let timeSlot2 = "";
      for (let j = 0; j < userTimeSlots?.length; j++) {
        const userSlot = userTimeSlots[j];
        const { timeSlots } = userSlot;
        const userSlotDateObj = userSlot.date.toDate();
        const userSlotYear = userSlotDateObj.getFullYear();
        const userSlotMonth = userSlotDateObj.getMonth() + 1;
        const userSlotDay = userSlotDateObj.getDate();
        const subject = userSlot;
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
            if (
              slot.startTime === timeSlot?.startTime &&
              timeSlot?.isBooked === "false"
            ) {
              timeSlot2 = timeSlots[k];
              isDuplicate = true;
              break;
            }
          }
        }
      }
      if (isDuplicate) {
        filteredSet.add(timeSlot2);
      }
    }

    const filteredArray = Array.from(filteredSet);

    setTimeSlots(filteredArray);
  };

  const handleSlotSelect = (e, slot) => {
    e.preventDefault();
    if (selectedTimes?.length < 3) {
      const isSelected = selectedTimes.includes(slot);
      if (isSelected) {
        setSelectedTimes(
          selectedTimes.filter((selectedSlot) => selectedSlot !== slot)
        );
      } else {
        setSelectedTimes([...selectedTimes, slot]);
      }
    }
  };

  const handleSaveSession = async () => {
    if (selectedTimes && selectedTimes?.length > 0 && selectedDate) {
      const session = {
        professor: `${user?.firstName} ${user?.lastName},${user?.email}`,
        subject: selectedCourse
          ? selectedCourse
          : `${userTimeSlots[0]?.subject?.key} ${userTimeSlots[0]?.subject?.CourseName}`,
        timeSlots: selectedTimes,
        date: selectedDate,
      };

      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        appointments: arrayUnion(session),
      });
      console.log("id", userId);
      const userDocRef = doc(db, "users", professorId);
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const selectedYear = selectedDate.getFullYear();
        const selectedMonth = selectedDate.getMonth() + 1;
        const selectedDay = selectedDate.getDate();

        const userData = userDocSnapshot.data();
        const sessions = userData?.sessions || [];

        for (let i = 0; i < sessions.length; i++) {
          const session = sessions[i];
          const sessionDate = session.date.toDate();
          const sessionYear = sessionDate.getFullYear();
          const sessionMonth = sessionDate.getMonth() + 1;
          const sessionDay = sessionDate.getDate();

          if (
            sessionYear === selectedYear &&
            sessionMonth === selectedMonth &&
            sessionDay === selectedDay
          ) {
            const timeSlots = session?.timeSlots || [];

            selectedTimes.forEach((selectedTime) => {
              timeSlots.forEach((timeSlot) => {
                if (
                  timeSlot.startTime === selectedTime.startTime &&
                  timeSlot.isBooked === "false"
                ) {
                  timeSlot.isBooked = "true";
                }
              });
            });
            sessions[i].timeSlots = timeSlots;
          }
        }
        await updateDoc(userDocRef, {
          sessions: sessions,
        });
      }

      setTimeSlots([]);
      setSelectedTimes([]);
      window.location.reload();

      setTimeout(() => {
        toast.success("You haved booked appointment successfully!");
      }, 6000);
    } else {
      toast.error("timeslot/date is not selected!");
    }
  };

  const handleCourseSelect = (e) => {
    const selectedOption =
      e.target.selectedOptions[0].getAttribute("data-key") + e.target.value;
    console.log("ddd", selectedOption);
    setSelectedCourse(selectedOption);
  };

  return (
    <Container>
      <div className="d-flex align-items-center justify-content-center">
        <div>
          <Row className="mb-3 mt-3">
            <Col>
              <h4 className="text-center">Select Available Time Slot</h4>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col className="d-flex justify-content-center">
              <Form.Group>
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  dateFormat="MMMM d, yyyy"
                  inline
                />
              </Form.Group>
            </Col>
          </Row>
        </div>
      </div>

      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>Select Course:</Form.Label>
            <Form.Control
              as="select"
              onChange={handleCourseSelect}
              multiple={false}
              required
              defaultValue=""
            >
              {userTimeSlots?.map((course, index) => (
                <option
                  key={index}
                  value={course?.subject?.CourseName}
                  data-key={course.subject?.key}
                >
                  {"("} {course.subject?.key} {course.subject?.CourseName} {")"}
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
                Book Appointment
              </Button>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default CalanderPage;

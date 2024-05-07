import { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form, Dropdown } from "react-bootstrap";
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
  arrayRemove,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import styles from "../../styles/timeSlot.css";
import { toast } from "react-toastify";
import styless from "../../styles/timeSlot.css";
import { useRouter } from "next/navigation";

const MyAppointments = () => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [userId, setUserId] = useState("");
  const [toggle, setToggle] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // Fetch user time slots
    const fetchUserTimeSlots = async () => {
      const auth = getAuth();
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          setUserId(user.uid);
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const appointments = userData?.appointments
              ?.map((appointment) => appointment)
              .flat();
            setAppointments(appointments);
          }
        }
      });
    };

    fetchUserTimeSlots();
  }, [toggle]);

  const togglData = () => {
    setToggle(!toggle);
  };

  const handleCancel = async (
    e,
    selectedDate,
    index,
    index2,
    startTime,
    endTime
  ) => {
    console.log("index", index, index2);
    if (selectedDate) {
      const userDocRef = doc(db, "users", userId);
      const userDocSnapshot = await getDoc(userDocRef);
      const appointmentsArray = userDocSnapshot.data().appointments;
      if (appointmentsArray?.length < 2) {
        if (appointmentsArray[index]?.timeSlots.length < 2) {
          appointmentsArray.splice(index, 1);
        } else {
          appointmentsArray[index]?.timeSlots?.splice(index2, 1);
        }

        await updateDoc(userDocRef, { appointments: appointmentsArray });
      } else {
        const session = appointmentsArray[index];
        const { timeSlots } = session;
        if (timeSlots?.length < 2) {
          appointmentsArray.splice(index, 1);
        } else {
          timeSlots?.splice(index2, 1);
        }
        await updateDoc(userDocRef, { appointments: appointmentsArray });
      }
      // console.log("data", selectedDate);
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
            timeSlots.forEach((timeSlot) => {
              if (
                timeSlot.startTime === startTime &&
                timeSlot.isBooked === "true"
              ) {
                timeSlot.isBooked = "false";
              }
            });
            sessions[i].timeSlots = timeSlots;
          }
        }
        console.log("sessions", sessions);
        await updateDoc(userDocRef, {
          sessions: sessions,
        });
      }

      setTimeSlots([]);
      togglData();
      setTimeout(() => {
        toast.success("You haved booked appointment successfully!");
      }, 6000);
    } else {
      toast.error("timeslot/date is not selected!");
    }
  };

  const handleReschedule = async(e) => {
    e.preventDefault();
    router.push("/pages/schedule");
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="container mt-4">
        <h4>My Appointments</h4>
        <div className="table-responsive">
          <table style={{ minHeight: "200px" }} className="table table-striped">
            <thead>
              <tr>
                <th style={{ backgroundColor: "#c6e2ff", color: "black" }}>
                  Tutor
                </th>
                <th style={{ backgroundColor: "#c6e2ff", color: "black" }}>
                  Time
                </th>
                <th style={{ backgroundColor: "#c6e2ff", color: "black" }}>
                  Subject
                </th>
                <th style={{ backgroundColor: "#c6e2ff", color: "black" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {appointments?.map((userSlot, index2) => {
                const professorDetails = userSlot?.professor.split(",");
                const { timeSlots, date, subject } = userSlot;
                const userSlotDateObj = date.toDate();
                return timeSlots.map((timeSlot, index) => {
                  const { startTime, endTime } = timeSlot;
                  const dateTimeString = `${startTime} - ${endTime} <br>${userSlotDateObj.toLocaleDateString()}`;
                  const professorHTML = `${professorDetails[0]} <br> ${professorDetails[1]}`;
                  return (
                    <tr key={index}>
                      <td
                        dangerouslySetInnerHTML={{ __html: professorHTML }}
                      ></td>
                      <td
                        dangerouslySetInnerHTML={{ __html: dateTimeString }}
                      ></td>
                      <td>{subject}</td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle
                            variant="primary"
                            id="dropdown-basic"
                          >
                            Action
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item
                              onClick={(e) =>
                                handleCancel(
                                  e,
                                  userSlotDateObj,
                                  index2,
                                  index,
                                  startTime,
                                  endTime
                                )
                              }
                            >
                              Cancel
                            </Dropdown.Item>
                            <Dropdown.Item onClick={handleReschedule}>
                              Reschedule
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyAppointments;

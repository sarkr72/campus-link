import React, { useState, useEffect } from "react";
import { db } from "../utils/firebase";
import { collection, getDoc, doc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Modal, Button, Form } from "react-bootstrap";
import { useRouter } from "next/navigation";
import Rating from "./Rating";

const ProfessorPage = () => {
  const router = useRouter();
  const [professors, setProfessors] = useState([]);
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            const docRef = doc(
              db,
              "professors",
              process.env.NEXT_PUBLIC_docId2
            );
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
              setProfessors(docSnapshot.data());
            }
            const docRef2 = doc(db, "courses", process.env.NEXT_PUBLIC_docId);
            const docSnapshot2 = await getDoc(docRef2);

            if (docSnapshot2.exists()) {
              const retrievedCourses = docSnapshot2.data();
              setCourses(retrievedCourses);
            }
          }
        });
      } catch (error) {
        console.error("Error fetching professors:", error);
      }
    };

    fetchData();
  }, []);

  const handleProfessorSelect = (e, professor) => {
    e.preventDefault();
    console.log('asasas')
    setSelectedProfessor(professor);
  };

  const handleRate = (e) => {
    e.preventDefault();
    router.push(
      `/pages/rateMyProfessor/${encodeURIComponent(selectedProfessor?.name)}`
    );
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const courses2 = Object.values(courses);
    if (e.target.value) {
      const filteredProfessors = professors?.professors?.filter((professor) =>
        professor.name.toLowerCase().includes(searchTerm) &&
        courses2?.some((course) =>
          course.professors?.some(
            (professorName) => professorName.toLowerCase() === professor.name.toLowerCase()
          )
        )
      );
      setSearchResults(filteredProfessors);
    } else {
      setSearchResults("");
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-12 text-center">
          <h1 className="fw-bold">Rate My Professor</h1>
        </div>
      </div>
      <h5 style={{ marginBottom: "0px", marginTop: "10px" }}>Search Professor</h5>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div>
          <Form.Group controlId="searchForm" style={{ marginBottom: "10px" }}>
            <Form.Control
              type="text"
              placeholder="Search by Professor Name"
              value={searchTerm}
              onChange={handleSearch}
            />
          </Form.Group>
          <ul style={{ listStyleType: "none", marginLeft: "-30px" }}>
            {searchResults &&
              searchResults?.map((professor, index) => (
                <li
                  key={index}
                  onClick={(e) => handleProfessorSelect(e, professor)}
                  style={{ cursor: "pointer" }}
                >
                  <div>
                    <h5>{professor.name}</h5>
                  </div>
                </li>
              ))}
          </ul>
        </div>

        {selectedProfessor && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              marginRight: "auto",
              marginTop: "50px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginBottom: "20px",
              }}
            >
              <p style={{ alignSelf: "flex-start", marginBottom: "0" }}>
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "45px",
                    alignItems: "center",
                  }}
                >
                  {selectedProfessor?.ratings &&
                    (selectedProfessor?.ratings.reduce(
                      (acc, rating) => acc + rating.rating,
                      0
                    ) / selectedProfessor?.ratings?.length).toFixed(1)}

                </span>
                /5
              </p>
              <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                Overall Quality Based on {selectedProfessor?.ratings?.length}{" "}
                ratings
              </span>
            </div>
            <h1>{selectedProfessor?.name}</h1>
            <span
              style={{
                margin: "4px 0",
                alignSelf: "flex-start",
                textAlign: "left",
              }}
            >
              Professor in the Computer Information Systems department at
              Farmingdale State College
            </span>
            <span style={{ marginBottom: "20px" }}>
              <strong>Email:</strong> {selectedProfessor?.email}
            </span>
            <Button
              style={{ marginBottom: "5px" }}
              onClick={(e) => handleRate(e)}
            >
              {"Rate->"}
            </Button>{" "}
            <hr
              style={{
                border: "1px solid black",
                margin: "5px 0",
                width: "100%",
              }}
            />
            <div
              style={{
                backgroundColor: "#f4f4f4",
                padding: "20px",
                marginBottom: "20px",
                borderRadius: "8px",
                textAlign: "left",
                maxWidth: "100%",
              }}
            >
              <h6 style={{ fontWeight: "bold" }}>Rating distribution</h6>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "3px" }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <p style={{ marginLeft: "6px", marginRight: "1px" }}>
                    Awesome 5{" "}
                  </p>
                  <Rating value={5} color="#f8e825" size="32px" /> &nbsp;
                  {selectedProfessor?.ratings &&
                    selectedProfessor?.ratings.filter(
                      (rating) => rating.rating === 5
                    ).length}
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <p style={{ marginLeft: "35px" }}>Great 4&nbsp;</p>
                  <Rating value={4} color="#f8e825" size="32px" /> &nbsp;
                  {selectedProfessor?.ratings &&
                    selectedProfessor?.ratings.filter(
                      (rating) => rating?.rating === 4
                    ).length}
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <p style={{ marginLeft: "37px" }}>Good 3&nbsp;</p>
                  <Rating value={3} color="#f8e825" size="32px" /> &nbsp;
                  {selectedProfessor?.ratings &&
                    selectedProfessor?.ratings.filter(
                      (rating) => rating?.rating === 3
                    ).length}
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <p style={{ marginLeft: "58px" }}>Ok 2&nbsp;</p>
                  <Rating value={2} color="#f8e825" size="32px" /> &nbsp;
                  {selectedProfessor?.ratings &&
                    selectedProfessor?.ratings.filter(
                      (rating) => rating?.rating === 2
                    ).length}
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <p style={{ marginLeft: "37px" }}>Awful 1&nbsp;</p>
                  <Rating value={1} color="#f8e825" size="32px" /> &nbsp;
                  {selectedProfessor?.ratings &&
                    selectedProfessor?.ratings.filter(
                      (rating) => rating?.rating === 1
                    ).length}
                </div>
              </div>
            </div>
            <h5>Ratings:</h5>
            {selectedProfessor?.ratings &&
              selectedProfessor?.ratings.map((rating, index) => (
                <div
                  style={{
                    backgroundColor: "#f4f4f4",
                    padding: "20px",
                    marginBottom: "20px",
                    borderRadius: "8px",
                    textAlign: "left",
                    width: "100%",
                  }}
                  key={index}
                >
                  <h4 style={{ marginTop: "-15px" }}>
                    <span style={{ fontSize: "17px" }}>#{index + 1}</span>
                  </h4>{" "}
                  <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                    {rating.courseCode}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "5px",
                    }}
                  >
                    Quality:{" "}
                    <Rating value={rating.rating} color="#f8e825" size="32px" />
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    Difficulty:{" "}
                    <Rating
                      value={rating.difficulty}
                      color="#f8e825"
                      size="32px"
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <p
                      style={{
                        margin: "4px 0",
                        alignSelf: "flex-start",
                        textAlign: "left",
                      }}
                    >
                      Feedback: {rating.feedback}
                    </p>
                    <p style={{ margin: "4px 0", alignSelf: "flex-start" }}>
                      Take Again:{" "}
                      <span style={{ fontWeight: "bold" }}>
                        {rating.takeAgain}
                      </span>
                    </p>{" "}
                    <p style={{ margin: "4px 0", alignSelf: "flex-start" }}>
                      For Credit:{" "}
                      <span style={{ fontWeight: "bold" }}>
                        {rating.forCredit}
                      </span>
                    </p>{" "}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessorPage;

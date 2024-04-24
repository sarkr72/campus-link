import { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import TutoringSessionCreate from "./TutoringSessionCreate";
import CalendarPage from "./CalendarPage";

const TutoringCenter = ({ id }) => {
  const [sessionData, setSessionData] = useState(null);

  const handleSaveSession = (data) => {
    setSessionData(data);
  };

  return (
    <Container>
      <Row className="mt-4">
        <Col md={6}>
          {/* Pass the onSaveSession prop to CalendarPage */}
          <CalendarPage onSaveSession={handleSaveSession} />
        </Col>
        <Col md={6}>
          <TutoringSessionCreate onSaveSession={handleSaveSession} />
        </Col>
      </Row>
    </Container>
  );
};

export default TutoringCenter;
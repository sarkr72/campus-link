import { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TutoringSessionCreate from "./TutoringSessionCreate";
import CalanderPage from "./CalendarPage";

const TutoringCenter = ({ id }) => {

  return (
    <Container>
      <Row>
        <Col md={6}>
          <CalanderPage />
        </Col>
        <Col md={6}>
          <TutoringSessionCreate />
        </Col>
      </Row>
    </Container>
  );
};

export default TutoringCenter;

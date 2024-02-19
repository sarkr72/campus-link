"use client";
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button } from 'react-bootstrap';
import Image from 'react-bootstrap/Image';


export default function Home() {
  const [users, setUsers] = useState([]);
  let id = 2

  return (
    <Container className="py-5">
      <Row className="justify-content-center align-items-center">
        <Col md={6} className="text-center">
          <h1 className="display-4">Welcome to Campus Link!</h1>
          <p className="lead">
            Connect with classmates, discuss course information, and schedule tutoring sessions to help you succeed.
          </p>
          <Button style={{ backgroundColor: '#176B87'}} variant="primary" size="lg" href="/pages/register">Get Started</Button>
        </Col>
        <Col md={6} className="text-center">
          <Image src="app/resources/images/person.jpeg" rounded />
        </Col>
      </Row>

      <hr className="my-5" />

      <Row className="text-center">
        <Col>
          <h2>Why Choose Us?</h2>
          <p>
            Here at Campus Link, students can engage with peers within their major, professors, and even
            tutors who can help them grow both academically and personally. It is a unique social media site
            designed by college students, for college students.
          </p>
        </Col>
      </Row>

      <Row className="mt-5 text-center">
        <Col>
          <h2>Features</h2>
          <ul className="list-unstyled">
            <li>Profile creation and customization</li>
            <li>Discussion boards for each major</li>
            <li>Real-time tutoring options with a built in schedule</li>
            <li></li>
          </ul>
        </Col>
      </Row>

      <Row className="mt-5 justify-content-center text-center">
        <Col md={6}>
          <h2>Join Us Today!</h2>
          <p>
            Take your education to the next level. Sign up now and start connecting!
          </p>
          <Button style={{ backgroundColor: '#176B87'}} variant="primary" size="lg" href="/pages/register">Sign Up</Button>
        </Col>
      </Row>
    </Container>
  );
}

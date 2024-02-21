"use client";
import { Inter } from "next/font/google";
import Image from "next/image";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect } from "react";
import React, { useState } from 'react';
import { Container, Row, Breadcrumb, Card, ListGroup, CardBody, CardText, Col} from 'react-bootstrap';
import personLogo from "../resources/images/person.jpeg";


const ViewProfile = () => {
    const [currnetEmail, setCurrentEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState("");
    const [data, setData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        profilePicture: "",
        bio: "",
        major: "",
        minor: "",
        isTutor: false,
        role: "",
    });
    const [error, setError] = useState("");

    useEffect(() => {
        // setIsLoading(true);
        const fetchCurrentUser = async () => {
          try {
            const response = await fetch(`/api/users`);
            if (response.ok) {
              const data2 = await response.json();
              const extractedData = data2.map(user => ({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                password: user.password,
                phone: user.phone,
                profilePicture: user.profilePicture,
                bio: user.bio,
                major: user.major,
                minor: user.minor,
                isTutor: user.isTutor,
                role: user.role
              }));
              
              setData(extractedData[0]);
              setUser(data);
              console.log("ssss", data);
              setIsLoading(false);
              console.log("User data:", data);
            } else {
              console.log("Failed to fetch user data:", response.statusText);
            }
          } catch (error) {
            console.error("Error getting current user:", error);
          } finally {
          }
        };
    
        fetchCurrentUser();
    }, []);

    return(
        <Container>
            <br/>
            <Row>
                <Breadcrumb className="bg-light rounded-3 p-3 mb-4">
                    <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
                    <Breadcrumb.Item href="#">User</Breadcrumb.Item>
                    <Breadcrumb.Item active>View Profile</Breadcrumb.Item>
                </Breadcrumb>
            </Row>

            <br/>

            <Row lg={2}>
                <Card className="mb-4" style={{ width: '29rem' }}>
                    <Image
                        className=""
                        src={personLogo}
                        alt="Logo"
                        width={65}
                        height={65}
                        fluid
                    />
                    <Card.Body className="text-center">
                        <Card.Text style={{justifyContent: 'center'}}>
                        {data.firstName}
                        </Card.Text>
                    </Card.Body>
                    <ListGroup className="list-group-flush">
                        <ListGroup.Item className="text-muted mb-1 text-center">Major: {data.major}</ListGroup.Item>
                        <ListGroup.Item className="text-muted mb-1 text-center">Bio: {data.bio}</ListGroup.Item>
                        <ListGroup.Item className="text-muted mb-1 text-center">Tutor: {data.isTutor}</ListGroup.Item>
                    </ListGroup>
                    <Card.Body>
                        <Card.Link className="text-center" href="/">Home</Card.Link>
                        <Card.Link href="/pages/updateProfile">Update</Card.Link>
                        <Card.Link href="#">Tutoring Center</Card.Link>
                    </Card.Body>
                </Card>

            <Col md={{ span: 4, offset: -9 }}>
                <Card className="mb-4">
                    <CardBody>
                        <Row>
                            <Col sm="3">
                                <CardText>Full Name</CardText>
                            </Col>
                            <Col sm="9">
                                <CardText className="text-muted">{data.firstName} {data.lastName}</CardText>
                            </Col>
                        </Row>
                        <hr />
                        <Row>
                            <Col sm="3">
                                <CardText>Email</CardText>
                            </Col>
                            <Col sm="9">
                                <CardText className="text-muted">{data.email}</CardText>
                            </Col>
                        </Row>
                        <hr />
                        <Row>
                            <Col sm="3">
                                <CardText>Password</CardText>
                            </Col>
                            <Col sm="9">
                                <CardText className="text-muted">{data.password}</CardText>
                            </Col>
                        </Row>
                        <hr />
                        <Row>
                            <Col sm="3">
                                <CardText>Phone Number</CardText>
                            </Col>
                            <Col sm="9">
                                <CardText className="text-muted">{data.phone}</CardText>
                            </Col>
                        </Row>
                        <hr />
                        <Row>
                            <Col sm="3">
                                <CardText>Role</CardText>
                            </Col>
                            <Col sm="9">
                                <CardText className="text-muted">{data.role}</CardText>
                            </Col>
                        </Row>
                        <hr />
                    </CardBody>
                </Card>
            </Col>
            </Row>
        </Container>
    );
}
export default ViewProfile;
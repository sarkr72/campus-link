"use client";
import { Inter } from "next/font/google";
import Image from "next/image";
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Container, Row, Breadcrumb, Card, ListGroup, CardBody, CardText, Col} from 'react-bootstrap';
import personLogo from "../resources/images/person.jpeg";


function ViewProfile() {
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
                        Test Student
                        </Card.Text>
                    </Card.Body>
                    <ListGroup className="list-group-flush">
                        <ListGroup.Item className="text-muted mb-1 text-center">Major: Computer Science</ListGroup.Item>
                        <ListGroup.Item className="text-muted mb-1 text-center">Year: Senior</ListGroup.Item>
                        <ListGroup.Item className="text-muted mb-1 text-center">Tutor: Yes</ListGroup.Item>
                    </ListGroup>
                    <Card.Body>
                        <Card.Link className="text-center" href="/">Home</Card.Link>
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
                                <CardText className="text-muted">Test Student</CardText>
                            </Col>
                        </Row>
                        <hr />
                        <Row>
                            <Col sm="3">
                                <CardText>Email</CardText>
                            </Col>
                            <Col sm="9">
                                <CardText className="text-muted">teststudent@gmail.com</CardText>
                            </Col>
                        </Row>
                        <hr />
                        <Row>
                            <Col sm="3">
                                <CardText>Password</CardText>
                            </Col>
                            <Col sm="9">
                                <CardText className="text-muted">private</CardText>
                            </Col>
                        </Row>
                        <hr />
                        <Row>
                            <Col sm="3">
                                <CardText>Phone Number</CardText>
                            </Col>
                            <Col sm="9">
                                <CardText className="text-muted">123-456-7890</CardText>
                            </Col>
                        </Row>
                        <hr />
                        <Row>
                            <Col sm="3">
                                <CardText>Role</CardText>
                            </Col>
                            <Col sm="9">
                                <CardText className="text-muted">Tutor</CardText>
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
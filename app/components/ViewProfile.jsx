"use client";
import { Inter } from "next/font/google";
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Container, Row, Breadcrumb, Card, ListGroup } from 'react-bootstrap';

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
                    <Card.Img variant="top" src="holder.js/100px180?text=Image cap" />
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
                        <Card.Link href="#">Card Link</Card.Link>
                        <Card.Link href="#">Another Link</Card.Link>
                    </Card.Body>
                </Card>
            </Row>
        </Container>
    );
}
export default ViewProfile;
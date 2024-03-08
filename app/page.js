"use client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import Image from "next/image";
import logoImage from "./resources/images/logo.png";
import styles from "/styles/landing.css";
// Font Awesome icons used in features section
import tutorIcon from "./resources/images/person-video.svg";
import peopleIcon from "./resources/images/people-fill.svg";
import calendarIcon from "./resources/images/calendar2-check.svg";
import loginIcon from "./resources/images/lock-fill.svg";
import signupIcon from "./resources/images/pencil-square.svg";
import student from "./resources/images/student.jpeg";
import student2 from "./resources/images/student2.jpeg";
import teacher from "./resources/images/teacher.jpeg";
import edgar from "./resources/images/stonehenge.jpeg";
import TimeSlotPicker from './components/TimeSlotPicker'


export default function Home() {
  const [users, setUsers] = useState([]);
  let id = 2;

  return (
    // <div>
    //   {/* Landing page */}
    //   <section id="landing">
    //     <Row className="justify-content-center align-items-center">
    //       <Col md={6} className="text-center">
    //         <h1 className="display-4">Welcome to Campus Link!</h1>
    //         <p className="lead">
    //           Connect with classmates, discuss course information, and schedule
    //           tutoring sessions to help you succeed.
    //         </p>
    //         <Button href="/pages/register">Get Started</Button>
    //       </Col>
    //       <Col md={6} className="text-center">
    //         <Image
    //           className="featured-image"
    //           src={logoImage} // path to your logo file
    //           alt="Logo"
    //           width={250}
    //           height={250}
    //         />
    //       </Col>
    //     </Row>
    //   </section>
    //   {/* Features */}
    //   <section id="features" class="row">
    //     <div class="feature-box">
    //       <Image
    //         className="icon"
    //         src={tutorIcon}
    //         alt="Tutoring Sessions Icon"
    //         width={64}
    //         height={64}
    //       />
    //       <h3 class="feature-title">Tutoring Sessions</h3>
    //       <p className="feature-desc">Connect with experienced tutors.</p>
    //     </div>
    //     <div class="feature-box">
    //       <Image
    //         className="icon"
    //         src={peopleIcon}
    //         alt="Discussion Board Icon"
    //         width={64}
    //         height={64}
    //       />
    //       <h3 class="feature-title">Discussion Boards</h3>
    //       <p className="feature-desc">Engage in meaningful discussions.</p>
    //     </div>
    //     <div class="feature-box">
    //       <Image
    //         className="icon"
    //         src={calendarIcon}
    //         alt="Schedule Tracker Icon"
    //         width={64}
    //         height={60}
    //       />
    //       <h3 class="feature-title">Schedule Tracker</h3>
    //       <p className="feature-desc">Organize your academic schedule.</p>
    //     </div>
    //   </section>
    //   {/* Why Us? */}
    //   <section id="whyUs">
    //     <Row className="text-center">
    //       <Col>
    //         <h2>Why Choose Us?</h2>
    //         <p className="desc">
    //           Here at Campus Link, students can engage with peers within their
    //           major, professors, and even tutors who can help them grow both
    //           academically and personally. It is a unique social media site
    //           designed by college students, for college students.
    //         </p>
    //       </Col>
    //     </Row>
    //   </section>
    //   {/* Testimonials */}
    //   <section id="testimonials">
    //     <div id="carouselExample" class="carousel slide">
    //       <div class="carousel-inner">
    //         <div class="carousel-item active">
    //           <h2 class="testimonial-text">
    //             My college life was so boring before Campus Link!
    //           </h2>
    //           <Image
    //             className="profile-picture"
    //             src={student2}
    //             alt="Teacher Icon"
    //             width={100}
    //             height={100}
    //           />{" "}
    //           <em>Cecilia Laterano, Biology Major</em>
    //         </div>
    //         <div class="carousel-item">
    //           <h2 class="testimonial-text">
    //             Campus Link has made connecting with my students much easier!
    //           </h2>
    //           <Image
    //             className="profile-picture"
    //             src={teacher}
    //             alt="Teacher Icon"
    //             width={100}
    //             height={100}
    //           />{" "}
    //           <em>Walter White, Chemistry Teacher</em>
    //         </div>
    //         <div class="carousel-item">
    //           <h2 class="testimonial-text">
    //             I love the tutoring feature! Helping people learn is my passion.
    //           </h2>
    //           <Image
    //             className="profile-picture"
    //             src={student}
    //             alt="Teacher Icon"
    //             width={100}
    //             height={100}
    //           />{" "}
    //           <em>Dora Márquez, Spanish Tutor</em>
    //         </div>
    //       </div>
    //       <button
    //         class="carousel-control-prev"
    //         type="button"
    //         data-bs-target="#carouselExample"
    //         data-bs-slide="prev"
    //       >
    //         <span class="carousel-control-prev-icon" aria-hidden="true"></span>
    //         <span class="visually-hidden">Previous</span>
    //       </button>
    //       <button
    //         class="carousel-control-next"
    //         type="button"
    //         data-bs-target="#carouselExample"
    //         data-bs-slide="next"
    //       >
    //         <span class="carousel-control-next-icon" aria-hidden="true"></span>
    //         <span class="visually-hidden">Next</span>
    //       </button>
    //     </div>
    //   </section>
    //   {/* About Us */}
    //   <section id="about" className="row">
    //     <div className="card col-lg-6 col-12 mb-4">
    //       <Image
    //         className="card-img-top"
    //         src={student2}
    //         alt="Developer Image"
    //       />
    //       <div className="card-body">
    //         <h5 className="card-title">Rinku Sarkar</h5>
    //         <p className="card-text">
    //           Replace your profile picture and description.
    //         </p>
    //         <a href="#" className="btn btn-primary">
    //           Contact Rinku
    //         </a>
    //       </div>
    //     </div>
    //     <div className="card col-lg-6 col-12 mb-4">
    //       <Image className="card-img-top" src={edgar} alt="Developer Image" />
    //       <div className="card-body">
    //         <h5 className="card-title">Edgar Pacheco</h5>
    //         <p className="card-text">
    //           Replace your profile picture and description.
    //         </p>
    //         <a
    //           href="href={`/contact?recipient=EdgarPacheco`}"
    //           className="btn btn-primary"
    //         >
    //           Contact Edgar
    //         </a>
    //       </div>
    //     </div>
    //     <div className="card col-lg-6 col-12 mb-4">
    //       <Image className="card-img-top" src={student} alt="Developer Image" />
    //       <div className="card-body">
    //         <h5 className="card-title">Jake Rios</h5>
    //         <p className="card-text">
    //           Replace your profile picture and description.
    //         </p>
    //         <a href="#" className="btn btn-primary">
    //           Contact Jake
    //         </a>
    //       </div>
    //     </div>
    //     <div className="card col-lg-6 col-12 mb-4">
    //       <Image className="card-img-top" src={teacher} alt="Developer Image" />
    //       <div className="card-body">
    //         <h5 className="card-title">Luke Green</h5>
    //         <p className="card-text">
    //           Replace your profile picture and description.
    //         </p>
    //         <a href="#" className="btn btn-primary">
    //           Contact Luke
    //         </a>
    //       </div>
    //     </div>
    //   </section>
    //   {/* Redirections */}
    //   <section id="redirections-section">
    //     <h2>Join Us Today!</h2>
    //     <p>
    //       Your Learning Adventure Starts Here. Sign up now and start connecting!
    //     </p>
    //     <div className="redirection-btns">
    //       <Button
    //         className="btn"
    //         variant="primary"
    //         size="lg"
    //         href="/pages/register"
    //       >
    //         <Image
    //           className="icon"
    //           src={signupIcon}
    //           alt="Discussion Board Icon"
    //           width={20}
    //           height={20}
    //         />{" "}
    //         Sign Up
    //       </Button>
    //       <Button
    //         className="btn"
    //         variant="primary"
    //         size="lg"
    //         href="/pages/logIn"
    //       >
    //         <Image
    //           className="icon"
    //           src={loginIcon}
    //           alt="Discussion Board Icon"
    //           width={20}
    //           height={20}
    //         />{" "}
    //         Log In
    //       </Button>
    //     </div>
    //   </section>
    // </div>
    <>
     <TimeSlotPicker />
    </>
  );
}

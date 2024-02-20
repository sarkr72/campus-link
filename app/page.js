"use client";
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import Image from "react-bootstrap/Image";
import image from './resources/images/person.jpeg'


export default function Home() {
  const [users, setUsers] = useState([]);
  let id = 2;

  return (
    <Container className="py-5">
      <Row className="justify-content-center align-items-center">
        <Col md={6} className="text-center">
          <h1 className="display-4">Welcome to Campus Link!</h1>
          <p className="lead">
            Connect with classmates, discuss course information, and schedule
            tutoring sessions to help you succeed.
          </p>
          <Button
            style={{ backgroundColor: "#176B87" }}
            variant="primary"
            size="lg"
            href="/pages/register"
          >
            Get Started
          </Button>
        </Col>
        <Col md={6} className="text-center">
          <Image src={image} alt='person' rounded style={{width: "200px", height: "100px"}}/>
        </Col>
      </Row>

      <hr className="my-5" />

      <Row className="text-center">
        <Col>
          <h2>Why Choose Us?</h2>
          <p>
            Here at Campus Link, students can engage with peers within their
            major, professors, and even tutors who can help them grow both
            academically and personally. It is a unique social media site
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
            Take your education to the next level. Sign up now and start
            connecting!
          </p>
          <Button
            style={{ backgroundColor: "#176B87" }}
            variant="primary"
            size="lg"
            href="/pages/register"
          >
            Sign Up
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

// page.js

// "use client";
// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import { Authenticator } from "@aws-amplify/ui-react";
// import { deleteUser } from "../utils/server";
// import { toast } from "react-toastify";
// import { Modal, Button } from "react-bootstrap";
// import  GrowSpinner  from "./components/Spinner";

// import { Amplify } from "aws-amplify";
// import awsExports from "../aws-exports";
// import '../utils/configureAmplify'
// import "@aws-amplify/ui-react/styles.css";
// Amplify.configure({ ...awsExports, ssr: true });

// export default function Home() {
//   const [users, setUsers] = useState([]);
//   const [showConfirmModal, setShowConfirmModal] = useState(false);
//   const [deleteUserId, setDeleteUserId] = useState(null);
//   const [deleteUserEmail, setDeleteUserEmail] = useState(null);
//   const [toggle, setToggle] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     fetchUsers();
//   }, [toggle]);

//   const fetchUsers = async () => {
//     setIsLoading(true);
//     try {
//       // const fetchedUsers = await listUsers();
//       const response = await fetch("/api/users");

//       let data = "";
//       if (response.ok) {
//         data = await response?.json();
//         setUsers(data);
//       }
//     } catch (error) {
//       console.error("Error fetching users:", error);
//     }
//     setIsLoading(false);
//   };

//   const handleDeleteUser = (id, email) => {
//     setDeleteUserId(id);
//     setDeleteUserEmail(email);
//     setShowConfirmModal(true);
//   };

//   const handleToggle = () => {
//     setToggle(!toggle);
//   }

//   if (isLoading) {
//     return <GrowSpinner />;
//   }

//   const handleConfirmDelete = async () => {
//     setIsLoading(true);
//     try {
//       console.log("delete id:", deleteUserId)
//       setShowConfirmModal(false);
//       const response = await fetch(`/api/users/${deleteUserId}`, {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       });

//       let data = "";
//       if (response.ok) {
//         data = response?.json();
//       }

//       // if (data && data?.message === "Student deleted successfully") {
//        console.log("deleeee")
//         await deleteUser(deleteUserEmail);
//         toast.success("Account deleted successfully!");
//         handleToggle();
//       // }
//       fetchUsers();
//     } catch (error) {
//       console.error("Error deleting user:", error);
//     }
//     setIsLoading(false);
//   };

//   return (
//     <div>
//       <h1>Users</h1>
//       <Link href='/pages/logIn'>login</Link>
//       <table className="table table-striped table-bordered mt-4">
//         <thead className="thead-dark">
//           <tr>
//             <th>Email</th>
//             <th>Name</th>
//             <th>Created At</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {users.map((user, index) => (
//             <tr key={index}>
//               <td>{user.email}</td>
//               <td>{user.firstName + " " + user.lastName}</td>
//               <td>{user.createdAt}</td>
//               <td>
//                 <button
//                   className="btn btn-danger"
//                   onClick={() => handleDeleteUser(user.id, user.email)}
//                 >
//                   Delete
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Confirm Delete Modal */}
//       <Modal
//         show={showConfirmModal}
//         onHide={() => setShowConfirmModal(false)}
//         centered
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Confirm Delete</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           Are you sure you want to delete user with email: {deleteUserEmail}?
//         </Modal.Body>
//         <Modal.Footer>
//           <Button
//             variant="secondary"
//             onClick={() => setShowConfirmModal(false)}
//           >
//             Cancel
//           </Button>
//           <Button variant="danger" onClick={handleConfirmDelete}>
//             Delete
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>

//     // <main>

//     //   <h1>Hello, {user.username}!</h1>
//     //   <button onClick={signOut}>Sign out</button>
//     // </main>
//   );
// }

// // export default withAuthenticator(Home)

// // {users.map((user, index) => (
// //   <tr key={index}>
// //     <td>{user.Name}</td>
// //     <td>{user.Value}</td>
// //     <td><button className="btn btn-danger" onClick={() => handleDeleteUser(index)}>Delete</button></td>
// //   </tr>
// // ))}

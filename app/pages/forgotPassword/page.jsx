"use client";

import { useState } from "react";
import { resetPassword, confirmResetPassword } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { toast } from "react-toastify";
import GrowSpinner from "../../components/Spinner";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const onChange = (e) => {
    setEmail(e.target.value);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      toast.success("Email was sent!");
    } catch (error) {
      toast.error("Could not send reset email.");
    }
  };

  return (
    <section
      className="object-cover h-[calc(100vh-48px)]"
      style={
        {
          // backgroundImage: `url(${signInBackgroundImage})`,
        }
      }
    >
      <h1 className="text-3xl text-center py-12 font-bold">Forgot Password?</h1>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="bg-white rounded px-4 py-4 shadow">
              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <input
                    className="form-control"
                    type="email"
                    id="email"
                    value={email}
                    onChange={onChange}
                    placeholder="Email address"
                  />
                </div>
                <div className="d-flex justify-content-between align-items-center ">
                  <p className="mb-0">
                    Dont have an account?
                    <Link href="/pages/register" className="ms-1 text-primary">
                      Register
                    </Link>
                  </p>
                  <p>
                    <Link
                      href="/pages/logIn"
                      className="text-primary"
                      style={{ marginTop: "50px" }}
                    >
                      Sign in instead
                    </Link>
                  </p>
                </div>
                <button
                  className="btn btn-primary btn-block mb-3"
                  type="submit"
                >
                  Send reset Email
                </button>
                <div className="d-flex align-items-center my-4">
                  <p className="text-xs text-center font-semibold mx-4"></p>
                </div>
                {/* <OAuth /> */}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;

// import { useState } from "react";
// import { resetPassword, confirmResetPassword } from "aws-amplify/auth";
// import { useRouter } from "next/navigation";
// import { Container, Form, Button, Alert } from "react-bootstrap";
// import { toast } from "react-toastify";
// import GrowSpinner from "../../components/Spinner";
// import { getAuth, sendPasswordResetEmail } from "firebase/auth";

// const ResetPasswordPage = () => {
//   const [username, setUsername] = useState("");
//   const [code, setCode] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [step, setStep] = useState(1); // Step 1: Request reset code, Step 2: Enter code and new password
//   const [errorMessage, setErrorMessage] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();
//   const [email, setEmail] = useState("");

//   // const onChange = (e) => {
//   //   setEmail(e.target.value);
//   // };

//   if (isLoading) {
//     return <GrowSpinner />;
//   }

//   const handleResetPassword = async (e) => {
//     e.preventDefault();
//     try {
//       // const output = await resetPassword({ username });
//       // handleResetPasswordNextSteps(output);
//       const auth = getAuth();
//       await sendPasswordResetEmail(auth, email);
//       toast.success("Email is sent!");
//       setErrorMessage("");
//       setIsLoading(false);
//     } catch (error) {
//       setIsLoading(false);
//       console.error("Error requesting reset code:", error);
//       setErrorMessage(
//         "Failed to request reset code. Please check your username."
//       );
//     }
//   };

//   const handleConfirmResetPassword = async (e) => {
//     e.preventDefault();

//     try {
//       const password = newPassword;
//       const response = await fetch(`/api/changeUserPassword/${username}`, {
//         method: "PUT",
//         headers: {
//           "Content-type": "application/json",
//         },
//         body: JSON.stringify({ password }),
//       });

//       if (response.ok) {
//         console.log("returned");

//         await confirmResetPassword({
//           username,
//           newPassword,
//           confirmationCode: code,
//         });
//         const successMessage = "Password reset successfully.";
//         router.push("/pages/logIn");
//         setErrorMessage("");
//       }
//     } catch (error) {
//       console.error(
//         "Error resetting password:",
//         error,
//         error.name,
//         error.code,
//         error.message
//       );
//       if (error.name === "LimitExceededException") {
//         setErrorMessage(
//           "The number of password reset requests has exceeded the limit."
//         );
//       } else if (error.name === "CodeMismatchException") {
//         setErrorMessage("The confirmation code provided does not match.");
//       } else {
//         setErrorMessage(
//           "Failed to reset password. Please check your confirmation code and try again."
//         );
//       }
//     }
//   };

//   const handleResetPasswordNextSteps = (output) => {
//     const { nextStep } = output;
//     if (nextStep.resetPasswordStep === "CONFIRM_RESET_PASSWORD_WITH_CODE") {
//       setStep(2); // Proceed to step 2
//     } else if (nextStep.resetPasswordStep === "DONE") {
//       setSuccessMessage("Password reset successfully.");
//     }
//   };

//   return (
//     <Container
//       style={{ minHeight: "100vh" }}
//       className="d-flex justify-content-center align-items-center h-100"
//     >
//       <div className="w-50">
//         <h2 className="text-center mb-4">Reset Password</h2>
//         {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
//         {successMessage && <Alert variant="success">{successMessage}</Alert>}
//         {step === 1 ? (
//           <Form onSubmit={handleResetPassword}>
//             <Form.Group controlId="username">
//               <Form.Label>Username (Email)</Form.Label>
//               <Form.Control
//                 type="email"
//                 placeholder="Enter your email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </Form.Group>
//             <Button
//               style={{ marginTop: "10px" }}
//               variant="primary"
//               type="submit"
//             >
//               Request Reset Code
//             </Button>
//           </Form>
//         ) : (
//           <Form onSubmit={handleConfirmResetPassword}>
//             <Form.Group controlId="code">
//               <Form.Label>Confirmation Code</Form.Label>
//               <Form.Control
//                 type="text"
//                 placeholder="Enter confirmation code"
//                 value={code}
//                 onChange={(e) => setCode(e.target.value)}
//                 required
//               />
//             </Form.Group>
//             <Form.Group style={{ marginTop: "10px" }} controlId="newPassword">
//               <Form.Label>New Password</Form.Label>
//               <Form.Control
//                 type="password"
//                 placeholder="Enter new password"
//                 value={newPassword}
//                 onChange={(e) => setNewPassword(e.target.value)}
//                 required
//               />
//             </Form.Group>
//             <Button
//               style={{ marginTop: "10px" }}
//               variant="primary"
//               type="submit"
//             >
//               Reset Password
//             </Button>
//           </Form>
//         )}
//       </div>
//     </Container>
//   );
// };

// export default ResetPasswordPage;

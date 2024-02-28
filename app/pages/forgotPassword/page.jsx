"use client";
import { useState } from "react";
import { resetPassword, confirmResetPassword } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { toast } from "react-toastify";
import GrowSpinner from "../../components/Spinner";

const ResetPasswordPage = () => {
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // Step 1: Request reset code, Step 2: Enter code and new password
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (isLoading) {
    return <GrowSpinner />;
  }

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const output = await resetPassword({ username });
      handleResetPasswordNextSteps(output);
      setErrorMessage("");
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error requesting reset code:", error);
      setErrorMessage(
        "Failed to request reset code. Please check your username."
      );
    }
  };

  const handleConfirmResetPassword = async (e) => {
    e.preventDefault();

    try {
      const password = newPassword;
      const response = await fetch(`/api/changeUserPassword/${username}`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({password}),
      });

      if (response.ok) {
        console.log("returned");

        await confirmResetPassword({
          username,
          newPassword,
          confirmationCode: code,
        });
        const successMessage = "Password reset successfully.";
        router.push("/pages/logIn");
        setErrorMessage("");
      }
    } catch (error) {
      console.error(
        "Error resetting password:",
        error,
        error.name,
        error.code,
        error.message
      );
      if (error.name === "LimitExceededException") {
        setErrorMessage(
          "The number of password reset requests has exceeded the limit."
        );
      } else if (error.name === "CodeMismatchException") {
        setErrorMessage("The confirmation code provided does not match.");
      } else {
        setErrorMessage(
          "Failed to reset password. Please check your confirmation code and try again."
        );
      }
    }
  };

  const handleResetPasswordNextSteps = (output) => {
    const { nextStep } = output;
    if (nextStep.resetPasswordStep === "CONFIRM_RESET_PASSWORD_WITH_CODE") {
      setStep(2); // Proceed to step 2
    } else if (nextStep.resetPasswordStep === "DONE") {
      setSuccessMessage("Password reset successfully.");
    }
  };

  return (
    <Container
      style={{ minHeight: "100vh" }}
      className="d-flex justify-content-center align-items-center h-100"
    >
      <div className="w-50">
        <h2 className="text-center mb-4">Reset Password</h2>
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        {step === 1 ? (
          <Form onSubmit={handleResetPassword}>
            <Form.Group controlId="username">
              <Form.Label>Username (Email)</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>
            <Button
              style={{ marginTop: "10px" }}
              variant="primary"
              type="submit"
            >
              Request Reset Code
            </Button>
          </Form>
        ) : (
          <Form onSubmit={handleConfirmResetPassword}>
            <Form.Group controlId="code">
              <Form.Label>Confirmation Code</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter confirmation code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group style={{ marginTop: "10px" }} controlId="newPassword">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button
              style={{ marginTop: "10px" }}
              variant="primary"
              type="submit"
            >
              Reset Password
            </Button>
          </Form>
        )}
      </div>
    </Container>
  );
};

export default ResetPasswordPage;

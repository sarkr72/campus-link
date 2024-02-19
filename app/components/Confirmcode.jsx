"use client";

import { useRouter } from "next/navigation";
import { Button } from 'react-bootstrap';

function ConfirmationPage() {
  const router = useRouter();

  // Function to handle confirmation
  const handleConfirm = () => {
    // Perform confirmation logic here

    // For demonstration purposes, navigate to the home page after confirmation
    router.push('/');
  };

  // Function to handle cancellation
  const handleCancel = () => {
    // Perform cancellation logic here

    // For demonstration purposes, navigate back to the previous page
    router.back();
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="container bg-light p-4 rounded shadow">
        <h1 className="text-center mb-4">Confirmation Page</h1>
        <p className="text-center">Are you sure you want to proceed?</p>
        <div className="d-flex justify-content-center">
          <Button variant="primary" onClick={handleConfirm} className="mx-2">
            Confirm
          </Button>
          <Button variant="danger" onClick={handleCancel} className="mx-2">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationPage;



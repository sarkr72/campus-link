// Import necessary dependencies
"use client";

import LoginForm from '../../components/LoginForm'

const LoginPage = () => {

  const handleSubmit = async(e) => {
    e.preventDefault();
   
    setError("");

    try {
      const response = await fetch("/api/logIn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push("/pages/register");
        if (data.error) {
          setError(data.error);
        } else {
          // Proceed with the login process
          console.log(data.message);
        }
      } else {
        setError("Failed to login. Please try again.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("Internal server error");
    }

  };

  return (
    <>
    <LoginForm />
    </>
  );
};

// Export the LoginPage component
export default LoginPage;

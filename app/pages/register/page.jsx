// pages/createUserPage.js
"use client";
import RegisterForm from '../../components/RegisterForm';
import Link from "next/link";

const CreateUserPage = () => {
  return (
    <div>
      <h1>Create User</h1>
      <RegisterForm />

      <p></p>
      <Link href="/pages/logIn">go to login</Link>

    </div>
  );
};

export default CreateUserPage; // Export as default

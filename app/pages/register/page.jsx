// pages/createUserPage.js
"use client";
import RegisterForm from "../../components/RegisterForm";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const CreateUserPage = () => {
  return (
    <div>
    <Header />
    <RegisterForm />
    <Footer />
    </div>
  );
};

export default CreateUserPage; 

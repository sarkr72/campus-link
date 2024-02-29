import React, { useState } from "react";
import styles from "/styles/contact.css";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let valid = true;
    const newErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = "Valid email is required";
      valid = false;
    }

    // Validate message
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Send email
      console.log("Sending email:", formData);

      // Clear the form after submission
      setFormData({
        name: "",
        email: "",
        message: "",
      });
    }
  };

  return (
    <div className={`contact-container  ${styles.mainTimeline}`}>
      <div className="row justify-content-center">
      <div className="contact-form">
            <h2 className="text-center mb-4">Contact Us</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  id="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                {errors.name && (
                  <div className="invalid-feedback">{errors.name}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">Your Email</label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  id="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="message">Your Message</label>
                <textarea
                  className={`form-control ${
                    errors.message ? "is-invalid" : ""
                  }`}
                  id="message"
                  rows="4"
                  placeholder="Enter your message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                ></textarea>
                {errors.message && (
                  <div className="invalid-feedback">{errors.message}</div>
                )}
              </div>

              <button type="submit" className="btn btn-light">
                Submit
              </button>
            </form>
          </div>
      </div>
    </div>
  );
};

export default ContactPage;


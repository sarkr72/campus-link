import { useState, useEffect } from 'react';
import BigCalendar from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    courseName: '',
    details: '',
  });

  
  useEffect(() => {
    // Fetch available time slots when selectedDate changes
  }, [selectedDate]); 
    const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowModal(true);
  };
  

  const handleTimeSlotSelect = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTimeSlot(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    // Handle form submission here
    console.log('Form submitted:', formData);
    // You can add logic here to send the form data to the backend
    // and handle the creation of the tutoring session
    handleCloseModal();
  };

  return (
    <div>
      <h1>Select Available Date and Time for Tutoring Session</h1>
      <BigCalendar 
        selectable
        onSelectSlot={(slotInfo) => handleDateSelect(slotInfo.start)}
        onSelectEvent={(event) => handleTimeSlotSelect(event.start)}
        events={availableTimeSlots.map(slot => ({
          start: new Date(selectedDate + ' ' + slot.startTime),
          end: new Date(selectedDate + ' ' + slot.endTime),
          title: 'Available',
        }))}
      />
        <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
            <Modal.Title>Book Tutoring Session</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <p>Date: {selectedDate}</p>
            <p>Time: {selectedTimeSlot}</p>
            <Form>
                <Form.Group controlId="name">
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" name="name" onChange={handleChange} />
                </Form.Group>
                <Form.Group controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" name="email" onChange={handleChange} />
                </Form.Group>
                <Form.Group controlId="courseName">
                <Form.Label>Course Name</Form.Label>
                <Form.Control type="text" name="courseName" onChange={handleChange} />
                </Form.Group>
                <Form.Group controlId="details">
                <Form.Label>Details</Form.Label>
                <Form.Control as="textarea" rows={3} name="details" onChange={handleChange} />
                </Form.Group>
            </Form>
            </Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit}>Book Session</Button>
            </Modal.Footer>
        </Modal>
    </div>
  );
};

export default CalendarPage;
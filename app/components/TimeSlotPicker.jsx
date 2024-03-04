import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const TimeSlotPicker = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedMajor, setSelectedMajor] = useState('');
  const [majors, setMajors] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Fetch majors when component mounts
    fetchMajors();
  }, []);

  useEffect(() => {
    // Fetch courses when selected major changes
    if (selectedMajor) {
      fetchCourses(selectedMajor);
    }
  }, [selectedMajor]);

  const fetchMajors = () => {
    // Mock API call to fetch majors
    // Replace this with your actual API endpoint
    const mockMajors = ['Computer Science', 'Engineering', 'Mathematics'];
    setMajors(mockMajors);
  };

  const fetchCourses = (major) => {
    // Mock API call to fetch courses based on the selected major
    // Replace this with your actual API endpoint
    const mockCourses = [
      { id: 1, name: 'Course A' },
      { id: 2, name: 'Course B' },
      { id: 3, name: 'Course C' },
    ];
    setCourses(mockCourses);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    // Fetch time slots when selected date changes
    fetchTimeSlots();
  };

  /*
  const fetchTimeSlots = () => {
    // Mock API call to fetch time slots for the selected date
    // Replace this with your actual API endpoint
    const dateStr = selectedDate.toISOString().split('T')[0];
    const mockTimeSlots = Array.from({ length: 24 }, (_, index) => {
      const startTime = ${index.toString().padStart(2, '0')}:00;
      const endTime = ${(index + 1).toString().padStart(2, '0')}:00;
      return { startTime, endTime };
    });
    setTimeSlots(mockTimeSlots);
  };
  */

  const handleMajorSelect = (e) => {
    const selectedMajor = e.target.value;
    setSelectedMajor(selectedMajor);
  };

  const handleSlotSelect = (startTime) => {
    // Handle slot selection
    console.log('Selected time slot:', startTime);
  };

  const handleSaveSession = () => {
    // Handle saving the tutoring session to the database
    console.log('Selected major:', selectedMajor);
    console.log('Selected date:', selectedDate);
    console.log('Selected courses:', selectedCourses);
  };

  return (
    <Container>
      <Row className="mb-3">
        <Col>
          <h1>Select Available Time Slot</h1>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>Select Major:</Form.Label>
            <Form.Control as="select" onChange={handleMajorSelect}>
              <option value="">Select Major</option>
              {majors.map((major, index) => (
                <option key={index} value={major}>
                  {major}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>
      {selectedMajor && (
        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>Select Date:</Form.Label>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="MMMM d, yyyy"
              />
            </Form.Group>
          </Col>
        </Row>
      )}
      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>Select Courses:</Form.Label>
            <Form.Control as="select" multiple>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        {timeSlots.map((slot, index) => (
          <Col key={index} xs={6} md={3} className="mb-2">
            <Button
              variant="primary"
              onClick={() => handleSlotSelect(slot.startTime)}
            >
              {slot.startTime} - {slot.endTime}
            </Button>
          </Col>
        ))}
      </Row>
      <Row className="mt-3">
        <Col>
          <Button
            variant="success"
            onClick={handleSaveSession}
            disabled={!selectedMajor}
          >
            Save Session
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default TimeSlotPicker
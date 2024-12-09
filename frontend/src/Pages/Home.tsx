import React, { useState } from 'react';
import StudentList from '../Components/StudentList/StudentList';
import LessonsList from '../Components/LessonsList/LessonsList';
import AddLesson from '../Components/AddLesson/AddLesson';
import dayjs, { Dayjs } from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import '../index.css';
import api from '../api/Axios';
import { useNavigate } from 'react-router-dom';

const LOGOUT_URL = '/auth/logout';

const Home: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post(LOGOUT_URL);

      localStorage.removeItem('accessToken');
    } catch (error) {
      console.error('Failed to log out', error);
    }
    navigate('/auth/login');
  };

  return (
    <div className='mainWrapper'>
      <StudentList />
      <div className='lessonRow'>
        <AddLesson onDateChange={(date) => setSelectedDate(date ? dayjs(date) : null)} startDate={selectedDate?.toDate() || null} />
        <LessonsList onDateChange={(date) => setSelectedDate(date ? dayjs(date) : null)} startDate={selectedDate?.toDate() || null} />
      </div>
      <button className="logout" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} />
        </button>
    </div>
  );
};

export default Home;

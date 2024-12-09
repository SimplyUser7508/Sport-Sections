import React, { useEffect, useState } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import api from '../../api/Axios';
import DropdownLess from '../Dropdown/DropdownLess';
import CustomDatePicker from '../DatePicker/DatePicker';
import CustomTimePicker from '../DigitsTimePicker/CustomTimePicker';
import styles from './AddLesson.module.css';

const ADD_LESSON_URL = '/lesson/addLesson';
const LESSON_URL = '/lesson/getLessons';
const STUDENT_URL = '/student/getStudents';

enum LessonStatus {
    PLANNED = 'PLANNED',
    CANCELLED = 'CANCELLED',
    DONE = 'DONE',
}

export interface LessonItem {
    lessonId?: string;
    dateTime: string;
    studentName?: string;
    status?: LessonStatus;
    telegramId?: string;
}

interface ApiResponse {
    payload: {
        lessons: LessonItem[];
    };
}

export interface Student {
    firstName: string;
    lastName: string;
    id: string;
}

interface DateProps {
    onDateChange: (date: Date | null) => void;
    startDate: Date | null;
}

dayjs.locale('ru');

const AddLesson: React.FC<DateProps> = ({ onDateChange, startDate }) => {
    const [lessons, setLessons] = useState<LessonItem[]>([]);
    const [error, setError] = useState<string>('');
    const [students, setStudents] = useState<{ value: string, label: string, student: Student }[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [selectedTime, setSelectedTime] = useState<Dayjs>(dayjs());
    const [addingLesson, setAddingLesson] = useState<LessonItem>({
        dateTime: dayjs().toISOString(),
    });

    const handleDateChange = (date: Date | null) => {
        if (date) {
            const newDate = dayjs(date);
            setSelectedDate(newDate);
            onDateChange(date);
        }
    };

    const handleTimeChange = (time: Dayjs | null) => {
        if (time) {
            setSelectedTime(time);

            const currentDateTime = dayjs(addingLesson.dateTime || dayjs().toISOString());
            const updatedDateTime = currentDateTime
                .hour(time.hour())
                .minute(time.minute())
                .second(0);

            setAddingLesson({
                ...addingLesson,
                dateTime: updatedDateTime.toISOString(),
            });
        }
    };

    const fetchLessons = async () => {
        try {
            const response = await api.get<ApiResponse>(LESSON_URL, {
                headers: {
                    'x-access-token': `${localStorage.getItem('accessToken')}`
                },
                params: {
                    page: 1,
                    limit: 5,
                },
            });
            setLessons(response.data.payload.lessons || []);
        } catch (err: any) {
            if (err.response?.status === 401) {
                setError('User not authorized');
            } else {
                setError('Failed to fetch lessons');
            }
        }
    };

    useEffect(() => {
        fetchLessons();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await api.get<{ payload: { students: Student[] } }>(STUDENT_URL, {
                headers: {
                    'x-access-token': `${localStorage.getItem('accessToken')}`
                },
            });

            const formattedStudents = response.data.payload.students.map((student) => ({
                value: student.id,
                label: `${student.firstName} ${student.lastName}`,
                student: student
            }));

            setStudents(formattedStudents);
        } catch (err: any) {
            if (err.response?.status === 401) {
                setError('User not authorized');
            } else {
                setError('Failed to fetch students');
            }
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleAddLesson = async () => {
        if (!selectedDate || !selectedTime || !selectedStudent) {
            setError('Please select date, time, and student');
            return;
        }

        const dateTime = selectedDate
            .hour(selectedTime.hour())
            .minute(selectedTime.minute())
            .second(0);

        const formattedDateTime = dateTime.format('YYYY-MM-DDTHH:mm:ss.SSSZZ');

        const newLesson = {
            id: selectedStudent.id,
            dateTime: formattedDateTime,
        };

        try {
            await api.post<LessonItem>(ADD_LESSON_URL, newLesson, {
                headers: {
                    'x-access-token': `${localStorage.getItem('accessToken')}`,
                },
            });
            
            setLessons([...lessons]);
            setSelectedStudent(null);
            setSelectedDate(dayjs());
            setSelectedTime(dayjs());
            fetchLessons();
        } catch (err) {
            setError('Failed to add lesson');
        }
    };

    return (
        <div className={styles.mainContainer}>
            <h1>Add lesson</h1>
            <button
                className={styles.addButton}
                onClick={handleAddLesson}
            ></button>
            <DropdownLess
                defaultOption={selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : "Select student"}
                options={students.map(student => ({ value: student.value, label: student.label }))}
                selectedOption={selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : ""}
                onSelect={(value) => {
                    const student = students.find(s => s.value === value);
                    setSelectedStudent(student ? student.student : null);
                }}
            />
            <div className={styles.clockContainer}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <CustomTimePicker
                        value={selectedTime}
                        onChange={handleTimeChange}
                    />
                </LocalizationProvider>
            </div>
            <div className={styles.timeDateContainer}>
                <div className={styles.dateContainer}>
                    <h2>Set the date and time</h2>
                    <div className={styles.datePickerContainer}>
                        <CustomDatePicker startDate={startDate} onDateChange={handleDateChange} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddLesson;

import React, { useEffect, useState } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import api from '../../api/Axios';
import DropdownLess from '../Dropdown/DropdownLess';
import CustomDatePicker from '../DatePicker/DatePicker';
import CustomTimePicker from '../DigitsTimePicker/CustomTimePicker';
import styles from './AddLesson.module.css';

const ADD_SECTION_URL = '/section/create';
const SECTION_URL = '/section/get';

export interface SectionItem {
    id?: number;
    section?: string;
    datetime: string;
    status?: string;
    user?: {
        id: number;
        email: string;
        username: string;
    };
}

export interface Section {
    value: string;
    label: string;
}

interface DateProps {
    onDateChange: (date: Date | null) => void;
    startDate: Date | null;
}

dayjs.locale('ru');

const AddLesson: React.FC<DateProps> = ({ onDateChange, startDate }) => {
    const [section, setSection] = useState<SectionItem[]>([]);
    const [,setError] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [selectedTime, setSelectedTime] = useState<Dayjs>(dayjs());
    const [addingSection, setAddingSection] = useState<SectionItem>({
        datetime: dayjs().toISOString(),
    });

    const sections = [
        { value: 'Futbolchik', label: 'Futbolchik' },
        { value: 'Basketball', label: 'Basketball' },
        { value: 'Swimming', label: 'Swimming' },
        { value: 'Volleyball', label: 'Volleyball' },
        { value: 'Tennis', label: 'Tennis' },
        { value: 'Badminton', label: 'Badminton' },
        { value: 'Kachalka', label: 'Kachalka' },
    ];
    const [selectedSection, setSelectedSection] = useState<Section | null>(null);

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

            const currentDateTime = dayjs(addingSection.datetime || dayjs().toISOString());
            const updatedDateTime = currentDateTime
                .hour(time.hour())
                .minute(time.minute())
                .second(0);

            setAddingSection({
                ...addingSection,
                datetime: updatedDateTime.toISOString(),
            });
        }
    };

    const fetchSections= async () => {
        try {
            const response = await api.get<SectionItem>(SECTION_URL, {
                headers: {
                    'Authorization': `${localStorage.getItem('accessToken')}`
                },
                params: {
                    page: 1,
                    limit: 5,
                },
            });
            if (Array.isArray(response.data.section)) {
                setSection(response.data.section);
            } else {
                setSection([]);
            }
            
        } catch (err: any) {
            if (err.response?.status === 401) {
                setError('User not authorized');
            } else {
                setError('Failed to fetch lessons');
            }
        }
    };

    useEffect(() => {
        fetchSections();
    }, []);

    // const fetchStudents = async () => {
    //     try {
    //         const response = await api.get<{ payload: { students: Student[] } }>(STUDENT_URL, {
    //             headers: {
    //                 'x-access-token': `${localStorage.getItem('accessToken')}`
    //             },
    //         });

    //         const formattedStudents = response.data.payload.students.map((student) => ({
    //             value: student.id,
    //             label: `${student.firstName} ${student.lastName}`,
    //             student: student
    //         }));

    //         setStudents(formattedStudents);
    //     } catch (err: any) {
    //         if (err.response?.status === 401) {
    //             setError('User not authorized');
    //         } else {
    //             setError('Failed to fetch students');
    //         }
    //     }
    // };

    // useEffect(() => {
    //     fetchStudents();
    // }, []);

    const handleAddLesson = async () => {
        if (!selectedDate || !selectedTime || !selectedSection) {
            setError('Please select date, time, and student');
            return;
        }

        const dateTime = selectedDate
            .hour(selectedTime.hour())
            .minute(selectedTime.minute())
            .second(0);

        const formattedDateTime = dateTime.format('YYYY-MM-DDTHH:mm:ss.SSSZZ');

        const newLesson = {
            section: selectedSection.value,
            datetime: formattedDateTime,
            status: 'PLANNED'
        };

        try {
            await api.post<SectionItem>(ADD_SECTION_URL, newLesson, {
                headers: {
                    'Authorization': `${localStorage.getItem('accessToken')}`,
                },
            });
            
            setSection([...section]);
            setSelectedSection(null);
            setSelectedDate(dayjs());
            setSelectedTime(dayjs());
            fetchSections();
        } catch (err) {
            setError('Failed to add lesson');
        }
    };

    return (
        <div className={styles.mainContainer}>
            <h1>Add Section</h1>
            <button
                className={styles.addButton}
                onClick={handleAddLesson}
            ></button>
            <DropdownLess
                defaultOption={"Select section"}
                options={sections.map(section => ({ value: section.value, label: section.label }))}
                selectedOption={selectedSection ? `${selectedSection.label}` : ""}
                onSelect={(value) => {
                    const section = sections.find(s => s.value === value);
                    setSelectedSection(section || null);
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

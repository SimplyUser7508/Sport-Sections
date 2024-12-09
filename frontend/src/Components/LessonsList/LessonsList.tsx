import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faClock, faQuestionCircle, faSave, faAngleRight, faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import CustomDatePicker from '../DatePicker/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import CustomTimePicker from '../DigitsTimePicker/CustomTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Tooltip } from 'react-tooltip';
import './LessonsList.css';
import api from '../../api/Axios';

dayjs.extend(customParseFormat);

const LESSON_URL = '/lesson/getLessons';
const DELETE_LESSON_URL = '/lesson/deleteLesson';
const UPDATE_LESSON_URL = '/lesson/updateLesson';
const CANCEL_LESSON_URL = '/lesson/cancelLesson';

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
}

interface ApiResponse {
    payload: {
        lessons: LessonItem[];
    };
}

export interface CustomButtonProps {
    onDateChange: (date: Date | null) => void;
    startDate: Date | null;
}

interface Query {
    page: number;
    limit: number;
}

const LessonsList: React.FC<CustomButtonProps> = ({ onDateChange, startDate }) => {
    const [lessons, setLessons] = useState<LessonItem[]>([]);
    const [error, setError] = useState<string>('');
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<Dayjs>(dayjs());
    const [editedLesson, setEditedLesson] = useState<LessonItem>({
        lessonId: '',
        dateTime: '',
        studentName: '',
        status: LessonStatus.PLANNED
    });
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const fetchLessons = useCallback(async ({ page, limit }: Query) => {
        setError('');
        try {
            const response = await api.get<ApiResponse>(LESSON_URL, {
                headers: {
                    'x-access-token': `${localStorage.getItem('accessToken')}`
                },
                params: { page, limit }
            });
            setLessons(response.data.payload.lessons || []);
        } catch (err: any) {
            setError(`Failed to fetch lessons: ${err.response?.status} ${err.response?.statusText}`);
        }
    }, []);

    useEffect(() => {
        fetchLessons({ page, limit });
    }, [page, limit, fetchLessons]);

    const toggleCalendar = (lesson: LessonItem) => {
        if (editingLessonId === lesson.lessonId) {
            setEditingLessonId(null);
            setCalendarOpen(false);
        } else {
            if (lesson.lessonId) {
                setEditingLessonId(lesson.lessonId);
                setEditedLesson(lesson);
                setCalendarOpen(true);
            }
        }
    };

    const handleDateChange = (date: Date | null) => {
        if (date) {
            const updatedDate = new Date(date);
            const existingDate = new Date(editedLesson.dateTime);
            updatedDate.setHours(existingDate.getHours(), existingDate.getMinutes());
            setEditedLesson({
                ...editedLesson,
                dateTime: updatedDate.toISOString(),
            });
        }
        onDateChange(date);
    };

    const handleTimeChange = (time: Dayjs | null) => {
        if (time) {
            setSelectedTime(time);

            const currentDateTime = dayjs(editedLesson.dateTime || dayjs().toISOString());
            const updatedDateTime = currentDateTime
                .hour(time.hour())
                .minute(time.minute())
                .second(0);

            setEditedLesson({
                ...editedLesson,
                dateTime: updatedDateTime.toISOString(),
            });
        }
    };

    const handleSave = async () => {
        try {
            await api.post(UPDATE_LESSON_URL, editedLesson, {
                headers: {
                    'x-access-token': `${localStorage.getItem('accessToken')}`
                },
            });
            fetchLessons({ page, limit });
            setEditingLessonId(null);
            setCalendarOpen(false);
        } catch (err) {
            setError('Failed to update lesson');
        }
    };

    const handleDelete = async (lessonId: string) => {
        try {
            await api.post(DELETE_LESSON_URL, { lessonId }, {
                headers: {
                    'x-access-token': `${localStorage.getItem('accessToken')}`
                },
            });
            setLessons(lessons.filter(lesson => lesson.lessonId !== lessonId));
            fetchLessons({ page, limit });
        } catch (err) {
            setError('Failed to delete lesson');
        }
    };

    const handleCancel = async (lessonId: string) => {
        try {
            await api.post(CANCEL_LESSON_URL, { lessonId }, {
                headers: {
                    'x-access-token': `${localStorage.getItem('accessToken')}`
                },
            });
            setLessons(lessons.filter(lesson => lesson.lessonId !== lessonId));
            fetchLessons({ page, limit });
        } catch (err) {
            setError('Failed to cancel lesson');
        }
    };

    const renderStatusIcon = (status: LessonStatus | undefined) => {
        switch (status) {
            case LessonStatus.DONE:
                return <FontAwesomeIcon icon={faCheck} className="status-icon done" />;
            case LessonStatus.CANCELLED:
                return <FontAwesomeIcon icon={faTimes} className="status-icon cancelled" />;
            case LessonStatus.PLANNED:
                return <FontAwesomeIcon icon={faClock} className="status-icon planned" />;
            default:
                return null;
        }
    };

    const paginatedLessons = lessons.slice(0, limit);

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div className="LessonsListContainer">
                <div className="header-icons-q">
                    <FontAwesomeIcon icon={faQuestionCircle} className="header-icon question" />
                </div>
                <Tooltip id="my-tooltip" />
                <div className='header-icons'>
                    <p
                        data-tooltip-id="my-tooltip"
                        data-tooltip-content="Завершено"
                        className="icon-paragraph"
                    >
                        <FontAwesomeIcon icon={faCheck} className="header-icon done" />
                    </p>
                    <p
                        data-tooltip-id="my-tooltip"
                        data-tooltip-content="Отменено"
                        className="icon-paragraph"
                    >
                        <FontAwesomeIcon icon={faTimes} className="header-icon cancelled" />
                    </p>
                    <p
                        data-tooltip-id="my-tooltip"
                        data-tooltip-content="Запланировано"
                        className="icon-paragraph"
                    >
                        <FontAwesomeIcon icon={faClock} className="header-icon planned" />
                    </p>
                </div>
                <h1>Lessons:</h1>
                {error && <p className="error">{error}</p>}
                <ul>
                    {paginatedLessons.map(lesson => (
                        <li key={lesson.lessonId}>
                            <div className="status-icon-container">
                                {renderStatusIcon(lesson.status)}
                            </div>
                            <div className='lesson-data'>
                                {editingLessonId === lesson.lessonId ? (
                                    <>
                                        <p>{lesson.studentName}</p>
                                        {calendarOpen && (
                                            <div style={{ position: 'relative', zIndex: '1000' }}>
                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                    <CustomDatePicker startDate={startDate} onDateChange={handleDateChange} />
                                                    <div style={{ position: 'absolute', left: '6rem', bottom: '0rem' }}>
                                                        <CustomTimePicker
                                                            value={selectedTime}
                                                            onChange={handleTimeChange}
                                                        />
                                                    </div>
                                                </LocalizationProvider>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <p>{dayjs(lesson.dateTime).format('DD-MM-YYYY HH:mm')}</p>
                                        <p>{lesson.studentName}</p>
                                    </>
                                )}
                            </div>
                            <div className="button-container">
                                {editingLessonId !== lesson.lessonId && (
                                    <>
                                        {lesson.status === LessonStatus.PLANNED && (
                                            <button className="list-edit" onClick={() => toggleCalendar(lesson)}></button>
                                        )}
                                        {lesson.status === LessonStatus.PLANNED && (
                                            <button className="list-cancel" onClick={() => handleCancel(lesson.lessonId || '')}>
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                        )}
                                        <button className="list-delete" onClick={() => handleDelete(lesson.lessonId || '')}></button>
                                    </>
                                )}
                            </div>
                            {editingLessonId === lesson.lessonId && (
                                <button className="save-button" onClick={handleSave}>
                                    <FontAwesomeIcon icon={faSave} />
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
                <div className="pagination">
                    <button 
                        disabled={page <= 1} 
                        onClick={() => handlePageChange(page - 1)}
                    >
                        <FontAwesomeIcon icon={faAngleLeft} />
                    </button>
                    <span>Page {page}</span>
                    <button 
                        disabled={paginatedLessons.length < limit} 
                        onClick={() => handlePageChange(page + 1)}
                    >
                        <FontAwesomeIcon icon={faAngleRight} />
                    </button>
                    <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}>
                        {[5, 10, 15, 20, 25, 30].map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>
            </div>
        </LocalizationProvider>
    );
};

export default LessonsList;

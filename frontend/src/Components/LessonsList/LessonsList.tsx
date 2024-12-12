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

const SECTION_URL = '/section/get';
const DELETE_LESSON_URL = '/section/delete';
const UPDATE_LESSON_URL = '/section/update';
const CANCEL_LESSON_URL = '/lesson/cancelLesson';

enum SectionStatus {
    PLANNED = 'PLANNED',
    CANCELLED = 'CANCELLED',
    DONE = 'DONE',
}

export interface SectionItem {
    id?: string;
    section?: string;
    datetime: string;
    status?: string;
    user?: {
        id: number;
        email: string;
        username: string;
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
    const [section, setSection] = useState<SectionItem[]>([]);
    const [error, setError] = useState<string>('');
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<Dayjs>(dayjs());
    const [editedLesson, setEditedLesson] = useState<SectionItem>({
        id: '',
        datetime: '',
        section: '',
        status: SectionStatus.PLANNED
    });
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const fetchSections = useCallback(async ({ page, limit }: Query) => {
        setError('');
        try {
            const response = await api.get<SectionItem>(SECTION_URL, {
                headers: {
                    'Authorization': `${localStorage.getItem('accessToken')}`
                },
                params: { page, limit }
            });
            if (Array.isArray(response.data.section)) {
                setSection(response.data.section);
            } else {
                setSection([]);
            }
        } catch (err: any) {
            setError(`Failed to fetch lessons: ${err.response?.status} ${err.response?.statusText}`);
        }
    }, []);

    useEffect(() => {
        fetchSections({ page, limit });
    }, [page, limit, fetchSections]);

    const toggleCalendar = (lesson: SectionItem) => {
        if (editingLessonId === lesson.id) {
            setEditingLessonId(null);
            setCalendarOpen(false);
        } else {
            if (lesson.id) {
                setEditingLessonId(lesson.id);
                setEditedLesson(lesson);
                setCalendarOpen(true);
            }
        }
    };

    const handleDateChange = (date: Date | null) => {
        if (date) {
            const updatedDate = new Date(date);
            const existingDate = new Date(editedLesson.datetime);
            updatedDate.setHours(existingDate.getHours(), existingDate.getMinutes());
            setEditedLesson({
                ...editedLesson,
                datetime: updatedDate.toISOString(),
            });
        }
        onDateChange(date);
    };

    const handleTimeChange = (time: Dayjs | null) => {
        if (time) {
            setSelectedTime(time);

            const currentDateTime = dayjs(editedLesson.datetime || dayjs().toISOString());
            const updatedDateTime = currentDateTime
                .hour(time.hour())
                .minute(time.minute())
                .second(0);

            setEditedLesson({
                ...editedLesson,
                datetime: updatedDateTime.toISOString(),
            });
        }
    };

    const handleSave = async () => {
        const id = editedLesson.id;
        if (!id) {
            setError('Missing lesson ID');
            return;
        }
    
        try {
            await api.post(`${UPDATE_LESSON_URL}/${id}`, editedLesson, {
                headers: {
                    'Authorization': `${localStorage.getItem('accessToken')}`
                },
            });
            fetchSections({ page, limit });
            setEditingLessonId(null);
            setCalendarOpen(false);
        } catch (err) {
            setError('Failed to update lesson');
        }
    };
    

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`${DELETE_LESSON_URL}/${id}`, {
                headers: {
                    Authorization: `${localStorage.getItem('accessToken')}`,
                },
            });
            setSection(section.filter((section) => section.id !== id));
            fetchSections({ page, limit });
        } catch (err) {
            setError('Failed to delete lesson');
        }
    };

    // const handleCancel = async (id: string) => {
    //     try {
    //         await api.post(CANCEL_LESSON_URL, { id }, {
    //             headers: {
    //                 'Authorization': `${localStorage.getItem('accessToken')}`
    //             },
    //         });
    //         setSection(section.filter(section => section.id !== id));
    //         fetchSections({ page, limit });
    //     } catch (err) {
    //         setError('Failed to cancel lesson');
    //     }
    // };

    const renderStatusIcon = (status: SectionStatus | undefined) => {
        switch (status) {
            case SectionStatus.DONE:
                return <FontAwesomeIcon icon={faCheck} className="status-icon done" />;
            case SectionStatus.CANCELLED:
                return <FontAwesomeIcon icon={faTimes} className="status-icon cancelled" />;
            case SectionStatus.PLANNED:
                return <FontAwesomeIcon icon={faClock} className="status-icon planned" />;
            default:
                return null;
        }
    };

    const paginatedSections = Array.isArray(section) ? section.slice(0, limit) : [];

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
                        data-tooltip-content="Запланировано"
                        className="icon-paragraph"
                    >
                        <FontAwesomeIcon icon={faClock} className="header-icon planned" />
                    </p>
                </div>
                <h1>Sections:</h1>
                {error && <p className="error">{error}</p>}
                <ul>
                    {paginatedSections.map(section => (
                        <li key={section.id}>
                            <div className="status-icon-container">
                            {renderStatusIcon(section.status as SectionStatus)}
                            </div>
                            <div className='section-data'>
                            {editingLessonId === section.id ? (
                                <>
                                    <p>{section.section}</p>

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
                                    <div className="color-secton-name">
                                        <p>{section.section}</p>
                                    </div>
                                    <p>{dayjs(section.datetime).format('DD-MM-YYYY HH:mm')}</p> {/* Дата */}
                                </>
                            )}
                            </div>
                            <div className="button-container">
                                {editingLessonId !== section.id && (
                                    <>
                                        {section.status === SectionStatus.PLANNED && (
                                            <button className="list-edit" onClick={() => toggleCalendar(section)}></button>
                                        )}
                                        {/* {section.status === SectionStatus.PLANNED && (
                                            <button className="list-cancel" onClick={() => handleCancel(section.id || '')}>
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                        )} */}
                                        <button className="list-delete" onClick={() => handleDelete(section.id || '')}></button>
                                    </>
                                )}
                            </div>
                            {editingLessonId === section.id && (
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
                        disabled={paginatedSections.length < limit} 
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

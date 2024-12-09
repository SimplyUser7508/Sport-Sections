import React, { useEffect, useState } from 'react';
import api from '../../api/Axios';
import './StudentList.css';

const STUDENT_URL = '/student/getStudents';
const DELETE_STUDENT_URL = '/student/deleteStudent';
const UPDATE_STUDENT_URL = '/student/updateStudent';
const ADD_STUDENT_URL = '/student/addStudent';

export interface Student {
    id?: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    telegramId?: string;
}

const StudentList: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [error, setError] = useState<string>('');
    const [newStudent, setNewStudent] = useState<Student>({
        id: '',
        firstName: '',
        lastName: '',
        avatarUrl: '',
        telegramId: ''
    });
    const [showAddStudentForm, setShowAddStudentForm] = useState<boolean>(false);
    const [showEditStudentForm, setShowEditStudentForm] = useState<boolean>(false);
    const [isAddButtonRotated, setIsAddButtonRotated] = useState<boolean>(false);
    const [areFieldsFilled, setAreFieldsFilled] = useState<boolean>(false);

    const fetchStudents = async () => {
        try {
            const response = await api.get(STUDENT_URL, {
                headers: { 
                    'x-access-token': `${localStorage.getItem('accessToken')}`
                },
            });

            setStudents(response.data.payload.students);
        } catch (err: any) {
            console.error('Error fetching students:', err);
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

    useEffect(() => {
        const { firstName, lastName, telegramId } = newStudent;
        const areSpecificFieldsFilled = [firstName, lastName, telegramId].every(value => value !== '');
        setAreFieldsFilled(areSpecificFieldsFilled);

        if (showEditStudentForm) {
            const areSpecificFieldsFilled = [firstName, lastName].every(value => value !== '');
            setAreFieldsFilled(areSpecificFieldsFilled);
        }
    }, [newStudent]);

    useEffect(() => {
        if (areFieldsFilled && showAddStudentForm) {
            toggleAddStudentForm();
        } else if (showAddStudentForm) {
            setIsAddButtonRotated(true);
        } else if (!areFieldsFilled && showEditStudentForm) {
            setShowEditStudentForm(false);
            setIsAddButtonRotated(false);
        }
    }, [areFieldsFilled]);

    const handleDelete = async (id: string) => {
        try {
            await api.post(DELETE_STUDENT_URL, {
                id,
            }, {
                headers: {
                    'x-access-token': `${localStorage.getItem('accessToken')}`
                },
            });
            setStudents(students.filter(student => student.id !== id));
        } catch (err) {
            console.error('Error deleting student:', err);
            setError('Failed to delete student');
        }
    };

    const handleEdit = async () => {
        const { id, firstName, lastName } = newStudent;
        try {
            await api.post(UPDATE_STUDENT_URL, {
                id,
                data: { firstName, lastName }
            }, {
                headers: {
                    'x-access-token': `${localStorage.getItem('accessToken')}`
                },
            });
            setNewStudent({
                firstName: '',
                lastName: '',
                telegramId: ''
            });
            setShowEditStudentForm(false);
            fetchStudents();
            toggleAddStudentForm();
        } catch (err) {
            console.error('Error updating student:', err);
            setError('Failed to update student');
        }
    };

    const editButton = async (id: string) => {
        setShowAddStudentForm(false);
        setIsAddButtonRotated(true);
        const studentToEdit = students.find(student => student.id === id);
        if (studentToEdit) {
            setNewStudent(studentToEdit);
            setShowEditStudentForm(true);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setNewStudent({
            ...newStudent,
            [e.target.name]: e.target.value
        });
    };

    const handleAddStudent = async () => {
        try {
            const response = await api.post<Student>(ADD_STUDENT_URL, newStudent, {
                headers: {
                    'x-access-token': `${localStorage.getItem('accessToken')}`
                },
            });
            setStudents([...students]);
            setNewStudent({
                firstName: '',
                lastName: '',
                telegramId: ''
            });
            setShowAddStudentForm(false);
            fetchStudents();
        } catch (err) {
            console.error('Error adding student:', err);
            setError('Failed to add student');
        }
    };

    const toggleAddStudentForm = () => {
        if(areFieldsFilled) {
            if(isAddButtonRotated) {
                setIsAddButtonRotated(false);
                if(showEditStudentForm){
                    setShowEditStudentForm(false);
                    setNewStudent({
                        firstName: '',
                        lastName: '',
                        telegramId: ''
                    });
                }
            }
            else {
                handleAddStudent();
            }
        } else {
            setShowAddStudentForm(!showAddStudentForm);
            setIsAddButtonRotated(!isAddButtonRotated);
        }
    };

    return (
        <div className="container">
            <h1>Students</h1>
            {error && <p className="error">{error}</p>}
            <ul>
                {students?.map(student => (
                    <li key={student.id}>
                        <img src={student.avatarUrl} alt={`${student.firstName} ${student.lastName}`} />
                        <div>
                            <p>{student.firstName} {student.lastName}</p>
                            {student.telegramId && <p>Telegram: {student.telegramId}</p>}
                        </div>
                        <div className="button-container">
                        <button className="edit" onClick={() => editButton(student.id || '')}></button>
                        <button className="delete" onClick={() => handleDelete(student.id || '')}></button>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="add-student-form">
                <button 
                    className={`add-button ${isAddButtonRotated ? 'rotated' : ''}`} 
                    onClick={toggleAddStudentForm}
                ></button>
                <div className={`form-content ${showAddStudentForm ? 'visible' : ''}`}>
                    <h2>Add Student</h2>
                    <div className="add-student-form-row">
                        <input className='stud-fields' type="text" name="firstName" value={newStudent.firstName} onChange={handleChange} placeholder="First Name" />
                        <input className='stud-fields' type="text" name="lastName" value={newStudent.lastName} onChange={handleChange} placeholder="Last Name" />
                        <input className='stud-fields' type="text" name="telegramId" value={newStudent.telegramId} onChange={handleChange} placeholder="Telegram ID" />
                    </div>
                </div>
                <div className={`form-content ${showEditStudentForm ? 'visible' : ''}`}>
                    <div className='edit-student-form-row'>
                        <input className='stud-fields' type="text" name="firstName" value={newStudent.firstName} onChange={handleChange} placeholder="First Name" />
                        <input className='stud-fields' type="text" name="lastName" value={newStudent.lastName} onChange={handleChange} placeholder="Last Name" />
                        <button className='submitEditButton' onClick={() => handleEdit()} disabled={!areFieldsFilled}></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentList;

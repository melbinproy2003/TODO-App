import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/AxiosInstance';
import Navbar from './Navbar';
import './MyDay.css';

function MyDay({ pk }) {
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [newTaskPin, setNewTaskPin] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [completedVisible, setCompletedVisible] = useState(false);
    const [overdueVisible, setOverdueVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTask, setSelectedTask] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchDefaultTasks() {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }

            try {
                const response = await axiosInstance.get(`Task/${pk}`);
                setTasks(response.data);
            } catch (err) {
                setError(err.response?.data || err.message || 'An error occurred');
            }
        }
        fetchDefaultTasks();
    }, [navigate, pk]);

    const handleAddTask = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        const newTask = {
            description: newTaskDescription,
            due_date: newTaskDueDate,
            pin: newTaskPin,
            complete: false
        };

        try {
            const response = await axiosInstance.post(`Task/${pk}/add/`, newTask);
            setTasks(prevTasks => [...prevTasks, response.data]);
            setNewTaskDescription('');
            setNewTaskDueDate('');
            setNewTaskPin(false);
        } catch (err) {
            setError(err.response?.data || err.message || 'An error occurred while adding the task.');
        }
    };

    const toggleCalendar = () => {
        setShowCalendar(prev => !prev);
    };

    const markComplete = async (task) => {
        try {
            const updatedTask = { ...task, complete: !task.complete };
            await axiosInstance.put(`Task/${task.id}/Update/`, updatedTask);
            setTasks(prevTasks => prevTasks.map(t => (t.id === task.id ? updatedTask : t)));
        } catch (err) {
            setError(err.response?.data || err.message || 'Error updating task.');
        }
    };

    const togglePin = async (task) => {
        try {
            const updatedTask = { ...task, pin: !task.pin };
            await axiosInstance.put(`Task/${task.id}/Update/`, updatedTask);
            setTasks(prevTasks => prevTasks.map(t => (t.id === task.id ? updatedTask : t)));
        } catch (err) {
            setError(err.response?.data || err.message || 'Error updating task.');
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const openTaskDetails = (task) => {
        setSelectedTask(task);
        setIsEditing(false);
    };

    const closeModal = () => {
        setSelectedTask(null);
    };

    const handleDeleteTask = async () => {
        if (selectedTask) {
            try {
                await axiosInstance.delete(`Task/${selectedTask.id}/Delete/`);
                setTasks(prevTasks => prevTasks.filter(task => task.id !== selectedTask.id));
                closeModal();
            } catch (err) {
                setError(err.response?.data || err.message || 'Error deleting task.');
            }
        }
    };

    const handleEditTask = async () => {
        if (selectedTask) {
            try {
                const updatedTask = {
                    ...selectedTask,
                    description: selectedTask.description,
                    due_date: selectedTask.due_date,
                    pin: selectedTask.pin,
                };
                await axiosInstance.put(`Task/${selectedTask.id}/Update/`, updatedTask);
                setTasks(prevTasks => prevTasks.map(t => (t.id === selectedTask.id ? updatedTask : t)));
                setIsEditing(false);
            } catch (err) {
                setError(err.response?.data || err.message || 'Error updating task.');
            }
        }
    };

    // Render method (error handling section)
    if (error) {
        const errorMessage = typeof error === 'object' && error.message ? error.message : error;
        return <div>Error: {errorMessage}</div>; // Render the error message safely
    }

    const currentDate = new Date();

    const filteredTasks = tasks.filter(task => 
        !task.complete && 
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) && 
        new Date(task.due_date) >= currentDate
    );
    
    const completedTasks = tasks.filter(task => 
        task.complete && 
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const overdueTasks = tasks.filter(task => 
        !task.complete && 
        new Date(task.due_date) < currentDate
    );

    const sortedTasks = filteredTasks.sort((a, b) => {
        if (a.pin !== b.pin) return b.pin - a.pin;
        return new Date(a.due_date) - new Date(b.due_date);
    });

    const sortedCompletedTasks = completedTasks.sort((a, b) => new Date(b.due_date) - new Date(a.due_date));

    const calculateRemainingDays = (dueDate) => {
        const dateDifference = new Date(dueDate) - currentDate;
        const remainingDays = Math.ceil(dateDifference / (1000 * 60 * 60 * 24));

        if (remainingDays <= 0) {
            return 'Overdue';
        } else if (remainingDays <= 2) {
            return `${remainingDays} day(s) left`;
        } else {
            return new Date(dueDate).toLocaleDateString();
        }
    };

    return (
        <Navbar>
            <div className="myday-container">
                <div className='searchContainer'>
                    <div className='searchBox'>
                        <input
                            type="text"
                            className='searchInput'
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>

                <div className="task-input-section">
                    <form onSubmit={handleAddTask} className="task-form">
                        <input
                            type="text"
                            value={newTaskDescription}
                            onChange={(e) => setNewTaskDescription(e.target.value)}
                            placeholder="Add a task"
                            required
                            className="task-input"
                        />
                        <div className="task-icons">
                            <span className="icon" onClick={toggleCalendar}>📅</span>
                        </div>
                        {showCalendar && (
                            <input
                                type="date"
                                value={newTaskDueDate}
                                onChange={(e) => setNewTaskDueDate(e.target.value)}
                                min={new Date().toISOString().split("T")[0]}
                                className="task-calendar"
                            />
                        )}
                        <button type="submit" className="add-task-button">Add</button>
                    </form>
                </div>

                {sortedTasks.length > 0 ? (
                    <div className="task-list">
                        {sortedTasks.map(task => (
                            <div key={task.id} className="task-item" onClick={() => openTaskDetails(task)}>
                                <span className={`circle-icon ${task.complete ? 'complete' : ''}`} onClick={() => markComplete(task)}>
                                    &#9900;
                                </span>
                                <div className="task-content">
                                    <p className="task-title">{task.description}</p>
                                    <p className="task-meta">{calculateRemainingDays(task.due_date)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-data-message">No Data Available</div>
                )}

                {/* Completed Tasks */}
                {completedTasks.length > 0 && (
                    <div className="completed-section">
                        <h2>Completed Tasks</h2>
                        <div className="task-list">
                            {sortedCompletedTasks.map(task => (
                                <div key={task.id} className="task-item complete" onClick={() => openTaskDetails(task)}>
                                    <span className="circle-icon complete">&#9900;</span>
                                    <div className="task-content">
                                        <p className="task-title">{task.description}</p>
                                        <p className="task-meta">Completed</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Overdue Tasks */}
                {overdueTasks.length > 0 && (
                    <div className="overdue-section">
                        <h2>Overdue Tasks</h2>
                        <div className="task-list">
                            {overdueTasks.map(task => (
                                <div key={task.id} className="task-item overdue" onClick={() => openTaskDetails(task)}>
                                    <span className="circle-icon overdue">&#9900;</span>
                                    <div className="task-content">
                                        <p className="task-title">{task.description}</p>
                                        <p className="task-meta">Overdue</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Modal for editing/deleting a task */}
                {selectedTask && (
                    <div className="modal">
                        <div className="modal-content">
                            <h2>{isEditing ? 'Edit Task' : 'Task Details'}</h2>
                            <p>Description: {selectedTask.description}</p>
                            <p>Due Date: {selectedTask.due_date}</p>
                            <div className="modal-actions">
                                <button onClick={() => setIsEditing(true)}>Edit</button>
                                <button onClick={handleDeleteTask}>Delete</button>
                                <button onClick={closeModal}>Close</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Navbar>
    );
}

export default MyDay;

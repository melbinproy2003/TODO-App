import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/AxiosInstance';
import Navbar from './Navbar';
import './MyDay.css';

function MyDay() {
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [newTaskPin, setNewTaskPin] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [completedVisible, setCompletedVisible] = useState(false);
    const [overdueVisible, setOverdueVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTask, setSelectedTask] = useState(null); // To store the task selected for viewing/editing
    const [isEditing, setIsEditing] = useState(false); // To track if in edit mode
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchDefaultTasks() {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }

            try {
                const response = await axiosInstance.get('DefaultTask/');
                setTasks(response.data);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'An error occurred');
            }
        }
        fetchDefaultTasks();
    }, [navigate]);

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
            const response = await axiosInstance.post('DefaultTask/add/', newTask);
            setTasks(prevTasks => [...prevTasks, response.data]);
            setNewTaskDescription('');
            setNewTaskDueDate('');
            setNewTaskPin(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An error occurred while adding the task.');
        }
    };

    const toggleCalendar = () => {
        setShowCalendar(prev => !prev);
    };

    const markComplete = async (task) => {
        try {
            const updatedTask = { ...task, complete: !task.complete };
            await axiosInstance.put(`DefaultTask/${task.id}/update/`, updatedTask);
            setTasks(prevTasks => prevTasks.map(t => (t.id === task.id ? updatedTask : t)));
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error updating task.');
        }
    };

    const togglePin = async (task) => {
        try {
            const updatedTask = { ...task, pin: !task.pin };
            await axiosInstance.put(`DefaultTask/${task.id}/update/`, updatedTask);
            setTasks(prevTasks => prevTasks.map(t => (t.id === task.id ? updatedTask : t)));
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error updating task.');
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const openTaskDetails = (task) => {
        setSelectedTask(task); // Set the clicked task as the selected task to open the modal
        setIsEditing(false); // Reset edit mode when opening a new task
    };

    const closeModal = () => {
        setSelectedTask(null); // Close the modal by resetting the selected task
    };

    const handleDeleteTask = async () => {
        if (selectedTask) {
            try {
                await axiosInstance.delete(`DefaultTask/${selectedTask.id}/delete/`);
                setTasks(prevTasks => prevTasks.filter(task => task.id !== selectedTask.id));
                closeModal(); // Close the modal after deletion
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Error deleting task.');
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
                await axiosInstance.put(`DefaultTask/${selectedTask.id}/update/`, updatedTask);
                setTasks(prevTasks => prevTasks.map(t => (t.id === selectedTask.id ? updatedTask : t)));
                setIsEditing(false); // Exit edit mode after saving
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Error updating task.');
            }
        }
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    const currentDate = new Date();

    // Filter tasks safely
    const filteredTasks = Array.isArray(tasks) ? tasks.filter(task => 
        !task.complete && 
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) && 
        new Date(task.due_date) >= currentDate // Only future tasks, excluding overdue
    ) : [];
    
    const completedTasks = Array.isArray(tasks) ? tasks.filter(task => 
        task.complete && 
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

    const overdueTasks = Array.isArray(tasks) ? tasks.filter(task => 
        !task.complete && 
        new Date(task.due_date) < currentDate // Only overdue tasks
    ) : [];

    // Sort tasks to show pinned tasks first, then by due date
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
                {/* Search Bar */}
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

                {/* Task Input Section */}
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

                {/* Uncompleted Tasks */}
                {sortedTasks.length > 0 && (
                    <div className="task-list">
                        {sortedTasks.map(task => (
                            <div key={task.id} className="task-item">
                                <span className={`circle-icon ${task.complete ? 'complete' : ''}`} onClick={() => markComplete(task)}>
                                    &#9900;
                                </span>
                                <div className="task-content">
                                    <p className="task-title" onClick={() => openTaskDetails(task)}>{task.description}</p>
                                    <p className="task-meta">{calculateRemainingDays(task.due_date)}</p>
                                </div>
                                <span className={`star-icon ${task.pin ? 'important' : ''}`} onClick={() => togglePin(task)}>
                                    &#9733;
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Completed Tasks */}
                {sortedCompletedTasks.length > 0 && (
                    <div className="completed-section">
                        <div className="completed-header" onClick={() => setCompletedVisible(!completedVisible)}>
                            <p>Completed {completedVisible ? '▴' : '▾'}</p>
                            <span>({sortedCompletedTasks.length})</span>
                        </div>

                        {completedVisible && (
                            <div className="task-list">
                                {sortedCompletedTasks.map(task => (
                                    <div key={task.id} className="task-item completed">
                                        <span className={`circle-icon ${task.complete ? 'complete' : ''}`} onClick={() => markComplete(task)}>
                                            &#9900;
                                        </span>
                                        <div className="task-content">
                                            <p className="task-title" onClick={() => openTaskDetails(task)}>{task.description}</p>
                                            <p className="task-meta">{new Date(task.due_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Overdue Tasks */}
                {overdueTasks.length > 0 && (
                    <div className="overdue-section">
                        <div className="overdue-header" onClick={() => setOverdueVisible(!overdueVisible)}>
                            <p>Overdue {overdueVisible ? '▴' : '▾'}</p>
                            <span>({overdueTasks.length})</span>
                        </div>

                        {overdueVisible && (
                            <div className="task-list">
                                {overdueTasks.map(task => (
                                    <div key={task.id} className="task-item overdue">
                                        <span className={`circle-icon ${task.complete ? 'complete' : ''}`} onClick={() => markComplete(task)}>
                                            &#9900;
                                        </span>
                                        <div className="task-content">
                                            <p className="task-title" onClick={() => openTaskDetails(task)}>{task.description}</p>
                                            <p className="task-meta">{new Date(task.due_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Modal for task details */}
                {selectedTask && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <div className="modal-header">
                                <h3>{isEditing ? 'Edit Task' : 'Task Details'}</h3>
                                <button className="close-modal" onClick={closeModal}>×</button>
                            </div>
                            <div className="modal-content">
                                {isEditing ? (
                                    <>
                                        <input
                                            type="text"
                                            value={selectedTask.description}
                                            onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })}
                                            className="modal-input"
                                        />
                                        <input
                                            type="date"
                                            value={selectedTask.due_date}
                                            onChange={(e) => setSelectedTask({ ...selectedTask, due_date: e.target.value })}
                                            className="modal-input"
                                        />
                                        <div className="pin-section">
                                            <input
                                                type="checkbox"
                                                checked={selectedTask.pin}
                                                onChange={(e) => setSelectedTask({ ...selectedTask, pin: e.target.checked })}
                                            />
                                            <span>Pin task</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p><strong>Description:</strong> {selectedTask.description}</p>
                                        <p><strong>Due Date:</strong> {new Date(selectedTask.due_date).toLocaleDateString()}</p>
                                        <p><strong>Pin:</strong> {selectedTask.pin ? 'Yes' : 'No'}</p>
                                    </>
                                )}
                            </div>
                            <div className="modal-footer">
                                {isEditing ? (
                                    <>
                                        <button onClick={handleEditTask} className="modal-save">Save</button>
                                        <button onClick={() => setIsEditing(false)} className="modal-cancel">Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => setIsEditing(true)} className="modal-edit">Edit</button>
                                        <button onClick={handleDeleteTask} className="modal-delete">Delete</button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Navbar>
    );
}

export default MyDay;

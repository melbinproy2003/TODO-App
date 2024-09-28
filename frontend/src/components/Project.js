import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../utils/AxiosInstance';
import Navbar from './Navbar';
import './MyDay.css';

function Project() {
    const { pk, taskname } = useParams();
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const [completedVisible, setCompletedVisible] = useState(false);
    const [overdueVisible, setOverdueVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedTaskList, setSelectedTaskList] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [tasklist, setTaskList] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchTasks() {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }

            try {
                const response = await axiosInstance.get(`Task/${pk}/`);
                setTasks(response.status === 204 ? [] : response.data);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'An error occurred');
            }
        }

        async function fetchTaskList() {
            try {
                const response = await axiosInstance.get(`TaskList/`);
                if (response.status === 204 || !response.data) {
                    setTaskList([]);
                } else {
                    const taskList = response.data.find(taskList => taskList.id === parseInt(pk));
                    setTaskList(taskList ? [taskList] : []);
                }
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'An error occurred');
                setTaskList([]);
            }
        }

        fetchTaskList();
        fetchTasks();
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
            task_list: pk,
            complete: false
        };

        try {
            const response = await axiosInstance.post(`Task/${pk}/add/`, newTask);
            setTasks(prevTasks => [...prevTasks, response.data]);
            setNewTaskDescription('');
            setNewTaskDueDate('');
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
            await axiosInstance.put(`Task/${task.id}/update/`, updatedTask);
            setTasks(prevTasks => prevTasks.map(t => (t.id === task.id ? updatedTask : t)));
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error updating task.');
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
        setSelectedTaskList(null);
    };

    const handleDeleteTask = async () => {
        if (selectedTask) {
            try {
                await axiosInstance.delete(`Task/${selectedTask.id}/delete/`);
                setTasks(prevTasks => prevTasks.filter(task => task.id !== selectedTask.id));
                closeModal();
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Error deleting task.');
            }
        }
    };

    // Function to open task list edit
    const openTaskListEdit = (task) => {
        setSelectedTaskList(task);
        setIsEditing(true);
    };

    const handleEditTask = async () => {
        if (selectedTask) {
            try {
                const updatedTask = {
                    ...selectedTask,
                    description: selectedTask.description,
                    due_date: selectedTask.due_date,
                };
                await axiosInstance.put(`Task/${selectedTask.id}/update/`, updatedTask);
                setTasks(prevTasks => prevTasks.map(t => (t.id === selectedTask.id ? updatedTask : t)));
                setIsEditing(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Error updating task.');
            }
        }
    };

    const handleEditTaskList = async () => {
        if (selectedTaskList) {
            try {
                // Create the updated task list object
                const updatedTaskList = {
                    ...selectedTaskList,
                    taskname: selectedTaskList.taskname,
                };

                // Make the API call to update the task list
                await axiosInstance.put(`TaskList/${selectedTaskList.id}/update/`, updatedTaskList);

                // Optionally, update the local state here to reflect the change without re-fetching
                setTaskList((prevTaskLists) =>
                    prevTaskLists.map((taskList) =>
                        taskList.id === selectedTaskList.id ? updatedTaskList : taskList
                    )
                );

                // Close the modal
                setIsEditing(false);
                closeModal();
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Error updating task list.');
            }
        }
    };

    // Function to handle the task list deletion
    const handleDeleteTaskList = async (taskId) => {
        try {
            await axiosInstance.delete(`TaskList/${taskId}/delete/`);
            navigate('/dashboard'); // Redirect to dashboard after deletion
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error deleting task list.');
        }
    };

     // Generate Markdown content
     const generateMarkdownContent = () => {
        const header = `# Project: ${taskname}\n\n`;
    
        // Count completed and pending tasks
        const completedTasks = tasks.filter(task => task.complete);
        const pendingTasks = tasks.filter(task => !task.complete);
        const summary = `Summary: ${completedTasks.length}/${tasks.length} todo completed\n\n`;
    
        // Format pending tasks
        const pendingTaskList = pendingTasks.map(task => {
            return `- [❌]  ${task.description}\n`;
        }).join('');
    
        // Format completed tasks
        const completedTaskList = completedTasks.map(task => {
            // const dueDate = task.due_date ? `Due: ${new Date(task.due_date).toLocaleDateString()}` : 'No Due Date';
            return `- [✔️]  ${task.description}\n`;
        }).join('');
    
        return header + summary + "## Pending Tasks\n" + pendingTaskList + "## Completed Tasks\n" + completedTaskList;
    };
    

    // Download Markdown file
    const downloadMarkdown = (content, filename) => {
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    };

    const handleExportMarkdown = () => {
        const markdownContent = generateMarkdownContent();
        downloadMarkdown(markdownContent, `${taskname}-tasks.md`);
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    const currentDate = new Date();

    // Filter tasks
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

    // Sort tasks by due date
    const sortedTasks = filteredTasks.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    const sortedCompletedTasks = completedTasks.sort((a, b) => new Date(b.due_date) - new Date(a.due_date));

    const calculateRemainingDays = (dueDate) => {
        const currentDateTime = new Date();
        const taskDueDate = new Date(dueDate);
        const dateDifference = taskDueDate - currentDateTime;

        const remainingDays = Math.floor(dateDifference / (1000 * 60 * 60 * 24));

        if (remainingDays < 0) {
            return 'Overdue';
        } else if (remainingDays === 1) {
            return '1 day left';
        } else {
            return `${remainingDays} days left`;
        }
    };

    return (
        <Navbar>
            {tasklist.map(task => {
                const dateObj = new Date(task.cdate);
                const formattedDate = dateObj.toLocaleDateString();
                const formattedTime = dateObj.toLocaleTimeString();

                return (
                    <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div onClick={() => openTaskListEdit(task)}>
                            <h3 style={{ color: 'green' }}>{task.taskname}</h3>
                            <p style={{color:'gray'}}>{formattedDate} {formattedTime}</p>
                        </div>
                         {/* Export Button */}
                         <div>
                        <button onClick={handleExportMarkdown} style={{ backgroundColor: 'orange', color: 'white', border: 'none',borderRadius:'10px', cursor: 'pointer' }}>Export as Markdown</button>
                        <> </>
                        <button onClick={() => handleDeleteTaskList(task.id)} style={{ backgroundColor: 'red', color: 'white', border: 'none',borderRadius:'10px', cursor: 'pointer' }}>
                            Delete
                        </button>
                        </div>
                    </div>
                );
            })}

            <div className="myday-container">

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
                            </div>
                        ))}
                    </div>
                )}

                {sortedCompletedTasks.length > 0 && (
                    <div className="completed-section">
                        <div className="completed-header" onClick={() => setCompletedVisible(!completedVisible)}>
                            <p>Completed {completedVisible ? '▲' : '▼'}</p>
                        </div>
                        {completedVisible && (
                            <div className="task-list">
                                {sortedCompletedTasks.map(task => (
                                    <div key={task.id} className="task-item completed">
                                        <span className="circle-icon complete">&#9900;</span>
                                        <div className="task-content">
                                            <p className="task-title" onClick={() => openTaskDetails(task)}><s>{task.description}</s></p>
                                            <p className="task-meta">Completed {new Date(task.due_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {overdueTasks.length > 0 && (
                    <div className="overdue-section">
                        <div className="overdue-header" onClick={() => setOverdueVisible(!overdueVisible)}>
                            <p>Overdue {overdueVisible ? '▲' : '▼'}</p>
                        </div>
                        {overdueVisible && (
                            <div className="task-list">
                                {overdueTasks.map(task => (
                                    <div key={task.id} className="task-item overdue">
                                        <span className="circle-icon" onClick={() => markComplete(task)}>
                                            &#9900;
                                        </span>
                                        <div className="task-content">
                                            <p className="task-title" onClick={() => openTaskDetails(task)}>{task.description}</p>
                                            <p className="task-meta">{calculateRemainingDays(task.due_date)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {selectedTask && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        {!isEditing ? (
                            <>
                                <h2>{selectedTask.description}</h2>
                                <p><strong>Created on:</strong> {selectedTask.cdate}</p>
                                <p><strong>Due Date:</strong> {new Date(selectedTask.due_date).toLocaleDateString()}</p>
                                <p><strong>Complete:</strong> {selectedTask.complete ? 'Yes' : 'No'}</p>
                                <button onClick={() => setIsEditing(true)} className="add-task-button">Edit</button>
                                <button onClick={handleDeleteTask} className="add-task-button" style={{ backgroundColor: 'red', color: 'white' }}>Delete</button>
                            </>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    value={selectedTask.description}
                                    onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })}
                                />
                                <input
                                    type="date"
                                    value={selectedTask.due_date}
                                    onChange={(e) => setSelectedTask({ ...selectedTask, due_date: e.target.value })}
                                />
                                <button onClick={handleEditTask} className="add-task-button">Save</button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {selectedTaskList && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        <input
                            type="text"
                            value={selectedTaskList.taskname}
                            onChange={(e) => setSelectedTaskList({ ...selectedTaskList, taskname: e.target.value })}
                        />
                        <button onClick={handleEditTaskList} className="add-task-button">Save</button>
                    </div>
                </div>
            )}
        </Navbar>
    );
}

export default Project;

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../utils/AxiosInstance';
import './Navbar.css';
import userIcon from '../Images/8666609_user_icon.svg';
import logoutIcon from '../Images/logout-svgrepo-com.svg';

const Navbar = ({ children }) => {
    const [projects, setProjects] = useState([]);
    const [username, setUsername] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newTaskName, setNewTaskName] = useState('');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setNewTaskName('');
    };

    const handleCreateProject = async () => {
        const createdProject = {
            taskname: newTaskName,
            pin: false,
        };

        try {
            const response = await axiosInstance.post('TaskList/add/', createdProject);
            setProjects([response.data, ...projects]);
            handleCloseModal();
        } catch (error) {
            console.error('Error creating project:', error.response ? error.response.data : error.message);
        }
    };

    useEffect(() => {
        async function fetchProjects() {
            try {
                const response = await axiosInstance.get('TaskList/');
                setProjects(response.data);
            } catch (error) {
                console.error('Error fetching projects', error);
            }
        }

        async function getUsername() {
            try {
                const response = await axiosInstance.get('profile/');
                setUsername(response.data.username);
            } catch (error) {
                console.error('Error fetching username', error);
            }
        }

        fetchProjects();
        getUsername();
    }, []);

    return (
        <div className="navbar-container">
            <nav className="navbar">
                <div className="navbar-brand">
                    <h1>TODO</h1>
                </div>
                <div className="menu">
                    <Link to="/dashboard">Home</Link>
                    <Link to="/myday">My Day</Link>
                    <div className="dropdown">
                        <button className="dropbtn">Projects</button>
                        <div className="dropdown-content">
                            {projects.length > 0 ? (
                                projects.map((project) => (
                                    <Link key={project.id} to={`/project/${project.id}/${project.taskname}`}>
                                        {project.taskname}
                                    </Link>
                                ))
                            ) : (
                                <span>No Projects</span>
                            )}
                        </div>
                    </div>
                    <span className="menu-item" onClick={handleOpenModal}>+ New Project</span>
                    <div className="user-info">
                        <img src={userIcon} alt="User" className="user-icon" />
                        <span className="username">{username}</span>
                    </div>
                    <div className="logout-container" onClick={handleLogout}>
                        <img src={logoutIcon} alt="Logout" className="logout-icon" />
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="main-content">
                <div className="main-display">
                    {children}
                </div>
            </div>

            {/* Modal for Creating New Project */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={handleCloseModal}>&times;</span>
                        <h2>Create New Project</h2>
                        <input
                            type="text"
                            placeholder="Project Name"
                            value={newTaskName}
                            onChange={(e) => setNewTaskName(e.target.value)}
                            className="task-edit-input"
                        />
                        <button onClick={handleCreateProject} className="add-task-button">Create</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Navbar;

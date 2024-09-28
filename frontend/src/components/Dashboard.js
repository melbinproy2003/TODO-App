import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/AxiosInstance';
import Navbar from './Navbar';
import './Dashboard.css';

const Dashboard = () => {
  const [projectsWithTasks, setProjectsWithTasks] = useState([]);
  const [draftProjects, setDraftProjects] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]); // New state for completed projects
  const [tasksSummary, setTasksSummary] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskPin, setNewTaskPin] = useState(false);
  const navigate = useNavigate();

  // Fetch all projects (task lists)
  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await axiosInstance.get('TaskList/');
        const projectData = response.data;

        // Separate projects with tasks, draft projects, and completed projects
        const tempWithTasks = [];
        const tempDrafts = [];
        const tempCompleted = []; // Temporary array for completed projects

        for (const project of projectData) {
          const taskResponse = await axiosInstance.get(`Task/${project.id}/`);
          const tasks = taskResponse.data;

          // Check if tasks is an array
          if (Array.isArray(tasks)) {
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(task => task.complete).length;

            // Update task summary for this project
            setTasksSummary(prevState => ({
              ...prevState,
              [project.id]: `${completedTasks}/${totalTasks} todo completed`,
            }));

            // Categorize projects
            if (totalTasks > 0) {
              tempWithTasks.push(project);
            } else {
              tempDrafts.push(project);
            }

            // Check if all tasks are completed
            if (totalTasks > 0 && completedTasks === totalTasks) {
              tempCompleted.push(project);
            }
          } else {
            console.warn(`Expected tasks to be an array for project ID ${project.id}, but got:`, tasks);
            // Treat as draft project if tasks are not an array
            tempDrafts.push(project);
          }
        }

        setProjectsWithTasks(tempWithTasks);
        setDraftProjects(tempDrafts);
        setCompletedProjects(tempCompleted); // Set completed projects
      } catch (err) {
        console.log('Error fetching projects', err);
      }
    }

    fetchProjects();
  }, [navigate]);

  const handleMyDayClick = () => {
    navigate('/myday');
  };

  const handleProjectClick = (id, taskname) => {
    navigate(`/project/${id}/${taskname}`);
  };

  // Modal-related functions
  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewTaskName('');
    setNewTaskPin(false);
  };

  const handleCreateProject = async () => {
    const createdProject = {
      taskname: newTaskName,
      pin: newTaskPin,
    };

    try {
      const response = await axiosInstance.post('TaskList/add/', createdProject);
      setDraftProjects([response.data, ...draftProjects]); // Add new project to the front
      handleCloseModal();
    } catch (err) {
      console.error('Failed to create project', err);
    }
  };

  return (
    <Navbar>
      <div className="dashboard-container">
        {/* Add New Project Section */}
        <div className="projects-grid">
          <div className="myday-card" onClick={handleOpenModal}>
            <div className="add-icon">+</div>
            <p style={{ color: 'black' }}>New Project</p>
          </div>
          {/* MyDay Section */}
          <div className="myday-card" onClick={handleMyDayClick}>
            <h3>MyDay</h3>
          </div>
        </div>

        {/* Draft Projects Section */}
        {draftProjects.length > 0 && (
          <div className="projects-section">
            <h4>Draft Projects</h4>
            <div className="projects-grid">
              {draftProjects.slice().reverse().map((proj, index) => (
                <div key={index} className="project-card" onClick={() => handleProjectClick(proj.id, proj.taskname)}>
                  <p><b>{proj.taskname}</b></p>
                  <p style={{ color: 'red' }}>{tasksSummary[proj.id] || 'no tasks'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects Section */}
        <div className="projects-section">
          <h4>Projects</h4>
          <div className="projects-grid">
            {projectsWithTasks.slice().reverse().map((proj, index) => (
              <div key={index} className="project-card" onClick={() => handleProjectClick(proj.id, proj.taskname)}>
                <p><b>{proj.taskname}</b></p>
                <p style={{ color: 'orange' }}>Summary: {tasksSummary[proj.id] || '0/0 todo completed'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Projects Section */}
        {completedProjects.length > 0 && (
          <div className="projects-section">
            <h4>Completed Projects</h4>
            <div className="projects-grid">
              {completedProjects.slice().reverse().map((proj, index) => (
                <div key={index} className="project-card" onClick={() => handleProjectClick(proj.id, proj.taskname)}>
                  <p><b>{proj.taskname}</b></p>
                  <p style={{ color: 'green' }}>Summary: {tasksSummary[proj.id] || '0/0 todo completed'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

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
    </Navbar>
  );
};

export default Dashboard;

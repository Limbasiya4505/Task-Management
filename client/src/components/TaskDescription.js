import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const TaskDescription = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedTask, setSelectedTask] = useState('');
    const [description, setDescription] = useState('');
    const [taskDescriptions, setTaskDescriptions] = useState([]); // New state to store task descriptions
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch all users from the backend
        axios.get('http://localhost:8000/api/getAllUsers')
            .then(response => {
                setUsers(response.data.data);
            })
            .catch(error => {
                console.error('Error fetching users:', error);
            });

        // Fetch task descriptions from the backend
        axios.get('http://localhost:8000/api/tasks')
            .then(response => {
                setTaskDescriptions(response.data);
            })
            .catch(error => {
                console.error('Error fetching task descriptions:', error);
            });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedUser || !selectedTask || !description) {
            alert('Please select a user, task and enter a description.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8000/api/tasks', {
                user: selectedUser,
                task: selectedTask,
                description: description,
            });

            alert('Task description added successfully!');
            navigate('/TaskManager', { state: { selectedUser, selectedTask, description } });
        } catch (error) {
            console.error('Error adding task description:', error);
            alert('Failed to add task description.');
        }
    };

    return (
        <div className="window-container">
            <div className="card" styles={{margin:'5px'}}>
                <nav style={styles.nav}>
                    <div style={styles.logo}>i</div>
                    <div style={styles.navLinks}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div
                                style={{ ...styles.activeLink, cursor: 'pointer' }}
                                onClick={() => console.log('Navigate to HOME')}>
                                <a href="/TaskDashboard" style={{ textDecoration: "none", color: "#666" }}>HOME</a>
                                
                            </div>
                            <div style={{ ...styles.link, cursor: "pointer" }} onClick={() => console.log("Navigate to TASK")}>
                                <a href="/TaskDescription" style={{ textDecoration: "none", color: "#666" }}>TASK</a>
                            </div>
                        </div>
                    </div>
                </nav>
                <div className="split-layout">
                    <div className="form-side">
                        <div className="form-container">
                            <h1 className="title">Add Task Description</h1>
                            <form onSubmit={handleSubmit}>
                                <div className="input-group">
                                    <label>Select User</label>
                                    <select
                                        value={selectedUser}
                                        onChange={(e) => setSelectedUser(e.target.value)}
                                        className="form-input"
                                    >
                                        <option value="">Select a User</option>
                                        {users.map(user => (
                                            <option key={user._id} value={user._id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="form-input"
                                        rows="4"
                                        placeholder="Enter task description..."
                                    />
                                </div>
                                <button type="submit" className="primary-button">
                                    Add Description
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    nav: {
        display: 'flex',
        alignItems: 'center',
        borderRadius: '20px',
        padding: '1rem 2rem',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    logo: {
        width: '36px',
        height: '36px',
        backgroundColor: '#007bff',
        borderRadius: '50%',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold'
    },
    navLinks: {
        display: 'flex',
        gap: '2rem',
        margin: '0 auto'
    },
    link: {
        textDecoration: 'none',
        color: '#666',
        fontSize: '14px'
    },
    activeLink: {
        textDecoration: 'none',
        color: '#007bff',
        fontSize: '14px'
    }
}
export default TaskDescription;
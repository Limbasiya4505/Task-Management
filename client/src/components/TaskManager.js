import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash } from 'react-feather'; // Import Trash icon for remove button
import settingImage from './settingimage.jpg';
import axios from 'axios'; // Import axios for making HTTP requests
import { useNavigate } from 'react-router-dom';

const TaskManager = () => {
  const navigate = useNavigate();

  const [selectedTask, setSelectedTask] = useState('');
  const [learningNotes, setLearningNotes] = useState('');
  const [timeBlocks, setTimeBlocks] = useState([
    {
      id: 1,
      time: '8:00:00 to 9:00:00',
      description: ''
    },
    {
      id: 2,
      time: '9:00:00 to 10:00:00',
      description: ''
    },
    {
      id: 3,
      time: '10:00:00 to 11:00:00',
      description: ''
    }
  ]);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const tasks = [
    {
      id: 1,
      name: 'FrontEnd Developer',
      description: [
        'Designing user interfaces: Creating and maintaining user interfaces for websites and web applications',
        'Developing interactive technology: Creating responsive technology for dynamic web pages, such as menu buttons and online forms',
        'Building reusable components: Creating front-end libraries and reusable components for future use',
        'Optimizing performance: Optimizing components for maximum performance across a variety of browsers and web-capable devices',
        'Collaborating with teams: Working with other teams to optimize website performance and ensure seamless integration with back-end systems',
        'Writing code: Writing clean, efficient, and maintainable code',
        'Troubleshooting: Troubleshooting and debugging issues to ensure smooth user experiences',
        'Participating in code reviews: Participating in code reviews to maintain code quality and consistency',
        'Staying up-to-date: Staying up-to-date with the latest industry trends and technologies',
        'Providing documentation: Providing code documentation and other inputs to technical documents'
      ]
    },
    { id: 2, name: 'Backend Developer', description: [] },
    { id: 3, name: 'UI & UX Designer', description: [] },
    { id: 4, name: 'Android Developer', description: [] },
    { id: 5, name: 'Python Developer', description: [] }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedTaskData = tasks.find(task => task.id === parseInt(selectedTask));
    
    const taskData = {
      name: selectedTask ? selectedTaskData.name : '',
      learning: learningNotes,
      startTime: timer,
      endTime: timer + 60,
      timeSlots: timeBlocks.map(block => ({
        startTime: block.time.split(' to ')[0],
        endTime: block.time.split(' to ')[1],
        notes: block.description
      })),
      // status: 'Pending' // Default status
    };

    try {
      const response = await axios.post('http://localhost:8000/api/tasks', taskData);
      // console.log('Task saved:', response.data);
      alert('Task saved successful!', response.data);
      navigate('/TaskManager');
      // Optionally reset the form or show a success message
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const updateTimeBlock = (id, description) => {
    setTimeBlocks(timeBlocks.map(block => 
      block.id === id ? { ...block, description } : block
    ));
  };

  const removeTimeBlock = (id) => {
    setTimeBlocks(timeBlocks.filter(block => block.id !== id));
  };

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval); // Cleanup interval
  }, [isRunning]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const formatTime = (time) => {
    const hours = String(Math.floor(time / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((time % 3600) / 60)).padStart(2, '0');
    const seconds = String(time % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`; // Fixed template literal
  };

  const handleAddBlock = () => {
    let nextStart, nextEnd;
  
    if (timeBlocks.length === 0) {
      // If no blocks exist, start from 8:00:00 to 9:00:00 as default
      nextStart = new Date('1970-01-01T08:00:00');
      nextEnd = new Date(nextStart);
      nextEnd.setHours(nextEnd.getHours() + 1);
    } else {
      // Calculate the next time block based on the last block
      const [, end] = timeBlocks[timeBlocks.length - 1].time.split(' to ');
      const isValidTime = (time) => {
        const timePattern = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
        return timePattern.test(time);
      };
  
      if (isValidTime(end)) {
        nextStart = new Date(`1970-01-01T${end}`);
        nextStart.setSeconds(0); // Ensure seconds are set to 0

        nextEnd = new Date(nextStart);
        nextEnd.setHours(nextEnd.getHours() + 1); // Add 1 hour
      } else {
        // If the last block's end time is invalid, start from 9:00:00
        nextStart = new Date('1970-01-01T09:00:00');
        nextEnd = new Date(nextStart);
        nextEnd.setHours(nextEnd.getHours() + 1);
      }
    }
  
    const newBlock = {
      id: timeBlocks.length + 1,
      time: `${nextStart.toTimeString().split(' ')[0]} to ${nextEnd.toTimeString().split(' ')[0]}`,
      description: ''
    };
  
    setTimeBlocks([...timeBlocks, newBlock]);
  };

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <div style={styles.logo}>i</div>
        <div style={styles.navLinks}>
          <div style={{ display: "flex", gap: "10px" }}>
            <div
              style={{ ...styles.activeLink, cursor: "pointer" }}
              onClick={() => console.log("Navigate to HOME")}>HOME</div>
            <div
              style={{ ...styles.link, cursor: "pointer" }}
              onClick={() => console.log("Navigate to ABOUT ME")}>ABOUT ME</div>
            <div
              style={{ ...styles.link, cursor: "pointer" }}
              onClick={() => console.log("Navigate to PROJECT")}>PROJECT</div>
          </div>
        </div>
        <button style={styles.searchButton}>
          <Search size={20} />
        </button>
      </nav>

      <div style={styles.content}>
        <div style={styles.taskSection}>
          <select 
            value={selectedTask}
            onChange={(e) => setSelectedTask(e.target.value)}
            style={styles.select}>
            <option value="">Select Task</option>
            {tasks.map(task => (
              <option key={task.id} value={task.id}>{task.name}</option>
            ))}
          </select>

          <input 
            type="text" 
            value={selectedTask ? tasks.find((task) => task.id === parseInt(selectedTask))?.name : ""} 
            // onChange={(e) => setSelectedTask(e.target.value)}
            style={styles.taskInput} 
            readOnly 
          />

          <div style={styles.descriptionSection}>
            <h3 style={styles.sectionTitle}>Description :</h3>
            <ul style={styles.descriptionList}>
              {tasks[0].description.map((item, index) => (
                <li key={index} style={styles.descriptionItem}>{item}</li>
              ))}
            </ul>
          </div>

          <div style={styles.descriptionSection}>
            <h3 style={styles.sectionTitle}>Learning :</h3>
            <textarea
              placeholder="Type here...."
              value={learningNotes}
              onChange={(e) => setLearningNotes(e.target.value)}
              style={styles.textarea}
            />
          </div>

          {/* <div style={styles.taskStatus}>
            <div>
              <h3 style={styles.sectionTitle}>Complete Task :</h3>
              <div style={styles.statusItem}>
                <span style={styles.checkmark}>✓</span> Task 1
              </div>
            </div>
            <div>
              <h3 style={styles.sectionTitle}>Pending Task :</h3>
              <div style={styles.statusItem}>
                <span style={styles.cross}>×</span> Task 2
              </div>
            </div>
          </div> */}
        </div>

        <div style={styles.timeSection}>
          <div style={styles.timeControls}>
            <div style={styles.timer}>{formatTime(timer)}</div>
            <div style={styles.timeButtons}>
              <button style={styles.timeButton} onClick={handleStart}>TIME START</button>
              <button style={styles.timeButton} onClick={handleStop}>TIME END</button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {timeBlocks.map(block => (
              <div key={block.id} style={styles.timeBlock}>
                <div style={styles.timeHeader}>
                  <span style={styles.timeIcon}>⏰</span>
                  <span style={styles.timeText}>{block.time}</span>
                  <button type="button" onClick={() => removeTimeBlock(block.id)} style={styles.removeButton}>
                    <Trash size={16} />
                  </button>
                </div>
                <div style={styles.timeContent}>
                  <textarea
                    placeholder="Type here...."
                    value={block.description}
                    onChange={(e) => updateTimeBlock(block.id, e.target.value)}
                    style={styles.textarea}
                  />
                </div>
              </div>
            ))}

            <div style={styles.submitSection}>
              <button type="button" style={styles.addButton} onClick={handleAddBlock}>
                <Plus size={24} />
              </button>
              <button type="submit" style={styles.submitButton}>
                SUBMIT
              </button>
            </div>
          </form>
        </div>
      </div>
      
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    backgroundImage: `url(${settingImage})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    fontFamily: 'Arial, sans-serif'
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
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
  },
  searchButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#666'
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  taskSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  select: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    width: '300px'
  },
  taskInput: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    width: '670px'
  },
  descriptionSection: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  sectionTitle: {
    fontSize: '16px',
    marginBottom: '1rem',
    fontWeight: 'normal'
  },
  descriptionList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  descriptionItem: {
    marginBottom: '0.75rem',
    fontSize: '14px',
    color: '#444',
    display: 'flex',
    alignItems: 'flex-start',
    '&:before': {
      content: '"•"',
      marginRight: '0.5rem'
    }
  },
  taskStatus: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '14px'
  },
  checkmark: {
    color: '#28a745'
  },
  cross: {
    color: '#dc3545'
  },
  timeSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },
  timeControls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  timer: {
    padding: '0.5rem 1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: 'white'
  },
  timeButtons: {
    display: 'flex',
    gap: '1rem'
  },
  timeButton: {
    padding: '0.5rem 1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer'
  },
  timeBlock: {
    backgroundColor: '#DADADA',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '1rem'
  },
  timeHeader: {
    padding: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  timeIcon: {
    fontSize: '16px'
  },
  timeText: {
    fontSize: '14px'
  },
  timeContent: {
    backgroundColor: 'white',
    padding: '1rem'
  },
  textarea: {
    width: '95%',
    minHeight: '50px',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    resize: 'vertical'
  },
  submitSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '2rem'
  },
  addButton: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  },
  submitButton: {
    padding: '0.75rem 2rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  removeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#dc3545',
    marginLeft: 'auto'
  }
};

export default TaskManager;
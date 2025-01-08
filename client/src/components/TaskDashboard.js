import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import settingImage from './settingimage.jpg';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import { format, isSunday, eachWeekOfInterval } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

ChartJS.register(ArcElement, Tooltip, Legend);

const TaskDashboard = () => {
  const [selectedUser , setSelectedUser ] = useState("");
  const [task, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [attendanceStats, setAttendanceStates] = useState({ present: 0, absent: 0 });
  const [users, setUsers] = useState([]);
  const [token] = useState(localStorage.getItem('token'));

  const holidays = [
    '2025-01-01', // New Year's Day
    '2025-01-26', // Republic Day
    '2025-03-17', // Holi
    '2025-04-14', // Dr. Ambedkar Jayanti
    '2025-05-01', // Labour Day
    '2025-08-15', // Independence Day
    '2025-10-02', // Gandhi Jayanti
    '2025-11-01', // Diwali
    '2025-12-25'  // Christmas
  ];

  const sundays = eachWeekOfInterval({
    start: new Date(2025, 0, 1),
    end: new Date(2025, 11, 31)
  }).map(date => format(date, 'yyyy-MM-dd'));

  const allHolidaysAndSundays = [...holidays, ...sundays];

  const handleUserChange = (event) => {
    setSelectedUser (event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const filtered = task.filter(task =>
      task.name.toLowerCase().includes(selectedUser.toLowerCase())
    );
    setFilteredTasks(filtered);
  };

  useEffect(() => {
    // Fetch tasks and users
    axios.get("http://localhost:8000/api/tasks", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        setTasks(response.data);
        setFilteredTasks(response.data);
      })
      .catch(err => console.log(err));

    axios.get("http://localhost:8000/api/user-details", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        setUsers(response.data);
      })
      .catch(err => console.log(err));
  }, [token]);

  useEffect(() => {
    const present = task.filter(task => task.startTime && task.endTime).length;
    const absent = task.length - present;
    setAttendanceStates({ present, absent });
  }, [task]);

  const pieChartData = {
    labels: ['Present', 'Absent'],
    datasets: [
      {
        data: [attendanceStats.present, attendanceStats.absent],
        backgroundColor: ['#2E7D32', '#98FB98'],
        borderWidth: 0
      }
    ]
  };

  const pieChartOptions = {
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  const isHoliday = (date) => {
    return allHolidaysAndSundays.includes(format(date, 'yyyy-MM-dd'));
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text('My Attendance Report', 14, 10);
    doc.autoTable({
      head: [['Date', 'In Time', 'Out Time']],
      body: task.map(record => {
        const recordDate = format(new Date(record.createdAt), 'dd-MM-yyyy');
        const holiday = isHoliday(new Date(record.createdAt));
        const sunday = isSunday(new Date(record.createdAt));
        if (holiday) {
          return [recordDate, 'Holiday', 'Holiday'];
        } else if (sunday) {
 return [recordDate, 'Sunday', 'Sunday'];
        } else {
          return [
            recordDate,
            format(new Date(record.startTime), 'HH:mm'),
            format(new Date(record.endTime), 'HH:mm')
          ];
        }
      })
    });
    doc.save('Attendance_Report_2025.pdf');
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
      </nav>

      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <div className="search-bar">
            <select value={selectedUser } onChange={handleUserChange}>
              <option value="">Select a user...</option>
              {users.map(user => (
                <option key={user.id} value={user.name}>{user.name}</option>
              ))}
            </select>
            <button type="submit" className="submit-button">
              SUBMIT
            </button>
          </div>
        </form>

        {users.map((user) => (
          <h4 key={user.id}>{user.name}</h4>
        ))}

        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ border: '1px solid #ccc', borderRadius: '5px', backgroundColor: 'white' }}>
              <div className="card-container">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task, index) => (
                    <div className="card" key={index}>
                      <h4 style={{ fontSize: '20px' }}>{format(new Date(task.createdAt), 'dd-MM-yyyy')}</h4>
                      <h4>{new Date(task.createdAt).toLocaleTimeString()}</h4>
                      <hr />
                      <h3>{task.name}</h3>
                      <p><strong>Learning:</strong> {task.learning}</p>
                      <p><strong>Start Time:</strong> {format(new Date(task.startTime), 'HH:mm:ss')}</p>
                      <p><strong>End Time:</strong> {format(new Date(task.endTime), 'HH:mm:ss')}</p>
                      <div>
                        <strong>Time Slots:</strong>
                        <ul>
                          {task.timeSlots.map((slot, index) => (
                            <li key={index}>
                              {slot.startTime} - {slot.endTime} <br />
                              <strong>Work:</strong> {slot.notes}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No tasks found matching your search.</p>
                )}
              </div>
            </div>
          </div>

          <div style={{ flex: 0.5 }}>
            <div style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '15px', backgroundColor: 'white' }}>
              <div style={{ marginBottom: '20px', maxWidth: '400px' }}>
                <center><Pie data={pieChartData} options={pieChartOptions} /></center>
              </div>
            </div>

            <div style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '15px', marginTop: '10px', backgroundColor: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>My Attendance</h3>
                <button onClick={downloadPDF} style={{ marginLeft: 'auto', padding: '5px 10px', borderRadius: '5px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <img style={{ width: '20px', height: '20 px', marginRight: '8px' }} src="/images/download-icon.png" alt="Download" />
                  Download PDF
                </button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                    <th colSpan="2" style={{ padding: '10px', textAlign: 'center' }}>Punch Time</th>
                  </tr>
                  <tr>
                    <th></th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>In Time</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Out Time</th>
                  </tr>
                </thead>
                <tbody>
                  {task.map((record, index) => {
                    const recordDate = new Date(record.createdAt);
                    const holiday = isHoliday(recordDate);
                    const sunday = isSunday(recordDate);
                    return (
                      <tr key={index}>
                        <td style={{ padding: '10px' }}>{format(recordDate, 'dd-MM-yyyy')}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }} colSpan="2">
                          {holiday ? (
                            <span style={{ backgroundColor: '#40C4FF', color: 'white', padding: '3px 8px', borderRadius: '3px' }}>Holiday</span>
                          ) : sunday ? (
                            <span style={{ backgroundColor: '#FFB74D', color: 'white', padding: '3px 8px', borderRadius: '3px' }}>Sunday</span>
                          ) : (
                            <>
                              <span style={{ backgroundColor: '#2E7D32', color: 'white', padding: '3px 8px', borderRadius: '3px' }}>{format(new Date(record.startTime), 'HH:mm')}</span>
                              &nbsp; &nbsp;
                              <span style={{ backgroundColor: '#2E7D32', color: 'white', padding: '3px 8px', borderRadius: '3px' }}>{format(new Date(record.endTime), 'HH:mm')}</span>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
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
  }
};

export default TaskDashboard;
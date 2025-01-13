import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import { format, isSunday, eachDayOfInterval, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

ChartJS.register(ArcElement, Tooltip, Legend);

const TaskDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0 });
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const holidays = [
    '2025-01-14', // Makar Sankranti
    '2025-01-26', // Republic Day
    '2025-02-18', // Maha Shivaratri
    '2025-03-22', // Holi
    '2025-04-14', // Dr. B.R. Ambedkar Jayanti
    '2025-05-01', // Labour Day
    '2025-06-15', // Example Holiday for June 2025
  ];

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const filtered = tasks.filter((task) =>
      task.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTasks(filtered);
  };

  useEffect(() => {
    axios.get('http://localhost:8000/api/tasks')
      .then((response) => {
        // Remove duplicate tasks based on task ID
        const uniqueTasks = response.data.filter((task, index, self) =>
          index === self.findIndex((t) => t._id === task._id)
        );
        setTasks(uniqueTasks);
        setFilteredTasks(uniqueTasks);
      })
      .catch((err) => console.log(err));

    axios.get('http://localhost:8000/api/getAllUsers')
      .then((response) => {
        setUsers(response.data.data);
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if (selectedUser) {
      const userFilteredTasks = tasks.filter(task => task.user === selectedUser);
      setFilteredTasks(userFilteredTasks);
    } else {
      setFilteredTasks(tasks);
    }
  }, [selectedUser, tasks]);

  useEffect(() => {
    updateAttendanceStats();
  }, [selectedUser, tasks, currentMonth]);

  const pieChartData = {
    labels: ['Present', 'Absent'],
    datasets: [{
      data: [attendanceStats.present, attendanceStats.absent],
      backgroundColor: ['#2E7D32', '#98FB98'],
      borderWidth: 0,
    }],
  };

  const pieChartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const isHoliday = (date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return holidays.includes(formattedDate);
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';

    const startParts = startTime.split(':');
    const endParts = endTime.split(':');

    if (startParts.length !== 2 || endParts.length !== 2) return 'N/A';

    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'N/A';

    const durationMs = end - start;
    if (durationMs <= 0) return 'N/A';

    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours} Hour ${minutes} Minute`;
  };

  const downloadPDF = () => {
    if (!selectedUser) {
      alert('Please select a user to generate the report.');
      return;
    }
  
    const doc = new jsPDF(); // A4 page size in portrait orientation
    const userName = getUserById(selectedUser);
    const reportTitle = `Attendance Report for ${userName} (${format(currentMonth, 'MMMM yyyy')})`;
  
    // Set font size and title position
    doc.setFontSize(18);
    doc.text(reportTitle, 14, 20);
  
    const summaryYPosition = 30;
    doc.setFontSize(12);
    doc.text("Summary:", 14, summaryYPosition);
    doc.text(`- Present: ${attendanceStats.present}`, 14, summaryYPosition + 10);
    doc.text(`- Absent: ${attendanceStats.absent}`, 14, summaryYPosition + 20);
  
    // Adjust the start position for the first table (Summary Table)
    let yPosition = doc.autoTable({
      startY: summaryYPosition + 30, // Space between summary and table
      styles: { cellPadding: 3, fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
      bodyStyles: { lineColor: [200, 200, 200], lineWidth: 0.1 },
      tableWidth: 'wrap',  // Table will adjust its width automatically
      margin: { horizontal: 10 },
    }).finalY || summaryYPosition + 40;
  
    // Table data with attendance records including duration
    const tableDataWithTime = getMonthAttendance().map((record) => {
      let duration = 'N/A';
      if (record.status === 'Present' && record.startTime && record.endTime) {
        const startTime = record.startTime.split(':').slice(0, 2).join(':');
        const endTime = record.endTime.split(':').slice(0, 2).join(':');
        duration = calculateDuration(startTime, endTime);
      }
      return [
        format(record.date, 'dd-MM-yyyy'),
        record.status,
        record.status === 'Present' ? record.startTime || 'N/A' : 'N/A',
        record.status === 'Present' ? record.endTime || 'N/A' : 'N/A',
        duration
      ];
    });
  
    // Adjust the second table (Attendance Table) position
    doc.autoTable({
      startY: yPosition + 10, // Adding spacing before next table
      head: [['Date', 'Status', 'Start Time', 'End Time', 'Duration']],
      body: tableDataWithTime,
      styles: { cellPadding: 3, fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
      bodyStyles: { lineColor: [200, 200, 200], lineWidth: 0.1 },
    });
  
    // Footer with page numbers and generation date
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, 200, 290, { align: 'right' });
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 290);
    }
  
    // Save the PDF
    doc.save(`Attendance_Report_${userName}.pdf`);
  };

  const handleUserChange = (event) => {
    const selectedUserId = event.target.value;
    setSelectedUser(selectedUserId);
  };

  const getUserById = (_id) => {
    const user = users.find(user => user._id === _id);
    return user ? user.name : 'Unknown User';
  };

  const updateAttendanceStats = () => {
    const monthAttendance = getMonthAttendance();
    const present = monthAttendance.filter(record => record.status === 'Present' || record.status === 'Sunday' || record.status === 'Holiday').length;
    const absent = monthAttendance.filter(record => record.status === 'Absent').length;
    setAttendanceStats({ present, absent });
  };

  const getMonthAttendance = () => {
    const firstDayOfMonth = startOfMonth(currentMonth);
    const lastDayOfMonth = endOfMonth(currentMonth);

    const daysInMonth = eachDayOfInterval({
      start: firstDayOfMonth,
      end: lastDayOfMonth,
    });

    return daysInMonth.map(date => {
      const formattedDate = format(date, 'yyyy-MM-dd');
      if (isHoliday(date)) {
        return { date, status: 'Holiday', startTime: null, endTime: null };
      } else if (isSunday(date)) {
        return { date, status: 'Sunday', startTime: null, endTime: null };
      } else {
        const taskForDay = tasks.find(task =>
          format(new Date(task.createdAt), 'yyyy-MM-dd') === formattedDate && task.user === selectedUser
        );
        return {
          date,
          status: taskForDay ? 'Present' : 'Absent',
          startTime: taskForDay ? format(new Date(taskForDay.startTime), 'HH:mm:ss') : null,
          endTime: taskForDay ? format(new Date(taskForDay.endTime), 'HH:mm:ss') : null,
        };
      }
    });
  };

  const calculateTotalDuration = () => {
    const monthAttendance = getMonthAttendance();
    let totalMinutes = 0;

    monthAttendance.forEach(record => {
      if (record.status === 'Present' && record.startTime && record.endTime) {
        const start = new Date(`1970-01-01T${record.startTime}`);
        const end = new Date(`1970-01-01T${record.endTime}`);
        const duration = (end - start) / (1000 * 60);
        totalMinutes += duration;
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours} hours ${minutes} minutes`;
  };

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <div style={styles.logo}>i</div>
        <div style={styles.navLinks}>
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ ...styles.activeLink, cursor: "pointer" }} onClick={() => console.log("Navigate to HOME")}>HOME</div>
            <div style={{ ...styles.link, cursor: "pointer" }} onClick={() => console.log("Navigate to ABOUT ME")}>ABOUT ME</div>
            <div style={{ ...styles.link, cursor: "pointer" }} onClick={() => console.log("Navigate to PROJECT")}>PROJECT</div>
          </div>
        </div>
      </nav>

      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <div className="search-bar">
            <input type="text" placeholder="Search By Task Name..." value={searchTerm} onChange={handleInputChange} />
            <button type="submit" className="submit-button">SUBMIT</button>
          </div>
        </form>

        <div>
          <select id="user-select" value={selectedUser} onChange={handleUserChange} style={styles.dropdown}>
            <option value="">--Select a User--</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>{user.name}</option>
            ))}
          </select>
        </div>

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
                      <p><strong>Assigned User:</strong> {getUserById(task.user)}</p>
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
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h3>{selectedUser ? `Attendance for ${getUserById(selectedUser)}` : 'My Attendance'}</h3>
                {/* Add Download Button */}
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button
                    onClick={downloadPDF}
                    style={{
                      ...styles.button,
                      backgroundColor: selectedUser ? '#28a745' : '#ccc',
                      cursor: selectedUser ? 'pointer' : 'not-allowed',
                    }}
                    disabled={!selectedUser}
                  >
                    Download Attendance Report
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                  <button onClick={previousMonth} style={styles.button}>Previous</button>
                  <span>{format(currentMonth, 'MMMM yyyy')}</span>
                  <button onClick={nextMonth} style={styles.button}>Next</button>
                </div>
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {selectedUser ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '10px', border: '1px solid #ccc' }}>Date</th>
                        <th style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getMonthAttendance().map((record, index) => (
                        <tr key={index}>
                          <td style={{ padding: '10px', border: '1px solid #ccc' }}>{format(record.date, 'dd-MM-yyyy')}</td>
                          <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'center' }}>
                            <span style={{
                              backgroundColor:
                                record.status === 'Present' ? '#2E7D32' :
                                  record.status === 'Absent' ? '#FF5722' :
                                    record.status === 'Holiday' ? '#40C4FF' :
                                      '#FFB74D',
                              color: 'white',
                              padding: '3px 8px',
                              borderRadius: '3px'
                            }}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ textAlign: 'center' }}>Please select a user to view their attendance.</p>
                )}
              </div>
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
    backgroundImage: `url('/images/setting-image.jpg')`,
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
  dropdown: {
    width: '30%',
    padding: '10px',
    border: '1px solid #ccc',
    margin: '10px 0',
    backgroundColor: 'white',
    fontSize: '16px'
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  }
};

export default TaskDashboard;
import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import settingImage from './settingimage.jpg';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import { format } from 'date-fns';

ChartJS.register(ArcElement, Tooltip, Legend);

const TaskDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Perform search action with searchTerm
    console.log("Search term:", searchTerm);
  };

  // const tasks = [
  //   {
  //     startTime: '09:10:51',
  //     endTime: '04:57:12',
  //     items: [
  //       'Create the chat application',
  //       'Create the login and signup screen',
  //       'Create the database and user’s login in the database and successfully login',
  //     ],
  //     references: ['Chat application Refer', 'Chat application Privacy refer'],
  //   },
  //   {
  //     startTime: '09:10:51',
  //     endTime: '04:57:12',
  //     items: [
  //       'Create the chat application',
  //       'Create the login and signup screen',
  //       'Create the database and user’s login in the database and successfully login',
  //     ],
  //     references: ['Chat application Refer', 'Chat application Privacy refer'],
  //   },
  //   {
  //     startTime: '10:00:00',
  //     endTime: '05:00:00',
  //     items: [
  //       'Implement real-time messaging',
  //       'Set up user authentication',
  //       'Design the user interface',
  //     ],
  //     references: ['UI Design Guidelines', 'Authentication API Docs'],
  //   },
  // ];

  const attendanceData = [
    { date: '25-12-2024', inTime: 'Christmas', outTime: 'Christmas' },
    { date: '24-12-2024', inTime: '7:45', outTime: '15:20' },
    { date: '23-12-2024', inTime: '8:00', outTime: '14:14' },
    { date: '22-12-2024', inTime: '7:35', outTime: '12:30' },
    { date: '21-12-2024', inTime: '8:20', outTime: '15:55' },
    { date: '20-12-2024', inTime: '7:55', outTime: '15:20' },
    { date: '19-12-2024', inTime: '8:30', outTime: '15:20' }
  ];

  const pieChartData = {
    labels: ['Present', 'Absent'],
    datasets: [
      {
        data: [75, 25],
        backgroundColor: [
          '#2E7D32',
          '#98FB98'
        ],
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

  const[task, settasks] = useState([]);
  useEffect( () => {
    axios.get("http://localhost:8000/api/tasks")
    .then(task => settasks(task.data))
    .catch(err => console.log(err));
  }, [])

  return (
    <div style={styles.container}>
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <form onSubmit={handleSubmit}>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleInputChange}
          />
          <button type="submit" className="submit-button">
            SUBMIT
          </button>
        </div>
      </form>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{flex: 1}}>
      
        <div style={{border: '1px solid #ccc', borderRadius: '5px', backgroundColor: 'white' }}>
          {/* <h2 className="card-title">Work Records</h2> */}
          <div className="card-container">
            {task.map((task, index) => (
              <div className="card" key={index}>
                <h4 style={{fontSize: '20px'}}>{format(new Date(task.createdAt).toLocaleDateString(), 'dd-MM-yyyy')}</h4>
                <h4>{new Date(task.createdAt).toLocaleTimeString()}</h4>
                <hr></hr>
                <h3>{task.name}</h3>
                <p><strong>Learning:</strong> {task.learning}</p>
                <p><strong>Start Time:</strong> {new Date(task.startTime).toISOString()}</p>
                <p><strong>End Time:</strong> {task.endTime}</p>
                <div>
                  <strong>Time Slots:</strong>
                  <ul>
                    {task.timeSlots.map((slot, index) => (
                      <li key={index}>
                        {slot.startTime} - {slot.endTime} <br></br>
                          <t><b>Work:</b></t> {slot.notes}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
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
              <span style={{ marginRight: '10px' }}>↓</span>
              <h3 style={{ margin: 0 }}>My Attendance</h3>
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
                {attendanceData.map((record, index) => (
                  <tr key={index}>
                    <td style={{ padding: '10px' }}>{record.date}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <span style={{
                        backgroundColor: record.inTime === 'Christmas' ? '#40C4FF' : '#2E7D32',
                        color: 'white',
                        padding: '3px 8px',
                        borderRadius: '3px'
                      }}>
                        {record.inTime}
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <span style={{
                        backgroundColor: record.outTime === 'Christmas' ? '#40C4FF' : '#2E7D32',
                        color: 'white',
                        padding: '3px 8px',
                        borderRadius: '3px'
                      }}>
                        {record.outTime}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="attendance-report-container">
            <h2><center>Attendance Report</center></h2>
            <table className="attendance-report-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  
                </tr>
              </thead>
              <tbody>
                {task.map((task, index) => (
                  <tr key={index}>
                    <td>{format(new Date(task.createdAt).toLocaleDateString(), 'dd-MM-yyyy')}</td>
                    <td>{task.startTime}</td>
                    <td>{task.endTime}</td>
                    
                  </tr>
                ))}
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
  }
}
export default TaskDashboard;
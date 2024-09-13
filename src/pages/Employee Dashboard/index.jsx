import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SideBar from '../../components/Side Bar';
import Table from '../../components/Table';
import Calendar from 'react-calendar';
import axios from 'axios';

import data from '../../assets/data.json';
import 'react-calendar/dist/Calendar.css';
import './styles.css';
import { RiLogoutCircleLine } from "react-icons/ri";

const getEmployeesData = (employees) => {
    return employees.map(({ _id, createdAt, updatedAt, isActive, ...rest }) => rest);
};

const EmployeeDashboard = () => {
  const [sideBarData, setSideBarData] = useState('Dashboard');
  const location = useLocation();
  const loggedInUser = location.state?.loggedInUser;
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [isToday, setIsToday] = useState(false);
  const timerRef = useRef(null);
  const [date, setDate] = useState(new Date());
  const [attendance, setAttendance] = useState([]);
  const [loginTime, setLoginTime] = useState(null);
  const [timeDifference, setTimeDifference] = useState(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
        const response = await axios.put(`http://192.168.0.111:8080/users/exit/${loggedInUser._id}`);
        navigate('/');
    } catch (error) {
        console.error('Error during logout:', error);
        alert('An error occurred during logout. Please try again.');
    }
  };

  const handleDateChange = (selectedDate) => {
    const today = new Date();
    today.setDate(today.getDate() - 1);
    const todayStr = today.toISOString().split('T')[0];
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    setIsToday(selectedDateStr === todayStr);
    setDate(selectedDate);
  };

  const setDataFromSideBar = (data) => {
    setSideBarData(data);
  }

  useEffect(() => {
    setSideBarData('Dashboard');
    return () => {
      setSideBarData('Dashboard');
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://192.168.0.111:8080/employe/getEmpDetails/${loggedInUser.employeId}`);
        console.log('Employee details:', response.data);
        const latestLog = response.data.logs[response.data.logs.length - 1];
        const timeDifferenceInSeconds = convertTimeToSeconds(latestLog.timeDifference);
        setTimer(timeDifferenceInSeconds);
        setEmployees(response.data.logs || []);
      } catch (error) {
        console.error('Error fetching employee details:', error);
      }
    }
    fetchData();
  }, [loggedInUser.employeId]);

  const convertTimeToSeconds = (timeString) => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimer((prevTime) => prevTime + 1);
      }, 1000);
    } else if (!isRunning && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const startTimer = async () => {
    const today = new Date().toISOString().split('T')[0];
    setIsRunning(true);
    const currentLoginTime = new Date().toLocaleTimeString();
    setLoginTime(currentLoginTime);
    setAttendance((prevAttendance) => [...prevAttendance, { date: today, loginTime: currentLoginTime, logoutTime: null }]);

    // Send punch in to the database
    try {
      console.log(loggedInUser);
      const response = await axios.put(`http://192.168.0.111:8080/employe/logintTime/${loggedInUser.employeId}`);

      console.log(response.data);
      const latestLog = response.data.logs[response.data.logs.length - 1];
      const timeDifferenceInSeconds = convertTimeToSeconds(latestLog.timeDifference);
      setTimer(timeDifferenceInSeconds);
      console.log('Punch in recorded:', response.data);
    } catch (error) {
      console.error('Error recording punch in:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  const stopTimer = async () => {
    const today = new Date().toISOString().split('T')[0];
    const existingAttendance = attendance.find(entry => entry.date === today);
    if (existingAttendance && !existingAttendance.loginTime) {
      alert('You have not logged in today.');
      return;
    }
    setIsRunning(false);
    const logoutTime = new Date().toLocaleTimeString();
    setAttendance((prevAttendance) => {
      const updatedAttendance = [...prevAttendance];
      updatedAttendance[updatedAttendance.length - 1].logoutTime = logoutTime;
      return updatedAttendance;
    });

    // Send punch out to the database
    try {
      const response = await axios.put(`http://192.168.0.111:8080/employe/logout/${loggedInUser.employeId}`);
      console.log('Punch out recorded:', response.data);
    } catch (error) {
      console.error('Error recording punch out:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  // const tileDisabled = ({ date, view }) => {
  //   if (view === 'month') {
  //     const today = new Date();
  //     today.setDate(today.getDate() - 1);
  //     const todayStr = today.toISOString().split('T')[0];
  //     const dateStr = date.toISOString().split('T')[0];
  //     return dateStr !== todayStr;
  //   }
  //   return false;
  // };

  const attendanceColumns = [
    { Header: 'Login Date', accessor: 'loginDate' },
    { Header: 'Login Time', accessor: 'loginTime' },
    { Header: 'Logout Time', accessor: 'logoutTime' },
    { Header: 'Time Difference', accessor: 'timeDifference' }
  ];

  return (
    <div className="employee-dashboard">
      <SideBar tabs={['Dashboard', 'Employees List']} fromSideBar={setDataFromSideBar} />
      <div className="main-content">
        <div className="header">
          <h1 className='welcome-message'>Welcome, {loggedInUser?.name || `${loggedInUser?.firstName} ${loggedInUser?.lastName}`}</h1>
        </div>
        {sideBarData === 'Dashboard' && (
          <>
           <div className="logout-container">
                        <button className="logout-button" onClick={handleLogout}><RiLogoutCircleLine /></button>
                    </div>
             <div className='dashboard-timer-container'>
              <div className="timer-container">
             <div className='timer-buttons-container'>
             <button className='timer-buttons' onClick={startTimer}>Punch In</button>
             <button className='timer-buttons' onClick={stopTimer}>Punch Out</button>
             </div>
                <h3>Timer: {formatTime(timer)}</h3>
              
              </div>
             <div className='calender'>
                <Calendar onChange={handleDateChange} value={date}  />
              </div>
              </div>
          </>
        )}
        {sideBarData === 'Employees List' && (
          <div className="list">
            <h2>Employee Attendance </h2>
            <Table
              data={employees}
              columns={attendanceColumns}
            />
            {employees.length === 0 && (
              <div className="empty-table-message">No attendance data available.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;

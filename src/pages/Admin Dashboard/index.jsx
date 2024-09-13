import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './styles.css';
import SideBar from '../../components/Side Bar';
import Table from '../../components/Table';
import data from '../../assets/data.json';
import axios from 'axios';
import EditForm from '../../components/EditForm';
import { RiLogoutCircleLine } from "react-icons/ri";

const getEmployeesData = (employees) => {
    if (!Array.isArray(employees)) {
        console.error('employees is not an array:', employees);
        return [];
    }
    return employees.map(({createdAt, updatedAt, password, deleted, companyId, isActive, ...rest }) => rest);
};

const AdminDashboard = () => {
    const [sideBarData, setSideBarData] = useState('Dashboard');
    const location = useLocation();
    const loggedInUser = location.state?.loggedInUser;
    const [employees, setEmployees] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const navigate = useNavigate();
    const [currentEmployee, setCurrentEmployee] = useState({
        name: '',
        empRole: '',
        contact: '',
        email: '',
        password: ''
    });
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [attendanceData, setAttendanceData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [editItem, setEditItem] = useState(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);

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
        console.log('Employees data before setting state:', data.users);
        setEmployees(Array.isArray(data.users) ? data.users : []);
        fetchEmployees();   
    }, [loggedInUser]);
    const handleLogout = async () => {
        try {
            const response = await axios.put(`http://192.168.0.111:8080/users/exit/${loggedInUser._id}`);
            navigate('/');
        } catch (error) {
            console.error('Error during logout:', error);
            alert('An error occurred during logout. Please try again.');
        }
    };
    const fetchEmployees = async () => {
        try {
            if (loggedInUser) {
               console.log(loggedInUser.adminId);
                const response = await axios.get(`http://192.168.0.111:8080/users/getEmployeByAdminId/${loggedInUser.adminId}`);
                console.log(response.data);
                setEmployees(Array.isArray(response.data) ? response.data : []);
            } else {
                console.error('Logged in user or company ID not available');
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            // Handle error (e.g., show error message to user)
        }
    };

    const handleModalOpen = (isEdit = false, employee = {}) => {
        setShowModal(true);
        setIsEditMode(isEdit);
        setCurrentEmployee(isEdit ? { ...employee } : {
            name: '',
            empRole: '',
            contact: '',
            email: '',
            password: ''
        });
    };

    const handleModalClose = () => {
        setShowModal(false);
        setIsEditMode(false);
        setCurrentEmployee({
            _id: '',
            name: '',
            empRole: '',
            contact: '',
            email: '',
            password: ''
        });
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;
        setCurrentEmployee({ ...currentEmployee, [name]: value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            if (isEditMode) {
                const { _id, ...employeeData } = currentEmployee;
                console.log(_id);
                const response = await axios.put(`http://192.168.0.111:8080/users/editEmploye/${_id}`, employeeData);
                console.log('Update response:', response.data);
                setEmployees(employees.map(emp => emp._id === _id ? response.data : emp));
            } else {
                const response = await axios.post('http://192.168.0.111:8080/users/addEmploye', {
                    ...currentEmployee,
                    adminId: loggedInUser.adminId,
                    company: loggedInUser.company
                });
                setEmployees([...employees, response.data]);
            }
            setShowModal(false);
            fetchEmployees(); // Refresh the employee list after update
        } catch (error) {
            console.error('Error submitting form:', error);
            // Handle error (e.g., show error message to user)
        }
    };
    const handleDelete = (employee) => {
        setEmployeeToDelete(employee);
        setShowDeleteConfirmation(true);
    };
    const confirmDelete = async () => {
        try {
            await axios.put(`http://192.168.0.111:8080/users/deleteEmploye/${employeeToDelete._id}`);
            setEmployees(employees.filter(emp => emp._id !== employeeToDelete._id));
            setShowDeleteConfirmation(false);
            setEmployeeToDelete(null);
        } catch (error) {
            console.error('Error deleting employee:', error);
            // Handle error (e.g., show error message to user)
        }
    };
    const cancelDelete = () => {
        setShowDeleteConfirmation(false);
        setEmployeeToDelete(null);
    };
    const handleEmployeeClick = (employee) => {
        console.log(employee);
        navigate(`/employee`, { state: { loggedInUser: employee } });
    }

    const handleAttendanceModalOpen = async (employee) => {
        setSelectedEmployee(employee);
        setShowAttendanceModal(true);
        await fetchAttendanceData(employee.employeId);
    };

    const handleAttendanceModalClose = () => {
        setShowAttendanceModal(false);
        setSelectedEmployee(null);
        setAttendanceData([]);
    };

    const fetchAttendanceData = async (employeeId) => {
        try {
            const response = await axios.get(`http://192.168.0.111:8080/employe/getEmpDetails/${employeeId}`);
            console.log(response.data);
            setAttendanceData(response.data.logs || []);
        } catch (error) {
            console.error('Error fetching attendance data:', error);
        }
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const employeeColumns = [
        { Header: 'Name', accessor: 'name' },
        { Header: 'Email', accessor: 'email' },
        { Header: 'Role', accessor: 'empRole' },
        { Header: 'Contact', accessor: 'contact' },
    ];

    const handleEdit = (item) => {
        setEditItem(item);
    };

    const handleEditSubmit = async (updatedData) => {
        try {
            console.log(updatedData._id);
            await axios.put(`http://192.168.0.111:8080/users/editEmploye/${updatedData._id}`, updatedData);
            await fetchEmployees();
            setEditItem(null);
        } catch (error) {
            console.error('Error updating employee:', error);
        }
    };

    return (
        <div className="admin-dashboard">
            <SideBar tabs={['Dashboard']} fromSideBar={setDataFromSideBar} />
            <div className="main-content">
                {sideBarData === 'Dashboard' && (
                    <>
                    <div className="logout-container">
  <button className="logout-button" onClick={handleLogout}><RiLogoutCircleLine /></button>
</div>
                        <h2>Welcome, {loggedInUser?.name || `${loggedInUser?.firstName} ${loggedInUser?.lastName}`}</h2>
                        {/* Add more dashboard content here */}
                        <div className="list">
                        <div className="addButton">
                            <button onClick={() => handleModalOpen(false)}>Add Employee</button>
                        </div>
                        <Table 
                            data={employees}
                            columns={employeeColumns}
                            onRowClick={handleAttendanceModalOpen}
                            setActions={true}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </div>
                    </>
                )}
                {/* {sideBarData === 'Employees List' && (
                  
                )} */}
            </div>
            {showModal && (
                <div className="modal-overlay" onClick={handleModalClose}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{isEditMode ? 'Edit Employee' : 'Add Employee'}</h2>
                            <button className="close-button" onClick={handleModalClose}>×</button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                {Object.keys(currentEmployee).map((key) => (
                                    key !== '_id' && (
                                        <div key={key}>
                                            <label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
                                            <input
                                                type={key === 'email' ? 'email' : key === 'password' ? 'password' : 'text'}
                                                id={key}
                                                name={key}
                                                value={currentEmployee[key] || ''}
                                                onChange={handleFormChange}
                                                required={key !== 'password' || !isEditMode}
                                                disabled={key === 'password' && isEditMode}
                                            />
                                        </div>
                                    )
                                ))}
                                <button type="submit">{isEditMode ? 'Update' : 'Add'}</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {showAttendanceModal && (
                <div className="modal-overlay" onClick={handleAttendanceModalClose}>
                    <div className="modal-content attendance-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Attendance for {selectedEmployee?.name}</h2>
                            <button className="close-button" onClick={handleAttendanceModalClose}>×</button>
                        </div>
                        <div className="modal-body">
                           
                            <div className="attendance-list">
                                <h3>Attendance for {selectedDate.toDateString()}</h3>
                                <Table
                                    data={attendanceData}
                                    columns={[
                                        { Header: 'Login Date', accessor: 'loginDate' },
                                        { Header: 'Login Time', accessor: 'loginTime' },
                                        { Header: 'Logout Time', accessor: 'logoutTime' },
                                        { Header: 'Time Difference', accessor: 'timeDifference'}
                                    ]}
                                />
                               
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {editItem && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Edit Employee</h2>
                        <EditForm
                            data={editItem}
                            columns={employeeColumns}
                            onSubmit={handleEditSubmit}
                            onCancel={() => setEditItem(null)}
                        />
                    </div>
                </div>
            )}
             {showDeleteConfirmation && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Confirm Delete</h2>
                        <p>Are you sure you want to delete?</p>
                        <div className="modal-buttons">
                            <button onClick={confirmDelete}>Delete</button>
                            <button onClick={cancelDelete}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
};

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './styles.css';
import SideBar from '../../components/Side Bar';
import Table from '../../components/Table';
import data from '../../assets/data.json';
import axios from 'axios';

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
    const [currentEmployee, setCurrentEmployee] = useState({
        name: '',
        empRole: '',
        contact: '',
        email: '',
        password: ''
    });

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

    const handleDelete = async (employee) => {
        try {
            await axios.put(`http://192.168.0.111:8080/users/deleteEmploye/${employee._id}`);
            setEmployees(employees.filter(emp => emp._id !== employee._id));
        } catch (error) {
            console.error('Error deleting employee:', error);
            // Handle error (e.g., show error message to user)
        }
    };

    return (
        <div className="admin-dashboard">
            <SideBar tabs={['Dashboard', 'Employees List']} fromSideBar={setDataFromSideBar} />
            <div className="main-content">
                {sideBarData === 'Dashboard' && (
                    <>
                        <h2>Welcome, {loggedInUser?.name || `${loggedInUser?.firstName} ${loggedInUser?.lastName}`}</h2>
                        {/* Add more dashboard content here */}
                    </>
                )}
                {sideBarData === 'Employees List' && (
                    <div className="list">
                        <div className="addButton">
                            <button onClick={() => handleModalOpen(false)}>Add Employee</button>
                        </div>
                        <Table 
                            data={employees}
                            dataTransform={getEmployeesData}
                            setActions={true}
                            onEdit={(employee) => handleModalOpen(true, employee)}
                            onDelete={handleDelete}
                        />
                    </div>
                )}
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
        </div>
    );
};

export default AdminDashboard;

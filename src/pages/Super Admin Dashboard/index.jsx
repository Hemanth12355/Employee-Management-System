import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './styles.css';
import SideBar from '../../components/Side Bar';
import Table from '../../components/Table';
import axios from 'axios'; 
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import EditForm from '../../components/EditForm';
import { RiLogoutCircleLine } from "react-icons/ri";

ChartJS.register(ArcElement, Tooltip, Legend);

const getCompaniesData = (companies) => {
    return Array.isArray(companies) ? companies.map(({ deleted, noOfAdmins, ...rest }) => rest) : [];
};
const getUsersData = (users) => {
    return Array.isArray(users) ? users.map(({ createdAt, updatedAt, isActive, ...rest }) => rest) : [];
};

const SuperAdminDashboard = () => {
    const [sideBarData, setSideBarData] = useState('Dashboard');
    const location = useLocation();
    const loggedInUser = location.state?.loggedInUser;
    const [companies, setCompanies] = useState([]);
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [companyForm, setCompanyForm] = useState({
        "_id":"",
        "company": "",
        "email": "",
        "contact": "",
        "locationOfOrganization": "",
        "noOfEmp": '',
        "country": "",
        "companyId": ""
    });
    const [isEditMode, setIsEditMode] = useState(false);
    const [userForm, setUserForm] = useState({
        "_id": '',
        "username": '',
        "email": '',
        "password": '',
        "name": '',
        "role": '',
        "companyId": ''
    });
    const [error, setError] = useState('');
    const [editItem, setEditItem] = useState(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const [admins, setAdmins] = useState([]);
    const [employees, setEmployees] = useState([]);

    const sidebarTabs = ['Dashboard', 'Companies List', 'Users List'];
    const dropdownTabs = {
        'Users List': ['Admins List', 'Employees List'],
    };

    const setDataFromSideBar = (tab, parentTab) => {
        if (parentTab === 'Users List') {
            if (tab === 'Admins List') {
                setSideBarData(tab);
                fetchAdmins();
            } else if (tab === 'Employees List') {
                setSideBarData(tab);
                fetchEmployees();
            }
        } else {
            setSideBarData(tab);
        }
    };

    useEffect(() => {
        setSideBarData('Dashboard');
        fetchCompanies();
        fetchAdmins();
        fetchEmployees();
        return () => {
            setSideBarData('Dashboard');
        }
    }, []);
    const handleLogout = async () => {
        try {
            const response = await axios.put(`http://192.168.0.111:8080/users/exit/${loggedInUser._id}`);
            navigate('/');
        } catch (error) {
            console.error('Error during logout:', error);
            alert('An error occurred during logout. Please try again.');
        }
    };
    const fetchCompanies = async () => {
        try {
            const response = await axios.get('http://192.168.0.111:8080/project/allOrganizations');
            console.log('Companies data fetched:', response.data);
            setCompanies(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching companies:', error);
            setCompanies([]);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://192.168.0.111:8080/users/allUsers');
            console.log('Users data fetched:', response.data);
            setUsers(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
        }
    };

    const fetchAdmins = async () => {
        try {
            const response = await axios.get('http://192.168.0.111:8080/users/allAdmins/Admin');
            console.log('Admins data fetched:', response.data);
            setAdmins(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching admins:', error);
            setAdmins([]);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await axios.get('http://192.168.0.111:8080/users/allEmployes/User');
            console.log('Employees data fetched:', response.data);
            setEmployees(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching employees:', error);
            setEmployees([]);
        }
    };

    const handleCompanyClick = (companyDetails) => {
        console.log('Company Details before navigating:', companyDetails);
        navigate('/company', { state: { companyDetails } });
    };

    const handleInsert = async (item) => {
        try {
            let response;
            if (sideBarData === 'Companies List') {
                response = await axios.post('http://192.168.0.111:8080/project/organizationRegitration', item, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                console.log('Company added:', response.data);
                await fetchCompanies();
            } else if (sideBarData === 'Users List') {
                response = await axios.post('http://192.168.0.111:8080/users/register', item);
                await fetchUsers();
            }
            console.log('Insert:', response.data);
            setShowModal(false);
            setError('');
        } catch (error) {
            console.error('Error inserting data:', error);
            setError('Failed to add. Please try again.');
        }
    };

    const handleDelete = async (item) => {
        setItemToDelete(item);
        setShowDeleteConfirmation(true);
    };

    const confirmDelete = async () => {
        try {
            if (sideBarData === 'Companies List') {
                await axios.put(`http://192.168.0.111:8080/project/delete/${itemToDelete.company}`);
                await fetchCompanies();
            } else if (sideBarData === 'Users List') {
                await axios.delete(`http://192.168.0.111:8080/users/delete/${itemToDelete._id}`);
                await fetchUsers();
            }
            console.log('Delete:', itemToDelete);
            setShowDeleteConfirmation(false);
            setItemToDelete(null);
        } catch (error) {
            console.error('Error deleting data:', error);
            setError('Failed to delete. Please try again.');
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirmation(false);
        setItemToDelete(null);
    };

    const handleModalOpen = () => {
        setShowModal(true);
        setIsEditMode(false);
        setError('');
        if (sideBarData === 'Companies List') {
            setCompanyForm({
                "company": "",
                "email": "",
                "contact": "",
                "locationOfOrganization": "",
                "noOfEmp": '',
                "country": "",
            });
        } else if (sideBarData === 'Users List') {
            setUserForm({
                "_id": '',
                "username": '',
                "email": '',
                "password": '', 
                "name": '',
                "role": '',
                "companyId": ''
            });
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        setIsEditMode(false);
        setError('');
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;
        if (sideBarData === 'Companies List') {
            setCompanyForm({ ...companyForm, [name]: value });
        } else if (sideBarData === 'Users List') {
            setUserForm({ ...userForm, [name]: value });
        }
    };

    const handleEdit = (item) => {
        setEditItem(item);
    };

    const handleEditSubmit = async (updatedData) => {
        try {
            if (sideBarData === 'Companies List') {
                await axios.put(`http://192.168.0.111:8080/project/edit/${updatedData._id}`, updatedData);
                await fetchCompanies();
            } else if (sideBarData === 'Users List') {
                await axios.put(`http://192.168.0.111:8080/users/edit/${updatedData._id}`, updatedData);
                await fetchUsers();
            }
            setEditItem(null);
        } catch (error) {
            console.error('Error updating item:', error);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            if (isEditMode) {
                if (sideBarData === 'Companies List') {
                    const response = await axios.put(`http://192.168.0.111:8080/project/edit/${companyForm._id}`, companyForm);
                    console.log('Update Company:', response.data);
                    await fetchCompanies();
                } else if (sideBarData === 'Users List') {
                    const response = await axios.put(`http://192.168.0.111:8080/users/edit/${userForm._id}`, userForm);
                    console.log('Update User:', response.data);
                    await fetchUsers();
                }
            } else {
                if (sideBarData === 'Companies List') {
                    await handleInsert(companyForm);
                } else if (sideBarData === 'Users List') {
                    await handleInsert(userForm);
                }
            }
            setShowModal(false);
        } catch (error) {
            console.error('Error submitting form:', error);
            setError('Failed to submit form. Please try again.');
        }
    };

    const totalCompanies = companies.length;
    const totalAdmins = admins.length;
    const totalEmployees = employees.length;
    const pieChartData = {
        labels: Array.isArray(companies) ? companies.map(company => company.company) : [],
        datasets: [
            {
                data: Array.isArray(companies) ? companies.map(company => parseInt(company.noOfEmp)) : [],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40'
                ],
                hoverBackgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40'
                ]
            }
        ]
    };

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 10,
                    font: {
                        size: 12
                    }
                }
            }
        }
    };

    const companyColumns = [
        { Header: 'Company', accessor: 'company' },
        { Header: 'Email', accessor: 'email' },
        { Header: 'Contact', accessor: 'contact' },
        { Header: 'Location', accessor: 'locationOfOrganization' },
        { Header: 'Employees', accessor: 'noOfEmp' },
        { Header: 'Country', accessor: 'country' },
    ];

    const userColumns = [
        { Header: 'Username', accessor: 'name' },
        { Header: 'Email', accessor: 'email' },
        { Header: 'Company', accessor: 'company' },
        { Header: 'Role', accessor: 'role' },
    ];

    return (
        <div className="super-admin-dashboard">
            <SideBar 
                tabs={sidebarTabs} 
                fromSideBar={setDataFromSideBar} 
                dropdownTabs={dropdownTabs}
            />
            <div className="main-content">
                {sideBarData === 'Dashboard' && (
                    <>
                   <div className="logout-container">
                        <button className="logout-button" onClick={handleLogout}><RiLogoutCircleLine /></button>
                    </div>
                        <h2>Welcome, Super Admin</h2>
                        <div className="dashboard-grid">
                            <div className="dashboard-item">
                                <h3>Total Companies</h3>
                                <p>{companies.length}</p>
                            </div>
                            <div className="dashboard-item">
                                <h3>Total Admins</h3>
                                <p>{admins.length}</p>
                            </div>
                            <div className="dashboard-item">
                                <h3>Total Employees</h3>
                                <p>{employees.length}</p>
                            </div>
    
                        </div>
                        <div className="pie-chart-container">
                            <h3>Employees by Company</h3>
                            <Pie data={pieChartData} options={pieChartOptions} />
                        </div>
                    </>
                )}
                {
                    sideBarData === 'Companies List' && (
                        <>
                            <div className='list'>
                                <div className="addButton">
                                    <button onClick={handleModalOpen}>Add Company</button>
                                </div>
                                <Table 
                                    data={companies}
                                    columns={companyColumns}
                                    setActions={true} 
                                    onRowClick={handleCompanyClick}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            </div>
                        </>
                    )
                }
              
                {sideBarData === 'Admins List' && (
                    <div className="list">
                        <Table 
                            data={admins}
                            columns={userColumns}
                            setActions={false}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </div>
                )}
                {sideBarData === 'Employees List' && (
                    <div className="list">
                        <Table 
                            data={employees}
                            columns={userColumns}
                            setActions={false}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </div>
                )}
            </div>
            {showModal && (
                <div className="modal-overlay" onClick={handleModalClose}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{isEditMode ? `Edit ${sideBarData === 'Companies List' ? 'Company' : 'User'}` : `Add ${sideBarData === 'Companies List' ? 'Company' : 'User'}`}</h2>
                            <button className="close-button" onClick={handleModalClose}>×</button>
                        </div>
                        <div className="modal-body">
                            {error && <div className="error-message">{error}</div>}
                            <form onSubmit={handleSubmit}>
                                {sideBarData === 'Companies List' ? (
                                    Object.keys(companyForm).map((key) => (
                                        key !== 'isDeleted' && key !== 'noOfAdmins' && key !== '_id' && (
                                            <div key={key}>
                                                <label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
                                                <input
                                                    type="text"
                                                    id={key}
                                                    name={key}
                                                    value={companyForm[key] || ''}
                                                    onChange={handleFormChange}
                                                    required
                                                />
                                            </div>
                                        )
                                    ))
                                ) : (
                                    Object.keys(userForm).map((key) => (
                                        key !== '_id' && (
                                            <div key={key}>
                                                <label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
                                                <input
                                                    type={key === 'password' ? 'password' : 'text'}
                                                    id={key}
                                                    name={key}
                                                    value={userForm[key] || ''}
                                                    onChange={handleFormChange}
                                                    required
                                                />
                                            </div>
                                        )
                                    ))
                                )}
                                <button type="submit">{isEditMode ? 'Update' : 'Submit'}</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {editItem && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Edit {sideBarData === 'Companies List' ? 'Company' : 'User'}</h2>
                        <EditForm
                            data={editItem}
                            columns={sideBarData === 'Companies List' ? companyColumns : userColumns}
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
                        <p>Are you sure you want to delete ?</p>
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

export default SuperAdminDashboard;

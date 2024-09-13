import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './styles.css';
import SideBar from '../../components/Side Bar';
import data from '../../assets/data.json';
import Table from '../../components/Table';
import axios from 'axios';
import EditForm from '../../components/EditForm';

const images = {
    accenture: require('../../assets/pngwing.com.png'),
    wipro: require('../../assets/wipro.png'),
    sira: require('../../assets/Group.png'),
}
const displayUsersData = (users) => {
    if (!Array.isArray(users)) {
        console.error('users is not an array:', users);
        return [];
    }
    return users.map(({ _id, createdAt, updatedAt, isActive, ...rest }) => rest);
};
const displayAdminsData = (users) => {
    if (!Array.isArray(users)) {
        console.error('users is not an array:', users);
        return [];
    }
    return users.map(({ createdAt, updatedAt, password, empId, deleted, empRole, contact, employeId, isActive,companyId, ...rest }) => rest);
};

const CompanyDashboard = () => {
    const location = useLocation();
    const [company, setCompany] = useState(null);
    const [sideBarData, setSideBarData] = useState('Dashboard');
    const [admins, setAdmins] = useState([]);
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentForm, setCurrentForm] = useState({});
    const [editItem, setEditItem] = useState(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const companyDetails = location.state?.companyDetails || null;

    useEffect(() => {
        if (companyDetails) {
            console.log(companyDetails);
            setCompany(companyDetails);
            fetchUsers(companyDetails.companyId);
            fetchAdmins(companyDetails._id);
        }
    }, [companyDetails]);

    const fetchCompanyDetails = async (companyId) => {
        try {
            const response = await axios.get(`http://192.168.0.111:8080/project/getCompanyById/${companyId}`);
            setCompany(response.data);
            fetchUsers(companyId);
            fetchAdmins(companyId);
        } catch (error) {
            console.error('Error fetching company details:', error);
            // Handle error (e.g., show error message to user)
        }
    };

    const fetchUsers = async (companyId) => {
        try {
            const response = await axios.get(`http://192.168.0.111:8080/users/getUsersByCompanyId/${companyId}`);
            const employeeUsers = Array.isArray(response.data) ? response.data.filter(user => user.role === 'employee') : [];
            setUsers(employeeUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
            // Handle error (e.g., show error message to user)
        }
    };

    const fetchAdmins = async (companyId) => {
        try {
            const response = await axios.get(`http://192.168.0.111:8080/users/getAdminByCompanyId/${companyId}`);
            
            console.log(response.data);
            setAdmins(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching admins:', error);
            // Handle error (e.g., show error message to user)
        }
    };

    const setDataFromSideBar = (data) => {
        setSideBarData(data);
    };

    const handleModalOpen = (isEdit = false, item = {}) => {
        setShowModal(true);
        setIsEditMode(isEdit);
        setCurrentForm(isEdit ? item : {
            name: '',
            email: '',
            password: '',
            contact: '',
        });
    };

    const handleModalClose = () => {
        setShowModal(false);
        setIsEditMode(false);
        setCurrentForm({});
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;
        setCurrentForm({ ...currentForm, [name]: value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            if (isEditMode) {
                if (sideBarData === 'Admins List') {
                    console.log('At Line 110', currentForm);
                    console.log('At Line 110', currentForm._id);
                    const response = await axios.put(`http://192.168.0.111:8080/users/editAdmin/${currentForm._id}`, currentForm);
                    setAdmins(admins.map(admin => admin._id === currentForm._id ? response.data : admin));
                } else if (sideBarData === 'Users List') {
                    const response = await axios.put(`http://192.168.0.111:8080/users/updateUser/${currentForm._id}`, currentForm);
                    setUsers(users.map(user => user._id === currentForm._id ? response.data : user));
                }
            } else {
                if (sideBarData === 'Dashboard') {
                    const response = await axios.post('http://192.168.0.111:8080/users/addAdmin', { ...currentForm,  companyId: company._id , company: company.company});
                    setAdmins([...admins, response.data]);
                } else if (sideBarData === 'Users List') {
                    const response = await axios.post('http://192.168.0.111:8080/users/register', { ...currentForm, role: 'employee', companyId: company._id });
                    setUsers([...users, response.data]);
                }
            }
            setShowModal(false);
        } catch (error) {
            console.error('Error submitting form:', error);
            // Handle error (e.g., show error message to user)
        }
    };

    const handleDelete = (item) => {
        setShowDeleteConfirmation(true);
        setItemToDelete(item);
    };
    const confirmDelete = async () => {
        try {
            await axios.put(`http://192.168.0.111:8080/users/deleteAdmin/${itemToDelete._id}`);
            if (sideBarData === 'Admins List') {
                setAdmins(admins.filter(admin => admin._id !== itemToDelete._id));
            } else if (sideBarData === 'Users List') {
                setUsers(users.filter(user => user._id !== itemToDelete._id));
            }
            setShowDeleteConfirmation(false);
            setItemToDelete(null);
        } catch (error) {
            console.error('Error deleting item:', error);
            // Handle error (e.g., show error message to user)
        }
    };
    const cancelDelete = () => {
        setShowDeleteConfirmation(false);
        setItemToDelete(null);
    };

    const adminColumns = [
        { Header: 'Name', accessor: 'name' },
        { Header: 'Email', accessor: 'email' },
        { Header: 'Company', accessor: 'company' },
        { Header: 'Contact', accessor: 'contact' },
    ];
    const adminEditColumns = [
        { Header: 'Name', accessor: 'name' },
        { Header: 'Email', accessor: 'email' },
        { Header: 'Company', accessor: 'company' },
        { Header: 'Contact', accessor: 'contact' },
    ];

    const handleEdit = (item) => {
        setEditItem(item);
    };

    const handleEditSubmit = async (updatedData) => {
        try {
            await axios.put(`http://192.168.0.111:8080/users/editAdmin/${updatedData._id}`, updatedData);
            await fetchAdmins();
            setEditItem(null);
        } catch (error) {
            console.error('Error updating admin:', error);
        }
    };

    return (
        <div className="company-dashboard">
            <SideBar tabs={['Dashboard']} fromSideBar={setDataFromSideBar} />
            <div className="main-content">
                {sideBarData === 'Dashboard' && company && (
                    <>
                        <h2>Welcome to {company.company}</h2>
                        <h2>Admins List</h2>
                        <div className="list">
                            <div className="addButton">
                                <button onClick={() => handleModalOpen()}>Add Admin</button>
                            </div>
                            {admins.length > 0 ? (
                                <Table 
                                    data={admins}
                                    columns={adminColumns}
                                    setActions={true}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ) : (
                                <p style={{ textAlign: 'center', fontSize: '1.5rem', color: 'gray' }}>No Admins</p>
                            )}
                        </div>
                        {/* Display other company details here */}
                    </>
                )}
                {/* {sideBarData === 'Admins List' && (
                    <>
                      
                    </>
                )} */}
               

            </div>
            {showModal && (
                <div className="modal-overlay" onClick={handleModalClose}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{isEditMode ? `Edit ${sideBarData === 'Admins List' ? 'Admin' : 'User'}` : `Add ${sideBarData === 'Admins List' ? 'Admin' : 'User'}`}</h2>
                            <button className="close-button" onClick={handleModalClose}>×</button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                {Object.keys(currentForm).map((key) => (
                                    <div key={key}>
                                        <label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
                                        <input
                                            type={key === 'password' ? 'password' : 'text'}
                                            id={key}
                                            name={key}
                                            value={currentForm[key] || ''}
                                            onChange={handleFormChange}
                                            required={key !== '_id'}
                                            disabled={key === '_id'}
                                        />
                                    </div>
                                ))}
                                <button type="submit">{isEditMode ? 'Update' : 'Submit'}</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {editItem && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Edit Admin</h2>
                        <EditForm
                            data={editItem}
                            columns={adminEditColumns}
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

export default CompanyDashboard;

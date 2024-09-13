import React, { useState, useEffect } from 'react';
import './styles.css';
const EditForm = ({ data, columns, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(data);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className='edit-form'>
      {columns.map(column => (
        <div key={column.accessor}>
          <label htmlFor={column.accessor}>{column.Header}</label>
          <input
            type="text"
            id={column.accessor}
            name={column.accessor}
            value={formData[column.accessor] || ''}
            onChange={handleChange}
          />
        </div>
      ))}
      <button type="submit" className='submit-button'>Edit</button>
      <button type="button" onClick={onCancel} className='cancel-button'>Cancel</button>
    </form>
  );
};

export default EditForm;
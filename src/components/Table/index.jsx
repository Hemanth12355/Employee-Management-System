import React from 'react';
import './styles.css'; // Assuming you have a styles.css for table styles

const Table = ({ data, onEdit, onDelete, setActions, onRowClick, dataTransform }) => {
  const handleRowClick = (item, index) => {
    if (onRowClick) {
      // Send the complete data of the particular row
      onRowClick(data[index]);
    }
  };

  // Apply the dataTransform function if provided
  const transformedData = dataTransform ? dataTransform(data) : data;

  return (
    <div className='table'>
      <table>
        <thead>
          <tr>
            {transformedData.length > 0 && Object.keys(transformedData[0]).map((key) => (
              <th key={key}>{key}</th>
            ))}
            {setActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {transformedData.map((item, index) => (
            <tr key={index} onClick={() => handleRowClick(item, index)}>
              {Object.values(item).map((value, idx) => (
                <td key={idx}>{value}</td>
              ))}
              {setActions && (
                <td className='action-buttons'>
                  <button onClick={(e) => { e.stopPropagation(); onEdit(item); }}>Edit</button>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(item); }}>Delete</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
import React from 'react';
import './styles.css'; // Assuming you have a styles.css for table styles
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

const Table = ({ data, columns, setActions, onRowClick, onEdit, onDelete }) => {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.accessor}>{column.Header}</th>
          ))}
          {setActions && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index} onClick={() => onRowClick && onRowClick(item)}>
            {columns.map((column) => (
              <td key={column.accessor}>{item[column.accessor]}</td>
            ))}
            {setActions && (
              <td className='action-buttons'>
                <button  onClick={(e) => { e.stopPropagation(); onEdit(item); }}><FaEdit /></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(item); }}><MdDelete /></button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
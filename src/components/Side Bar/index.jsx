import React, { useState } from 'react';
import './styles.css';

const SideBar = ({tabs, fromSideBar}) => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    fromSideBar(tab);
  };
  return (
    <div className="sidebar">
        <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            {tabs.map((tab, index) => (
                <h1 
                    key={index} 
                    className={`sidebar-tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => handleTabClick(tab)}
                >
                    {tab}
                </h1>
            ))}
        </div>
    </div>
  );
};

export default SideBar;

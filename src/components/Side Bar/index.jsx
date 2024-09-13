import React, { useState } from 'react';
import './styles.css';

const SideBar = ({ tabs = [], fromSideBar, dropdownTabs = {} }) => {
	const [activeTab, setActiveTab] = useState(tabs[0] || '');

	const handleTabClick = (tab) => {
		setActiveTab(tab);
		fromSideBar(tab);
	};

	const handleDropdownItemClick = (tab, item) => {
		setActiveTab(item);
		fromSideBar(item, tab);
	};

	return (
		<div className="sidebar">
			<ul>
				{tabs.map((tab) => (
					<li
						key={tab}
						className={`${activeTab === tab ? 'active' : ''} ${dropdownTabs[tab] ? 'has-dropdown' : ''}`}
						onClick={dropdownTabs[tab] ? undefined : () => handleTabClick(tab)}
					>
						{tab}
						{dropdownTabs[tab] && (
							<ul className="dropdown">
								{dropdownTabs[tab].map((item) => (
									<li key={item} onClick={(e) => {
										e.stopPropagation();
										handleDropdownItemClick(tab, item);
									}}>{item}</li>
								))}
							</ul>
						)}
					</li>
				))}
			</ul>
		</div>
	);
};

export default SideBar;

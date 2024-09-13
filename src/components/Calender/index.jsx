import { useEffect, useState } from 'react';
import Calender from 'react-simple-calender';

export default function EmployeeCalender({ onDateChange }) {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    console.log(date);
    onDateChange(date); // Call the parent's callback whenever the date changes
  }, [date]);

  // Define holidays (you may want to fetch this from an API or pass as props)
  const holidays = [
    { date: new Date(2024, 9, 13), color: '#FF0000' }, // Christmas
    { date: new Date(2024, 9, 14), color: '#00FF00' },   // New Year's Day
    // Add more holidays as needed
  ];

  return (
    <Calender
      preselectedDates={[]}
      disabledDates={[]}
      multiselect={false}
      onChange={(params) => {
        setDate(params.date);
        console.log(JSON.stringify(params));
      }}
      titleFormat={'MMMM YYYY'}
      daysFormat={2}
      customDayRenderer={(date) => {
        const holiday = holidays.find(h => h.date.getTime() === date.getTime());
        if (holiday) {
          return {
            style: {
              backgroundColor: holiday.color,
              color: 'white',
              borderRadius: '50%',
            }
          };
        }
        return null;
      }}
    />
  );
}

import { useEffect, useState } from 'react';
import Calender from 'react-simple-calender';

export default function EmployeeCalender({ onDateChange }) {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    console.log(date);
    onDateChange(date); // Call the parent's callback whenever the date changes
  }, [date]);

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
    />
  );
}

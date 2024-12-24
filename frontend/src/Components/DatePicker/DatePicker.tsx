import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ru } from 'date-fns/locale';
import './DatePicker.css';

registerLocale('ru', ru);

interface CustomDatePickerProps {
  startDate: Date | null;
  onDateChange: (date: Date | null) => void;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ startDate, onDateChange }) => {
  return (
    <DatePicker
      selected={startDate}
      onChange={onDateChange}
      locale="ru"
      dateFormat="dd/MM/yyyy"
      className="custom-datepicker"
      calendarClassName="custom-calendar"
    />
  );
};

export default CustomDatePicker;

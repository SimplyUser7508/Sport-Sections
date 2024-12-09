import React from 'react';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import './CustomTimePicker.css';
import dayjs, { Dayjs } from 'dayjs';

interface CustomTimePickerProps {
    value: Dayjs | null;
    onChange: (date: Dayjs | null) => void;
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({ value, onChange }) => {
    const handleChange = (newValue: any) => {
        if (newValue) {
            onChange(dayjs(newValue));
        } else {
            onChange(null);
        }
    };

    return (
        <TimePicker
            className='custom-time-picker'
            value={value}
            onChange={handleChange}
            ampm={false}
            minutesStep={1}
        />
    );
};

export default CustomTimePicker;

import React from 'react';
import './Dropdown.css';

interface DropdownProps {
    defaultOption: string;
    options: { value: string, label: string, disabled?: boolean }[];
    selectedOption: string;
    onSelect: (value: string) => void;
}

const DropdownLess: React.FC<DropdownProps> = ({ defaultOption, options, selectedOption, onSelect }) => {
    return (
        <div className="dropdown">
            <div className="dropdown-button">{selectedOption || defaultOption}</div>
            <div className="dropdown-content">
                {options.map((option, index) => (
                    <a
                        key={index}
                        style={{ color: option.disabled ? '#888888' : '#000', pointerEvents: option.disabled ? 'none' : 'auto' }}
                        onClick={() => !option.disabled && onSelect(option.value)}
                    >
                        {option.label}
                    </a>
                ))}
            </div>
        </div>
    );
};

export default DropdownLess;

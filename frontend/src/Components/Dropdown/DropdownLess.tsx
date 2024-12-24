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
                    <button
                    key={index}
                    style={{
                        color: option.disabled ? '#888888' : '#000',
                        pointerEvents: option.disabled ? 'none' : 'auto',
                        background: 'none',
                        border: 'none',
                        padding: '0',
                        font: 'inherit',
                        textDecoration: 'underline',
                        cursor: option.disabled ? 'default' : 'pointer',
                    }}
                    onClick={() => !option.disabled && onSelect(option.value)}
                    disabled={option.disabled}
                >
                    {option.label}
                </button>
                ))}
            </div>
        </div>
    );
};

export default DropdownLess;

import React from 'react';
import './Dropdown.css';

interface DropdownProps {
    defaultOption: string;
    options: { value: string, label: string, disabled?: boolean }[];
}

const Dropdown: React.FC<DropdownProps> = ({ defaultOption, options }) => {
    return (
        <div className="dropdown">
            <div className="dropdown-button">{defaultOption}</div>
            <div className="dropdown-content">
                {options.map((option, index) => (
                    <a
                        key={index}
                        href="#"
                        style={{ color: option.disabled ? '#888888' : '#000', pointerEvents: option.disabled ? 'none' : 'auto' }}
                    >
                        {option.label}
                    </a>
                ))}
            </div>
        </div>
    );
}

export default Dropdown;
    
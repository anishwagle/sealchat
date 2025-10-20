import { useState, useRef, useEffect } from 'react';
import { MdPublic, MdPeople, MdLock } from 'react-icons/md';
import { IoChevronDown } from 'react-icons/io5';
import { PrivacyLevel } from '@/types/profile';

interface VisibilityToggleProps {
    value: PrivacyLevel;
    onChange: (value: PrivacyLevel) => void;
}

export default function VisibilityToggle({ value, onChange }: VisibilityToggleProps) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (privacy: PrivacyLevel) => {
        switch (privacy) {
            case 'private':
                return <MdLock className="h-5 w-5" />;
            case 'friends':
                return <MdPeople className="h-5 w-5" />;
            case 'public':
                return <MdPublic className="h-5 w-5" />;
        }
    };

    const getLabel = (privacy: PrivacyLevel) => {
        switch (privacy) {
            case 'private':
                return 'Only me';
            case 'friends':
                return 'Friends';
            case 'public':
                return 'Everyone';
        }
    };

    const options: PrivacyLevel[] = ['private', 'friends', 'public'];

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-md hover:bg-gray-100"
                title={getLabel(value)}
            >
                <span className="text-gray-500">{getIcon(value)}</span>
                <IoChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    {options.map((option) => (
                        <button
                            key={option}
                            onClick={() => {
                                onChange(option);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-gray-50 ${
                                value === option ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700'
                            }`}
                        >
                            <span className={value === option ? 'text-indigo-600' : 'text-gray-500'}>
                                {getIcon(option)}
                            </span>
                            <span className="text-sm font-medium">{getLabel(option)}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
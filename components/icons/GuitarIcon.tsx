
import React from 'react';

export const GuitarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        <path d="M16.25 2.75l-3.5 3.5" />
        <path d="M12.44 9.31L6.81 3.69" />
        <path d="M17.81 14.69L12.19 9.06" />
        <path d="M13.75 5.25c-1-1-1-2.5 0-3.5 1-1 2.5-1 3.5 0s1 2.5 0 3.5c-1 1-2.5 1-3.5 0z" />
        <path d="M5.5 11.5L2 15l2.5 2.5 3.5-3.5" />
        <path d="M11.5 17.5L8 21l2.5 2.5 3.5-3.5" />
        <path d="M14.5 8.5l-5 5" />
    </svg>
);

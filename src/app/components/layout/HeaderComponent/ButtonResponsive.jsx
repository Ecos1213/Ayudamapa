import React from "react";

export default function ButtonResponsive({isOpen, setIsOpen}) {
    return(
        <div className="md:hidden flex items-center">
            <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Toggle menu"
            >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="black">
                    {isOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>
        </div>
    )
    
}
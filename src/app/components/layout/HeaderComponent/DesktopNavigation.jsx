import React from "react";

export default function DesktopNavigation () {

    return(
        <>
            <nav className="hidden md:flex space-x-8">
                <a href="#" className="text-black-600 hover:text-gray font-medium transition">Home</a>
                <a href="#" className="text-black-600 hover:text-gray font-medium transition">Features</a>
                <a href="#" className="text-black-600 hover:text-gray font-medium transition">Lineas de atencion</a>
                <a href="#" className="text-black-600 hover:text-gray font-medium transition">Contact</a>
            </nav>

            {/* Desktop CTA Button */}
            <div className="hidden md:flex items-center">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
                    Registro
                </button>
            </div>
        </>
    )
}
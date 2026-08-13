import { useState } from 'react';
import IconHeader from './HeaderComponent/IconHeader';
import MenuMobile from './HeaderComponent/MenuMobile';
import ButtonResponsive from './HeaderComponent/ButtonResponsive';
import DesktopNavigation from './HeaderComponent/DesktopNavigation';

import './css/Header.css';


export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
            
                {/* Logo Section */}
                <IconHeader />

                {/* Desktop Navigation */}
                <DesktopNavigation />

                {/* Mobile Menu Button */}
                <ButtonResponsive isOpen={isOpen} setIsOpen={setIsOpen} />
                
            </div>
        </div>

        {/* Mobile Drawer Navigation */}
        <MenuMobile isOpen={isOpen}/>                
    </header>
  );
}
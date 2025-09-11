
import React from 'react';
import { NavItem } from '../types';

const navItems: NavItem[] = ['Ménage', 'Intervenants', 'Statistiques', 'Dashboard'];

interface SidebarProps {
  activeView: NavItem;
  onViewChange: (view: NavItem) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {

  const getButtonClass = (item: NavItem) => {
    const baseClass = 'w-full text-left font-semibold py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500';
    if (item === activeView) {
      return `${baseClass} bg-red-300 text-gray-900 shadow-sm`;
    }
    return `${baseClass} bg-rose-50 text-gray-600 hover:bg-red-200 border border-gray-200`;
  };

  return (
    <aside className="w-full md:w-48 flex-shrink-0">
      <nav className="flex flex-row md:flex-col gap-3">
        {navItems.map((item) => (
          <button key={item} onClick={() => onViewChange(item)} className={getButtonClass(item)}>
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

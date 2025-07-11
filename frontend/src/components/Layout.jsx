import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import Header from './common/Header';
import Sidebar from './common/Sidebar';

export default function Layout() {
  const { user } = useAuth();
  const { sidebarOpen } = useApp();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className={`
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-64'}
      `}>
        {/* Header */}
        <Header />
        
        {/* Page Content */}
        <main className="container-custom section-padding">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import './Home.css';  // Import your updated CSS styles here

function HomePage() {
  return (
    <div>
      <nav class="navbar">
        <div class="container-fluid">
          <a class="navbar-brand" href="#">
            TODO
          </a>
        </div>
      </nav>
      <div className="container">
        <div className="left">
          <img src={require('../Images/TODO.webp')} alt="todo-app" className="image" />
        </div>
        <div className="right">
          <Outlet /> {/* This will render Login/Register based on the route */}
        </div>
      </div>
    </div>
  );
}

export default HomePage;

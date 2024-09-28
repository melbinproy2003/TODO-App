import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import HomePage from './components/Home';
import Dashboard from './components/Dashboard';
import MyDay from './components/MyDay';
import Project from './components/Project';
import PrivateRoute from './utils/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />}>
          <Route path="/" element={<Login />} />
          <Route path="/registration" element={<Register />} />
        </Route>
        <Route path="/dashboard" element={<PrivateRoute> <Dashboard /> </PrivateRoute>}/>
        <Route path="/myday" element={<PrivateRoute> <MyDay /> </PrivateRoute>}/>
        <Route path="/project/:pk/:taskname" element={<PrivateRoute> <Project /> </PrivateRoute>}/>
      </Routes>
    </Router>
  );
}

export default App;

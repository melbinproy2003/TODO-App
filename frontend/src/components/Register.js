import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Login.css'; // Using the same CSS file for both login and registration

const Registration = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmpassword, setConfirmpassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        // Checking passwords matching or not
        if (password !== confirmpassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/user/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    confirmpassword
                }),
            });

            if (response.ok) {
                navigate('/');
            } else {
                const errorData = await response.json();
                setError(errorData.error || "Registration failed. Please try again.");
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="login-container">
            <h2>Create an Account</h2>
            <form onSubmit={handleRegister}>
                {error && <div className="alert-error">{error}</div>}
                <div className="form-group">
                    <label>Username:</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Email:</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Confirm Password:</label>
                    <input 
                        type="password" 
                        value={confirmpassword} 
                        onChange={(e) => setConfirmpassword(e.target.value)} 
                        required 
                    />
                </div>
                <button type="submit" className="login-button">Sign Up</button>
            </form>
            <p className="register-prompt">
                Do you have an account? <a href="/">Login</a>
            </p>
        </div>
    );
};

export default Registration;

// Import necessary dependencies
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation'
import { loginUser } from '../../../utils/auth';


const LoginPage = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [user, setUser] = useState('');

    const handleLogin = async (e) => {
      e.preventDefault();
      setError('');
  
      try {
        const response = await fetch('/api/logIn', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
  
        if (response.ok) {
          const data = await response.json();
          router.push('/pages/register');
          if (data.error) {
            setError(data.error);
          } else {
            // Proceed with the login process
            console.log(data.message);
          }
        } else {
          setError('Failed to login. Please try again.');
        }
      } catch (error) {
        console.error('Error during login:', error);
        setError('Internal server error');
      }
    };

  // Render the login form
  return (
    <div>
      <h1>Login</h1>
      {error && <p>{error}</p>}
      <form onSubmit={handleLogin}>
        {/* Input fields for email and password */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        {/* Submit button for login form */}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

// Export the LoginPage component
export default LoginPage;

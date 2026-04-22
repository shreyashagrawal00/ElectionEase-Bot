import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await register(formData.name, formData.email, formData.password);
      } else {
        await login(formData.email, formData.password);
      }
      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.msg) {
        alert("Authentication failed: " + err.response.data.msg);
      } else {
        alert("Authentication failed. Please check credentials or try another email.");
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full p-8 shadow-xl">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-slate-900">
            {isRegister ? 'Create an Account' : 'Sign In'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {isRegister && (
              <div>
                <label className="sr-only">Full Name</label>
                <input name="name" type="text" required className="appearance-none rounded relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="Full Name" onChange={handleChange} />
              </div>
            )}
            <div>
              <label className="sr-only">Email address</label>
              <input name="email" type="email" required className="appearance-none rounded relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="Email address" onChange={handleChange} />
            </div>
            <div>
              <label className="sr-only">Password</label>
              <input name="password" type="password" required className="appearance-none rounded relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="Password" onChange={handleChange} />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full h-10 text-lg">
              {isRegister ? 'Sign Up' : 'Sign In'}
            </Button>
          </div>
          
          <div className="text-center">
             <button type="button" onClick={() => setIsRegister(!isRegister)} className="text-sm text-primary-600 hover:text-primary-500 font-medium">
                {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
             </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Login;

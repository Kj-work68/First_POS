import React, {useState, useEffect, useRef} from 'react';
import { useAsyncError, useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import services from '../../services/axios';
import { useAuthStore } from '../../stores/useAuthStore';
import type { LoginResponse } from '../../types/auth';
import './Login.css'

export const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const toast = useRef<Toast>(null);
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

    if (!username || !password) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill in all fields',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await services.post<LoginResponse>('/auth/login', {
        username,
        password,
      });

      const { user, token } = response.data;
      setAuth(user, token);

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: `Welcome back, ${user.fullName}`,
      });

      // นำทางไปยัง Dashboard หรือหน้า POS
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Login failed';
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="login-container">
      <Toast ref={toast} />
      <div className="login-card">
        <div className="login-header">
          <h2>Smart POS</h2>
          <p>Please enter your credentials to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="username">Username</label>
            <InputText
              id="username"
              value={username}
              onChange={((e) => setUsername(e.target.value))}
              placeholder="Enter username"
              className="w-full"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              toggleMask
              feedback={false}
              className="w-full"
              inputClassName="w-full"
            />
          </div>

          <Button
            label="Sign In"
            type="submit"
            loading={loading}
            className="w-full"
            style={{ marginTop: '1rem' }}
          />
        </form>
      </div>
    </div>
  )
}

export default Login;
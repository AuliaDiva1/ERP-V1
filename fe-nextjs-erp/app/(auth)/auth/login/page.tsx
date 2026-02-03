'use client';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { roleRoutes } from 'utils/roleRoutes';
import ToastNotifier from '../../../components/ToastNotifier';
import axios from 'axios';

type ToastNotifierHandle = {
  showToast: (status: string, message?: string) => void;
};

const LoginPage = () => {
  const router = useRouter();
  const toastRef = useRef<ToastNotifierHandle>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        { email, password },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const data = res.data;

      // Cek apakah response sukses berdasarkan status code
      if (data.status !== '00' || !data.token || !data.user) {
        toastRef.current?.showToast('01', data.message || 'Login gagal');
        setLoading(false);
        return;
      }

      // Simpan token & data user ke localStorage
      localStorage.setItem('TOKEN', data.token);
      localStorage.setItem('ROLE', data.user.role);
      localStorage.setItem('USER_NAME', data.user.name);
      localStorage.setItem('USER_EMAIL', data.user.email);
      localStorage.setItem('USER_ID', data.user.id.toString());

      // Tampilkan toast sukses
      toastRef.current?.showToast('00', `Selamat datang, ${data.user.name}!`);

      // Redirect sesuai role setelah 1 detik
      setTimeout(() => {
        const redirect = roleRoutes[data.user.role] || '/';
        router.push(redirect);
      }, 1000);

    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle error dari backend
      const errorMessage = err.response?.data?.message || 'Terjadi kesalahan koneksi ke server';
      toastRef.current?.showToast('01', errorMessage);
      
      setLoading(false);
    }
  };

  return (
    <>
      <ToastNotifier ref={toastRef} />
      
      <div className="min-h-screen flex align-items-center justify-content-center p-4" 
           style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        
        <div className="surface-card shadow-8 border-round-2xl overflow-hidden" 
             style={{ maxWidth: '1000px', width: '100%' }}>
          
          <div className="grid m-0">
            {/* Left Side - Welcome Section */}
            <div className="col-12 lg:col-6 p-0 relative overflow-hidden"
                 style={{
                   background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%)',
                   minHeight: '500px'
                 }}>
              
              {/* Decorative circles */}
              <div className="absolute" style={{ top: '20px', left: '30px', opacity: 0.3 }}>
                <div className="border-circle border-2 border-white" 
                     style={{ width: '60px', height: '60px' }}></div>
              </div>
              <div className="absolute" style={{ top: '40px', right: '50px', opacity: 0.2 }}>
                <div className="border-circle bg-white" 
                     style={{ width: '40px', height: '40px' }}></div>
              </div>
              <div className="absolute" style={{ bottom: '80px', left: '40px', opacity: 0.2 }}>
                <div className="border-circle bg-white" 
                     style={{ width: '30px', height: '30px' }}></div>
              </div>
              <div className="absolute" style={{ bottom: '150px', right: '60px', opacity: 0.3 }}>
                <div className="border-circle border-2 border-white" 
                     style={{ width: '50px', height: '50px' }}></div>
              </div>

              {/* Content */}
              <div className="flex flex-column justify-content-center h-full px-6 py-8">
                <div className="mb-4">
                  <div className="flex align-items-center gap-2 mb-2">
                    <i className="pi pi-building text-white text-2xl"></i>
                    <span className="text-white text-sm font-medium uppercase tracking-wider">
                      {process.env.NEXT_PUBLIC_COMPANY_NAME || 'PT. Garapan Indonesia Sukses'}
                    </span>
                  </div>
                </div>

                <div className="mb-5">
                  <h2 className="text-white text-4xl font-light mb-3">
                    Nice to see you again
                  </h2>
                  <h1 className="text-white text-6xl font-bold mb-4">
                    WELCOME BACK
                  </h1>
                  <div className="bg-white" style={{ width: '80px', height: '4px' }}></div>
                </div>

                <p className="text-white-alpha-80 text-lg line-height-3 max-w-30rem">
                  {process.env.NEXT_PUBLIC_APP_NAME || 'Enterprise Resource Planning'} - 
                  Manage your business operations efficiently with our integrated system.
                </p>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="col-12 lg:col-6 p-6 lg:p-8">
              <div className="flex flex-column h-full justify-content-center">
                
                <div className="mb-6">
                  <h2 className="text-900 text-4xl font-bold mb-2">
                    Login Account
                  </h2>
                  <p className="text-600 text-sm line-height-3 mt-0 mb-6">
                    Enter your credentials to access your account and start managing your business operations.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Email Input */}
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-900 font-medium mb-2">
                      Email Address
                    </label>
                    <span className="p-input-icon-left w-full">
                      <i className="pi pi-envelope text-400"></i>
                      <InputText
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full"
                        style={{ paddingLeft: '2.5rem' }}
                        disabled={loading}
                        required
                      />
                    </span>
                  </div>

                  {/* Password Input */}
                  <div className="mb-4">
                    <label htmlFor="password" className="block text-900 font-medium mb-2">
                      Password
                    </label>
                    <span className="p-input-icon-left w-full">
                      <i className="pi pi-lock text-400"></i>
                      <InputText
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full"
                        style={{ paddingLeft: '2.5rem' }}
                        disabled={loading}
                        required
                      />
                    </span>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex align-items-center justify-content-between mb-5">
                    <div className="flex align-items-center">
                      <Checkbox
                        inputId="keepSignedIn"
                        checked={keepSignedIn}
                        onChange={(e) => setKeepSignedIn(e.checked || false)}
                        className="mr-2"
                        disabled={loading}
                      />
                      <label htmlFor="keepSignedIn" className="text-900 font-medium cursor-pointer">
                        Keep me signed in
                      </label>
                    </div>
                    <a 
                      href="/forgot-password" 
                      className="text-primary font-medium no-underline hover:underline"
                      style={{ pointerEvents: loading ? 'none' : 'auto' }}
                    >
                      Forgot password?
                    </a>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    label={loading ? 'Logging in...' : 'LOGIN'}
                    icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'}
                    iconPos="right"
                    className="w-full p-3 text-xl font-bold"
                    loading={loading}
                    disabled={loading}
                    style={{
                      background: loading 
                        ? '#94a3b8' 
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      borderRadius: '50px',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </form>

                {/* Footer Text */}
                <div className="text-center mt-5">
                  <span className="text-600 font-medium text-sm">
                    Having trouble logging in?{' '}
                    <a 
                      href="mailto:support@garapan.com" 
                      className="text-primary font-medium no-underline hover:underline"
                    >
                      Contact IT Support
                    </a>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
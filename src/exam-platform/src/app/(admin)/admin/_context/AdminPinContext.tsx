'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL } from '@/lib/api-config';

interface AdminPinContextType {
  pin: string;
  verified: boolean;
  verify: (pin: string) => Promise<boolean>;
  logout: () => void;
}

const AdminPinContext = createContext<AdminPinContextType | null>(null);

export function AdminPinProvider({ children }: { children: ReactNode }) {
  const [pin, setPin] = useState('');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    // Persist verification within the browser session only
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('admin_verified') === 'true') {
        const storedPin = sessionStorage.getItem('admin_pin_session') ?? '';
        setPin(storedPin);
        setVerified(true);
      }
    }
  }, []);

  const verify = async (inputPin: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/document-admin/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: inputPin }),
      });
      if (res.ok) {
        setPin(inputPin);
        setVerified(true);
        sessionStorage.setItem('admin_verified', 'true');
        sessionStorage.setItem('admin_pin_session', inputPin);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setPin('');
    setVerified(false);
    sessionStorage.removeItem('admin_verified');
    sessionStorage.removeItem('admin_pin_session');
  };

  return (
    <AdminPinContext.Provider value={{ pin, verified, verify, logout }}>
      {children}
    </AdminPinContext.Provider>
  );
}

export const useAdminPin = () => {
  const ctx = useContext(AdminPinContext);
  if (!ctx) throw new Error('useAdminPin must be used inside AdminPinProvider');
  return ctx;
};

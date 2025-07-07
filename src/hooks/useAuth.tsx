
import { useState, useEffect, createContext, useContext } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  feedback?: string;
  purchases: number;
  isRewardReady: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string) => User | null;
  register: (name: string, email: string, feedback?: string) => User;
  addPurchase: () => void;
  useReward: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('vape-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (email: string): User | null => {
    const users = JSON.parse(localStorage.getItem('vape-users') || '[]');
    const foundUser = users.find((u: User) => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('vape-user', JSON.stringify(foundUser));
      return foundUser;
    }
    return null;
  };

  const register = (name: string, email: string, feedback?: string): User => {
    const users = JSON.parse(localStorage.getItem('vape-users') || '[]');
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      feedback,
      purchases: 0,
      isRewardReady: false
    };
    users.push(newUser);
    localStorage.setItem('vape-users', JSON.stringify(users));
    setUser(newUser);
    localStorage.setItem('vape-user', JSON.stringify(newUser));
    return newUser;
  };

  const addPurchase = () => {
    if (!user) return;
    const updatedUser = {
      ...user,
      purchases: user.purchases + 1,
      isRewardReady: user.purchases + 1 >= 5
    };
    setUser(updatedUser);
    localStorage.setItem('vape-user', JSON.stringify(updatedUser));
    
    // Update user in users array
    const users = JSON.parse(localStorage.getItem('vape-users') || '[]');
    const userIndex = users.findIndex((u: User) => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem('vape-users', JSON.stringify(users));
    }
  };

  const useReward = () => {
    if (!user) return;
    const updatedUser = {
      ...user,
      purchases: 0,
      isRewardReady: false
    };
    setUser(updatedUser);
    localStorage.setItem('vape-user', JSON.stringify(updatedUser));
    
    // Update user in users array
    const users = JSON.parse(localStorage.getItem('vape-users') || '[]');
    const userIndex = users.findIndex((u: User) => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem('vape-users', JSON.stringify(users));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vape-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, addPurchase, useReward, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

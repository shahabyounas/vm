// @jest-environment node
// Jest unit tests for db/auth.ts
import { loginUser, registerUser, logoutUser, subscribeToAuthState } from '../auth';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getDoc, setDoc, doc, Timestamp } from 'firebase/firestore';

jest.mock('firebase/auth');
jest.mock('firebase/firestore');

describe('auth module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loginUser calls signInWithEmailAndPassword and returns user', async () => {
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: { uid: '123' } });
    (getDoc as jest.Mock).mockResolvedValue({ exists: () => true, data: () => ({ id: '123', name: 'Test User' }) });
    const user = await loginUser('test@example.com', 'password');
    expect(signInWithEmailAndPassword).toHaveBeenCalled();
    expect(getDoc).toHaveBeenCalled();
    expect(user).toEqual(expect.objectContaining({ id: '123', name: 'Test User' }));
  });

  it('registerUser calls createUserWithEmailAndPassword and setDoc', async () => {
    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: { uid: '456' } });
    (setDoc as jest.Mock).mockResolvedValue(undefined);
    const settings = { purchaseLimit: 5, descriptionMessage: '', updatedAt: Timestamp.now(), updatedBy: 'system' };
    const user = await registerUser('New User', 'new@example.com', 'pw', undefined, settings);
    expect(createUserWithEmailAndPassword).toHaveBeenCalled();
    expect(setDoc).toHaveBeenCalled();
    expect(user).toEqual(expect.objectContaining({ id: '456', name: 'New User' }));
  });

  it('logoutUser calls signOut', async () => {
    (signOut as jest.Mock).mockResolvedValue(undefined);
    await logoutUser();
    expect(signOut).toHaveBeenCalled();
  });

  it('subscribeToAuthState calls onAuthStateChanged', () => {
    (onAuthStateChanged as jest.Mock).mockReturnValue(() => 'unsub');
    const cb = jest.fn();
    const unsub = subscribeToAuthState(cb);
    expect(onAuthStateChanged).toHaveBeenCalledWith(expect.anything(), cb);
    expect(unsub()).toBe('unsub');
  });
}); 
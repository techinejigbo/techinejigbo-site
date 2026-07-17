import { createUserWithEmailAndPassword, sendEmailVerification, signOut, signInWithEmailAndPassword, User } from 'firebase/auth';
import { auth } from './config';

export const registerUserWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Immediately send verification email
    await sendEmailVerification(user);
    
    return user;
  } catch (error) {
    console.error("Error creating auth user:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  return signOut(auth);
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

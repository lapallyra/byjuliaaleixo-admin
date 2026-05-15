import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    // Ignore abort errors which are common during dev/refresh
    if (error?.name === 'AbortError' || error?.message?.toLowerCase().includes('abort')) {
      return;
    }
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

export const login = async () => {
  try {
    console.log('[Auth] Attempting login with popup');
    const result = await signInWithPopup(auth, googleProvider);
    console.log('[Auth] Login success:', result.user.email);
    return result.user;
  } catch (error: any) {
    console.error('[Auth] Login error details:', {
      code: error.code,
      message: error.message,
      name: error.name
    });
    if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
      console.log('[Auth] Login popup closed by user.');
      return;
    }
    throw error; // Re-throw to be handled by caller
  }
};
export const logout = () => signOut(auth);

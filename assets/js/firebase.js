// Inicialización Firebase (módulos web v9+)
// Asegurate de crear 'assets/js/firebase-config.js' con tus credenciales y NO subirlo al repo
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { firebaseConfig } from './firebase-config.js';

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export async function ensureAnonAuth(){
  try { await signInAnonymously(auth); } catch(_) { /* ignore */ }
  return new Promise(resolve => {
    onAuthStateChanged(auth, () => resolve());
  });
}



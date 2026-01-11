import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc
} from 'firebase/firestore';
import { auth, db } from './firebase';

export const signUp = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await setDoc(doc(db, 'users', user.uid), {
      name: name,
      email: email,
      createdAt: new Date().toISOString()
    });
    
    return { success: true, user: { uid: user.uid, email: email, name: name } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();
    
    return { 
      success: true, 
      user: { uid: user.uid, email: email, name: userData?.name || 'User' } 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      callback({ uid: user.uid, email: user.email, name: userData?.name || 'User' });
    } else {
      callback(null);
    }
  });
};

export const savePantryData = async (userId, pantryItems, meals, productDatabase) => {
  try {
    await setDoc(doc(db, 'users', userId, 'pantry', 'data'), {
      items: pantryItems,
      meals: meals,
      productDatabase: productDatabase,
      lastUpdated: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('Error saving:', error);
    return { success: false, error: error.message };
  }
};

export const loadPantryData = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId, 'pantry', 'data');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: true, data: { items: [], meals: [], productDatabase: [] } };
    }
  } catch (error) {
    console.error('Error loading:', error);
    return { success: false, error: error.message };
  }
};

export const saveProductToDatabase = async (product) => {
  try {
    await setDoc(doc(db, 'products', product.barcode), product);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getProductFromDatabase = async (barcode) => {
  try {
    const docRef = doc(db, 'products', barcode);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, product: docSnap.data() };
    } else {
      return { success: true, product: null };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

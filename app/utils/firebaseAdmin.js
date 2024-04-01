import { auth } from './firebase';
import admin from 'firebase-admin';
// import key from '@/key';
// const serviceAccount = require('../key');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  console.log(auth);
  // admin.initializeApp({
    // credential: admin.credential.cert(key),
    // databaseURL: 'https://your-project-id.firebaseio.com'
  // });
}

export { admin };
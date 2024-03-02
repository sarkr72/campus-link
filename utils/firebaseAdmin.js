import admin from 'firebase-admin';

const serviceAccount = require('../key.json');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // databaseURL: 'https://your-project-id.firebaseio.com'
  });
}

export { admin };
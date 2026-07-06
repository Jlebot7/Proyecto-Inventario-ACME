
const FirebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'acme-d0f37.firebaseapp.com',
  databaseURL: 'https://acme-d0f37-default-rtdb.firebaseio.com',
  projectId: 'acme-d0f37',
  storageBucket: 'acme-d0f37.appspot.com',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:xxxxxxxxxxxxxxxxxxxxxx'
};


function isFirebaseConfigured() {
  return (
    typeof FirebaseConfig.databaseURL === 'string' &&
    !FirebaseConfig.databaseURL.includes('YOUR_PROJECT')
  );
}


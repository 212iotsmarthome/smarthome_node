const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
require('dotenv').config();
const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const Schedule = collection(db, "Schedule");

async function getSchedule() {
    const Schedule = collection(db, "Schedule");
    const Snapshot = await getDocs(Schedule);
    const List = Snapshot.docs.map(doc => doc.data());
    return List;
}

module.exports = { getSchedule };


const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, 
    onSnapshot, addDoc, updateDoc, deleteDoc, 
    doc, query, where, orderBy, serverTimestamp, getDoc } = require('firebase/firestore');
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

async function getDocument(collectionParam) {
  const ScheduleRef = collection(db, collectionParam);
  let ScheduleDoc = await getDocs(ScheduleRef);
  let List = [];
  ScheduleDoc.docs.forEach(
    doc => 
    List.push({...doc.data(), 'id': doc.id })
  );
  return List;
}

async function addDocument (collectionParam, data) {
    try {
      const docRef = await addDoc(collection(db, collectionParam), data);
      console.log("Document written with ID: ", docRef.id);
      return docRef.id;
    } catch (e) {
      console.error("Error adding document: ", e);
    }
}

async function deleteDocumentById (collectionParam, id) {
    try {
      return await deleteDoc(doc(db, collectionParam, id));
    } catch (e) {
      console.error("Error delete: ", e);
    }
}

async function editDocumentById (collectionParam, id, data) {
    try {
      await updateDoc(doc(db, collectionParam, id), data);
      console.log("update doc: ", id);
    } catch (e) {
      console.error("Error update: ", e);
    }
}

module.exports = { getDocument, addDocument, deleteDocumentById, editDocumentById };


import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

const COLLECTION_NAME = 'patients';

/**
 * Escuta em tempo real a lista de pacientes cadastrados
 */
export function subscribeToPatients(callback, onError) {
  if (!isFirebaseConfigured || !db) {
    callback([]);
    return () => {};
  }

  const patientsRef = collection(db, COLLECTION_NAME);

  const unsubscribe = onSnapshot(
    patientsRef,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // Ordena por nome alfabeticamente em memória
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      callback(list);
    },
    (err) => {
      console.error("Erro ao carregar lista de pacientes:", err);
      if (onError) onError(err);
    }
  );

  return unsubscribe;
}

/**
 * Cadastra um novo paciente
 */
export async function createPatient(data) {
  if (!db) throw new Error("Banco de dados não conectado.");

  const patientsRef = collection(db, COLLECTION_NAME);
  const docRef = await addDoc(patientsRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Atualiza os dados de um paciente existente
 */
export async function updatePatient(id, data) {
  if (!db) throw new Error("Banco de dados não conectado.");

  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Exclui um paciente do cadastro
 */
export async function deletePatient(id) {
  if (!db) throw new Error("Banco de dados não conectado.");

  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}


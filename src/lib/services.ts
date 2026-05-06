import { collection, doc, setDoc, addDoc, getDoc, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';
import { School, Class, UserProfile } from '../types';

export const SchoolService = {
  async getSchool(schoolId: string): Promise<School> {
    const snap = await getDoc(doc(db, 'schools', schoolId));
    return snap.data() as School;
  },

  async getTeachers(schoolId: string): Promise<UserProfile[]> {
    const q = query(collection(db, 'users'), where('schoolId', '==', schoolId), where('role', '==', 'teacher'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as UserProfile);
  },

  async getClasses(schoolId: string): Promise<Class[]> {
    const q = query(collection(db, `schools/${schoolId}/classes`));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Class);
  },

  async createClass(schoolId: string, name: string): Promise<void> {
    await addDoc(collection(db, `schools/${schoolId}/classes`), {
      name,
      schoolId,
      studentIds: [],
      createdAt: new Date().toISOString()
    });
  }
};

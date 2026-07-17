import { collection, doc, setDoc, getDoc, getDocs, query, orderBy, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from './config';

// ... (existing code remains unchanged up to getTraineeData)

export const getAllTrainees = async (): Promise<TraineeData[]> => {
  try {
    const q = query(collection(db, 'trainees'));
    const querySnapshot = await getDocs(q);
    const trainees: TraineeData[] = [];
    querySnapshot.forEach((doc) => {
      trainees.push(doc.data() as TraineeData);
    });
    return trainees.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Error fetching all trainees:", error);
    return [];
  }
};

export const getAllExams = async (traineeUid?: string): Promise<ExamRecord[]> => {
  try {
    const q = traineeUid 
      ? query(collection(db, 'exams'), where('traineeId', '==', traineeUid))
      : query(collection(db, 'exams'));
    const querySnapshot = await getDocs(q);
    const exams: ExamRecord[] = [];
    querySnapshot.forEach((doc) => {
      exams.push(doc.data() as ExamRecord);
    });
    return exams.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  } catch (error) {
    console.error("Error fetching all exams:", error);
    return [];
  }
};

export interface TraineeData {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  school: string;
  traineeClass: string;
  program: 'web-development' | 'graphic-design';
  course: 'web-development' | 'graphic-design';
  createdAt: string;
  passportPhotoBase64?: string;
  status?: 'active' | 'suspended';
}

export interface ExamRecord {
  traineeId: string;
  examId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface Material {
  id: string;
  title: string;
  type: 'video' | 'pdf';
  link: string;
  course: 'web-development' | 'graphic-design';
  createdAt: string;
}

export interface GlobalSettings {
  isExamOpen: boolean;
}

export const getAnnouncements = async (): Promise<Announcement[]> => {
  try {
    const q = query(collection(db, 'announcements'));
    const snap = await getDocs(q);
    const results: Announcement[] = [];
    snap.forEach(doc => results.push({ id: doc.id, ...doc.data() } as Announcement));
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }
};

export const getMaterials = async (course: 'web-development' | 'graphic-design'): Promise<Material[]> => {
  try {
    const q = query(collection(db, 'materials'), where('course', '==', course));
    const snap = await getDocs(q);
    const results: Material[] = [];
    snap.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() as Material });
    });
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Error fetching materials:", error);
    return [];
  }
};

export const getGlobalSettings = async (): Promise<GlobalSettings> => {
  try {
    const docRef = doc(db, 'settings', 'global');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as GlobalSettings;
    }
    return { isExamOpen: false };
  } catch (error) {
    console.error("Error fetching global settings:", error);
    return { isExamOpen: false };
  }
};

export const registerTrainee = async (data: TraineeData) => {
  try {
    const docRef = doc(db, 'trainees', data.uid);
    await setDoc(docRef, data);
    return { success: true };
  } catch (error) {
    console.error("Error writing trainee document: ", error);
    throw error;
  }
};

export const getTraineeData = async (uid: string) => {
  try {
    const docRef = doc(db, 'trainees', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as TraineeData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error reading trainee document: ", error);
    throw error;
  }
};

// --- Admin Functions ---

export const checkIfAdmin = async (uid: string): Promise<boolean> => {
  try {
    const docRef = doc(db, 'admins', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

export const addAdmin = async (uid: string, email: string, addedByUid: string) => {
  try {
    const docRef = doc(db, 'admins', uid);
    await setDoc(docRef, { email, addedByUid, addedAt: new Date().toISOString() });
    return { success: true };
  } catch (error) {
    console.error("Error adding admin:", error);
    throw error;
  }
};

// --- Exam Functions ---

export interface ExamRecord {
  id?: string;
  traineeId: string;
  examId: string; // e.g., 'web-dev-101'
  score: number;
  totalQuestions: number;
  completedAt: string;
}

export const saveExamScore = async (examData: ExamRecord) => {
  try {
    // Generate a unique ID if not provided
    const docId = examData.id || `${examData.traineeId}_${examData.examId}_${Date.now()}`;
    const docRef = doc(db, 'exams', docId);
    await setDoc(docRef, { ...examData, id: docId });
    return { success: true, id: docId };
  } catch (error) {
    console.error("Error saving exam score:", error);
    throw error;
  }
};

// --- Dashboard Admin Functions ---

export const updateTraineeStatus = async (uid: string, status: 'active' | 'suspended') => {
  try {
    const docRef = doc(db, 'trainees', uid);
    await updateDoc(docRef, { status });
    return { success: true };
  } catch (error) {
    console.error("Error updating trainee status:", error);
    throw error;
  }
};

export const deleteTrainee = async (uid: string) => {
  try {
    await deleteDoc(doc(db, 'trainees', uid));
    return { success: true };
  } catch (error) {
    console.error("Error deleting trainee:", error);
    throw error;
  }
};

export const updateGlobalSettings = async (settings: Partial<GlobalSettings>) => {
  try {
    const docRef = doc(db, 'settings', 'global');
    await setDoc(docRef, settings, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error updating global settings:", error);
    throw error;
  }
};

// --- Questions ---

export interface QuestionData {
  id: string;
  courseId: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

export const getQuestions = async (courseId: string): Promise<QuestionData[]> => {
  try {
    const q = query(collection(db, 'questions'), where('courseId', '==', courseId));
    const snap = await getDocs(q);
    const results: QuestionData[] = [];
    snap.forEach(doc => {
      results.push({ ...doc.data() as QuestionData, id: doc.id });
    });
    return results;
  } catch (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
};

export const saveQuestion = async (q: Partial<QuestionData>) => {
  try {
    const docRef = q.id ? doc(db, 'questions', q.id) : doc(collection(db, 'questions'));
    await setDoc(docRef, { ...q, id: docRef.id }, { merge: true });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error saving question:", error);
    throw error;
  }
};

export const deleteQuestion = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'questions', id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting question:", error);
    throw error;
  }
};

// --- Staff Invites ---

export const checkInviteStatus = async (email: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'allowed_admins', email));
    return docSnap.exists();
  } catch (error) {
    return false;
  }
};

export const addInvitedStaff = async (email: string) => {
  try {
    await setDoc(doc(db, 'allowed_admins', email), { email, invitedAt: new Date().toISOString() });
    return { success: true };
  } catch (error) {
    console.error("Error adding invited staff:", error);
    throw error;
  }
};

export const getAllowedAdmins = async () => {
  try {
    const snap = await getDocs(query(collection(db, 'allowed_admins')));
    const results: {email: string, invitedAt: string}[] = [];
    snap.forEach(doc => results.push(doc.data() as any));
    return results;
  } catch (error) {
    console.error("Error fetching allowed admins:", error);
    return [];
  }
};

export const deleteInvitedStaff = async (email: string) => {
  try {
    await deleteDoc(doc(db, 'allowed_admins', email));
    return { success: true };
  } catch (error) {
    console.error("Error deleting invited staff:", error);
    throw error;
  }
};

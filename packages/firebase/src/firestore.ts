import { collection, doc, setDoc, getDoc, getDocs, query, orderBy, updateDoc, deleteDoc, where, onSnapshot } from 'firebase/firestore';
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

export const subscribeToTrainees = (callback: (trainees: TraineeData[]) => void) => {
  const q = query(collection(db, 'trainees'));
  return onSnapshot(q, (snapshot) => {
    const trainees: TraineeData[] = [];
    snapshot.forEach((doc) => {
      trainees.push(doc.data() as TraineeData);
    });
    callback(trainees.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, (error) => {
    console.error("Error in subscribeToTrainees:", error);
    callback([]);
  });
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

export const subscribeToExams = (callback: (exams: ExamRecord[]) => void, traineeUid?: string) => {
  const q = traineeUid 
    ? query(collection(db, 'exams'), where('traineeId', '==', traineeUid))
    : query(collection(db, 'exams'));
    
  return onSnapshot(q, (snapshot) => {
    const exams: ExamRecord[] = [];
    snapshot.forEach((doc) => {
      exams.push(doc.data() as ExamRecord);
    });
    callback(exams.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()));
  }, (error) => {
    console.error("Error in subscribeToExams:", error);
    callback([]);
  });
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
  course: string;
  createdAt: string;
}

export interface GlobalSettings {
  isExamOpen: boolean;
  openPrograms?: Record<string, boolean>;
}

export interface VolunteerData {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  expertise: string;
  linkedin: string;
  createdAt: string;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
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

export const subscribeToAnnouncements = (callback: (announcements: Announcement[]) => void) => {
  const q = query(collection(db, 'announcements'));
  return onSnapshot(q, (snapshot) => {
    const results: Announcement[] = [];
    snapshot.forEach(doc => results.push({ id: doc.id, ...doc.data() } as Announcement));
    callback(results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, (error) => {
    console.error("Error in subscribeToAnnouncements:", error);
    callback([]);
  });
};

export const saveAnnouncement = async (a: Partial<Announcement>) => {
  try {
    const docRef = a.id ? doc(db, 'announcements', a.id) : doc(collection(db, 'announcements'));
    await setDoc(docRef, { ...a, id: docRef.id }, { merge: true });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error saving announcement:", error);
    throw error;
  }
};

export const deleteAnnouncement = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'announcements', id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting announcement:", error);
    throw error;
  }
};

export const getMaterials = async (course: string): Promise<Material[]> => {
  try {
    const q = query(collection(db, 'materials'), where('course', '==', course));
    const snap = await getDocs(q);
    const results: Material[] = [];
    snap.forEach(doc => {
      results.push({ ...(doc.data() as Omit<Material, 'id'>), id: doc.id });
    });
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Error fetching materials:", error);
    return [];
  }
};

export const subscribeToMaterials = (course: string, callback: (materials: Material[]) => void) => {
  const q = query(collection(db, 'materials'), where('course', '==', course));
  return onSnapshot(q, (snapshot) => {
    const results: Material[] = [];
    snapshot.forEach(doc => {
      results.push({ ...(doc.data() as Omit<Material, 'id'>), id: doc.id });
    });
    callback(results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, (error) => {
    console.error("Error in subscribeToMaterials:", error);
    callback([]);
  });
};

export const saveMaterial = async (m: Partial<Material>) => {
  try {
    const docRef = m.id ? doc(db, 'materials', m.id) : doc(collection(db, 'materials'));
    await setDoc(docRef, { ...m, id: docRef.id }, { merge: true });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error saving material:", error);
    throw error;
  }
};

export const deleteMaterial = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'materials', id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting material:", error);
    throw error;
  }
};

export const getGlobalSettings = async (): Promise<GlobalSettings> => {
  try {
    const docRef = doc(db, 'settings', 'global');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as GlobalSettings;
      return { 
        isExamOpen: data.isExamOpen ?? false, 
        openPrograms: data.openPrograms ?? {} 
      };
    }
    return { isExamOpen: false, openPrograms: {} };
  } catch (error) {
    console.error("Error fetching global settings:", error);
    return { isExamOpen: false, openPrograms: {} };
  }
};

export const subscribeToGlobalSettings = (callback: (settings: GlobalSettings) => void) => {
  const docRef = doc(db, 'settings', 'global');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data() as GlobalSettings;
      callback({
        isExamOpen: data.isExamOpen ?? false,
        openPrograms: data.openPrograms ?? {}
      });
    } else {
      callback({ isExamOpen: false, openPrograms: {} });
    }
  }, (error) => {
    console.error("Error in subscribeToGlobalSettings:", error);
    callback({ isExamOpen: false, openPrograms: {} });
  });
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

export const subscribeToQuestions = (courseId: string, callback: (questions: QuestionData[]) => void) => {
  const q = query(collection(db, 'questions'), where('courseId', '==', courseId));
  return onSnapshot(q, (snapshot) => {
    const results: QuestionData[] = [];
    snapshot.forEach(doc => {
      results.push({ ...doc.data() as QuestionData, id: doc.id });
    });
    callback(results);
  }, (error) => {
    console.error("Error in subscribeToQuestions:", error);
    callback([]);
  });
};

export const getAllCoursesFromQuestions = async (): Promise<string[]> => {
  try {
    const q = query(collection(db, 'questions'));
    const snap = await getDocs(q);
    const courses = new Set<string>();
    snap.forEach(doc => {
      const data = doc.data() as QuestionData;
      if (data.courseId) {
        courses.add(data.courseId);
      }
    });
    const uniqueCourses = Array.from(courses);
    return uniqueCourses.length > 0 ? uniqueCourses : ['graphic-design', 'web-development'];
  } catch (error) {
    console.error("Error fetching all courses from questions:", error);
    return ['graphic-design', 'web-development'];
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

// --- Volunteers & Messages ---

export const saveVolunteer = async (v: Partial<VolunteerData>) => {
  try {
    const docRef = v.id ? doc(db, 'volunteers', v.id) : doc(collection(db, 'volunteers'));
    await setDoc(docRef, { ...v, id: docRef.id }, { merge: true });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error saving volunteer:", error);
    throw error;
  }
};

export const getVolunteers = async (): Promise<VolunteerData[]> => {
  try {
    const q = query(collection(db, 'volunteers'));
    const snap = await getDocs(q);
    const results: VolunteerData[] = [];
    snap.forEach(doc => results.push({ id: doc.id, ...doc.data() } as VolunteerData));
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Error fetching volunteers:", error);
    return [];
  }
};

export const subscribeToVolunteers = (callback: (volunteers: VolunteerData[]) => void) => {
  const q = query(collection(db, 'volunteers'));
  return onSnapshot(q, (snapshot) => {
    const results: VolunteerData[] = [];
    snapshot.forEach(doc => results.push({ id: doc.id, ...doc.data() } as VolunteerData));
    callback(results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, (error) => {
    console.error("Error in subscribeToVolunteers:", error);
    callback([]);
  });
};

export const saveContactMessage = async (m: Partial<ContactMessage>) => {
  try {
    const docRef = m.id ? doc(db, 'messages', m.id) : doc(collection(db, 'messages'));
    await setDoc(docRef, { ...m, id: docRef.id }, { merge: true });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
};

export const getContactMessages = async (): Promise<ContactMessage[]> => {
  try {
    const q = query(collection(db, 'messages'));
    const snap = await getDocs(q);
    const results: ContactMessage[] = [];
    snap.forEach(doc => results.push({ id: doc.id, ...doc.data() } as ContactMessage));
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};

export const subscribeToContactMessages = (callback: (messages: ContactMessage[]) => void) => {
  const q = query(collection(db, 'messages'));
  return onSnapshot(q, (snapshot) => {
    const results: ContactMessage[] = [];
    snapshot.forEach(doc => results.push({ id: doc.id, ...doc.data() } as ContactMessage));
    callback(results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, (error) => {
    console.error("Error in subscribeToContactMessages:", error);
    callback([]);
  });
};

// --- Gallery ---

export interface GalleryItem {
  id?: string;
  title: string;
  category: 'media' | 'design' | 'web';
  mediaType?: 'image' | 'video';
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
}

export const getGalleryItems = async (): Promise<GalleryItem[]> => {
  try {
    const q = query(collection(db, 'gallery'));
    const snap = await getDocs(q);
    const results: GalleryItem[] = [];
    snap.forEach(doc => results.push({ id: doc.id, ...doc.data() } as GalleryItem));
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Error fetching gallery items:", error);
    return [];
  }
};

export const subscribeToGalleryItems = (callback: (items: GalleryItem[]) => void) => {
  const q = query(collection(db, 'gallery'));
  return onSnapshot(q, (snapshot) => {
    const results: GalleryItem[] = [];
    snapshot.forEach(doc => results.push({ id: doc.id, ...doc.data() } as GalleryItem));
    callback(results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, (error) => {
    console.error("Error in subscribeToGalleryItems:", error);
    callback([]);
  });
};

export const saveGalleryItem = async (item: Partial<GalleryItem>) => {
  try {
    const docRef = item.id ? doc(db, 'gallery', item.id) : doc(collection(db, 'gallery'));
    await setDoc(docRef, { ...item, id: docRef.id }, { merge: true });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error saving gallery item:", error);
    throw error;
  }
};

export const deleteGalleryItem = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'gallery', id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    throw error;
  }
};

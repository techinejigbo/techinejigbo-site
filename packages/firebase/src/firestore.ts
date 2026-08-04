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
  status?: 'active' | 'suspended' | 'pending';
}

export interface ExamRecord {
  id?: string;
  traineeId: string;
  examId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  timeSpentSeconds?: number;
  violationsCount?: number;
  autoSubmitted?: boolean;
  reason?: string;
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
  status?: 'pending' | 'contacted' | 'accepted' | 'rejected';
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

export const backfillMissingCertificates = async () => {
  try {
    const examsSnapshot = await getDocs(collection(db, 'exams'));
    const certsSnapshot = await getDocs(collection(db, 'certificates'));
    
    const existingCerts = new Set<string>();
    certsSnapshot.forEach(doc => {
      const data = doc.data() as CertificateRecord;
      existingCerts.add(`${data.traineeId}_${data.examId}`);
    });

    let generatedCount = 0;

    for (const docSnap of examsSnapshot.docs) {
      const exam = docSnap.data() as ExamRecord;
      const key = `${exam.traineeId}_${exam.examId}`;
      
      // If score is >= 70 and no certificate exists yet
      if (exam.score >= 70 && !existingCerts.has(key)) {
        // Generate certificateId
        const traineeData = await getTraineeData(exam.traineeId);
        if (!traineeData) continue;
        
        const courseCode = exam.examId.toUpperCase();
        const cleanName = `${traineeData.firstName}${traineeData.lastName}`.replace(/\s+/g, '').substring(0, 4).toUpperCase();
        const timestamp = Math.floor(Date.now() / 1000).toString().slice(-4);
        const certificateId = `TE-${courseCode}-2026-${cleanName}-${timestamp}`;

        const newCert: Partial<CertificateRecord> = {
          traineeId: exam.traineeId,
          examId: exam.examId,
          course: exam.examId,
          score: exam.score,
          correctCount: Math.round((exam.score / 100) * exam.totalQuestions),
          totalQuestions: exam.totalQuestions,
          elapsedSeconds: 0, // Fallback since it's not in ExamRecord
          issueDate: exam.completedAt,
          status: 'pending',
          certificateId
        };
        
        const certDocRef = doc(collection(db, 'certificates'));
        await setDoc(certDocRef, { ...newCert, id: certDocRef.id }, { merge: true });
        
        generatedCount++;
        existingCerts.add(key); // prevent duplicates in the same run
      }
    }
    
    return { success: true, count: generatedCount };
  } catch (error) {
    console.error("Error backfilling certificates:", error);
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

export const saveExamScore = async (examData: ExamRecord) => {
  try {
    // Generate a deterministic ID based on trainee and exam course to enforce single submission
    const docId = examData.id || `${examData.traineeId}_${examData.examId}`;
    const docRef = doc(db, 'exams', docId);
    
    // Check if exam already exists to prevent duplicate writes
    const existing = await getDoc(docRef);
    if (existing.exists()) {
      throw new Error("This assessment has already been completed and submitted.");
    }

    await setDoc(docRef, { ...examData, id: docId });
    return { success: true, id: docId };
  } catch (error) {
    console.error("Error saving exam score:", error);
    throw error;
  }
};

export const hasStudentCompletedExam = async (traineeId: string, examId: string): Promise<boolean> => {
  try {
    const docId = `${traineeId}_${examId}`;
    const docRef = doc(db, 'exams', docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) return true;
    
    // Fallback: check query in case legacy records were saved with timestamp docId
    const q = query(collection(db, 'exams'), where('traineeId', '==', traineeId), where('examId', '==', examId));
    const querySnap = await getDocs(q);
    return !querySnap.empty;
  } catch (error) {
    console.error("Error checking completed exam status:", error);
    return false;
  }
};

// --- Dashboard Admin Functions ---

export const updateTraineeStatus = async (uid: string, status: 'active' | 'suspended' | 'pending') => {
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

export const updateVolunteerStatus = async (id: string, status: 'pending' | 'contacted' | 'accepted' | 'rejected') => {
  try {
    const docRef = doc(db, 'volunteers', id);
    await updateDoc(docRef, { status });
    return { success: true };
  } catch (error) {
    console.error("Error updating volunteer status:", error);
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

// --- Certificates ---

export interface CertificateRecord {
  id: string;
  traineeId: string;
  examId: string;
  course: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  elapsedSeconds: number;
  issueDate: string;
  status: 'pending' | 'approved';
  certificateId: string;
}

export const saveCertificate = async (cert: Partial<CertificateRecord>) => {
  try {
    const docRef = cert.id ? doc(db, 'certificates', cert.id) : doc(collection(db, 'certificates'));
    await setDoc(docRef, { ...cert, id: docRef.id }, { merge: true });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error saving certificate:", error);
    throw error;
  }
};

export const subscribeToCertificates = (callback: (certs: CertificateRecord[]) => void, traineeId?: string) => {
  const q = traineeId 
    ? query(collection(db, 'certificates'), where('traineeId', '==', traineeId))
    : query(collection(db, 'certificates'));
    
  return onSnapshot(q, (snapshot) => {
    const certs: CertificateRecord[] = [];
    snapshot.forEach((doc) => {
      certs.push(doc.data() as CertificateRecord);
    });
    callback(certs.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()));
  }, (error) => {
    console.error("Error in subscribeToCertificates:", error);
    callback([]);
  });
};

export const updateCertificateStatus = async (id: string, status: 'pending' | 'approved') => {
  try {
    const docRef = doc(db, 'certificates', id);
    await updateDoc(docRef, { status });
    return { success: true };
  } catch (error) {
    console.error("Error updating certificate status:", error);
    throw error;
  }
};

// --- Donations ---

export interface DonationRecord {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  isAnonymous?: boolean;
  purpose: string;
  message?: string;
  status: 'success' | 'pending' | 'failed';
  channel?: string;
  paidAt: string;
  createdAt: string;
  paystackResponse?: any;
}

export const saveDonation = async (donation: Partial<DonationRecord>) => {
  try {
    const docId = donation.id || donation.reference;
    const docRef = docId ? doc(db, 'donations', docId) : doc(collection(db, 'donations'));
    const dataToSave = {
      ...donation,
      id: docRef.id,
      createdAt: donation.createdAt || new Date().toISOString()
    };
    await setDoc(docRef, dataToSave, { merge: true });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error saving donation:", error);
    throw error;
  }
};

export const getDonations = async (): Promise<DonationRecord[]> => {
  try {
    const q = query(collection(db, 'donations'));
    const snapshot = await getDocs(q);
    const donations: DonationRecord[] = [];
    snapshot.forEach((docSnap) => {
      donations.push({ id: docSnap.id, ...docSnap.data() } as DonationRecord);
    });
    return donations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Error fetching donations:", error);
    return [];
  }
};

export const subscribeToDonations = (callback: (donations: DonationRecord[]) => void) => {
  const q = query(collection(db, 'donations'));
  return onSnapshot(q, (snapshot) => {
    const donations: DonationRecord[] = [];
    snapshot.forEach((docSnap) => {
      donations.push({ id: docSnap.id, ...docSnap.data() } as DonationRecord);
    });
    callback(donations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, (error) => {
    console.error("Error in subscribeToDonations:", error);
    callback([]);
  });
};

export const updateDonationStatus = async (id: string, status: 'success' | 'pending' | 'failed') => {
  try {
    const docRef = doc(db, 'donations', id);
    await updateDoc(docRef, { status });
    return { success: true };
  } catch (error) {
    console.error("Error updating donation status:", error);
    throw error;
  }
};

// --- Class Recordings ---

export interface ClassRecording {
  id: string;
  title: string;
  course: string;
  week?: string;
  lessonNumber?: number;
  classDate: string;
  instructor?: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  attachmentLink?: string;
  attachmentTitle?: string;
  duration?: string;
  createdAt: string;
}

export const getClassRecordings = async (course?: string): Promise<ClassRecording[]> => {
  try {
    const q = course 
      ? query(collection(db, 'recordings'), where('course', '==', course))
      : query(collection(db, 'recordings'));
    const snap = await getDocs(q);
    const results: ClassRecording[] = [];
    snap.forEach(docSnap => {
      results.push({ ...(docSnap.data() as Omit<ClassRecording, 'id'>), id: docSnap.id });
    });
    return results.sort((a, b) => {
      const dateA = new Date(a.classDate || a.createdAt).getTime();
      const dateB = new Date(b.classDate || b.createdAt).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error fetching class recordings:", error);
    return [];
  }
};

export const subscribeToClassRecordings = (
  callback: (recordings: ClassRecording[]) => void,
  course?: string
) => {
  const q = course 
    ? query(collection(db, 'recordings'), where('course', '==', course))
    : query(collection(db, 'recordings'));
    
  return onSnapshot(q, (snapshot) => {
    const results: ClassRecording[] = [];
    snapshot.forEach(docSnap => {
      results.push({ ...(docSnap.data() as Omit<ClassRecording, 'id'>), id: docSnap.id });
    });
    callback(results.sort((a, b) => {
      const dateA = new Date(a.classDate || a.createdAt).getTime();
      const dateB = new Date(b.classDate || b.createdAt).getTime();
      return dateB - dateA;
    }));
  }, (error) => {
    console.error("Error in subscribeToClassRecordings:", error);
    callback([]);
  });
};

export const saveClassRecording = async (rec: Partial<ClassRecording>) => {
  try {
    const docRef = rec.id ? doc(db, 'recordings', rec.id) : doc(collection(db, 'recordings'));
    const dataToSave = {
      ...rec,
      id: docRef.id,
      createdAt: rec.createdAt || new Date().toISOString()
    };
    await setDoc(docRef, dataToSave, { merge: true });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error saving class recording:", error);
    throw error;
  }
};

export const deleteClassRecording = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'recordings', id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting class recording:", error);
    throw error;
  }
};



/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StudentInfo {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  school: string;
  course: 'graphic-design' | 'web-development';
}

export interface Question {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

export interface QuizState {
  student: StudentInfo;
  answers: Record<number, 'A' | 'B' | 'C' | 'D'>;
  timeSpentSeconds: number;
  isCompleted: boolean;
  score?: number;
  submittedAt?: string;
}

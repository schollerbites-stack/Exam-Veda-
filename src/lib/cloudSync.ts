import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Category, Lesson, CloudSyncStatus } from '../types';
import { INITIAL_CATEGORIES, INITIAL_LESSONS } from '../data/initialData';

// Firestore collections
const CATEGORIES_COLLECTION = 'categories';
const LESSONS_COLLECTION = 'lessons';

// Local storage backup keys for offline resilience
const STORAGE_KEY_CATEGORIES = 'study_handler_categories_v1';
const STORAGE_KEY_LESSONS = 'study_handler_lessons_v1';

// Helper to remove undefined properties so Firestore writes never fail
function cleanForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        cleaned[key] = value.map(item =>
          typeof item === 'object' && item !== null ? cleanForFirestore(item) : item
        );
      } else if (typeof value === 'object' && value !== null) {
        cleaned[key] = cleanForFirestore(value);
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

class CloudSyncService {
  private categoriesListeners: Array<(categories: Category[]) => void> = [];
  private lessonsListeners: Array<(lessons: Lesson[]) => void> = [];
  private statusListeners: Array<(status: CloudSyncStatus) => void> = [];

  private unsubCategories: Unsubscribe | null = null;
  private unsubLessons: Unsubscribe | null = null;

  private isInitialized = false;
  private currentStatus: CloudSyncStatus = {
    isConnected: false,
    isSyncing: false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastSyncedAt: null,
    totalCloudLessons: 0,
    totalCloudCategories: 0,
    error: null,
  };

  private currentCategories: Category[] = [];
  private currentLessons: Lesson[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.updateStatus({ isOnline: true, error: null });
        this.initRealtimeSync();
      });

      window.addEventListener('offline', () => {
        this.updateStatus({ isOnline: false });
      });
    }
  }

  // Subscribe to category updates
  public subscribeCategories(callback: (categories: Category[]) => void) {
    this.categoriesListeners.push(callback);
    // Send current cached value immediately
    if (this.currentCategories.length > 0) {
      callback(this.currentCategories);
    }
    return () => {
      this.categoriesListeners = this.categoriesListeners.filter(cb => cb !== callback);
    };
  }

  // Subscribe to lesson updates
  public subscribeLessons(callback: (lessons: Lesson[]) => void) {
    this.lessonsListeners.push(callback);
    // Send current cached value immediately
    if (this.currentLessons.length > 0) {
      callback(this.currentLessons);
    }
    return () => {
      this.lessonsListeners = this.lessonsListeners.filter(cb => cb !== callback);
    };
  }

  // Subscribe to sync status updates
  public subscribeStatus(callback: (status: CloudSyncStatus) => void) {
    this.statusListeners.push(callback);
    callback(this.currentStatus);
    return () => {
      this.statusListeners = this.statusListeners.filter(cb => cb !== callback);
    };
  }

  private notifyCategories(categories: Category[]) {
    // Check if categories have actually changed to avoid triggering unnecessary re-renders
    if (
      this.currentCategories.length === categories.length &&
      this.currentCategories.every((c, i) => c.id === categories[i].id && c.updatedAt === categories[i].updatedAt && c.name === categories[i].name)
    ) {
      return;
    }

    this.currentCategories = categories;
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch {
      // ignore
    }
    this.categoriesListeners.forEach(cb => {
      try {
        cb(categories);
      } catch (err) {
        console.error('Error in categories listener:', err);
      }
    });
  }

  private notifyLessons(lessons: Lesson[]) {
    // Check if lessons have actually changed to avoid triggering unnecessary re-renders
    if (
      this.currentLessons.length === lessons.length &&
      this.currentLessons.every((l, i) => l.id === lessons[i].id && l.updatedAt === lessons[i].updatedAt && (l.questions?.length || 0) === (lessons[i].questions?.length || 0))
    ) {
      return;
    }

    this.currentLessons = lessons;
    try {
      localStorage.setItem(STORAGE_KEY_LESSONS, JSON.stringify(lessons));
    } catch {
      // ignore
    }
    this.lessonsListeners.forEach(cb => {
      try {
        cb(lessons);
      } catch (err) {
        console.error('Error in lessons listener:', err);
      }
    });
  }

  private updateStatus(partial: Partial<CloudSyncStatus>) {
    this.currentStatus = { ...this.currentStatus, ...partial };
    this.statusListeners.forEach(cb => {
      try {
        cb(this.currentStatus);
      } catch (err) {
        console.error('Error in status listener:', err);
      }
    });
  }

  // Initialize Real-time Cloud Synchronization
  public initRealtimeSync() {
    if (this.isInitialized) {
      return;
    }
    this.isInitialized = true;

    this.updateStatus({ isSyncing: true, error: null });

    try {
      const categoriesCol = collection(db, CATEGORIES_COLLECTION);
      const lessonsCol = collection(db, LESSONS_COLLECTION);

      // Listen to Categories
      this.unsubCategories = onSnapshot(
        categoriesCol,
        snapshot => {
          if (snapshot.empty && this.currentStatus.isOnline) {
            // First time setup: seed cloud database if empty
            this.seedInitialIfEmpty();
            return;
          }

          const cats: Category[] = snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              name: data.name || '',
              iconEmoji: data.iconEmoji || '📚',
              color: data.color || 'indigo',
              description: data.description,
              isPublished: data.isPublished !== false,
              createdAt: data.createdAt || Date.now(),
              updatedAt: data.updatedAt,
            } as Category;
          });

          cats.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

          this.notifyCategories(cats);
          this.updateStatus({
            isConnected: true,
            isSyncing: false,
            lastSyncedAt: Date.now(),
            totalCloudCategories: cats.length,
          });
        },
        error => {
          console.warn('Firestore categories sync warning:', error);
          this.updateStatus({
            isSyncing: false,
            error: error.message,
          });
        }
      );

      // Listen to Lessons
      this.unsubLessons = onSnapshot(
        lessonsCol,
        snapshot => {
          const lesList: Lesson[] = snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              categoryId: data.categoryId || '',
              title: data.title || '',
              description: data.description,
              iconEmoji: data.iconEmoji || '📖',
              questions: Array.isArray(data.questions) ? data.questions : [],
              rawText: data.rawText,
              notes: data.notes,
              isPublished: data.isPublished !== false,
              isApproved: data.isApproved !== false,
              sharedBy: data.sharedBy || 'Community',
              createdAt: data.createdAt || Date.now(),
              updatedAt: data.updatedAt,
            } as Lesson;
          });

          lesList.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

          this.notifyLessons(lesList);
          this.updateStatus({
            isConnected: true,
            isSyncing: false,
            lastSyncedAt: Date.now(),
            totalCloudLessons: lesList.length,
          });
        },
        error => {
          console.warn('Firestore lessons sync warning:', error);
          this.updateStatus({
            isSyncing: false,
            error: error.message,
          });
        }
      );
    } catch (err: any) {
      console.error('Failed to bind Firestore listeners:', err);
      this.updateStatus({
        isSyncing: false,
        error: err?.message || 'Firestore connection error',
      });
    }
  }

  // Automatic Cloud Seeding on first run if database is empty
  public async seedInitialIfEmpty() {
    try {
      const catCheck = await getDocs(collection(db, CATEGORIES_COLLECTION));
      if (!catCheck.empty) {
        return;
      }

      console.log('🌱 Seeding initial educational categories & lessons to Firestore Cloud Database...');
      this.updateStatus({ isSyncing: true });

      const batch = writeBatch(db);

      // Add Initial Categories
      for (const cat of INITIAL_CATEGORIES) {
        const catRef = doc(db, CATEGORIES_COLLECTION, cat.id);
        batch.set(catRef, cleanForFirestore({
          ...cat,
          isPublished: true,
          updatedAt: Date.now(),
        }));
      }

      // Add Initial Lessons
      for (const les of INITIAL_LESSONS) {
        const lesRef = doc(db, LESSONS_COLLECTION, les.id);
        batch.set(lesRef, cleanForFirestore({
          ...les,
          isPublished: true,
          isApproved: true,
          sharedBy: 'Admin',
          updatedAt: Date.now(),
        }));
      }

      await batch.commit();
      console.log('✅ Cloud Database initial seed complete.');
      this.updateStatus({
        isConnected: true,
        isSyncing: false,
        lastSyncedAt: Date.now(),
        totalCloudCategories: INITIAL_CATEGORIES.length,
        totalCloudLessons: INITIAL_LESSONS.length,
      });
    } catch (err: any) {
      console.error('Error seeding initial data to Firestore:', err);
      this.updateStatus({ isSyncing: false, error: err?.message });
    }
  }

  // Save Category to Cloud Database
  public async saveCategory(category: Category): Promise<void> {
    this.updateStatus({ isSyncing: true });
    try {
      const catRef = doc(db, CATEGORIES_COLLECTION, category.id);
      const dataToSave = cleanForFirestore({
        ...category,
        isPublished: category.isPublished !== false,
        updatedAt: Date.now(),
      });
      await setDoc(catRef, dataToSave, { merge: true });
      this.updateStatus({ isSyncing: false, lastSyncedAt: Date.now() });
    } catch (err: any) {
      console.error('Failed to save category to Firestore:', err);
      this.updateStatus({ isSyncing: false, error: err?.message });
      throw err;
    }
  }

  // Delete Category from Cloud Database
  public async deleteCategory(categoryId: string): Promise<void> {
    this.updateStatus({ isSyncing: true });
    try {
      const catRef = doc(db, CATEGORIES_COLLECTION, categoryId);
      await deleteDoc(catRef);

      // Also cascade delete lessons under this category
      const lessonsToDelete = this.currentLessons.filter(l => l.categoryId === categoryId);
      if (lessonsToDelete.length > 0) {
        const batch = writeBatch(db);
        for (const les of lessonsToDelete) {
          const lesRef = doc(db, LESSONS_COLLECTION, les.id);
          batch.delete(lesRef);
        }
        await batch.commit();
      }

      this.updateStatus({ isSyncing: false, lastSyncedAt: Date.now() });
    } catch (err: any) {
      console.error('Failed to delete category from Firestore:', err);
      this.updateStatus({ isSyncing: false, error: err?.message });
      throw err;
    }
  }

  // Save / Update Lesson to Cloud Database
  public async saveLesson(lesson: Lesson): Promise<void> {
    this.updateStatus({ isSyncing: true });
    try {
      const lesRef = doc(db, LESSONS_COLLECTION, lesson.id);
      const dataToSave = cleanForFirestore({
        ...lesson,
        isPublished: lesson.isPublished !== false,
        isApproved: lesson.isApproved !== false,
        sharedBy: lesson.sharedBy || 'Community',
        updatedAt: Date.now(),
      });
      await setDoc(lesRef, dataToSave, { merge: true });
      this.updateStatus({ isSyncing: false, lastSyncedAt: Date.now() });
    } catch (err: any) {
      console.error('Failed to save lesson to Firestore:', err);
      this.updateStatus({ isSyncing: false, error: err?.message });
      throw err;
    }
  }

  // Delete Lesson from Cloud Database
  public async deleteLesson(lessonId: string): Promise<void> {
    this.updateStatus({ isSyncing: true });
    try {
      const lesRef = doc(db, LESSONS_COLLECTION, lessonId);
      await deleteDoc(lesRef);
      this.updateStatus({ isSyncing: false, lastSyncedAt: Date.now() });
    } catch (err: any) {
      console.error('Failed to delete lesson from Firestore:', err);
      this.updateStatus({ isSyncing: false, error: err?.message });
      throw err;
    }
  }

  // Toggle Visibility (Publish / Hide) for a Lesson
  public async togglePublishLesson(lessonId: string, isPublished: boolean): Promise<void> {
    try {
      const lesRef = doc(db, LESSONS_COLLECTION, lessonId);
      await setDoc(lesRef, { isPublished, updatedAt: Date.now() }, { merge: true });
    } catch (err: any) {
      console.error('Failed to toggle publish status:', err);
      throw err;
    }
  }

  // Toggle Approval for a Lesson
  public async toggleApproveLesson(lessonId: string, isApproved: boolean): Promise<void> {
    try {
      const lesRef = doc(db, LESSONS_COLLECTION, lessonId);
      await setDoc(lesRef, { isApproved, updatedAt: Date.now() }, { merge: true });
    } catch (err: any) {
      console.error('Failed to toggle approval status:', err);
      throw err;
    }
  }

  // Reset Cloud Data to Initial Default Dataset
  public async resetCloudToDefaults(): Promise<void> {
    this.updateStatus({ isSyncing: true });
    try {
      // 1. Delete all existing docs in batches
      const catDocs = await getDocs(collection(db, CATEGORIES_COLLECTION));
      const lesDocs = await getDocs(collection(db, LESSONS_COLLECTION));

      const deleteBatch = writeBatch(db);
      catDocs.forEach(d => deleteBatch.delete(d.ref));
      lesDocs.forEach(d => deleteBatch.delete(d.ref));
      await deleteBatch.commit();

      // 2. Insert defaults
      const insertBatch = writeBatch(db);
      for (const cat of INITIAL_CATEGORIES) {
        insertBatch.set(doc(db, CATEGORIES_COLLECTION, cat.id), cleanForFirestore({
          ...cat,
          isPublished: true,
          updatedAt: Date.now(),
        }));
      }
      for (const les of INITIAL_LESSONS) {
        insertBatch.set(doc(db, LESSONS_COLLECTION, les.id), cleanForFirestore({
          ...les,
          isPublished: true,
          isApproved: true,
          sharedBy: 'Admin',
          updatedAt: Date.now(),
        }));
      }
      await insertBatch.commit();

      this.updateStatus({ isSyncing: false, lastSyncedAt: Date.now() });
    } catch (err: any) {
      console.error('Failed to reset cloud database:', err);
      this.updateStatus({ isSyncing: false, error: err?.message });
      throw err;
    }
  }

  // Clear all data from cloud
  public async clearAllCloudData(): Promise<void> {
    this.updateStatus({ isSyncing: true });
    try {
      const catDocs = await getDocs(collection(db, CATEGORIES_COLLECTION));
      const lesDocs = await getDocs(collection(db, LESSONS_COLLECTION));

      const batch = writeBatch(db);
      catDocs.forEach(d => batch.delete(d.ref));
      lesDocs.forEach(d => batch.delete(d.ref));
      await batch.commit();

      this.updateStatus({ isSyncing: false, lastSyncedAt: Date.now() });
    } catch (err: any) {
      console.error('Failed to clear cloud database:', err);
      this.updateStatus({ isSyncing: false, error: err?.message });
      throw err;
    }
  }
}

export const cloudSync = new CloudSyncService();

import React, { useState, useEffect } from 'react';
import { Category, Lesson, ActiveView, QuizResult } from './types';
import { INITIAL_CATEGORIES, INITIAL_LESSONS } from './data/initialData';
import { Navbar } from './components/Navbar';
import { CategoryGrid } from './components/CategoryGrid';
import { CategoryDetail } from './components/CategoryDetail';
import { NoteViewer } from './components/NoteViewer';
import { NotesHub } from './components/NotesHub';
import { QuizRunner } from './components/QuizRunner';
import { QuizAnalysis } from './components/QuizAnalysis';
import { AdminPanel } from './components/AdminPanel';
import { BottomNav } from './components/BottomNav';
import { TestHistory } from './components/TestHistory';
import { AITutorChat } from './components/AITutorChat';
import { OfflineIndicator } from './components/PWAInstallButton';
import { Plus } from 'lucide-react';

const STORAGE_KEY_CATEGORIES = 'study_handler_categories_v1';
const STORAGE_KEY_LESSONS = 'study_handler_lessons_v1';
const STORAGE_KEY_SOUND = 'study_handler_sound_v1';
const STORAGE_KEY_HISTORY = 'study_handler_quiz_history_v1';
const STORAGE_KEY_SAVED_NOTES = 'study_handler_saved_notes_v1';

export default function App() {
  // Categories State
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load categories from localStorage:', e);
    }
    return INITIAL_CATEGORIES;
  });

  // Lessons State (with fallback migration so existing storage gets notes)
  const [lessons, setLessons] = useState<Lesson[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LESSONS);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((item: Lesson) => {
            if (!item.notes) {
              const defaultMatch = INITIAL_LESSONS.find(init => init.id === item.id);
              if (defaultMatch && defaultMatch.notes) {
                return { ...item, notes: defaultMatch.notes };
              }
            }
            return item;
          });
        }
      }
    } catch (e) {
      console.error('Failed to load lessons from localStorage:', e);
    }
    return INITIAL_LESSONS;
  });

  // Sound preference
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SOUND);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Test History State (Persistent student performance record)
  const [history, setHistory] = useState<QuizResult[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load quiz history:', e);
    }
    return [];
  });

  // Offline Saved / Downloaded Notes state
  const [savedOfflineNoteIds, setSavedOfflineNoteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SAVED_NOTES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load saved notes from localStorage:', e);
    }
    return [];
  });

  // Active View navigation
  const [activeView, setActiveView] = useState<ActiveView>({ type: 'categories' });

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories:', e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LESSONS, JSON.stringify(lessons));
    } catch (e) {
      console.error('Failed to save lessons:', e);
    }
  }, [lessons]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SOUND, JSON.stringify(soundEnabled));
    } catch (e) {
      console.error('Failed to save sound setting:', e);
    }
  }, [soundEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SAVED_NOTES, JSON.stringify(savedOfflineNoteIds));
    } catch (e) {
      console.error('Failed to save offline notes list:', e);
    }
  }, [savedOfflineNoteIds]);

  const handleToggleSaveOfflineNote = (lessonId: string) => {
    setSavedOfflineNoteIds(prev =>
      prev.includes(lessonId) ? prev.filter(id => id !== lessonId) : [...prev, lessonId]
    );
  };

  // Open Admin helper (navigates to full-screen mobile Admin page)
  const handleOpenAdmin = (
    tab: 'upload' | 'categories' | 'lessons' = 'upload',
    catId?: string
  ) => {
    setActiveView({
      type: 'admin',
      initialTab: tab,
      defaultCategoryId: catId,
    });
  };

  // Category Actions
  const handleAddCategory = (newCat: Category) => {
    setCategories(prev => [...prev, newCat]);
  };

  const handleUpdateCategory = (updatedCat: Category) => {
    setCategories(prev => prev.map(c => (c.id === updatedCat.id ? updatedCat : c)));
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
    setLessons(prev => prev.filter(l => l.categoryId !== categoryId));
    if (activeView.type === 'category_detail' && activeView.categoryId === categoryId) {
      setActiveView({ type: 'categories' });
    }
  };

  // Lesson Actions
  const handleSaveLesson = (lesson: Lesson) => {
    setLessons(prev => {
      const idx = prev.findIndex(l => l.id === lesson.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = lesson;
        return next;
      }
      return [...prev, lesson];
    });
  };

  const handleDeleteLesson = (lessonId: string) => {
    setLessons(prev => prev.filter(l => l.id !== lessonId));
  };

  const handleResetData = () => {
    setCategories(INITIAL_CATEGORIES);
    setLessons(INITIAL_LESSONS);
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY_CATEGORIES);
    localStorage.removeItem(STORAGE_KEY_LESSONS);
    localStorage.removeItem(STORAGE_KEY_HISTORY);
    setActiveView({ type: 'categories' });
  };

  const handleClearAllData = () => {
    setCategories([]);
    setLessons([]);
    setHistory([]);
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_LESSONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify([]));
    setActiveView({ type: 'categories' });
  };

  // Calculations for Stats
  const totalQuestions = lessons.reduce((sum, l) => sum + (l.questions?.length || 0), 0);

  const isFullscreenView =
    activeView.type === 'admin' ||
    activeView.type === 'ai_tutor' ||
    activeView.type === 'quiz' ||
    activeView.type === 'note_viewer';

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white pb-20">
      {/* Offline Status Alert */}
      <OfflineIndicator
        onNavigateToNotes={() => setActiveView({ type: 'notes_hub' })}
        onNavigateToHistory={() => setActiveView({ type: 'history' })}
      />

      {/* Top Navbar (hidden on full-screen views like Admin, AI Tutor, Quiz, and NoteViewer) */}
      {!isFullscreenView && (
        <Navbar
          activeView={activeView}
          onNavigate={view => setActiveView(view)}
          onNavigateHome={() => setActiveView({ type: 'categories' })}
          onOpenAdmin={handleOpenAdmin}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          totalCategories={categories.length}
          totalLessons={lessons.length}
          totalQuestions={totalQuestions}
          historyCount={history.length}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {/* VIEW 1: Categories 2-by-2 Grid */}
        {activeView.type === 'categories' && (
          <CategoryGrid
            categories={categories}
            lessons={lessons}
            onSelectCategory={(catId, initialTab) =>
              setActiveView({ type: 'category_detail', categoryId: catId, initialTab })
            }
            onOpenNotes={() => setActiveView({ type: 'notes_hub' })}
            onOpenAdmin={handleOpenAdmin}
          />
        )}

        {/* VIEW 2: Category Detail & Lessons */}
        {activeView.type === 'category_detail' && (() => {
          const currentCategory = categories.find(c => c.id === activeView.categoryId);
          if (!currentCategory) {
            return (
              <div className="max-w-md mx-auto my-12 text-center p-6 bg-white rounded-2xl border border-slate-200">
                <p className="text-sm text-slate-700">श्रेणी नहीं मिली।</p>
                <button
                  onClick={() => setActiveView({ type: 'categories' })}
                  className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                >
                  होम पर जाएं
                </button>
              </div>
            );
          }

          return (
            <CategoryDetail
              category={currentCategory}
              lessons={lessons}
              initialTab={activeView.initialTab || 'questions'}
              onBack={() => setActiveView({ type: 'categories' })}
              onStartQuiz={lessonId => setActiveView({ type: 'quiz', lessonId })}
              onReadNote={lessonId => {
                setActiveView({
                  type: 'note_viewer',
                  lessonId,
                  returnView: {
                    type: 'category_detail',
                    categoryId: currentCategory.id,
                    initialTab: 'notes',
                  },
                });
              }}
              onOpenAdmin={handleOpenAdmin}
              onEditLesson={lesson => {
                handleOpenAdmin('upload', lesson.categoryId);
              }}
              onDeleteLesson={handleDeleteLesson}
            />
          );
        })()}

        {/* VIEW 3: Interactive Mock Quiz Runner */}
        {activeView.type === 'quiz' && (() => {
          const currentLesson = lessons.find(l => l.id === activeView.lessonId);
          if (!currentLesson) {
            return (
              <div className="max-w-md mx-auto my-12 text-center p-6 bg-white rounded-2xl border border-slate-200">
                <p className="text-sm text-slate-700">लेसन नहीं मिला।</p>
                <button
                  onClick={() => setActiveView({ type: 'categories' })}
                  className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                >
                  होम पर जाएं
                </button>
              </div>
            );
          }

          const cat = categories.find(c => c.id === currentLesson.categoryId);

          return (
            <QuizRunner
              lesson={currentLesson}
              categoryName={cat?.name || 'अध्ययन'}
              soundEnabled={soundEnabled}
              onFinishQuiz={result => {
                // Save to persistent test history
                setHistory(prev => [result, ...prev]);
                setActiveView({
                  type: 'quiz_analysis',
                  result,
                  lessonId: currentLesson.id,
                });
              }}
              onExitQuiz={() => {
                if (currentLesson.categoryId) {
                  setActiveView({ type: 'category_detail', categoryId: currentLesson.categoryId });
                } else {
                  setActiveView({ type: 'categories' });
                }
              }}
            />
          );
        })()}

        {/* VIEW 4: Full Quiz Analysis Screen */}
        {activeView.type === 'quiz_analysis' && (() => {
          const currentLesson = lessons.find(l => l.id === activeView.lessonId);
          if (!currentLesson) {
            return (
              <div className="max-w-md mx-auto my-12 text-center p-6 bg-white rounded-2xl border border-slate-200">
                <p className="text-sm text-slate-700">लेसन डेटा उपलब्ध नहीं है।</p>
                <button
                  onClick={() => setActiveView({ type: 'categories' })}
                  className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                >
                  होम पर जाएं
                </button>
              </div>
            );
          }

          return (
            <QuizAnalysis
              result={activeView.result}
              lesson={currentLesson}
              onRetake={() => {
                setActiveView({ type: 'quiz', lessonId: currentLesson.id });
              }}
              onBackToCategory={() => {
                setActiveView({ type: 'category_detail', categoryId: currentLesson.categoryId });
              }}
              onNavigateHome={() => {
                setActiveView({ type: 'categories' });
              }}
              onReadNotes={() => {
                setActiveView({
                  type: 'note_viewer',
                  lessonId: currentLesson.id,
                  returnView: {
                    type: 'quiz_analysis',
                    result: activeView.result,
                    lessonId: currentLesson.id,
                  },
                });
              }}
              onAskAI={query => {
                setActiveView({ type: 'ai_tutor', initialQuery: query });
              }}
            />
          );
        })()}

        {/* VIEW 5: Student Record & Test History */}
        {activeView.type === 'history' && (
          <TestHistory
            history={history}
            categories={categories}
            lessons={lessons}
            onReviewAttempt={attempt => {
              setActiveView({
                type: 'quiz_analysis',
                result: attempt,
                lessonId: attempt.lessonId,
              });
            }}
            onRetakeLesson={lessonId => {
              setActiveView({ type: 'quiz', lessonId });
            }}
            onDeleteAttempt={attemptId => {
              setHistory(prev => prev.filter(h => h.id !== attemptId));
            }}
            onClearHistory={() => setHistory([])}
            onNavigateHome={() => setActiveView({ type: 'categories' })}
          />
        )}

        {/* VIEW 6: Study Notes Hub (Browse All Notes) */}
        {activeView.type === 'notes_hub' && (
          <NotesHub
            categories={categories}
            lessons={lessons}
            selectedCategoryId={activeView.categoryId}
            savedOfflineNoteIds={savedOfflineNoteIds}
            onReadNote={(lessonId: string) => {
              setActiveView({
                type: 'note_viewer',
                lessonId,
                returnView: { type: 'notes_hub', categoryId: activeView.categoryId },
              });
            }}
            onStartQuiz={(lessonId: string) => {
              setActiveView({ type: 'quiz', lessonId });
            }}
            onOpenAdmin={handleOpenAdmin}
            onNavigateHome={() => setActiveView({ type: 'categories' })}
          />
        )}

        {/* VIEW 7: Full Note Viewer */}
        {activeView.type === 'note_viewer' && (() => {
          const currentLesson = lessons.find(l => l.id === activeView.lessonId);
          if (!currentLesson) {
            return (
              <div className="max-w-md mx-auto my-12 text-center p-6 bg-white rounded-2xl border border-slate-200">
                <p className="text-sm text-slate-700">नोट्स या लेसन नहीं मिला।</p>
                <button
                  onClick={() => setActiveView({ type: 'categories' })}
                  className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  होम पर जाएं
                </button>
              </div>
            );
          }

          const currentCat = categories.find(c => c.id === currentLesson.categoryId);
          const categoryLessons = lessons.filter(l => l.categoryId === currentLesson.categoryId);

          return (
            <NoteViewer
              lesson={currentLesson}
              category={currentCat}
              allCategoryLessons={categoryLessons}
              isSavedOffline={savedOfflineNoteIds.includes(currentLesson.id)}
              onToggleSaveOffline={handleToggleSaveOfflineNote}
              onBack={() => {
                if (activeView.returnView) {
                  setActiveView(activeView.returnView);
                } else {
                  setActiveView({
                    type: 'category_detail',
                    categoryId: currentLesson.categoryId,
                    initialTab: 'notes',
                  });
                }
              }}
              onStartQuiz={(lessonId: string) => {
                setActiveView({ type: 'quiz', lessonId });
              }}
              onSelectLesson={(lessonId: string) => {
                setActiveView({
                  type: 'note_viewer',
                  lessonId,
                  returnView: activeView.returnView,
                });
              }}
              onAskAI={(query: string) => {
                setActiveView({
                  type: 'ai_tutor',
                  initialQuery: query,
                });
              }}
            />
          );
        })()}

        {/* VIEW 8: Groq AI Study Tutor (Full Screen with Settings Icon) */}
        {activeView.type === 'ai_tutor' && (
          <AITutorChat
            initialQuery={activeView.initialQuery}
            onNavigateHome={() => setActiveView({ type: 'categories' })}
          />
        )}

        {/* VIEW 9: Full Screen Mobile-Fit Admin Data Portal */}
        {activeView.type === 'admin' && (
          <AdminPanel
            categories={categories}
            lessons={lessons}
            initialTab={activeView.initialTab || 'upload'}
            defaultCategoryId={activeView.defaultCategoryId}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            onSaveLesson={handleSaveLesson}
            onDeleteLesson={handleDeleteLesson}
            onResetData={handleResetData}
            onClearAllData={handleClearAllData}
            onNavigateHome={() => setActiveView({ type: 'categories' })}
            onStartQuiz={lessonId => setActiveView({ type: 'quiz', lessonId })}
          />
        )}
      </main>

      {/* Floating Action Button (FAB) for Instant Admin Access on desktop when on general views */}
      {!isFullscreenView && (
        <button
          onClick={() => handleOpenAdmin('upload')}
          className="hidden md:flex fixed bottom-20 right-6 z-40 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white w-12 h-12 rounded-full shadow-lg hover:shadow-xl items-center justify-center transition-all group hover:scale-105 cursor-pointer"
          title="+ नया प्रश्न / डेटा जोड़ें (Admin Panel)"
        >
          <Plus className="w-6 h-6 transition-transform group-hover:rotate-90 duration-200" />
        </button>
      )}

      {/* Bottom Navigation Drawer */}
      {activeView.type !== 'quiz' && activeView.type !== 'note_viewer' && (
        <BottomNav
          activeView={activeView}
          onNavigate={view => setActiveView(view)}
          onOpenAdmin={handleOpenAdmin}
          historyCount={history.length}
        />
      )}
    </div>
  );
}

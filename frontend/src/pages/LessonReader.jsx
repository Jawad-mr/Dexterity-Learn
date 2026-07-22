import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, CheckCircle, ChevronLeft, Bookmark, Code, HelpCircle, Play, Sparkles, Check, X, RefreshCw, Loader2 } from 'lucide-react';
import { api, useAuth } from '../context/AuthContext';

export default function LessonReader() {
  const { courseSlug, lessonSlug } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  // Code Playground State
  const [editorCode, setEditorCode] = useState('');
  const [selectedSnippet, setSelectedSnippet] = useState(0);
  const [consoleOutput, setConsoleOutput] = useState('');
  
  // Quiz Module State
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState('');

  // 1. Fetch Course details (needed for IDs and quizzes)
  const { data: courseData } = useQuery({
    queryKey: ['course-syllabus', courseSlug],
    queryFn: () => api.get(`/courses/${courseSlug}`).then((res) => res.data),
  });
  const course = courseData?.course;

  // 2. Fetch Lesson details
  const { data: lessonData, isLoading, error } = useQuery({
    queryKey: ['lesson-content', courseSlug, lessonSlug],
    queryFn: () => api.get(`/courses/${courseSlug}/lessons/${lessonSlug}`).then((res) => res.data),
  });

  const lesson = lessonData?.lesson;
  const prevLesson = lessonData?.prevLesson;
  const nextLesson = lessonData?.nextLesson;

  // Initialize editor code when codeSnippets load
  useEffect(() => {
    if (lesson?.codeSnippets?.length > 0) {
      setEditorCode(lesson.codeSnippets[selectedSnippet].code);
    }
  }, [lesson, selectedSnippet]);

  // Find bookmark state
  const isBookmarked = user?.bookmarks?.some(
    (b) => b.id === lesson?._id && b.type === 'lesson'
  );

  // Find completion state
  const enrollment = user?.enrolledCourses?.find(
    (c) => c.courseId === course?._id || c.courseId?._id === course?._id
  );
  const isCompleted = enrollment?.completedLessons?.includes(lesson?._id);

  // Toggle Bookmark Mutation
  const bookmarkMutation = useMutation({
    mutationFn: () =>
      api.post('/courses/bookmarks', {
        type: 'lesson',
        id: lesson._id,
        title: lesson.title,
        url: `/courses/${courseSlug}/lessons/${lessonSlug}`,
      }),
    onSuccess: () => {
      refreshUser();
    },
  });

  // Complete Lesson Mutation
  const completeMutation = useMutation({
    mutationFn: () => api.post(`/courses/${course._id}/lessons/${lesson._id}/complete`),
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries(['course-syllabus', courseSlug]);
    },
  });

  // Sandbox Code Runner
  const runCode = () => {
    setConsoleOutput('Running...');
    const snippet = lesson?.codeSnippets?.[selectedSnippet];
    
    if (snippet?.language === 'javascript') {
      try {
        // Intercept console.log
        let logs = [];
        const originalLog = console.log;
        console.log = (...args) => {
          logs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' '));
        };

        // Execute user code
        const runner = new Function(editorCode);
        runner();

        console.log = originalLog; // Restore console
        setConsoleOutput(logs.join('\n') || 'Code completed with no output.');
      } catch (err) {
        setConsoleOutput(`Error: ${err.message}`);
      }
    } else if (snippet?.language === 'html') {
      // Simulate rendering HTML
      setConsoleOutput(`[Rendered Web Frame]\n${editorCode}`);
    } else {
      setConsoleOutput(`Executed simulated console for ${snippet?.language}:\nCode ran successfully!`);
    }
  };

  // Submit Quiz Question Answer
  const handleQuizAnswerSubmit = () => {
    if (selectedAnswer === null) return;
    
    const quiz = course.quizzes[currentQuestion];
    const isCorrect = selectedAnswer === quiz.answerIndex;
    
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      setQuizFeedback(`Correct! ${quiz.explanation}`);
    } else {
      setQuizFeedback(`Incorrect. The correct answer was: "${quiz.options[quiz.answerIndex]}". ${quiz.explanation}`);
    }
    setQuizSubmitted(true);
  };

  // Move to next question or complete quiz
  const handleNextQuizQuestion = () => {
    setSelectedAnswer(null);
    setQuizSubmitted(false);
    setQuizFeedback('');
    
    if (currentQuestion < course.quizzes.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      // Finished
      setConsoleOutput(`Quiz Cleared! XP Awarded +25.`);
      setShowQuiz(false);
      // Automatically toggle completion if not done
      if (!isCompleted) {
        completeMutation.mutate();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="text-center py-12">
        <h3 className="text-sm font-bold text-red-500">Failed to load lesson.</h3>
        <Link to="/courses" className="text-xs text-brand-500 mt-2 hover:underline inline-block">Back to Courses</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6 lg:grid lg:grid-cols-4 lg:gap-6 lg:items-start lg:space-y-0">
      
      {/* Left Column: Nav, Lesson content, quizzes, and pagination arrows */}
      <div className="space-y-6 lg:col-span-3">
        {/* Navigation header */}
        <div className="flex items-center justify-between">
          <Link
            to={`/courses/${courseSlug}`}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-650"
          >
            <ChevronLeft className="h-4 w-4" /> Syllabus Index
          </Link>

          {user && (
            <button
              onClick={() => bookmarkMutation.mutate()}
              className={`flex h-8 w-8 items-center justify-center rounded-xl border transition ${
                isBookmarked
                  ? 'border-brand-500 bg-brand-50 text-brand-500 dark:bg-brand-950/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400 bg-white dark:bg-slate-900'
              }`}
              title="Bookmark this lesson"
            >
              <Bookmark className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Lesson Content Area */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-3xl p-5 shadow-flat-lg">
          <h1 className="text-lg font-black text-slate-850 dark:text-slate-100">{lesson.title}</h1>
          
          <div className="prose dark:prose-invert mt-4">
            {lesson.content.split('\n\n').map((para, i) => {
              if (para.startsWith('## ')) {
                return <h2 key={i}>{para.replace('## ', '')}</h2>;
              }
              if (para.startsWith('- ')) {
                return (
                  <ul key={i} className="list-disc pl-5 mt-2 space-y-1">
                    {para.split('\n').map((item, idx) => (
                      <li key={idx}>{item.replace('- ', '')}</li>
                    ))}
                  </ul>
                );
              }
              if (para.startsWith('```')) {
                const lines = para.split('\n');
                const codeBlock = lines.slice(1, lines.length - 1).join('\n');
                return (
                  <pre key={i} className="bg-slate-900 text-slate-100 rounded-xl p-3 my-3 text-xs overflow-x-auto font-mono">
                    <code>{codeBlock}</code>
                  </pre>
                );
              }
              return <p key={i}>{para}</p>;
            })}
          </div>
        </div>

        {/* Quizzes Button / Panel */}
        {course?.quizzes?.length > 0 && !showQuiz && (
          <button
            onClick={() => {
              setShowQuiz(true);
              setCurrentQuestion(0);
              setSelectedAnswer(null);
              setQuizSubmitted(false);
              setQuizFeedback('');
            }}
            className="flex items-center justify-between w-full bg-gradient-to-r from-brand-300 to-brand-400 border-2 border-slate-950 rounded-2xl p-4 text-slate-900 hover:bg-brand-300 transition cursor-pointer shadow-flat-sm active:translate-y-[1px] active:shadow-none"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-slate-950 text-brand-450 rounded-lg flex items-center justify-center shrink-0 border border-slate-950">
                <HelpCircle className="h-4.5 w-4.5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-black text-slate-950">Practice Quiz</h4>
                <p className="text-[10px] text-slate-800 font-medium mt-0.5">Validate your lesson reading with a quiz</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-950 animate-pulse" />
          </button>
        )}

        {/* Quiz Interface overlay card */}
        {showQuiz && course?.quizzes?.[currentQuestion] && (
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-3xl p-5 shadow-flat-lg page-transition space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-slate-950 dark:border-slate-800">
              <span className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                Question {currentQuestion + 1} of {course.quizzes.length}
              </span>
              <button
                onClick={() => setShowQuiz(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-650"
              >
                Cancel
              </button>
            </div>

            <h3 className="text-xs font-black text-slate-808 dark:text-slate-100 leading-normal">
              {course.quizzes[currentQuestion].question}
            </h3>

            <div className="grid gap-2">
              {course.quizzes[currentQuestion].options.map((opt, idx) => (
                <button
                  key={idx}
                  disabled={quizSubmitted}
                  onClick={() => setSelectedAnswer(idx)}
                  className={`w-full text-left text-xs p-3 rounded-xl border-2 transition ${
                    selectedAnswer === idx
                      ? 'border-brand-400 bg-brand-200 text-slate-950 font-black shadow-flat-sm'
                      : 'border-slate-950 dark:border-slate-800 bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {quizFeedback && (
              <div className={`p-3 rounded-xl border text-[11px] leading-relaxed ${
                selectedAnswer === course.quizzes[currentQuestion].answerIndex
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-650 dark:text-red-400'
              }`}>
                {quizFeedback}
              </div>
            )}

            <div className="flex justify-end pt-2">
              {!quizSubmitted ? (
                <button
                  onClick={handleQuizAnswerSubmit}
                  disabled={selectedAnswer === null}
                  className="bg-brand-500 hover:bg-brand-650 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuizQuestion}
                  className="flex items-center gap-1 bg-brand-500 hover:bg-brand-650 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                >
                  {currentQuestion < course.quizzes.length - 1 ? 'Next Question' : 'Complete Quiz'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Completion & Navigation bar footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 pt-4 mt-8">
          
          {/* Previous navigation */}
          {prevLesson ? (
            <button
              onClick={() => navigate(`/courses/${courseSlug}/lessons/${prevLesson.slug}`)}
              className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-brand-500 font-semibold"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
          ) : (
            <div />
          )}

          {/* Mark completion toggle checkbox */}
          {user && (
            <button
              onClick={() => completeMutation.mutate()}
              disabled={completeMutation.isPending}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition ${
                isCompleted
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-soft'
                  : 'bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-700 text-slate-500 dark:text-slate-400'
              }`}
            >
              <Check className="h-3.5 w-3.5" />
              {isCompleted ? 'Completed' : 'Mark Done'}
            </button>
          )}

          {/* Next navigation */}
          {nextLesson ? (
            <button
              onClick={() => navigate(`/courses/${courseSlug}/lessons/${nextLesson.slug}`)}
              className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-brand-500 font-semibold"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <div />
          )}

        </div>
      </div>

      {/* Right Column: Code Sandbox Editor */}
      <div className="space-y-6 lg:col-span-1 lg:sticky lg:top-20 order-first lg:order-last">
        {lesson.codeSnippets?.length > 0 && (
          <div className="bg-slate-900 text-white rounded-3xl border-2 border-slate-950 shadow-flat overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b-2 border-slate-900">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-brand-400" />
                <span className="text-xs font-black">Interactive Sandbox</span>
              </div>
              
              {/* Snippet Selection pills */}
              {lesson.codeSnippets.length > 1 && (
                <div className="flex gap-1">
                  {lesson.codeSnippets.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSnippet(idx)}
                      className={`text-[9px] font-semibold px-2 py-0.5 rounded-lg transition ${
                        idx === selectedSnippet ? 'bg-brand-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Snippet {idx + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 space-y-2">
              <textarea
                value={editorCode}
                onChange={(e) => setEditorCode(e.target.value)}
                className="w-full h-48 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono outline-none focus:border-brand-500 text-brand-200"
                spellCheck="false"
              />

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setEditorCode(lesson.codeSnippets[selectedSnippet].code)}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition"
                >
                  <RefreshCw className="h-3 w-3" /> Reset
                </button>
                <button
                  onClick={runCode}
                  className="flex items-center gap-1 bg-brand-500 hover:bg-brand-450 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl transition"
                >
                  <Play className="h-3 w-3 fill-white" /> Run Snippet
                </button>
              </div>

              {consoleOutput && (
                <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3 mt-2 text-[10px] font-mono whitespace-pre-wrap text-emerald-400 max-h-32 overflow-y-auto no-scrollbar">
                  <span className="text-slate-500 uppercase tracking-wider text-[8px] font-bold block mb-1">Sandbox Output:</span>
                  {consoleOutput}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

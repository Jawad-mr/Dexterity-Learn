import React, { useState, useEffect } from 'react';
import { quizStorage } from '../utils/storage';

export default function Quiz({ course, onQuizPassed }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [result, setResult] = useState(null);

  // Sync result on mount and when course changes
  useEffect(() => {
    const savedResult = quizStorage.get(course.id);
    setResult(savedResult);
    setSelectedAnswers({});
  }, [course.id]);

  if (!course.quiz || course.quiz.length === 0) return null;

  const handleOptionChange = (questionIndex, optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: optionIndex
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let score = 0;
    
    course.quiz.forEach((q, qi) => {
      const selected = selectedAnswers[qi];
      if (selected !== undefined && selected === q.correctIndex) {
        score++;
      }
    });

    const passThreshold = 0.6; // 60% passing score
    const passed = (score / course.quiz.length) >= passThreshold;
    const quizResult = { score, total: course.quiz.length, passed };

    quizStorage.save(course.id, quizResult);
    setResult(quizResult);

    if (passed && onQuizPassed) {
      onQuizPassed();
    }
  };

  const isPassed = result && result.passed;

  return (
    <div className="cert-box">
      <h3>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="5" />
          <path d="M8.5 12.5L7 22l5-3 5 3-1.5-9.5" />
        </svg>
        <span>
          {isPassed 
            ? `Certification Unlocked for ${course.title}!` 
            : `One quick check before certification`}
        </span>
      </h3>
      
      {isPassed ? (
        <>
          <p>
            Congratulations! You passed the quiz. Ready to make it official? Get a verified Dexterity Learn certificate for this course.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
            <a 
              href={course.razorpayLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-amber"
            >
              Get Certified
            </a>
            <a 
              href={`#/course/${course.id}/certificate-confirmation`} 
              className="btn btn-ghost-dark"
            >
              Already paid? Continue &rarr;
            </a>
          </div>
        </>
      ) : (
        <>
          <p>Answer a few questions about {course.title} to unlock your certificate purchase (60% passing score required).</p>
          
          <form onSubmit={handleSubmit}>
            {course.quiz.map((q, qi) => (
              <div key={qi} className="quiz-q">
                <p>{qi + 1}. {q.question}</p>
                {q.options.map((opt, oi) => {
                  const isChecked = selectedAnswers[qi] === oi;
                  return (
                    <label key={oi} className="quiz-opt">
                      <input
                        type="radio"
                        name={`q${qi}`}
                        value={oi}
                        checked={isChecked}
                        onChange={() => handleOptionChange(qi, oi)}
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            ))}
            
            <button 
              type="submit" 
              className="btn btn-amber"
              disabled={Object.keys(selectedAnswers).length < course.quiz.length}
            >
              Submit Quiz
            </button>
          </form>

          {result && !result.passed && (
            <div className="quiz-result quiz-fail">
              Score: {result.score} / {result.total} &bull; Please review the lessons above and try again!
            </div>
          )}
        </>
      )}
    </div>
  );
}

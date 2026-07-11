import React, { useState, useEffect } from 'react';
import { quizStorage } from '../utils/storage';
import siteConfig from '../data/siteConfig.json';

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

  // Prefilled WhatsApp message for certification
  const certMessage = `Hi Dexterity Learn! I want to get certified for the course: "${course.title}" (Special Offer: ₹299). I have completed all lessons and passed the client-side quiz. Please send me the payment QR code/details.`;
  const whatsappCertUrl = `${siteConfig.whatsappCommunity}?text=${encodeURIComponent(certMessage)}`;

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
            Congratulations! You passed the quiz. Claim your certification now to showcase your skills on your resume and LinkedIn:
          </p>

          <div className="cert-price-card">
            <div className="cert-price-row">
              <span className="cert-price-sale">₹299</span>
              <span className="cert-price-original">₹599</span>
              <span className="cert-price-discount">Save 50%</span>
            </div>

            <ul className="cert-bullets">
              <li>Official PDF certificate signed by mentors</li>
              <li>LinkedIn credential verification link</li>
              <li>Resume booster code credential</li>
            </ul>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <a 
              href={whatsappCertUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-amber btn-block"
            >
              Get Certified on WhatsApp
            </a>
            <a 
              href={`#/course/${course.id}/certificate-confirmation`} 
              className="mono"
              style={{ 
                fontSize: '13px', 
                color: 'var(--brand-cream)', 
                textAlign: 'center', 
                textDecoration: 'underline' 
              }}
            >
              Already paid? Verify request &rarr;
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

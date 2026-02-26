import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import TestQuestion from './TestQuestion';
import VideoQuestion from './VideoQuestion';
import { submitTest, logViolation, processProctoringSnapshot } from '../../services/api';

const TestEngine = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { session } = location.state || {};
    const [questions, setQuestions] = useState([]);
    const [videoQuestions, setVideoQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);

    const [questionTimeLeft, setQuestionTimeLeft] = useState(30);
    const [isVideoSection, setIsVideoSection] = useState(false);
    const [webcamWarnings, setWebcamWarnings] = useState(0);
    const [tabWarnings, setTabWarnings] = useState(0);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [violationMessage, setViolationMessage] = useState('');
    const [violationType, setViolationType] = useState('tab');

    const [currentVideoQuestionIndex, setCurrentVideoQuestionIndex] = useState(0);
    const [videoCompleted, setVideoCompleted] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(() => !!document.fullscreenElement);
    const [submissionResult, setSubmissionResult] = useState(null);
    const lastViolationTime = useRef(0);
    // Suppresses all violation detection during the planned MCQ→Video fullscreen transition
    const isPhaseTransitioning = useRef(false);
    // Tracks whether MCQ answers have already been submitted, to avoid double-submission
    const mcqSubmitted = useRef(false);
    const answersRef = useRef(answers);
    useEffect(() => { answersRef.current = answers; }, [answers]);

    // Refs to avoid stale closures in event listeners
    const sessionRef = useRef(session);
    const submissionResultRef = useRef(submissionResult);
    useEffect(() => { sessionRef.current = session; }, [session]);
    useEffect(() => { submissionResultRef.current = submissionResult; }, [submissionResult]);

    // Proctoring Refs
    const webcamRef = useRef(null);
    const snapshotIntervalRef = useRef(null);

    // Load session data
    useEffect(() => {
        if (!session) { navigate('/assessment/select'); return; }
        if (session.question_set) setQuestions(session.question_set);
        else if (session.questions) setQuestions(session.questions);
        if (session.video_question_set) setVideoQuestions(session.video_question_set);
        else if (session.video_questions) setVideoQuestions(session.video_questions);
        else if (session.videoQuestions) setVideoQuestions(session.videoQuestions);
        setLoading(false);
    }, [session, navigate]);

    // MCQ next
    const handleNext = useCallback(async () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setQuestionTimeLeft(30);
        } else {
            // Auto-save MCQ answers BEFORE entering video section so they're not lost if video fails
            if (!mcqSubmitted.current && session?.id) {
                mcqSubmitted.current = true;
                try {
                    await submitTest(session.id, { answers: answersRef.current });
                } catch (err) {
                    console.error('MCQ auto-save failed:', err);
                    // Don't block progress — still go to video section
                }
            }
            // Mark as transitioning BEFORE exiting fullscreen so listeners don't fire violations
            isPhaseTransitioning.current = true;
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => { });
            }
            setIsVideoSection(true);
            setCurrentVideoQuestionIndex(0);
        }
    }, [currentQuestionIndex, questions.length, session?.id, answers]);

    // MCQ 30s timer
    useEffect(() => {
        if (loading || isVideoSection || questions.length === 0 || submissionResult) return;
        setQuestionTimeLeft(30);
        const t = setInterval(() => {
            setQuestionTimeLeft(prev => {
                if (prev <= 1) return 0;
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(t);
    }, [currentQuestionIndex, isVideoSection, questions.length, loading, submissionResult]);

    // MCQ timeout → next
    useEffect(() => {
        if (!isVideoSection && questionTimeLeft === 0 && questions.length > 0 && !loading && !submissionResult) handleNext();
    }, [questionTimeLeft, isVideoSection, questions.length, loading, handleNext, submissionResult]);

    // Snapshot Loop (Strictly for MCQ Section)
    useEffect(() => {
        // Clear existing interval if any
        if (snapshotIntervalRef.current) clearInterval(snapshotIntervalRef.current);

        // ONLY run if NOT in video section, NOT loading, and NOT submitted
        if (!isVideoSection && !loading && !submissionResult && session?.id) {
            snapshotIntervalRef.current = setInterval(() => {
                captureAndAnalyzeSnapshot();
            }, 30000); // 30 seconds
        }

        return () => {
            if (snapshotIntervalRef.current) clearInterval(snapshotIntervalRef.current);
        };
    }, [isVideoSection, loading, submissionResult, session?.id]);

    const captureAndAnalyzeSnapshot = async () => {
        if (!webcamRef.current) return;
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        // Convert base64 to blob
        const blob = await (await fetch(imageSrc)).blob();
        const formData = new FormData();
        formData.append('image', blob, 'snapshot.jpg');

        try {
            const res = await processProctoringSnapshot(session.id, formData);

            if (res.status === 'terminated') {
                handleTermination();
            } else if (res.status === 'warning') {
                triggerViolation(res.reason, 'webcam');
            }
        } catch (err) {
            console.error("Proctoring Error:", err);
        }
    };

    const handleTermination = () => {
        setWebcamWarnings(100); // Trigger disqualification
        setShowWarningModal(false);
        if (snapshotIntervalRef.current) clearInterval(snapshotIntervalRef.current);
    };

    // Client-side Proctoring (Tab switch, blur/focus, fullscreen, keyboard)
    useEffect(() => {
        // Fires when browser tab is switched (works cross-platform)
        const onVisChange = () => {
            if (isPhaseTransitioning.current) return;
            if (document.hidden) triggerViolation('Tab switch detected', 'tab');
        };

        // Fires on Alt+Tab / workspace switch on Linux (visibilitychange may not fire)
        const onBlur = () => {
            if (isPhaseTransitioning.current) return;
            if (document.fullscreenElement && !submissionResultRef.current) {
                triggerViolation('Window lost focus', 'tab');
            }
        };

        // Re-check fullscreen when user returns — catches WM-level fullscreen exit
        const onFocus = () => {
            if (isPhaseTransitioning.current) return;
            if (!document.fullscreenElement && !submissionResultRef.current) {
                triggerViolation('Fullscreen exited while away', 'tab');
            }
        };

        // Safari fires pagehide/pageshow more reliably than visibilitychange
        // (especially during Mission Control and Spaces transitions on macOS)
        const onPageHide = () => {
            triggerViolation('Page hidden (tab or app switch)', 'tab');
        };

        const onFsChange = () => setIsFullScreen(!!document.fullscreenElement);
        const prevent = (e) => { e.preventDefault(); return false; };
        const onKey = (e) => {
            if (e.key === 'F12') { e.preventDefault(); return false; }
            if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) { e.preventDefault(); return false; }
            if (e.ctrlKey && e.key === 'U') { e.preventDefault(); return false; }
            // macOS: Cmd+Tab, Cmd+H, Cmd+M
            if (e.metaKey && ['Tab', 'h', 'H', 'm', 'M'].includes(e.key)) { e.preventDefault(); return false; }
        };

        document.addEventListener('visibilitychange', onVisChange);
        window.addEventListener('blur', onBlur);
        window.addEventListener('focus', onFocus);
        window.addEventListener('pagehide', onPageHide);
        document.addEventListener('fullscreenchange', onFsChange);
        // Safari uses webkit prefix for fullscreen
        document.addEventListener('webkitfullscreenchange', onFsChange);
        document.addEventListener('contextmenu', prevent);
        document.addEventListener('copy', prevent);
        document.addEventListener('paste', prevent);
        document.addEventListener('cut', prevent);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('visibilitychange', onVisChange);
            window.removeEventListener('blur', onBlur);
            window.removeEventListener('focus', onFocus);
            window.removeEventListener('pagehide', onPageHide);
            document.removeEventListener('fullscreenchange', onFsChange);
            document.removeEventListener('webkitfullscreenchange', onFsChange);
            document.removeEventListener('contextmenu', prevent);
            document.removeEventListener('copy', prevent);
            document.removeEventListener('paste', prevent);
            document.removeEventListener('cut', prevent);
            document.removeEventListener('keydown', onKey);
            if (snapshotIntervalRef.current) clearInterval(snapshotIntervalRef.current);
        };
    }, []);

    // Focus polling — catches macOS Mission Control, Spaces, and any missed blur events
    // Runs every 2s and checks document.hasFocus(); more reliable than events alone
    useEffect(() => {
        if (loading || submissionResult) return;
        const focusPoll = setInterval(() => {
            if (isPhaseTransitioning.current) return;
            const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
            if (!document.hasFocus() && fsEl && !submissionResultRef.current) {
                triggerViolation('Focus lost (polling detected)', 'tab');
            }
        }, 2000);
        return () => clearInterval(focusPoll);
    }, [loading, submissionResult]);

    // Heartbeat gap detection — catches Safari App Nap / JS execution pause
    // If the gap between ticks exceeds 6s (expected 3s), JS was suspended
    useEffect(() => {
        if (loading || submissionResult) return;
        let lastTick = Date.now();
        const heartbeat = setInterval(() => {
            const now = Date.now();
            const gap = now - lastTick;
            lastTick = now;
            if (isPhaseTransitioning.current) return;
            if (gap > 6000 && document.fullscreenElement && !submissionResultRef.current) {
                triggerViolation('Browser execution paused (possible app switch)', 'tab');
            }
        }, 3000);
        return () => clearInterval(heartbeat);
    }, [loading, submissionResult]);

    const triggerViolation = async (reason = 'Tab switch', type = 'tab') => {
        const now = Date.now();
        if (now - lastViolationTime.current < 2000) return;
        lastViolationTime.current = now;

        let currentWarnings = 0;
        if (type === 'tab') {
            setTabWarnings(prev => { currentWarnings = prev + 1; return currentWarnings; });
        } else {
            setWebcamWarnings(prev => { currentWarnings = prev + 1; return currentWarnings; });
        }

        setViolationMessage(reason);
        setViolationType(type);
        setShowWarningModal(true);

        // Use ref to always get latest session (avoids stale closure from useEffect [])
        const currentSession = sessionRef.current;

        // We only log client-side violations here (like tab switch). 
        // Snapshot violations are logged by the server.
        if (currentSession?.id && type === 'tab') {
            try {
                const res = await logViolation(currentSession.id, { violation_type: 'tab_switch' });
                if (res.status === 'terminated') {
                    handleTermination();
                }
            } catch (error) {
                console.error('Failed to log violation:', error);
            }
        }
    };

    const enterFullScreen = () => {
        document.documentElement.requestFullscreen().catch(console.error);
        setIsFullScreen(true);
        // Phase transition is complete — re-enable violation detection
        isPhaseTransitioning.current = false;
    };

    const handleAnswer = (optionKey) => {
        setAnswers(prev => ({ ...prev, [questions[currentQuestionIndex].id]: optionKey }));
    };

    const handleVideoComplete = () => {
        if (currentVideoQuestionIndex < videoQuestions.length - 1) {
            setCurrentVideoQuestionIndex(prev => prev + 1);
        } else {
            setVideoCompleted(true);
            handleSubmitTest();
        }
    };

    const handleSubmitTest = async () => {
        try {
            if (snapshotIntervalRef.current) clearInterval(snapshotIntervalRef.current);

            if (document.fullscreenElement) {
                try { await document.exitFullscreen(); } catch (e) { /* ignore */ }
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            // Only submit MCQ answers if not already auto-saved when transitioning to video
            if (!mcqSubmitted.current) {
                mcqSubmitted.current = true;
                const res = await submitTest(session.id, { answers });
                navigate('/assessment/result', {
                    state: { result: { ...res, passed: res.passed ?? (res.score >= 0) } }
                });
            } else {
                // MCQ was already submitted — just navigate to result
                navigate('/assessment/result', { state: { result: { score: null, alreadySubmitted: true } } });
            }
        } catch (err) {
            console.error('Failed to submit test:', err);
            alert('Submission failed. Please try again.');
        }
    };

    // --- Styles ---
    const s = {
        page: { minHeight: '100vh', background: '#f9fafb', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', system-ui, sans-serif", userSelect: 'none' },
        center: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', fontFamily: "'Inter', system-ui, sans-serif", padding: 32 },
        card: { background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '48px 40px', maxWidth: 500, width: '100%', textAlign: 'center' },
        header: { position: 'fixed', top: 0, left: 0, right: 0, height: 56, background: '#fff', borderBottom: '1px solid #e5e7eb', zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' },
        btnPrimary: { padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer', background: '#059669', color: '#fff' },
        btnDanger: { padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer', background: '#dc2626', color: '#fff', width: '100%' },
        webcamContainer: { position: 'fixed', bottom: 20, right: 20, width: 140, height: 105, background: '#000', borderRadius: 8, overflow: 'hidden', zIndex: 50, border: '2px solid #fff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }
    };

    if (loading || !session) {
        return (
            <div style={s.center}>
                <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
        );
    }

    // Disqualified
    if (webcamWarnings > 3 || tabWarnings > 3) {
        return (
            <div style={s.center}>
                <div style={s.card}>
                    <div style={{ fontSize: 56, marginBottom: 16 }}>🚫</div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: '#dc2626', margin: '0 0 12px' }}>Assessment Terminated</h1>
                    <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, marginBottom: 24 }}>
                        You exceeded the maximum proctoring violations. Your assessment has been automatically concluded, and your current progress has been submitted.
                    </p>
                    <button onClick={handleSubmitTest} style={s.btnPrimary}>View Assessment Result</button>
                </div>
            </div>
        );
    }

    // Fullscreen prompt
    if (!isFullScreen && !submissionResult) {
        return (
            <div style={s.center}>
                <div style={s.card}>
                    <div style={{ fontSize: 56, marginBottom: 16 }}>🖥️</div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>Fullscreen Required</h1>
                    <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, marginBottom: 24 }}>
                        This assessment must be taken in fullscreen mode. Exiting fullscreen will count as a violation.
                    </p>
                    <button onClick={enterFullScreen} style={s.btnPrimary}>🖥️ Enter Fullscreen & Begin</button>
                </div>
            </div>
        );
    }

    const progressPct = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

    return (
        <div style={s.page} onContextMenu={e => e.preventDefault()} onCopy={e => e.preventDefault()} onCut={e => e.preventDefault()} onPaste={e => e.preventDefault()}>

            {/* Warning Modal */}
            {showWarningModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 420, width: '100%', margin: 16, textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
                        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Proctoring Warning</h2>
                        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>{violationMessage || 'Violation detected.'}</p>
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', fontSize: 16, fontWeight: 700, color: '#dc2626', marginBottom: 20 }}>
                            {violationType === 'tab' ? `Tab Violations Remaining: ${Math.max(0, 3 - tabWarnings)}` : `Webcam Violations Remaining: ${Math.max(0, 3 - webcamWarnings)}`}
                        </div>
                        <button onClick={() => setShowWarningModal(false)} style={s.btnDanger}>I Understand & Resume</button>
                    </div>
                </div>
            )}

            {/* Webcam (always active during MCQ, except when submitted) */}
            {!isVideoSection && !submissionResult && (
                <div style={s.webcamContainer}>
                    <Webcam
                        ref={webcamRef}
                        audio={false}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ width: 1280, height: 720, facingMode: "user" }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onUserMedia={() => console.log('Webcam started')}
                        onUserMediaError={(err) => console.error('Webcam error:', err)}
                    />
                </div>
            )}

            {/* Header / Timer Bar */}
            <header style={s.header}>
                <div></div> {/* Empty div to keep flex alignment for the right-side timer */}

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {/* MCQ timer only — video timer is inside VideoQuestion */}
                    {!isVideoSection && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 13 }}>⏱</span>
                            <span style={{
                                fontFamily: 'monospace', fontSize: 18, fontWeight: 700,
                                color: questionTimeLeft < 10 ? '#dc2626' : '#111827',
                            }}>
                                {String(questionTimeLeft).padStart(2, '0')}s
                            </span>
                        </div>
                    )}

                    <span style={{
                        fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 20,
                        background: isVideoSection ? '#f5f3ff' : '#ecfdf5',
                        color: isVideoSection ? '#7c3aed' : '#059669',
                    }}>
                        {isVideoSection ? '🎥 Video' : '📝 MCQ'}
                    </span>

                    {(webcamWarnings > 0 || tabWarnings > 0) && (
                        <div style={{ display: 'flex', gap: 6 }}>
                            {tabWarnings > 0 && (
                                <span style={{ fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 20, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                                    ⚠ Tab: {tabWarnings}/3
                                </span>
                            )}
                            {webcamWarnings > 0 && (
                                <span style={{ fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 20, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                                    ⚠ Cam: {webcamWarnings}/3
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </header>

            {/* Progress bar */}
            {!isVideoSection && questions.length > 0 && (
                <div style={{ position: 'fixed', top: 56, left: 0, right: 0, height: 4, background: '#e5e7eb', zIndex: 30 }}>
                    <div style={{ height: '100%', background: '#059669', transition: 'width 0.5s ease', width: `${progressPct}%` }}></div>
                </div>
            )}

            {/* Main content */}
            <main style={{ flex: 1, marginTop: 56, padding: '40px 24px', maxWidth: 800, margin: '56px auto 0', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 'calc(100vh - 56px)' }}>

                {/* MCQ Section */}
                {!isVideoSection && questions.length > 0 && (
                    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '32px 28px' }}>
                        <TestQuestion
                            question={questions[currentQuestionIndex]}
                            questionIndex={currentQuestionIndex}
                            totalQuestions={questions.length}
                            onSelectAnswer={handleAnswer}
                            selectedAnswer={answers[questions[currentQuestionIndex]?.id]}
                        />
                        <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={handleNext} style={s.btnPrimary}>
                                {currentQuestionIndex === questions.length - 1 ? 'Proceed to Video →' : 'Next Question →'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Video Section*/}
                {isVideoSection && !videoCompleted && videoQuestions.length > 0 && (
                    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '32px 28px' }}>
                        <VideoQuestion
                            key={`video-${currentVideoQuestionIndex}`}
                            question={videoQuestions[currentVideoQuestionIndex]}
                            questionIndex={currentVideoQuestionIndex}
                            totalVideoQuestions={videoQuestions.length}
                            sessionId={session.id}
                            onVideoUploaded={handleVideoComplete}
                        />
                    </div>
                )}

                {/* No video questions → submit */}
                {isVideoSection && videoQuestions.length === 0 && !submissionResult && (
                    <div style={{ ...s.card, margin: '0 auto' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>📤</div>
                        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Review & Submit</h2>
                        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>All questions completed. Ready to submit.</p>
                        <button onClick={handleSubmitTest} style={s.btnPrimary}>Submit Assessment</button>
                    </div>
                )}

                {/* No MCQs */}
                {!isVideoSection && questions.length === 0 && (
                    <div style={{ ...s.card, margin: '0 auto' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>No Questions Available</h2>
                        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>No MCQ questions for the selected domains.</p>
                        {videoQuestions.length > 0 && (
                            <button onClick={() => { setIsVideoSection(true); setCurrentVideoQuestionIndex(0); }} style={s.btnPrimary}>
                                Proceed to Video Questions
                            </button>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default TestEngine;
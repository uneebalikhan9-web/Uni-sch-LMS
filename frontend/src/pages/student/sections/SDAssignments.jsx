import React from 'react';
import { ClipboardText, FileText, VideoCamera, Play, LockKey, Question, SpeakerHigh, CheckCircle, PaperPlaneRight, Sparkle, Clock } from "@phosphor-icons/react";
import { S } from './SDStyles';
import VideoPlayer from './VideoPlayer';

export default function SDAssignments({ 
  assignments, 
  setSelectedAssignment, 
  setShowSubmitModal, 
  setSubmissionText 
}) {
  const [playingVideoId, setPlayingVideoId] = React.useState(null);
  const [completedVideos, setCompletedVideos] = React.useState({});
  const [quizAnswers, setQuizAnswers] = React.useState({});
  const [submittingQuizId, setSubmittingQuizId] = React.useState(null);

  const speakQuestion = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Speech synthesis is not supported in this browser.');
    }
  };

  const handleVideoCompleted = async (assignmentId) => {
    setCompletedVideos(prev => ({ ...prev, [assignmentId]: true }));
    try {
      const token = sessionStorage.getItem('token');
      await fetch(`${API_BASE_URL}/api/submissions/video-completed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ assignment_id: assignmentId })
      });
    } catch (e) {
      console.error('Failed to mark video completed:', e);
    }
  };

  const handleQuizSubmit = async (assignmentId) => {
    setSubmittingQuizId(assignmentId);
    try {
      const token = sessionStorage.getItem('token');
      const answersObj = quizAnswers[assignmentId] || {};
      const formattedAnswers = Object.entries(answersObj).map(([idx, ans]) => `Q${parseInt(idx)+1}: ${ans}`).join('\n\n');

      const res = await fetch(`${API_BASE_URL}/api/submissions/${assignmentId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ submission_text: formattedAnswers })
      });
      const data = await res.json();
      if (data.success) {
        alert('Quiz answers submitted successfully!');
        window.location.reload();
      } else {
        alert(data.message || 'Error submitting quiz');
      }
    } catch (e) {
      alert('Error submitting quiz: ' + (e.message || 'Network error'));
    } finally {
      setSubmittingQuizId(null);
    }
  };

  return (
    <div style={S.tableCard} className="table-container animate-fadeIn">
      <div style={S.tableHeader}>
        <h2 style={S.tableTitle}>
          <ClipboardText size={28} weight="duotone" color="#0891b2" style={{verticalAlign:'middle', marginRight:'12px'}} />
          My Assignments
        </h2>
      </div>
      <div style={S.assignmentsList}>
        {assignments.length === 0 ? (
          <div style={S.emptyState}>
            <FileText size={48} weight="duotone" color="#94a3b8" />
            <p>No assignments assigned yet.</p>
          </div>
        ) : (
          assignments.map(a => {
            const isVideoLecture = a.assignment_type === 'Video Lecture';
            let isVideoExpired = false;
            let embedUrl = null;
            
            if (isVideoLecture && a.external_link) {
              const createdDate = new Date(a.created_at);
              const diffHours = (new Date() - createdDate) / (1000 * 60 * 60);
              if (diffHours >= 24) {
                isVideoExpired = true;
              } else {
                const ytMatch = a.external_link.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
                if (ytMatch && ytMatch[1]) {
                  embedUrl = ytMatch[1]; // Store just the ID for react-youtube
                } else {
                  embedUrl = null; // Can't play non-YT properly with this player
                }
              }
            }

            return (
            <div key={a.id} style={S.assignmentCard}>
              <div style={S.assignmentHeader}>
                <div>
                  <span style={S.assignmentCourse}>{a.course_title}</span>
                  <span style={S.assignmentDue}>Due: {new Date(a.due_date).toLocaleDateString()}</span>
                </div>
                {a.marks_obtained ? (
                  <span style={S.scoreBadge}>{a.marks_obtained}/{a.max_marks}</span>
                ) : !isVideoLecture ? (
                  <span style={{
                    ...S.statusBadge,
                    background: a.submitted_at ? '#e0e7ff' : '#fee2e2',
                    color: a.submitted_at ? '#4338ca' : '#991b1b'
                  }}>
                    {a.submitted_at ? 'Submitted' : 'Pending'}
                  </span>
                ) : null}
              </div>

              <h3 style={S.assignmentTitle}>{a.title}</h3>
              <p style={S.assignmentDesc}>{a.description}</p>
              
              {a.feedback && (
                <div style={S.feedbackBox}>
                  <p style={S.feedbackLabel}>Teacher Feedback:</p>
                  <p style={S.feedbackText}>{a.feedback}</p>
                </div>
              )}

              {/* External Link / Video Render */}
              {a.external_link && !isVideoLecture && (
                <div style={{ marginTop: '12px' }}>
                  <a 
                    href={a.external_link} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ display: 'inline-block', padding: '6px 14px', background: '#e0e7ff', color: '#4f46e5', textDecoration: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px' }}
                  >
                    🔗 Open Resource Link
                  </a>
                </div>
              )}

              {isVideoLecture && (
                <div style={{ marginTop: '20px', borderTop: '1.5px dashed #e2e8f0', paddingTop: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}>
                        <VideoCamera size={20} weight="fill" />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, color: '#0f172a', fontSize: '15px', fontWeight: '800' }}>Interactive Video Lecture</h4>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Watch full video lecture to unlock assessment quiz</span>
                      </div>
                    </div>

                    {(a.is_video_completed || completedVideos[a.id]) && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: '#dcfce7', color: '#15803d', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>
                        <CheckCircle size={15} weight="fill" /> Video Completed
                      </span>
                    )}
                  </div>

                  {embedUrl ? (
                    <div>
                      {playingVideoId === a.id ? (
                        <>
                          <VideoPlayer 
                            videoId={embedUrl} 
                            assignmentId={a.id} 
                            onClose={() => setPlayingVideoId(null)}
                            onVideoEnd={() => handleVideoCompleted(a.id)}
                          />
                          {!a.is_video_completed && !completedVideos[a.id] && (
                            <button
                              onClick={() => handleVideoCompleted(a.id)}
                              style={{ marginTop: '12px', padding: '9px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                              <CheckCircle size={16} weight="fill" /> I Have Completed Watching Video
                            </button>
                          )}
                        </>
                      ) : (
                        <button 
                          onClick={() => setPlayingVideoId(a.id)}
                          style={{ padding: '11px 22px', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 6px 18px rgba(79,70,229,0.3)', transition: 'all 0.2s' }}
                        >
                          <Play size={18} weight="fill" /> Watch Video Lecture
                        </button>
                      )}

                      {/* Video Quiz Section */}
                      {(() => {
                        const rawQs = a.video_questions;
                        const questionsList = typeof rawQs === 'string' ? JSON.parse(rawQs || '[]') : (rawQs || []);
                        const isUnlocked = a.is_video_completed || a.submitted_at || completedVideos[a.id] || questionsList.length === 0;

                        if (questionsList.length === 0) return null;

                        return (
                          <div style={{ marginTop: '20px', background: isUnlocked ? '#ffffff' : '#f8fafc', borderRadius: '16px', padding: '20px', border: `1.5px solid ${isUnlocked ? '#cbd5e1' : '#e2e8f0'}`, boxShadow: isUnlocked ? '0 8px 24px rgba(0,0,0,0.04)' : 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: isUnlocked ? '#eef2ff' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isUnlocked ? '#4f46e5' : '#94a3b8' }}>
                                  <Question size={20} weight="bold" />
                                </div>
                                <div>
                                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                                    Post-Lecture Assessment Quiz ({questionsList.length} Questions)
                                  </h4>
                                  <span style={{ fontSize: '12px', color: '#64748b' }}>Evaluate your learning after finishing the video</span>
                                </div>
                              </div>

                              {!isUnlocked ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: '#fef3c7', color: '#92400e', borderRadius: '20px', fontSize: '12px', fontWeight: '800', border: '1px solid #fde68a' }}>
                                  <LockKey size={16} weight="fill" /> Locked – Watch Full Video First
                                </span>
                              ) : (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: '#dcfce7', color: '#15803d', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>
                                  <CheckCircle size={16} weight="fill" /> Questions Unlocked
                                </span>
                              )}
                            </div>

                            {!isUnlocked ? (
                              <div style={{ padding: '14px 16px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Clock size={22} color="#94a3b8" weight="duotone" />
                                <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
                                  Please watch the video lecture completely. Once finished, all assessment questions will automatically unlock for you to answer.
                                </p>
                              </div>
                            ) : (
                              <div>
                                <div style={{ padding: '12px 16px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0', marginBottom: '16px', fontSize: '13px', color: '#15803d', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <Sparkle size={18} weight="fill" />
                                  <span>Video completed! Click 🔊 Listen Question to hear audio and type your answers below.</span>
                                </div>

                                {questionsList.map((qText, qIdx) => (
                                  <div key={qIdx} style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', marginBottom: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '12px' }}>
                                      <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '13.5px' }}>
                                        Question {qIdx + 1}: <span style={{ fontWeight: '600', color: '#334155' }}>{qText}</span>
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => speakQuestion(qText)}
                                        style={{ padding: '6px 12px', background: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', flexShrink: 0, transition: 'all 0.2s' }}
                                        title="Listen to question audio"
                                      >
                                        <SpeakerHigh size={16} weight="fill" /> Listen Question
                                      </button>
                                    </div>

                                    {a.submission_text ? (
                                      <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', color: '#334155', border: '1px solid #f1f5f9' }}>
                                        <strong style={{ color: '#475569', display: 'block', marginBottom: '4px' }}>Your Submitted Response:</strong>
                                        <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit', color: '#0f172a', fontWeight: '600' }}>{a.submission_text}</pre>
                                      </div>
                                    ) : (
                                      <textarea
                                        rows="3"
                                        placeholder="Type your answer clearly..."
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                                        value={(quizAnswers[a.id] && quizAnswers[a.id][qIdx]) || ''}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setQuizAnswers(prev => ({
                                            ...prev,
                                            [a.id]: { ...(prev[a.id] || {}), [qIdx]: val }
                                          }));
                                        }}
                                      />
                                    )}
                                  </div>
                                ))}

                                {!a.submission_text && (
                                  <button
                                    onClick={() => handleQuizSubmit(a.id)}
                                    disabled={submittingQuizId === a.id}
                                    style={{ marginTop: '10px', padding: '12px 24px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}
                                  >
                                    <PaperPlaneRight size={18} weight="bold" /> {submittingQuizId === a.id ? 'Submitting Responses...' : 'Submit Quiz Answers'}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <a 
                      href={a.external_link} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ display: 'inline-block', padding: '6px 14px', background: '#e0e7ff', color: '#4f46e5', textDecoration: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px' }}
                    >
                      Open Video Link
                    </a>
                  )}
                </div>
              )}

              {!a.marks_obtained && !a.submitted_at && !isVideoLecture && (
                <button 
                  onClick={() => { 
                    setSelectedAssignment(a); 
                    setShowSubmitModal(true); 
                    setSubmissionText(a.submission_text || ''); 
                  }}
                  style={{
                    ...S.submitBtn,
                    background: 'var(--primary-color, #4f46e5)',
                    color: '#fff',
                    marginTop: '16px'
                  }}
                >
                  Submit Assignment
                </button>
              )}
            </div>
          );
        })
        )}
      </div>
    </div>
  );
}

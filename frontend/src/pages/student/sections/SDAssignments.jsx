import React from 'react';
import { ClipboardText, FileText } from "@phosphor-icons/react";
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
      alert('Network error submitting quiz');
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
                <div style={{ marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '15px', fontWeight: '800' }}>📹 Lecture Video</h4>
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
                              style={{ marginTop: '10px', padding: '8px 14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                            >
                              ✓ I Have Completed Watching Video
                            </button>
                          )}
                        </>
                      ) : (
                        <button 
                          onClick={() => setPlayingVideoId(a.id)}
                          style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#4f46e5,#6366f1)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(79,70,229,0.25)' }}
                        >
                          ▶ Watch Video Lecture
                        </button>
                      )}

                      {/* Video Quiz Questions Section */}
                      {(() => {
                        const rawQs = a.video_questions;
                        const questionsList = typeof rawQs === 'string' ? JSON.parse(rawQs || '[]') : (rawQs || []);
                        const isUnlocked = a.is_video_completed || a.submitted_at || completedVideos[a.id] || questionsList.length === 0;

                        if (questionsList.length === 0) return null;

                        return (
                          <div style={{ marginTop: '20px', background: isUnlocked ? '#f8fafc' : '#f1f5f9', borderRadius: '14px', padding: '18px', border: `1.5px solid ${isUnlocked ? '#cbd5e1' : '#e2e8f0'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                                ❓ Video Lecture Quiz Questions ({questionsList.length})
                              </h4>
                              {!isUnlocked && (
                                <span style={{ padding: '4px 10px', background: '#fef3c7', color: '#92400e', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>
                                  🔒 Locked - Watch Full Video First
                                </span>
                              )}
                            </div>

                            {!isUnlocked ? (
                              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                                Please watch the video lecture completely. Once finished, these questions will unlock automatically for you to answer.
                              </p>
                            ) : (
                              <div>
                                <p style={{ fontSize: '12px', color: '#059669', fontWeight: '700', marginBottom: '14px' }}>
                                  ✅ Video Completed! Answer the questions below. Click 🔊 to listen to any question out loud.
                                </p>

                                {questionsList.map((qText, qIdx) => (
                                  <div key={qIdx} style={{ background: '#ffffff', borderRadius: '10px', padding: '14px', marginBottom: '12px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '10px' }}>
                                      <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '13px' }}>
                                        Question {qIdx + 1}: {qText}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => speakQuestion(qText)}
                                        style={{ padding: '4px 10px', background: '#eef2ff', color: '#4f46e5', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}
                                        title="Listen to question"
                                      >
                                        🔊 Listen Question
                                      </button>
                                    </div>

                                    {a.submission_text ? (
                                      <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: '#334155', marginTop: '6px' }}>
                                        <strong>Your Submitted Answers:</strong>
                                        <pre style={{ whiteSpace: 'pre-wrap', margin: '4px 0 0', fontFamily: 'inherit' }}>{a.submission_text}</pre>
                                      </div>
                                    ) : (
                                      <textarea
                                        rows="2"
                                        placeholder="Type your answer here..."
                                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
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
                                    style={{ marginTop: '8px', padding: '10px 22px', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}
                                  >
                                    {submittingQuizId === a.id ? 'Submitting...' : '🚀 Submit Quiz Answers'}
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

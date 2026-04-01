import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import FeedbackModal from '../components/FeedbackModal';
import Editor from '@monaco-editor/react';
import { FileCode, X, FloppyDisk, TerminalWindow, ArrowLeft } from '@phosphor-icons/react';

const LabPlayer = ({ labName: propLabName, labId: propLabId, url: propUrl, environment: propEnvironment, user: propUser, onBack }) => {
    const { labId: paramLabId } = useParams();
    const navigate = useNavigate();
    const [logId, setLogId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submissionText, setSubmissionText] = useState('');
    const [showSubmission, setShowSubmission] = useState(false);
    
    // Resolve labId and user info
    const labId = propLabId || paramLabId;
    const user = propUser || JSON.parse(sessionStorage.getItem('user'));
    const labName = propLabName || labId || "Untitled Lab";
    
    // Clean URL: Remove leading semicolons or accidental characters
    let labUrl = propUrl || `https://onecompiler.com/embed/${labId || 'python'}?theme=dark`;
    if (labUrl.startsWith(';')) labUrl = labUrl.substring(1);
    // If it's just a domain, ensure it has https
    if (labUrl && !labUrl.startsWith('http')) labUrl = 'https://' + labUrl;
    
    // Auto-append dark theme for OneCompiler if not present
    if (labUrl.includes('onecompiler.com') && !labUrl.includes('theme=')) {
        labUrl += (labUrl.includes('?') ? '&' : '?') + 'theme=dark';
    }

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        const startLabSession = async () => {
            if (!user || !user.id || !labId) {
                setLoading(false);
                return;
            }
            try {
                const response = await axios.post(`${API_BASE}/labs/log-start`, {
                    studentId: user.id,
                    labName: labName
                });
                
                if (response.data.success) {
                    setLogId(response.data.logId);
                }
            } catch (error) {
                console.error('Failed to log lab start:', error);
            } finally {
                // Short artificial delay to make it feel like "Provisioning"
                setTimeout(() => setLoading(false), 800);
            }
        };

        startLabSession();

        return () => {
            if (logId) {
                axios.post(`${API_BASE}/labs/log-end`, {
                    logId: logId
                }).catch(err => console.error('Failed to log lab end on unmount:', err));
            }
        };
    }, [labId, user?.id]);

    const [showFeedback, setShowFeedback] = useState(false);

    const handleFinish = async () => {
        if (!submissionText.trim()) {
            if (!window.confirm("You have not submitted any code. Are you sure you want to terminate the session without saving?")) {
                return;
            }
        }

        if (logId) {
            try {
                await axios.post(`${API_BASE}/labs/log-end`, {
                    logId: logId,
                    submission: submissionText
                });
            } catch (error) {
                console.error('Error logging lab finish:', error);
            }
        }
        setShowFeedback(true);
    };

    const submitFeedback = async (feedbackData) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.post(`${API_BASE}/feedback`, {
                labId: labId,
                rating: feedbackData.rating,
                comment: feedbackData.comment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Error submitting feedback:', error);
        } finally {
            navigate(-1);
        }
    };

    if (loading) {
        return (
            <div style={{
                height: '70vh', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                background: '#0f172a', 
                borderRadius: '24px',
                color: '#fff',
                gap: '20px'
            }}>
                <div style={{
                    width: '50px', 
                    height: '50px', 
                    border: '4px solid rgba(255,255,255,0.1)', 
                    borderTop: '4px solid #7c3aed', 
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <div style={{textAlign: 'center'}}>
                    <h3 style={{margin: 0, fontSize: '1.2rem'}}>Provisioning Environment</h3>
                    <p style={{margin: '5px 0 0', color: '#94a3b8', fontSize: '0.9rem'}}>Connecting to secure cloud instance...</p>
                </div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex', 
            flexDirection: 'column', 
            height: '92vh', 
            width: '100%',
            background: '#0f172a', 
            borderRadius: '16px', 
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid #1e293b'
        }}>
            {/* Lab Toolbar */}
            <header style={{
                padding: '12px 24px', 
                background: 'linear-gradient(90deg, #1e293b, #0f172a)', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderBottom: '1px solid #334155'
            }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                    {onBack && (
                        <button 
                            onClick={onBack}
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                color: '#fff',
                                padding: '8px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            title="Back to Labs"
                        >
                            <ArrowLeft size={18} weight="bold" />
                        </button>
                    )}
                    <div style={{
                        background: '#7c3aed', 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '8px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '18px'
                    }}>🔬</div>
                    <div>
                        <h1 style={{fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc', margin: 0}}>
                            {labName}
                        </h1>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <div style={{width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%'}}></div>
                            <span style={{fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Session Active</span>
                        </div>
                    </div>
                </div>

                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <div style={{
                        padding: '6px 12px', 
                        background: 'rgba(255,255,255,0.05)', 
                        borderRadius: '6px', 
                        fontSize: '0.8rem', 
                        color: '#94a3b8',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        {user?.name || 'Student'}
                    </div>
                    <button 
                        onClick={handleFinish}
                        style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '10px',
                            fontWeight: '700',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                        Terminate Session
                    </button>
                </div>
            </header>
            
            {/* Lab Viewport */}
            <main style={{
                flex: 1, 
                width: '100%',
                position: 'relative', 
                background: '#1e1e1e', // VS Code default background
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'stretch',
                overflow: 'hidden'
            }}>
                <div style={{ flex: '1 1 auto', position: 'relative', display: 'flex', flexDirection: 'column', width: '100%', minWidth: '0' }}>
                    <div style={{ width: '100%', padding: '8px 16px', background: '#252526', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: '8px', color: '#9cdcfe', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}>
                        <TerminalWindow size={16} /> interactive_terminal.exe
                    </div>
                    <iframe 
                        src={labUrl}
                        title="Cloud Lab Player"
                        style={{
                            width: '100%', 
                            height: '100%', 
                            flex: 1,
                            border: 'none',
                            background: '#1e1e1e',
                            display: 'block'
                        }}
                        allow="clipboard-read; clipboard-write; microphone; camera; display-capture"
                    />
                </div>

                {showSubmission && (
                    <div style={{
                        width: '500px',
                        background: '#1e1e1e', // VS Code dark
                        borderLeft: '1px solid #333',
                        display: 'flex',
                        flexDirection: 'column',
                        animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                        <div style={{
                            background: '#2d2d2d', 
                            padding: '10px 16px', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            borderBottom: '1px solid #1e1e1e'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileCode size={18} color="#4fc1ff" />
                                <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#fff' }}>final_submission.code</span>
                            </div>
                            <button 
                                onClick={() => setShowSubmission(false)}
                                style={{
                                    background: 'transparent', 
                                    border: 'none', 
                                    color: '#ccc', 
                                    cursor: 'pointer', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    padding: '4px', 
                                    borderRadius: '4px', 
                                    transition: 'all 0.2s', 
                                    ':hover': { background: '#3c3c3c', color: '#fff' }
                                }}
                                title="Close Editor"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        
                        <div style={{ padding: '16px', borderBottom: '1px solid #333' }}>
                            <h3 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: '600' }}>
                                Source Code Submission
                            </h3>
                            <p style={{ color: '#9cdcfe', fontSize: '0.8rem', margin: 0, lineHeight: '1.4' }}>
                                Format and finalize your complete source code here. This code will be persisted for final instructor evaluation. Review thoroughly before submission.
                            </p>
                        </div>

                        <div style={{ flex: 1, position: 'relative' }}>
                            <Editor
                                height="100%"
                                language={propEnvironment ? propEnvironment.toLowerCase() : "javascript"}
                                theme="vs-dark"
                                value={submissionText}
                                onChange={(value) => setSubmissionText(value || '')}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                                    wordWrap: 'on',
                                    scrollBeyondLastLine: false,
                                    padding: { top: 12 },
                                    smoothScrolling: true,
                                    cursorBlinking: "smooth",
                                    cursorSmoothCaretAnimation: "on",
                                    formatOnPaste: true,
                                    lineNumbers: "on",
                                    renderLineHighlight: "all"
                                }}
                            />
                        </div>

                        <div style={{ padding: '16px', background: '#252526', borderTop: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#6b7280', fontSize: '12px', fontFamily: 'monospace' }}>
                                {submissionText.length} bytes
                            </span>
                            <button 
                                onClick={handleFinish}
                                style={{
                                    background: '#0e639c', // VS Code button blue
                                    color: '#fff',
                                    border: '1px solid transparent',
                                    padding: '8px 16px',
                                    borderRadius: '2px',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'background 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#1177bb'}
                                onMouseOut={(e) => e.currentTarget.style.background = '#0e639c'}
                            >
                                <FloppyDisk size={16} /> Save & Terminate
                            </button>
                        </div>
                    </div>
                )}

                {!showSubmission && (
                    <button 
                        onClick={() => setShowSubmission(true)}
                        style={{
                            position: 'absolute',
                            right: '24px',
                            bottom: '24px',
                            background: '#0e639c',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '12px 20px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                            zIndex: 10,
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = '#1177bb';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = '#0e639c';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <FileCode size={18} /> Open Final Submission
                    </button>
                )}
            </main>
            <style>{`
                @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
            `}</style>

            <FeedbackModal 
                isOpen={showFeedback}
                onClose={() => navigate(-1)}
                onSubmit={submitFeedback}
                title={`Rate Lab: ${labName}`}
            />
        </div>
    );
};

export default LabPlayer;

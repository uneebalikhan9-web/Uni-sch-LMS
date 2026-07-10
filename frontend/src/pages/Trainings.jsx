import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CalendarBlank, Briefcase, CaretLeft, Sparkle } from '@phosphor-icons/react';
import API_BASE_URL from '../config/api';

export default function Trainings() {
  const [trainings, setTrainings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/trainings`);
      if (res.data.success) {
        setTrainings(res.data.trainings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const S = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      color: '#fff',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden',
    },
    bgOrb1: {
      position: 'absolute',
      width: '600px',
      height: '600px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(79, 70, 229, 0.2) 0%, transparent 70%)',
      top: '-200px',
      left: '-200px',
      zIndex: 0,
    },
    bgOrb2: {
      position: 'absolute',
      width: '500px',
      height: '500px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
      bottom: '-100px',
      right: '-100px',
      zIndex: 0,
    },
    content: {
      position: 'relative',
      zIndex: 10,
      maxWidth: '1200px',
      margin: '0 auto',
    },
    header: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      marginBottom: '60px',
      marginTop: '40px',
    },
    backBtn: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      color: '#fff',
      padding: '10px 20px',
      borderRadius: '30px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      backdropFilter: 'blur(10px)',
      marginBottom: '30px',
      alignSelf: 'flex-start',
      transition: 'all 0.3s ease',
    },
    badge: {
      background: 'rgba(79, 70, 229, 0.2)',
      color: '#a5b4fc',
      padding: '8px 16px',
      borderRadius: '30px',
      fontSize: '0.9rem',
      fontWeight: '700',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      border: '1px solid rgba(79, 70, 229, 0.3)',
      marginBottom: '16px',
    },
    title: {
      fontSize: '3.5rem',
      fontWeight: '800',
      margin: '0 0 16px 0',
      letterSpacing: '-0.03em',
      background: 'linear-gradient(135deg, #fff, #94a3b8)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    subtitle: {
      fontSize: '1.2rem',
      color: '#94a3b8',
      maxWidth: '600px',
      lineHeight: '1.6',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '30px',
    },
    card: {
      background: 'rgba(30, 41, 59, 0.5)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '24px',
      overflow: 'hidden',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.3)',
      display: 'flex',
      flexDirection: 'column',
    },
    imageContainer: {
      height: '200px',
      background: 'rgba(15, 23, 42, 0.8)',
      position: 'relative',
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.5s ease',
    },
    cardBody: {
      padding: '30px',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
    },
    statusBadge: (status) => ({
      position: 'absolute',
      top: '16px',
      right: '16px',
      background: status === 'ongoing' ? 'rgba(34, 197, 94, 0.2)' : status === 'upcoming' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(100, 116, 139, 0.2)',
      color: status === 'ongoing' ? '#4ade80' : status === 'upcoming' ? '#fde047' : '#cbd5e1',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '700',
      backdropFilter: 'blur(10px)',
      border: `1px solid ${status === 'ongoing' ? 'rgba(34, 197, 94, 0.3)' : status === 'upcoming' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(100, 116, 139, 0.3)'}`,
      textTransform: 'uppercase',
    }),
    cardTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      margin: '0 0 12px 0',
      color: '#fff',
    },
    cardDesc: {
      color: '#94a3b8',
      fontSize: '0.95rem',
      lineHeight: '1.6',
      marginBottom: '24px',
      flex: 1,
    },
    metaData: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#cbd5e1',
      fontSize: '0.9rem',
      fontWeight: '500',
      marginBottom: '12px',
    },
    metaIcon: {
      color: '#818cf8',
    },
    applyBtn: {
      width: '100%',
      padding: '14px',
      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
      color: '#fff',
      border: 'none',
      borderRadius: '16px',
      fontSize: '1rem',
      fontWeight: '700',
      cursor: 'pointer',
      marginTop: '20px',
      transition: 'all 0.3s ease',
      boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.4)',
    },
    loadingSpinner: {
      width: '50px',
      height: '50px',
      border: '4px solid rgba(255, 255, 255, 0.1)',
      borderTop: '4px solid #4f46e5',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto',
    }
  };

  return (
    <div style={S.container}>
      <style>
        {`
          @keyframes spin { 100% { transform: rotate(360deg); } }
          .training-card:hover {
            transform: translateY(-10px);
            border-color: rgba(129, 140, 248, 0.5);
            box-shadow: 0 20px 40px -10px rgba(79, 70, 229, 0.3);
          }
          .training-card:hover .card-img {
            transform: scale(1.05);
          }
          .back-btn:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: translateX(-5px);
          }
          .apply-btn:hover {
            box-shadow: 0 15px 25px -5px rgba(79, 70, 229, 0.6);
            transform: translateY(-2px);
          }
        `}
      </style>
      
      <div style={S.bgOrb1}></div>
      <div style={S.bgOrb2}></div>

      <div style={S.content}>
        <button style={S.backBtn} className="back-btn" onClick={() => navigate(-1)}>
          <CaretLeft size={20} weight="bold" /> Back
        </button>

        <div style={S.header}>
          <div style={S.badge}>
            <Sparkle size={16} weight="fill" />
            Lancers Tech Excellence
          </div>
          <h1 style={S.title}>Professional Trainings</h1>
          <p style={S.subtitle}>
            Enhance your skills with our industry-leading training programs. 
            Designed for forward-thinking professionals and students.
          </p>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <div style={S.loadingSpinner}></div>
          </div>
        ) : trainings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Briefcase size={48} color="#64748b" weight="duotone" style={{ marginBottom: '20px' }} />
            <h2 style={{ fontSize: '1.5rem', margin: '0 0 10px 0', color: '#f8fafc' }}>No Trainings Available</h2>
            <p style={{ color: '#94a3b8' }}>Check back later for new professional training courses.</p>
          </div>
        ) : (
          <div style={S.grid}>
            {trainings.map((t) => (
              <div key={t.id} style={S.card} className="training-card">
                <div style={S.imageContainer}>
                  {t.image_url ? (
                    <img src={t.image_url} alt={t.title} style={S.image} className="card-img" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}>
                      <Briefcase size={64} color="rgba(255,255,255,0.1)" weight="fill" />
                    </div>
                  )}
                  <div style={S.statusBadge(t.status)}>{t.status}</div>
                </div>
                
                <div style={S.cardBody}>
                  <h3 style={S.cardTitle}>{t.title}</h3>
                  <p style={S.cardDesc}>{t.description}</p>
                  
                  <div>
                    {t.instructor && (
                      <div style={S.metaData}>
                        <Briefcase size={18} style={S.metaIcon} weight="duotone" />
                        <span>Instructor: <strong>{t.instructor}</strong></span>
                      </div>
                    )}
                    {(t.start_date || t.end_date) && (
                      <div style={S.metaData}>
                        <CalendarBlank size={18} style={S.metaIcon} weight="duotone" />
                        <span>
                          {t.start_date ? new Date(t.start_date).toLocaleDateString() : 'TBD'} 
                          {' - '} 
                          {t.end_date ? new Date(t.end_date).toLocaleDateString() : 'TBD'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <button style={S.applyBtn} className="apply-btn">
                    Register Interest
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

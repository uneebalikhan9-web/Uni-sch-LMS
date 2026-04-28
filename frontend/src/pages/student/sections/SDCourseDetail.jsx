import React from 'react';
import { ArrowLeft, User } from "@phosphor-icons/react";
import { S } from './SDStyles';

export default function SDCourseDetail({ selectedCourse, setActivePage }) {
  return (
    <div className="animate-fadeIn">
      <button onClick={() => setActivePage('courses')} style={S.backBtn}>
        <ArrowLeft weight="bold" /> Back to Courses
      </button>
      <div style={S.detailCard}>
        <h2 style={S.detailTitle}>{selectedCourse?.title}</h2>
        <p style={S.detailDesc}>{selectedCourse?.description}</p>
        <div style={S.detailInstructor}>
          <User size={20} weight="fill" color="#4f46e5" />
          <div>
            <strong>Lead Instructor:</strong> {selectedCourse?.teacher_name}
          </div>
        </div>
      </div>
    </div>
  );
}

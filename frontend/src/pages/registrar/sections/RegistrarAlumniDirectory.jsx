import React from 'react';

const RegistrarAlumniDirectory = ({ alumni, filterData }) => {
  const filtered = filterData(alumni, ['id', 'name', 'program']);

  return (
    <div className="section">
      <div className="section-header">
        <h3>Official Alumni Directory</h3>
        <span className="badge-count">{filtered.length} Graduated</span>
      </div>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Alumni ID</th>
              <th>Full Name</th>
              <th>Degree Awarded</th>
              <th>Graduation Year</th>
              <th>Final CGPA</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id}>
                <td className="id-cell">{a.id}</td>
                <td className="name-cell">{a.name}</td>
                <td>{a.program}</td>
                <td>{a.graduation_year}</td>
                <td className="cgpa-cell">{a.cgpa}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No alumni records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistrarAlumniDirectory;

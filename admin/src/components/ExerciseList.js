import React, { useState } from 'react';
import './ExerciseList.css';

const ExerciseList = ({ exercises, onEdit, onDelete }) => {
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterIntensity, setFilterIntensity] = useState('all');
  const [filterEquipment, setFilterEquipment] = useState('all');

  const categories = [...new Set(exercises.map(ex => ex.category))];
  const intensities = [...new Set(exercises.map(ex => ex.intensity))];
  const equipmentTypes = [...new Set(exercises.map(ex => ex.equipment))];

  const filteredExercises = exercises.filter(ex => {
    if (filterCategory !== 'all' && ex.category !== filterCategory) return false;
    if (filterIntensity !== 'all' && ex.intensity !== filterIntensity) return false;
    if (filterEquipment !== 'all' && ex.equipment !== filterEquipment) return false;
    return true;
  });

  return (
    <div className="exercise-list-container">
      <div className="filters">
        <div className="filter-group">
          <label>Category:</label>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">All</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Intensity:</label>
          <select value={filterIntensity} onChange={(e) => setFilterIntensity(e.target.value)}>
            <option value="all">All</option>
            {intensities.map(int => (
              <option key={int} value={int}>{int}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Equipment:</label>
          <select value={filterEquipment} onChange={(e) => setFilterEquipment(e.target.value)}>
            <option value="all">All</option>
            {equipmentTypes.map(eq => (
              <option key={eq} value={eq}>{eq}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="exercise-count">
        Showing {filteredExercises.length} of {exercises.length} exercises
      </div>

      <div className="exercise-grid">
        {filteredExercises.map(exercise => (
          <div key={exercise.id} className="exercise-card">
            <div className="exercise-card-header">
              <h3>{exercise.name}</h3>
              <div className="exercise-actions">
                <button
                  className="btn-edit"
                  onClick={() => onEdit(exercise)}
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  className="btn-delete"
                  onClick={() => onDelete(exercise.id)}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
            
            <div className="exercise-details">
              <div className="detail-row">
                <span className="detail-label">Category:</span>
                <span className="detail-value">{exercise.category}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Intensity:</span>
                <span className="detail-value">{exercise.intensity}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Equipment:</span>
                <span className="detail-value">{exercise.equipment || 'none'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Duration:</span>
                <span className="detail-value">{exercise.duration_seconds}s</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Calories/min:</span>
                <span className="detail-value">{exercise.calories_per_minute}</span>
              </div>
              {exercise.description && (
                <div className="exercise-description">
                  {exercise.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="no-exercises">
          No exercises found matching the filters.
        </div>
      )}
    </div>
  );
};

export default ExerciseList;


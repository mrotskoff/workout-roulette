import React, { useState, useEffect } from 'react';
import './ExerciseForm.css';

const ExerciseForm = ({ exercise, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'cardio',
    description: '',
    duration_seconds: 30,
    intensity: 'medium',
    equipment: 'none',
    calories_per_minute: 5,
  });

  useEffect(() => {
    if (exercise) {
      setFormData({
        name: exercise.name || '',
        category: exercise.category || 'cardio',
        description: exercise.description || '',
        duration_seconds: exercise.duration_seconds || 30,
        intensity: exercise.intensity || 'medium',
        equipment: exercise.equipment || 'none',
        calories_per_minute: exercise.calories_per_minute || 5,
      });
    }
  }, [exercise]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration_seconds' || name === 'calories_per_minute' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="exercise-form-container">
      <div className="form-header">
        <h2>{exercise ? 'Edit Exercise' : 'Add New Exercise'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="exercise-form">
        <div className="form-group">
          <label htmlFor="name">Exercise Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Push-ups"
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="cardio">Cardio</option>
            <option value="strength">Strength</option>
            <option value="flexibility">Flexibility</option>
            <option value="core">Core</option>
            <option value="balance">Balance</option>
            <option value="general">General</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Brief description of the exercise..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="duration_seconds">Duration (seconds) *</label>
            <input
              type="number"
              id="duration_seconds"
              name="duration_seconds"
              value={formData.duration_seconds}
              onChange={handleChange}
              required
              min="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="calories_per_minute">Calories per Minute</label>
            <input
              type="number"
              id="calories_per_minute"
              name="calories_per_minute"
              value={formData.calories_per_minute}
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="intensity">Intensity *</label>
            <select
              id="intensity"
              name="intensity"
              value={formData.intensity}
              onChange={handleChange}
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="equipment">Equipment Required</label>
            <select
              id="equipment"
              name="equipment"
              value={formData.equipment}
              onChange={handleChange}
            >
              <option value="none">None</option>
              <option value="dumbbells">Dumbbells</option>
              <option value="resistance-bands">Resistance Bands</option>
              <option value="kettlebell">Kettlebell</option>
              <option value="barbell">Barbell</option>
              <option value="yoga-mat">Yoga Mat</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-submit">
            {exercise ? 'Update Exercise' : 'Create Exercise'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExerciseForm;


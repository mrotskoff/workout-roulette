import React, { useState, useEffect } from 'react';
import './App.css';
import ExerciseList from './components/ExerciseList';
import ExerciseForm from './components/ExerciseForm';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function App() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingExercise, setEditingExercise] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/exercises`);
      const data = await response.json();
      setExercises(data);
    } catch (error) {
      console.error('Error loading exercises:', error);
      alert('Failed to load exercises. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (exercise) => {
    setEditingExercise(exercise);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exercise?')) {
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/api/exercises/${id}`, {
        method: 'DELETE',
      });
      loadExercises();
    } catch (error) {
      console.error('Error deleting exercise:', error);
      alert('Failed to delete exercise');
    }
  };

  const handleFormSubmit = async (exerciseData) => {
    try {
      const url = editingExercise
        ? `${API_BASE_URL}/api/exercises/${editingExercise.id}`
        : `${API_BASE_URL}/api/exercises`;
      
      const method = editingExercise ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exerciseData),
      });

      setShowForm(false);
      setEditingExercise(null);
      loadExercises();
    } catch (error) {
      console.error('Error saving exercise:', error);
      alert('Failed to save exercise');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingExercise(null);
  };

  const handleNewExercise = () => {
    setEditingExercise(null);
    setShowForm(true);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Workout Roulette - Admin Panel</h1>
        <p>Manage exercises for the Workout Roulette app</p>
      </header>

      <main className="App-main">
        {showForm ? (
          <ExerciseForm
            exercise={editingExercise}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
          />
        ) : (
          <>
            <div className="toolbar">
              <button className="btn btn-primary" onClick={handleNewExercise}>
                + Add New Exercise
              </button>
              <button className="btn btn-secondary" onClick={loadExercises}>
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="loading">Loading exercises...</div>
            ) : (
              <ExerciseList
                exercises={exercises}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;


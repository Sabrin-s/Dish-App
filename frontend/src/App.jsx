import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './index.css';

const API_URL = 'http://localhost:4000';
const socket = io(API_URL);

export default function App() {
  const [dishes, setDishes] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Initial fetch via REST
    fetch(`${API_URL}/api/dishes`)
      .then((res) => res.json())
      .then(setDishes)
      .catch((err) => console.error('Failed to fetch dishes', err));

    // Real-time updates (covers toggles from this UI AND direct backend/db.json edits)
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('dishes', (updatedDishes) => setDishes(updatedDishes));

    return () => {
      socket.off('dishes');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  const toggleDish = async (dishId) => {
    try {
      await fetch(`${API_URL}/api/dishes/${dishId}/toggle`, { method: 'PATCH' });
      // No need to manually update state — socket 'dishes' event will broadcast the change
    } catch (err) {
      console.error('Failed to toggle dish', err);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>🍽️ Dish Dashboard</h1>
        <span className={`status ${connected ? 'online' : 'offline'}`}>
          {connected ? 'Live' : 'Disconnected'}
        </span>
      </header>

      <div className="grid">
        {dishes.map((dish) => (
          <div className="card" key={dish.dishId}>
            <img src={dish.imageUrl} alt={dish.dishName} onError={(e) => (e.target.style.display = 'none')} />
            <div className="card-body">
              <h3>{dish.dishName}</h3>
              <p className={dish.isPublished ? 'badge published' : 'badge unpublished'}>
                {dish.isPublished ? 'Published' : 'Unpublished'}
              </p>
              <button
                className={dish.isPublished ? 'btn unpublish' : 'btn publish'}
                onClick={() => toggleDish(dish.dishId)}
              >
                {dish.isPublished ? 'Unpublish' : 'Publish'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

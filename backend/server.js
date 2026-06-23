const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const DB_PATH = path.join(__dirname, 'db.json');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

function readDishes() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeDishes(dishes) {
  fs.writeFileSync(DB_PATH, JSON.stringify(dishes, null, 2));
}

// GET all dishes
app.get('/api/dishes', (req, res) => {
  try {
    res.json(readDishes());
  } catch (err) {
    res.status(500).json({ error: 'Failed to read dishes' });
  }
});

// PATCH toggle published status
app.patch('/api/dishes/:id/toggle', (req, res) => {
  try {
    const dishes = readDishes();
    const dish = dishes.find((d) => d.dishId === req.params.id);
    if (!dish) return res.status(404).json({ error: 'Dish not found' });

    dish.isPublished = !dish.isPublished;
    writeDishes(dishes); // triggers fs.watch below -> broadcasts to all clients

    res.json(dish);
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle dish' });
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.emit('dishes', readDishes());
});

// Watch db.json for ANY change (via API or direct manual edit) and broadcast.
// Debounced because some editors/OS trigger multiple events per save.
let debounceTimer = null;
fs.watch(DB_PATH, { persistent: true }, () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    try {
      const dishes = readDishes();
      io.emit('dishes', dishes);
      console.log('db.json changed -> broadcasted update to clients');
    } catch (e) {
      // ignore transient parse errors mid-write
    }
  }, 100);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

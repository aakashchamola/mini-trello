const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to Mini Trello API!');
});

// Example route for boards
app.get('/boards', (req, res) => {
  res.json([{ id: 1, name: 'Sample Board' }]);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

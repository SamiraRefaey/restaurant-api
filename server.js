const express = require('express');
const app = express();
const port = 3000;

const menuRoutes = require('./routes/menuRoutes');

app.use(express.json());

app.get('/',(req,res) => {
  res.send('Smart Restaurant API is running');
});


app.use('/api/menu', menuRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const express = require('express');
const app = express();
const port = 3000;

const restaurants=[
    {id:1, name:'Burger House', cuisine:'Burgers',rating:4.5},
    {id:2, name:'Pizza Palace', cuisine:'Italian',rating:4.2},
    {id:3, name:'Sushi Delight', cuisine:'Japanese',rating:4.8}
]
app.get('/',(req,res) => {
  res.send('Smart Restaurant API is running');
});

app.get('/api/restaurants',(req,res) => {
  res.json(restaurants);
});
app.get('/api/restaurants/:id',(req,res) => {
  const id = Number(req.params.id);
  const restaurant = restaurants.find(r => r.id === id);
  if (!restaurant) {
    return res.status(404).json({ message: 'Restaurant not found' });
  }
  res.json(restaurant);
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
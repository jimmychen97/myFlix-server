const express = require('express'),
  morgan = require('morgan');
const app = express();

let topMovies = [
  {
    title: 'True Grit',
    director: 'Ethan Coen',
  },
  {
    title: 'Pulp Fiction',
    director: 'Quentin Tarantino',
  },
  {
    title: 'The Guard',
    director: 'John Michael McDonagh',
  },
  {
    title: 'E.T. The Extra-Terrestrial',
    director: 'Steven Spielberg',
  },
  {
    title: 'Moonrise Kingdom',
    director: 'Wes Anderson',
  },
  {
    title: 'Gravity',
    director: 'Alfonso Cuaron',
  },
  {
    title: 'Shuan of the Dead',
    director: 'Edgar Wright',
  },
  {
    title: 'Snowpiercer',
    director: 'Joon-ho Bong',
  },
  {
    title: 'What We Do In The Shadows',
    director: 'Taika Waititi',
  },
  {
    title: 'North by Northwest',
    director: 'Alfred Hitchcock',
  },
];

app.use(morgan('common'));
app.use(express.static('public'));

// GET route returning default response
app.get('/', (req, res) => {
  res.send('Welcome to the movie API');
});

// GET route located at endpoint '/movies'
app.get('/moviess', (req, res) => {
  res.json(topMovies);
});

// error handling
app.use((err, req, res, next)=>{
    console.error(err.stack);
    res.status(500).send('Something went wrong');
});

app.listen(8080, () => {
  console.log('Web app is running on port 8080');
});
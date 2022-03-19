const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

const app = express();
app.use(bodyParser.json());

let movies = [
  {
    title: 'True Grit',
    director: 'Ethan Coen',
    genre: {'name':'Horror'}
  },
  {
    title: 'Pulp Fiction',
    director: 'Quentin',
    genre: {'name':'Horror'}
  },
  {
    title: 'The Guard',
    director: 'John Michael McDonagh',
    genre: {'name':'Horror'}
  },
  {
    title: 'E.T. The Extra-Terrestrial',
    director: 'Steven Spielberg',
    genre: {'name':'Horror'}
  },
  {
    title: 'Moonrise Kingdom',
    director: 'Wes Anderson',
    genre: {'name':'Horror'}
  },
  {
    title: 'Gravity',
    director: 'Alfonso Cuaron',
    genre: {'name':'Horror'}
  },
  {
    title: 'Shuan of the Dead',
    director: 'Edgar Wright',
    genre: {'name':'Horror'}
  },
  {
    title: 'Snowpiercer',
    director: 'Joon-ho Bong',
    genre: {'name':'Horror'}
  },
  {
    title: 'What We Do In The Shadows',
    director: 'Taika Waititi',
    genre: {'name':'Horror'}
  },
  {
    title: 'North by Northwest',
    director: 'Alfred Hitchcock',
    genre: {'name':'Horror'}
  },
];

let users = [
  {
    "id" : 1,
    "name" : "Amy",
    "favoriteMovies" : [] 
  },
  {
    "id" : 2,
    "name" : "Betty",
    "favoriteMovies" : [] 
  },{
    "id" : 3,
    "name" : "Christy",
    "favoriteMovies" : ['Doraemon'] 
  }
]

app.use(morgan('common'));
app.use(express.static('public'));

// CREATE: allow new users to register
app.post('/users', (req, res) => {
  const newUser = req.body;

  if(newUser.name){
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send('New user need name'); 
  }
})

// CREATE: allow user to add a movie to list of favorites
app.post('/users/:id/:movieTitle', (req, res)=>{
  const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id);

  if(user){
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s favorite list`);
  } else {
    res.status(400).send('User not found');
  }
})

// READ: return default page
app.get('/', (req, res) => {
  res.send('Welcome to the movie API');
});

// READ: return a list of all movies to the user
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

// READ: return a sinlge movie by title
app.get('/movies/:title', (req, res) => {
  // TODO: look up object destructing
  const { title } = req.params;
  const movie = movies.find( movie => movie.title === title );

  if(movie){
    res.status(200).json(movie);
  } else {
    res.status(400).send('Movie not found');
  }
})

// READ: return data about a genre by name
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find( movie => movie.genre.name === genreName ).genre;

  if(genre){
    res.status(200).json(genre);
  } else {
    res.status(400).send('Genre not found');
  }
})

// READ: return data about director by name
app.get('/movies/directors/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = movies.find( movie => movie.director === directorName ).director;

  if(director){
    res.status(200).json(director);
  } else {
    res.status(400).send('Director not found');
  }
})

// UPDATE: allow users to update their username
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  // two equal sign because the id is string here, but a number in the array
  let user = users.find( user => user.id == id);

  if(user){
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('User not found');
  }
})

// DELETE: allow user to remove a movie to list of favorites
app.delete('/users/:id/:movieTitle', (req, res)=>{
  const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id);

  if(user){
    user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
    res.status(200).send(`${movieTitle} has been removed to user ${id}'s favorite list`);
  } else {
    res.status(400).send('User not found');
  }
})

// DELETE: allow existing user to deregister
app.delete('/users/:id', (req, res)=>{
  const { id } = req.params;

  let user = users.find( user => user.id == id);

  if(user){
    users = users.filter( user => user.id != id);
    res.status(200).send(`User ${id} has been deleted`);
  } else {
    res.status(400).send('User not found');
  }
})

// error handling
app.use((err, req, res, next)=>{
    console.error(err.stack);
    res.status(500).send('Something went wrong');
});

app.listen(8080, () => {
  console.log('Web app is running on port 8080');
});
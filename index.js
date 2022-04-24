const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  mongoose = require('mongoose'),
  Models = require('./models.js'),
  cors = require('cors'),
  Movies = Models.Movie,
  Users = Models.User,
  { check, validationResult } = require('express-validator');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('common'));
app.use(express.static('public'));

// local mongoDB connection
// mongoose.connect('mongodb://localhost:27017/myFlixDB', { useUnifiedTopology: true });

// online mongoDB connection
mongoose.connect( process.env.CONNECTION_URI, { useUnifiedTopology: true });

app.use(cors()); 
let auth = require('./auth.js')(app);
const passport = require('passport');
require('./passport');

// CREATE: allow new users to register
app.post('/users', [
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let hashedPassword = Users.hashPassword(req.body.Password);

  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users.create({
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        })
          .then((user) => {
            res.status(201).json(user);
          })
          .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
          });
      }
    })
    .catch((ererrror) => {
      console.log(err);
      res.status(500).send('Error: ' + err);
    });
});

// READ: return default page
app.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
  res.send('Welcome to the movie API');
});

// READ: return a list of all movies to the user
passport.authenticate('jwt', {session: false})
app.get('/movies', (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send(`Error: ${err}`);
    });
});

// READ: return data about a single movie by title to the user
app.get('/movies/:Title', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      if (movie) {
        res.status(200).json(movie);
      } else {
        res.status(400).send('Movie not found.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send(`Error: ${err}`);
    });
});

// READ: return data about a genre by name
app.get('/movies/genre/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.Name })
    .then((movie) => {
      if (movie) {
        res.status(200).json(movie.Genre);
      } else {
        res.status(400).sendStatus('Genre not found.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send(`Error: ${err}`);
    });
});

// READ: return data about director by name
app.get('/movies/director/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.Name })
    .then((movie) => {
      if (movie) {
        res.status(200).json(movie.Director);
      } else {
        res.status(400).sendStatus('Director not found.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send(`Error: ${err}`);
    });
});

// READ: get all users
app.get('/users', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// READ: get a specific users
app.get('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.status(201).json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// UPDATE: update user info base on username
app.put('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      },
    },
    { new: true }
  )
    .then((updatedUser) => {
      res.status(200).json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// UPDATE: add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $push: {
        FavoriteMovies: req.params.MovieID,
      }
    },
    { new: true }
  )
    .then((updatedUser) => {
      res.status(200).json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// DELETE: allow user to remove a movie to list of favorites
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $pull: {
        FavoriteMovies: req.params.MovieID,
      },
    },
    { new: true }
  )
    .then((updatedUser) => {
      res.status(200).json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// DELETE: allow existing user to deregister
app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
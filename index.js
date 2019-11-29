const bodyParser = require('body-parser')
const express = require('express')
const logger = require('morgan')
const app = express()
const {
  fallbackHandler,
  notFoundHandler,
  genericErrorHandler,
  poweredByHandler
} = require('./handlers.js')

const SnakeGame = require('./snake-game');

// For deployment to Heroku, the port needs to be set using ENV, so
// we check for the port number in process.env
app.set('port', (process.env.PORT || 9001))

app.enable('verbose errors')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(poweredByHandler)

// --- SNAKE LOGIC GOES BELOW THIS LINE ---
const games = {};

// Handle POST request to '/start'
app.post('/start', (request, response) => {
  games[request.body.game.id] = new SnakeGame(request.body);

  const data = {
    color: '#DFFF00',
  };

  return response.json(data)
})

// Handle POST request to '/move'
app.post('/move', (request, response) => {
  const move = games[request.body.game.id].nextMove(request.body);

  const data = {
    move: move,
  };

  return response.json(data)
})

app.post('/end', (request, response) => {
  delete games[request.body.game.id];
  return response.json({});
})

app.post('/ping', (request, response) => {
  // Used for checking if this snake is still alive.
  return response.json({});
})

// --- SNAKE LOGIC GOES ABOVE THIS LINE ---

app.use('*', fallbackHandler)
app.use(notFoundHandler)
app.use(genericErrorHandler)

app.listen(app.get('port'), () => {
  console.log('Server listening on port %s', app.get('port'))
})

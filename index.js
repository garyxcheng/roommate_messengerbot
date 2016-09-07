'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
var pg = require('pg');

var connectionString = "postgres://sciefmdltovpgf:_ZvjMSKxSioNzHzthDMMlQ5Ziw@ec2-54-235-68-4.compute-1.amazonaws.com:5432/deut9i6kcu526n";
var client = new pg.Client(connectionString);
client.connect();

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
	res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
	let event = req.body.entry[0].messaging[i]
	let sender = event.sender.id
	if (event.message && event.message.text) {
	    let text = event.message.text
	    sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
	    //sendTextMessage(sender, "Maybe?? " + client.query('SELECT * FROM test_table;').then(res => res.rows[0]);
	    sendTextMessage(sender, "JEKKA: " + JSON.stringify(client.query('SELECT * FROM information_schema.tables;', function(err, result) {
	        //done();
	        if (err)
		{ return "Error " + err; }
	        else
		{ return result.rows[0].name;}
	    })));
	}
    }
    res.sendStatus(200)
})

const token = "EAAYXLPi0SSoBAAu6Kxhbh0IYnAB9u2w2CNHOY7XWwS09NKFxJiblvftUAydOnsOh6VEntZB58UdPcYJYXkSKBRc31DRjLrArne8UlEu9b4xur1tFpPuvaDs5KxhC5ZCjdUKjivp6ZBGZA0hSZBaUK48FKZAoHEwvobZA4debNcERQZDZD"

function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
	url: 'https://graph.facebook.com/v2.6/me/messages',
	qs: {access_token:token},
	method: 'POST',
	json: {
	    recipient: {id:sender},
	    message: messageData,
	}
    }, function(error, response, body) {
	if (error) {
	    console.log('Error sending messages: ', error)
	} else if (response.body.error) {
	    console.log('Error: ', response.body.error)
	}
    })
}

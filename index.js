const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const fs = require('fs');
require('dotenv').config()
require('./db.js')

const User = require('./models/User')
app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ "extended": true }))

// display webpage
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html')
});

// create new user
app.post('/api/users', (req, res) => {
  let un = req.body.username
  let cu = new User({ username: un })
  cu.save()
  res.json({ "_id": cu._id, "username": cu.username, "log": "[]" })
})

// get all users and return as array
app.get('/api/users', async (req, res) => {
  let users = await User.find()
  let holdarr = []
  for (let i = 0; i < users.length; i++) {
    holdarr.push({ "_id": users[i]._id, "username": users[i].username, "log": users[i].log })
  }
  res.send(holdarr)
})

// create new exercises
app.post('/api/users/:_id/exercises', async (req, res) => {
  let { description, duration, date } = req.body
  console.log("Creating new exercise")
  let uid = req.params._id;
  let updating = await User.findById(uid)
  if (!date) {
    date = new Date(Date.now()).toDateString()
  } else {
    date = new Date(req.body.date).toDateString()
  }
  let newObj = { "description": String(description), "duration": Number(duration), "date": String(date) }
  updating.log.push(newObj)
  await updating.save()
  res.json({ "username": updating.username, "description": description, "duration": Number(duration), "date": date, "_id": uid })
});


app.get('/api/users/:_id/logs', async (req, res) => {
  let usr = await User.findById(req.params._id)
  let reqs = { ...req.query }
  let us = { ...usr['_doc'] }
  let filarr = []
  for (let i = 0; i < us.log.length; i++) {
    if (req.to && req.from) {
      if (new Date(reqs.from) <= new Date(us.log.date) >= new Date(reqs.to)) {
        filarr.push(us.log[i])
      }
    } else if (!req.to && !req.from){
      filarr.push(us.log[i])
    }
    

  }
  let larr = reqs.limit ? filarr.splice(0, reqs.limit) : filarr
  let resp = { "_id": us._id, "username": us.username, "count": us.log.length, "log": larr }
  res.json(resp)
})




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

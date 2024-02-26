const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const fs = require('fs');
require('dotenv').config()

let rawdata = fs.readFileSync('usersdata')
let jsondata;
if(rawdata.toString() === ""){
  jsondata = {"users":{}}
} else {
  jsondata = JSON.parse(atob(rawdata))

}

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ "extended": true }))

// display webpage
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html')
});
// get full stored json
app.get('/api/json', function (req, res) {
  res.json(jsondata)
})



// make user
app.post('/api/users', function (req, res) {
  let data = req.body;
  if (!data.username) res.json({ "error": "no username provided. contact the front end dev as they did something wrong." })
  let newid = crypto.randomUUID()
  let now = new Date(Date.now()).toDateString()
  let newUser = {
    "id": newid,
    "username": data.username,
    "log": [{ "description": "Created account.", "duration": 0, "date": now }]
  }
  jsondata.users = { ...jsondata.users, [newUser.id]: newUser }
  fs.writeFile("usersdata", btoa(JSON.stringify(jsondata)), (err) => {
    if (err) { res.json({ "error": err }) } else {
      console.log("successful write");
      res.json({ "_id": newUser.id, "username": newUser.username })
    }
  })



})



// get all users
app.get('/api/users', function (req, res) {
  // return all
  let tmparr = []
  let data = { ...jsondata }
  for (const idkey in jsondata.users) {
    tmparr.push({ "_id": data.users[idkey].id, "username": data.users[idkey].username, "log": data.users[idkey].log })
  }
  res.send(tmparr)
})



// get single user whole
app.get('/api/users/:_id', function (req, res) {
  let id = req.params._id;
  console.log(`Looking for: ${id}`)
  let user = { "error": "User not found." }
  for (const idkey in jsondata.users) {
    console.log(idkey)
    if (idkey === id) {
      console.log('match')
      user = jsondata.users[idkey]
    }
  }
  res.json(user)
})
// get single user with activities
app.get('/api/users/:_id/logs', (req, res) => {
  let id = req.params._id;
  console.log(`Looking for: ${id}`)
  let user = { "error": "User not found." }
  for (const idkey in jsondata.users) {
    if (idkey === id) {
      console.log('match')
      user = jsondata.users[idkey]
    }
  }

  let userdata = { "_id": user.id, "username": user.username, "log": user.log }
  res.json(userdata)
})

// get single user all logs + count 
app.get('/api/users/:_id/exercises', (req, res) => {
  let id = req.params._id;
  console.log(`Looking for: ${id}`)
  let user = { "error": "User not found." }
  let logarr = []
  for (const idkey in jsondata.users) {
    if (idkey === id) {
      console.log('match')
      user = jsondata.users[idkey]
      for(let i =0;i<user.log.length;i++){
        let itm = user.log[i]
        console.log('item:',user.log[i])

        logarr.push({"description": String(itm.description), "username":itm.username,"duration": Number(itm.duration), "date":itm.date.toString() })
      }
    }
  }

  let userdata = { "_id": user.id, "username": user.id, "count": user.log.length, "log": user.log }
  res.json(userdata)
})




// create new activity
app.post('/api/users/:_id/exercises', function (req, res) {
  let { description, duration, date } = req.body;
  if (date) {
    date = new Date(date)
  } else {
    date = new Date().toDateString()
  }
  const id = req.params._id.toString()
  console.log('id', id)
  for (let key in jsondata.users) {
    if (key === id) {
      jsondata.users[id].log = [...jsondata.users[id].log, { "description": description.toString(), "duration": Math.floor(duration), "date": date }]
      try {
        fs.writeFile('usersdata', btoa(JSON.stringify(jsondata)), (err) => {
          if (err) {
            res.status(500).send(err)
          } else {
            res.json(jsondata.users[key])
          }
        })
      } catch (err) {
        res.send(err)
      }
    }
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

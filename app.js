const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())
const dbpath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initialize = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('srever running')
    })
  } catch (e) {
    console.log(e)
    process.exit(1)
  }
}
const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

initialize()

//api1
app.get('/players/', async (rq, rp) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      cricket_team
    ORDER BY
      player_id;`
  const PlayersArray = await db.all(getPlayersQuery)
  rp.send(
    PlayersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

//api2
app.post('/players/', async (rq, rp) => {
  const np = rq.body
  const {player_name, jersey_number, role} = np
  const addp = `INSERT INTO cricket_team (player_name, jersey_number, role) VALUES (?, ?, ?);`
  const dbResponse = await db.run(addp, [player_name, jersey_number, role])
  const pid = dbResponse.lastID
  rp.send('Player Added to Team')
})
//api3

app.get('/players/:playerId/', async (rq, rp) => {
  const {playerId} = rq.params
  const getbyplayerid = `
     select *
     from cricket_team
     where player_id= ${playerId}
  ;`
  const dbrp = await db.get(getbyplayerid)
  rp.send(convertDbObjectToResponseObject(dbrp))
})

//api4

app.put('/players/:playerId/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const {playerId} = request.params
  const updatePlayerQuery = `UPDATE cricket_team SET player_name = '${playerName}', jersey_number = ${jerseyNumber}, role = '${role}' WHERE player_id = ${playerId}`
  const palyer = await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

//api5

app.delete('/players/:playerId', async (rq, rp) => {
  const {playerId} = rq.params
  const deleteid = `delete from cricket_team where player_id= ${playerId};`
  const rmp = await db.run(deleteid)
  rp.send('Player Removed')
})

module.exports = app

## Rock, Paper, Scissors Assessment
💥 Jonathan Robles 💥

---

Install:
```sh
npm install
```

###### Main task solution desc:
custom strategy records up to a 100 of the other players' last moves , it then takes what the player is most likely going to throw and uses the winning move for that move.

To run the main task solution:
```sh
npm run start
```

###### Bonus task solution desc:
- modified to allow more players/ports
- each player keeps track of their own moves
- when a player is ready to play with another they transfer their record of gamecounts to each other and update their individual data
- if the requested player has played more games than anyone else, he refuses
- after a player plays every player, he chooses to play with someone with the least amount of games

To run the bonus task solution:
```sh
npm run startmulti
```

To run jest tests:
```sh
npm run test
```


###### Additional Notes:

- The command to execute has been changed to pull an environment file that has the ports defined (for the bonus task solution)
```sh
node --env-file=.env player.js 9001 constant
```

<p align="center">
  <img src="https://avatars.slack-edge.com/2020-10-09/1419974538162_9f52dfc46e897908c829_96.png" alt="Jemstone, Jumstone, Jomstone, and Jamstone" width="150" height="150"/>
</p>

<h1 align="center">j[aeou]mstones</h1>

A Slack integration to keep track of j[aeou]mstones through the use of slash commands.

Server deployed at [https://jemstones.herokuapp.com/](https://jemstones.herokuapp.com/)

Frontend application deployed at [https://jemstones.netlify.app](https:leaderboard///jemstones.netlify.app);

### Current endpoints accessible:

GET https://jemstones.herokuapp.com/status
- Endpoint to wake up dynos before executing slack events

GET https://jemstones.herokuapp.com/transactions
- Displays a list of all transactions that have taken place in the application

GET /leaderboard
- Displays a list of users sored from highest to lowest stones total

GET /leaderboard/amy
- Displays a list of users sorted from highest to lowest amystones

GET /leaderboard/col
- Displays a list of users sorted from highest to lowest colestones

GET /leaderboard/ger
- Displays a list of users sorted from highest to lowest gerstones

GET /leaderboard/har
- Displays a list of users sorted from highest to lowest harrystones

GET /leaderboard/jam
- Displays a list of users sorted from highest to lowest jamstones

GET /leaderboard/jan
- Displays a list of users sorted from highest to lowest janstones

GET /leaderboard/jem
- Displays a list of users sorted from highest to lowest jemstones

GET /leaderboard/jom
- Displays a list of users sorted from highest to lowest jomstones

GET /leaderboard/jum
- Displays a list of users sorted from highest to lowest jumstones


### Slash command usage:
```
/amystones <username of person you want to gift> <amount you want to gift>
/colestones <username of person you want to gift> <amount you want to gift>
/gerstones <username of person you want to gift> <amount you want to gift>
/harrystones <username of person you want to gift> <amount you want to gift>
/jamstones <username of person you want to gift> <amount you want to gift>
/janstones <username of person you want to gift> <amount you want to gift>
/jemstones <username of person you want to gift> <amount you want to gift>
/jomstones <username of person you want to gift> <amount you want to gift>
/jumstones <username of person you want to gift> <amount you want to gift>
```
  
**Warning: If you attempt to remove the j[aeou]mstones of others, it will not end well for you.**

**Secondary warning: If you attempt to give yourself j[aeou]mstones, it will also not end well for you.**
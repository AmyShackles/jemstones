<p align="center">
  <img src="https://avatars.slack-edge.com/2020-10-09/1419974538162_9f52dfc46e897908c829_96.png" alt="Jemstone, Jumstone, Jomstone, and Jamstone" width="150" height="150"/>
</p>

<h1 align="center">j[aeou]mstones</h1>

A Slack integration to keep track of j[aeou]mstones through the use of slash commands.

Server deployed at [https://jemstones.herokuapp.com/](https://jemstones.herokuapp.com/)

### Current endpoints accessible:
GET https://jemstones.herokuapp.com/transactions
- Displays a list of all transactions that have taken place in the application

GET https://jemstones.herokuapp.com/users
- Displays a list of all users (includes those who give and receive jemstones)

GET https://jemstones.herokuapp.com/?leaderboard=jam
- Displays a list of users sorted from highest to lowest jamstones

GET https://jemstones.herokuapp.com/?leaderboard=jem
- Displays a list of users sorted from highest to lowest jemstones

GET https://jemstones.herokuapp.com/?leaderboard=jom
- Displays a list of users sorted from highest to lowest jomstones

GET https://jemstones.herokuapp.com/?leaderboard=jum
- Displays a list of users sorted from highest to lowest jumstones

GET https://jemstones.herokuapp.com/jam
- Displays a list of users sorted from highest to lowest jamstones

GET https://jemstones.herokuapp.com/jem
- Displays a list of users sorted from highest to lowest jemstones

GET https://jemstones.herokuapp.com/jom
- Displays a list of users sorted from highest to lowest jomstones

GET https://jemstones.herokuapp.com/jum
- Displays a list of users sorted from highest to lowest jumstones

### Slash command usage:
```
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

<p align="center">
  <img src="https://avatars.slack-edge.com/2020-10-08/1441363635392_b9eaed28ee1b15f417ee_96.png" alt="Jemstone" width="200" height="200"/>
</p>

<h1 align="center">jemstones</h1>

A Slack integration to keep track of jemstones through the use of a slash command.

Server deployed at [https://jemstones.herokuapp.com/](https://jemstones.herokuapp.com/)

### Current endpoints accessible:
GET https://jemstones.herokuapp.com/transactions
- Displays a list of all transactions that have taken place in the application

GET https://jemstones.herokuapp.com/users
- Displays a list of all users (includes those who give and receive jemstones)

### Slash command usage:
```
/jemstones <username of person you want to gift> <amount you want to gift>
```
  
**Warning: If you attempt to remove the jemstones of others, it will not end well for you.**

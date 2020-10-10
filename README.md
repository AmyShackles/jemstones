# jemstones

A Slack integration to keep track of jemstones through the use of slash commands.

Server deployed at [https://jemstones.herokuapp.com/](https://jemstones.herokuapp.com/)

### Current endpoints accessible:
GET https://jemstones.herokuapp.com/transactions
- Displays a list of all transactions that have taken place in the application
GET https://jemstones.herokuapp.com/users
- Displays a list of all users (includes those who give and receive jemstones)

### Slash command usage:
/jemstones <username of person you want to gift> <amount you want to gift>
  
Warning: If you attempt to remove the jemstones of others, it will not end well for you.

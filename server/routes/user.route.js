const Router = require('express').Router();

Router.get('/', (req, res) => {
    res.send('User route is working!');
});

module.exports = Router;

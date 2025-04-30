const Router = require('express').Router();

Router.get('/', (req, res) => {
    res.send('Auth route is working!');
});

module.exports = Router;

const Router = require('express').Router();

Router.get('/', (req, res) => {
    res.send('Module route is working!');
});

module.exports = Router;

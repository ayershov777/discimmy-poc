const Router = require('express').Router();

Router.get('/', (req, res) => {
    res.send('Pathway route is working!');
});

module.exports = Router;

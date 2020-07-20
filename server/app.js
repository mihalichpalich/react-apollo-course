const express = require('express');
const {graphqlHTTP} = require('express-graphql');
const schema = require('../schema/schema');

const app = express();

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}));

app.listen(process.env.PORT || 3001, function (err) {
    err ? console.log(err) : console.log('Server run');
});
const express = require('express');
const {graphqlHTTP} = require('express-graphql');
const schema = require('../schema/schema');
const mongoose = require('mongoose');

const app = express();

mongoose.connect(
    `mongodb+srv://miklasfafara:7455718@cluster0.ggsfc.mongodb.net/react-apollo-course?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
).then(() => {
    app.listen(process.env.PORT || 3001, function (err) {
        if (err) {
            return console.log(err)
        }
        console.log('Server run');
    });
}).catch(err => {
    console.log(err);
});

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}));
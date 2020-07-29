const express = require('express');
const {ApolloServer} = require('apollo-server');
const schema = require('../schema/schema');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());

const server = new ApolloServer({
    schema,
    playground: true,
    introspection: true
});

server.listen({ port: process.env.PORT || 4000 }).then(({url}) => {
    mongoose.connect(
        `mongodb+srv://miklasfafara:7455718@cluster0.ggsfc.mongodb.net/react-apollo-course?retryWrites=true&w=majority`,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: true
        }
    ).then(() => {
        console.log(`Server ready at ${url}`);
    }).catch(err => {
        console.log(err);
    });
}).catch(err => {
    console.log(err);
});


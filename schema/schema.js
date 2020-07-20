const graphql = require('graphql');
const {GraphQLObjectType, GraphQLString, GraphQLSchema} = graphql;

const MovieType = new GraphQLObjectType({
    name: 'Movie',
    fields: () => ({
        id: {type: GraphQLString},
        name: {type: GraphQLString},
        genre: {type: GraphQLString}
    })
});

const Query = new GraphQLObjectType({
    name: 'Query',
    fields: {
        movie: {
            type: MovieType,
            args: {id: {type: GraphQLString}},
            resolve(parents, args) {

            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: Query
});
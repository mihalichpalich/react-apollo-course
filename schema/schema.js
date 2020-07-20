const graphql = require('graphql');
const {GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull} = graphql;

const Movies = require('../models/movie');
const Directors = require('../models/director');

const MovieType = new GraphQLObjectType({
    name: 'Movie',
    fields: () => ({ //поля оборачиваются в ф-ю, чтобы вызываться из любого места кода
        id: {type: GraphQLID},
        name: {type: new GraphQLNonNull(GraphQLString)},
        genre: {type: new GraphQLNonNull(GraphQLString)},
        director: {
            type: DirectorType,
            resolve(parent, args) { //параметр, который переносится из родительского запроса
                return Directors.findById(parent.directorId)
            }
        }
    })
});

const DirectorType = new GraphQLObjectType({
    name: 'Director',
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: new GraphQLNonNull(GraphQLString)},
        age: {type: new GraphQLNonNull(GraphQLInt)},
        movies: {
            type: new GraphQLList(MovieType), //вывод списка элементов
            resolve(parent, args) {
                return Movies.find({directorId: parent.id})
            }
        }
    })
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
        addDirector: {
            type: DirectorType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                age: {type: new GraphQLNonNull(GraphQLInt)}
            },
            resolve(parents, args) {
                const director = new Directors({
                    name: args.name,
                    age: args.age
                });

                return director.save()
            }
        },
        addMovie: {
            type: MovieType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                genre: {type: new GraphQLNonNull(GraphQLString)},
                directorId: {type: GraphQLID}
            },
            resolve(parents, args) {
                const movie = new Movies({
                    name: args.name,
                    genre: args.genre,
                    directorId: args.directorId
                });

                return movie.save()
            }
        },
        deleteDirector: {
            type: DirectorType,
            args: {id: {type: GraphQLID}},
            resolve(parents, args) {
                return Directors.findByIdAndRemove(args.id)
            }
        },
        deleteMovie: {
            type: MovieType,
            args: {id: {type: GraphQLID}},
            resolve(parents, args) {
                return Movies.findByIdAndRemove(args.id)
            }
        },
        updateDirector: {
            type: DirectorType,
            args: {
                id: {type: GraphQLID},
                name: {type: new GraphQLNonNull(GraphQLString)},
                age: {type: new GraphQLNonNull(GraphQLInt)}
            },
            resolve(parents, args) {
                return Directors.findByIdAndUpdate(
                    args.id,
                    {$set: {name: args.name, age: args.age}},
                    {new: true} //в ответе отображаются обновленные данные
                )
            }
        },
        updateMovie: {
            type: MovieType,
            args: {
                id: {type: GraphQLID},
                name: {type: new GraphQLNonNull(GraphQLString)},
                genre: {type: new GraphQLNonNull(GraphQLString)},
                directorId: {type: GraphQLID}
            },
            resolve(parents, args) {
                return Movies.findByIdAndUpdate(
                    args.id,
                    {$set: {name: args.name, genre: args.genre, directorId: args.directorId}},
                    {new: true} //в ответе отображаются обновленные данные
                )
            }
        }
    })
});


const Query = new GraphQLObjectType({ //запросы на получение данных
    name: 'Query',
    fields: {
        movie: {
            type: MovieType,
            args: {id: {type: GraphQLID}},
            resolve(parents, args) {
                return Movies.findById(args.id)
            }
        },
        director: {
            type: DirectorType,
            args: {id: {type: GraphQLID}},
            resolve(parents, args) {
                return Directors.findById(args.id)
            }
        },
        movies: {
            type: new GraphQLList(MovieType),
            resolve(parents, args) {
                return Movies.find({})
            }
        },
        directors: {
            type: new GraphQLList(DirectorType),
            resolve(parents, args) {
                return Directors.find({})
            }
        },
    }
});

module.exports = new GraphQLSchema({
    query: Query,
    mutation: Mutation
});
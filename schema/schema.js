const graphql = require('graphql');
const {GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLBoolean} = graphql;

const Movies = require('../models/movie');
const Directors = require('../models/director');

const MovieType = new GraphQLObjectType({
    name: 'Movie',
    fields: () => ({ //поля оборачиваются в ф-ю, чтобы вызываться из любого места кода
        id: {type: GraphQLID},
        name: {type: new GraphQLNonNull(GraphQLString)},
        genre: {type: new GraphQLNonNull(GraphQLString)},
        watched: {type: new GraphQLNonNull(GraphQLBoolean)},
        rate: {type: GraphQLInt},
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
            resolve(parents, {name, age}) {
                if (name === '') {
                    throw new Error("Director's name should not be empty");
                }

                if (parseInt(age) <= 0) {
                    throw new Error("Director's age should be a positive number");
                }

                const director = new Directors({
                    name,
                    age
                });

                return director.save()
            }
        },
        addMovie: {
            type: MovieType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                genre: {type: new GraphQLNonNull(GraphQLString)},
                directorId: {type: new GraphQLNonNull(GraphQLID)},
                watched: {type: new GraphQLNonNull(GraphQLBoolean)},
                rate: {type: GraphQLInt}
            },
            resolve(parents, {name, genre, directorId, watched, rate}) {
                if (name === '') {
                    throw new Error("Movies's name should not be empty");
                }

                if (genre === '') {
                    throw new Error("Movies's genre should not be empty");
                }

                if (directorId === '') {
                    throw new Error("Movies's director is not chosen");
                }

                const movie = new Movies({
                    name,
                    genre,
                    directorId,
                    watched,
                    rate
                });

                return movie.save()
            }
        },
        deleteDirector: {
            type: DirectorType,
            args: {id: {type: GraphQLID}},
            resolve(parents, {id}) {
                 Movies
                    .find({directorId: id})
                    .then((res) => {
                        if (res.length > 0) {
                            throw Error("Directors with movies cannot be removed")
                        } else {
                            return Directors.findByIdAndRemove(id)
                        }
                    })
                    .catch(err => {
                        throw err
                    });
            }
        },
        deleteMovie: {
            type: MovieType,
            args: {id: {type: GraphQLID}},
            resolve(parents, {id}) {
                return Movies.findByIdAndRemove(id)
            }
        },
        updateDirector: {
            type: DirectorType,
            args: {
                id: {type: GraphQLID},
                name: {type: new GraphQLNonNull(GraphQLString)},
                age: {type: new GraphQLNonNull(GraphQLInt)}
            },
            resolve(parents, {id, name, age}) {
                if (name === '') {
                    throw new Error("Director's name should not be empty");
                }

                return Directors.findByIdAndUpdate(
                    id,
                    {$set: {name, age}},
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
                directorId: {type: new GraphQLNonNull(GraphQLID)},
                watched: {type: new GraphQLNonNull(GraphQLBoolean)},
                rate: {type: GraphQLInt}
            },
            resolve(parents, {id, name, genre, directorId, watched, rate}) {
                if (name === '') {
                    throw new Error("Movies's name should not be empty");
                }

                if (genre === '') {
                    throw new Error("Movies's genre should not be empty");
                }

                if (directorId === '') {
                    throw new Error("Movies's director is not chosen");
                }

                return Movies.findByIdAndUpdate(
                    id,
                    {$set: {name, genre, directorId, watched, rate}},
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
            resolve(parents, {id}) {
                return Movies.findById(id)
            }
        },
        director: {
            type: DirectorType,
            args: {id: {type: GraphQLID}},
            resolve(parents, {id}) {
                return Directors.findById(id)
            }
        },
        movies: {
            type: new GraphQLList(MovieType),
            args: {name: {type: GraphQLString}},
            resolve(parents, {name}) {
                return Movies.find({name: {$regex: name, $options: "i"}}) //опции поиска: введенное название -
                // регулярное выражение, $options: "i" - нечувствительность к регистру
            }
        },
        directors: {
            type: new GraphQLList(DirectorType),
            args: {name: {type: GraphQLString}},
            resolve(parents, {name}) {
                return Directors.find({name: {$regex: name, $options: "i"}})
            }
        },
    }
});

module.exports = new GraphQLSchema({
    query: Query,
    mutation: Mutation
});
import { GraphQLServer, PubSub } from 'graphql-yoga'

import db from './db'
import Query from './resolvers/Query'
import Mutation from './resolvers/Mutation'
import Post from './resolvers/Post'
import User from './resolvers/User'
import Comment from './resolvers/Comment'
import Subscription from './resolvers/Subscription'



// Resolvers are a set of functions
// ctx = context
// parent, args, ctx, info
// you can distructure args {}
// parent.value gives you access to the root values

// Process
// Set Mutation
// Set Resolver
// test

const pubsub = new PubSub()

const server = new GraphQLServer({ 
    typeDefs: './src/schema.graphql', 
    resolvers: {
        Query,
        Mutation,
        Post,
        User,
        Comment,
        Subscription
    }, 
    context: {
        db,
        pubsub
    } 
})
server.start(() => console.log('Server is running on localhost:4000'))

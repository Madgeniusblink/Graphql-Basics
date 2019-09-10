import { GraphQLServer } from 'graphql-yoga'
import uuidv4 from 'uuid/v4'

// Scalar types - String, Boolean, Int(whole numbers), Float(decimal), ID(unique identifier) 
// Objects & Array

// Query types:
// add(a: Float, b: Float): Float!
// greeting(name: String, age: Int): String!
// add(numbers: [Float!]!): Float!
// grades: [Int!]!

// Demo user data
const users = [{
    id: '1',
    name: 'Cris',
    email: 'Cris@example.com',
    age: 24
}, {
    id: '2',
    name: 'Carlos',
    email: 'carlos@example.com',
    age: 20
}, {
    id: '3',
    name: 'maya',
    email: 'maya@example.com',
    age: 22
}, {
    id: '4',
    name: 'werner',
    email: 'wer@example.com'
}]

const posts = [{
    id: '1',
    title: 'the first post',
    body: 'your post one',
    published: true,
    author: '2',
    comments: '101'
},{
    id: '2',
    title: 'the second but first post',
    body: 'your post one and second',
    published: false,
    author: '1',
    comments: '102'
},{
    id: '3',
    title: 'the last post',
    body: 'great last post in the array',
    published: true,
    author: '3',
    comments: '103'
}]


const comments = [{
    id: '101',
    text: 'Awesome article but you could of added xyc',
    author: '1',
    post: '1'
},{
    id: '102',
    text: 'awesome explaination! thank you',
    author: '2',
    post: '2'
},{
    id: '103',
    text: 'those xyc always add up to 10?',
    author: '3',
    post: '3'
},{
    id: '104',
    text: 'why was he explaining xyc',
    author: '4',
    post: '3'
}]

// Type definition (shema)
const typeDefs = `
    type Query {
        users(query: String): [User!]!
        posts(query: String): [Post!]!
        me: User!
        post: Post
        comments: [Comment!]!
        
    }

    type Mutation {
        createUser(name: String!, email: String!, age: Int): User!
        createPost(title: String!, body: String!, published: Boolean!, author: ID!): Post!
        createComment(text: String!, author: ID!, post: ID!): Comment!
    }

    type User {
        id: ID!
        name: String!
        age: Int
        email: String!
        posts: [Post!]!
        comments: [Comment!]!
    }

    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
        author: User!
        comments: [Comment!]!
    }

    type Comment {
        id: ID!
        text: String!
        author: User!
        post: Post!
    }
`

// Resolvers are a set of functions
// ctx = context
// parent, args, ctx, info
// you can distructure args {}

// parent.value gives you access to the root values

// 
const resolvers = {
    Query: {
        users(parent, args, ctx, info) {
            if (!args.query) {
                return users
            }

            return users.filter((user) => {
                return user.name.toLowerCase().includes(args.query.toLowerCase())
            })
        },
        me() {
            return { 
                id: '1234',
                name: 'Cristian',
                email: 'C@gmail.com'
            }
        },
        posts(parent, args, ctx, info) {
            if(!args.query) {
                return posts
            }
            
            return posts.filter((post) => {
                const isTitleMatch = post.body.toLowerCase().includes(args.query.toLowerCase())
                const isBodydMatch = post.title.toLowerCase().includes(args.query.toLowerCase())
                
                return isTitleMatch || isBodydMatch
            })
        },
        post() {
            return {
                id: '124',
                title: 'the first post',
                body: 'your post one',
                published: true
            }
        },
        comments(parent, args, ctx, info) {
            return comments
        }

    },
    Mutation: {
        createUser(parent, args, ctx, info) {
            const emailTaken = users.some((user) => user.email === args.email)
            if(emailTaken) {
                throw new Error('Unable to create user')
            }

            const user = {
                id: uuidv4(),
                name: args.name,
                email: args.email,
                age: args.age
            }

            users.push(user)

            return user
        },
        createPost(parent, args, ctx, info) {
            const userExist = users.some((user) => user.id === args.author)

            if (!userExist) {
                throw new Error('User not found')
            }

            const post = {
                id: uuidv4(),
                title: args.title,
                body: args.body,
                published: args.published,
                author: args.author
            }

            posts.push(post)

            return post
        },
        createComment(parent, args, ctx, info) {
            const userExists = users.some(user => user.id === args.author)
            const postExists = posts.some(post => post.id === args.post && post.published)
            
            if (!userExists || !postExists) {
                throw new Error('unable to publish your comment')
            }
            

            const comment = {
                id: uuidv4(),
                text: args.text, 
                author: args.author, 
                post: args.post
            }

            comments.push(comment)

            return comment
        }
    },
    Post: {
        author(parent, args, ctx, info) {
            return users.find((user) => {
                return user.id === parent.author
            })
        },
        comments(parent, args, ctx, info) {
            return comments.filter((comment) => {
                return comment.post === parent.id
            })
        }

    },
    User: {
        posts(parent, args, ctx, info) {
            return posts.filter((post) => {
                return post.author === parent.id
            })
        },
        comments(parent, args, ctx, info) {
            return comments.filter((comment) => {
                return comment.author === parent.id
            })
        }
    },
    Comment: {
        author(parent, args, ctx, info) {
            return users.find((user) => {
                return user.id === parent.author
            })
        },
        post(parent, args, ctx, info) {
            return posts.find((post) => {
                return post.id === parent.post
            })
        }
    }
}

const server = new GraphQLServer({ typeDefs, resolvers })
server.start(() => console.log('Server is running on localhost:4000'))

import { GraphQLServer } from 'graphql-yoga'
import uuidv4 from 'uuid/v4'

// BEFORE RESTRUCTURING PROJECT

// Scalar types - String, Boolean, Int(whole numbers), Float(decimal), ID(unique identifier) 
// Objects & Array

// Query types:
// add(a: Float, b: Float): Float!
// greeting(name: String, age: Int): String!
// add(numbers: [Float!]!): Float!
// grades: [Int!]!

// Demo user data
let users = [{
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

let posts = [{
    id: '1',
    title: 'the first post',
    body: 'your post one',
    published: true,
    author: '1',
    comments: '101'
},{
    id: '2',
    title: 'the second but first post',
    body: 'your post one and second',
    published: false,
    author: '2',
    comments: '102'
},{
    id: '3',
    title: 'the last post',
    body: 'great last post in the array',
    published: true,
    author: '3',
    comments: '103'
}]


let comments = [{
    id: '101',
    text: 'Awesome article but you could of added xyc',
    author: '1',
    post: '1'
},{
    id: '102',
    text: 'awesome explaination! thank you',
    author: '2',
    post: '1'
},{
    id: '103',
    text: 'those xyc always add up to 10?',
    author: '1',
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
        createUser(data: CreateUserInput!): User!
        deleteUser(id: ID!): User!
        createPost(data: CreatePostInput!): Post!
        deletePost(id: ID!): Post!
        createComment(data: CreateCommentInput!): Comment!
        deleteComment(id: ID!): Comment!
    }

    input CreateUserInput {
        name: String! 
        email: String!
        age: Int
    }

    input CreatePostInput {
        title: String!
        body: String!
        published: Boolean!
        author: ID!
    }

    input CreateCommentInput {
        text: String!
        author: ID!
        post: ID!
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
            const emailTaken = users.some((user) => user.email === args.data.email)
            if(emailTaken) {
                throw new Error('Unable to create user')
            }

            
            const user = {
                id: uuidv4(),
                ...args.data
            }

            users.push(user)

            return user
        },
        deleteUser(parent, args, ctx, info) {
            // Find the location (index) of the user
            const userIndex = users.findIndex((user) => user.id === args.id)

            if (userIndex === -1) {
                throw new Error('User not found')
            }
            // splice takes in the location of user and how many users to delete
            const deletedUsers = users.splice(userIndex,1)

            // Filter out all the post and comments that belong to the user (keep the post that do not belong to the user)
            posts = posts.filter((post) => {
                // does the post match with the user that is being deleted?
                const match = post.author === args.id

                // if match we want to delete post + comments in post
                if (match) {
                    // cleans out the comments within the post that is being deleted
                    // return true if its a comment we want to keep and return false otherwise
                    comments = comments.filter((comment) => comment.post !== post.id)
                }

                // returns a boolean | 
                // we want to return true when we did not find a match keeping that post
                // return false when we did find a match making sure that post gets filter out
                //notmatch
                return !match 
            })

            comments = comments.filter((comment) => comment.author !== args.id)

            return deletedUsers[0]


        },
        createPost(parent, args, ctx, info) {
            const userExist = users.some((user) => user.id === args.data.author)

            if (!userExist) {
                throw new Error('User not found')
            }

            const post = {
                id: uuidv4(),
                ...args.data
            }

            posts.push(post)

            return post
        },
        deletePost(parent, args, ctx, info) {
            // check if post exists
            const postIndex = posts.findIndex((post) => post.id === args.id)
            if (postIndex === -1) {
                throw new Error('Post not found')
            }

            // delete post
            const deletedPosts = posts.splice(postIndex, 1)

            // Deleting relational data
            // delete all comments belonging to that post that is being deleted
            // true if we want to keep it and false to remove
            comments = comments.filter((comment) => comment.post !== args.id)

            // deletes the first post in the array that gets return
            return deletedPosts[0]
        },
        createComment(parent, args, ctx, info) {
            const userExists = users.some(user => user.id === args.data.author)
            const postExists = posts.some(post => post.id === args.data.post && post.published)
            
            if (!userExists || !postExists) {
                throw new Error('unable to publish your comment')
            }
            

            const comment = {
                id: uuidv4(),
                ...args.data
            }

            comments.push(comment)

            return comment
        },
        deleteComment(parent, args, ctx, info) {
            const commentIndex = comments.findIndex(comment => comment.id === args.id)
            if (commentIndex === -1) {
                throw new Error('unable to delete your comment')
            }

            const deleteComments = comments.splice(commentIndex, 1)

            return deleteComments[0]
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

import uuidv4 from 'uuid/v4'
import { type } from 'os';

// Enum
// 1. A special type that defines a set of constants.
// 2. This type can then be used as the type for a field (similar to scalar and custom object types).
// 3. Values for the field must be one of the constant for the type

// EXAMPLE:
// Userrole(enum) - standard, editor, admin
// UserRole must be one of the Enum above.. anything else fails
// type User {
//     role: UserRole!
// }


const Mutation = {
    createUser(parent, args, {db}, info) {
        const emailTaken = db.users.some((user) => user.email === args.data.email)
        if(emailTaken) {
            throw new Error('Unable to create user')
        }

        
        const user = {
            id: uuidv4(),
            ...args.data
        }

        db.users.push(user)

        return user
    },
    deleteUser(parent, args, {db}, info) {
        // Find the location (index) of the user
        const userIndex = db.users.findIndex((user) => user.id === args.id)

        if (userIndex === -1) {
            throw new Error('User not found')
        }
        // splice takes in the location of user and how many users to delete
        const deletedUsers = db.users.splice(userIndex,1)

        // Filter out all the post and comments that belong to the user (keep the post that do not belong to the user)
        db.posts = db.posts.filter((post) => {
            // does the post match with the user that is being deleted?
            const match = post.author === args.id

            // if match we want to delete post + comments in post
            if (match) {
                // cleans out the comments within the post that is being deleted
                // return true if its a comment we want to keep and return false otherwise
                db.comments = db.comments.filter((comment) => comment.post !== post.id)
            }

            // returns a boolean | 
            // we want to return true when we did not find a match keeping that post
            // return false when we did find a match making sure that post gets filter out
            //notmatch
            return !match 
        })

        db.comments = db.comments.filter((comment) => comment.author !== args.id)

        return deletedUsers[0]


    },
    updateUser(parent, args, { db }, info) {
        // locate user
        const user = db.users.find((user) => user.id === args.id)

        // check if there was no user
        if (!user) {
            throw new Error('User not found')
        }

        // look for data to see what they want to update
        // updating email
        if (typeof args.data.email === 'string') {
            // if the email is taken
            const emailTaken = db.users.some((user) => user.email === args.data.email)
            if (emailTaken) {
                throw new Error('Email taken')
            }
            // If the email is not taken..continue
            user.email = args.data.email
        }

        // Updating name
        if (typeof args.data.name === 'string') {
            user.name = args.data.name
        }

        // updating age
        if (typeof args.data.age !== 'undefined') {
            user.age = args.data.age
        }
        return user
    },
    createPost(parent, args, {db, pubsub}, info) {
        const userExist = db.users.some((user) => user.id === args.data.author)

        if (!userExist) {
            throw new Error('User not found')
        }

        const post = {
            id: uuidv4(),
            ...args.data
        }

        db.posts.push(post)
        
        // Subscription to notify when a post is published
        // Only if the published value is set to true 
        
        if (args.data.published) {
            pubsub.publish(`post`, { 
                post: {
                    mutation: 'CREATED',
                    data: post
                }
             })
        }
        

        return post
    },
    deletePost(parent, args, { db, pubsub}, info) {
        // check if post exists
        const postIndex = db.posts.findIndex((post) => post.id === args.id)
        if (postIndex === -1) {
            throw new Error('Post not found')
        }

        // delete post
        // const deletedPosts = db.posts.splice(postIndex, 1)
        // de-structured version:
        const [post] = db.posts.splice(postIndex, 1)

        // Deleting relational data
        // delete all comments belonging to that post that is being deleted
        // true if we want to keep it and false to remove
        db.comments = db.comments.filter((comment) => comment.post !== args.id)

        // alerts people when a post has been deleted via subscription
        // Checks that only notifies if post was published else no need
        if(post.published) {
            pubsub.publish('post', {
                post: {
                    mutation: 'DELETED',
                    data: post
                }
            })
        }
        // deletes the first post in the array that gets return
        return post
    },
    updatePost(parent, args, { db, pubsub }, info) {
        const post = db.posts.find((post) => post.id === args.id)
        const originalPost = { ...post }

        if (!post) {
            throw new Error('Unable to update post')
        }

        // updating title
        if (typeof args.data.title === 'string') {
            post.title = args.data.title
        }
        // updaing body
        if (typeof args.data.body === 'string') {
            post.body = args.data.body
        }
        // updating publish
        if (typeof args.data.published === 'boolean') {
            post.published = args.data.published

            // if the post was published but is now unpublished
            if (originalPost.published && !post.published) {
                // deleted(originalpost) notification (subscription)
                pubsub.publish('post', {
                    post: {
                        mutation: 'DELETED',
                        data: originalPost
                    }
                })
            // if the post was not original post but is now published
            } else if (!originalPost.published && post.published) {
                // Created notification (subscription)
                pubsub.publish('post', {
                    post: {
                        mutation: 'CREATED',
                        data: post
                    }
                })
            }
            // is the post published but not already modify the published value
        } else if (post.published) {
            // update notification (subscription)
            pubsub.publish('post', {
                post: {
                    mutation: 'UPDATED',
                    data: post
                }
            })
        }

        return post

    },
    createComment(parent, args, { db, pubsub }, info) {
        const userExists = db.users.some(user => user.id === args.data.author)
        const postExists = db.posts.some(post => post.id === args.data.post && post.published)
        
        if (!userExists || !postExists) {
            throw new Error('unable to publish your comment')
        }
        

        const comment = {
            id: uuidv4(),
            ...args.data
        }

        db.comments.push(comment)
        // Subscription for new comments
        pubsub.publish(`comment ${args.data.post}`, {
            comment: {
                mutation: 'CREATED',
                data: comment
            }
        })

        return comment
    },
    deleteComment(parent, args, { db, pubsub }, info) {
        const commentIndex = db.comments.findIndex(comment => comment.id === args.id)
        if (commentIndex === -1) {
            throw new Error('unable to delete your comment')
        }

        // const deleteComments = db.comments.splice(commentIndex, 1)
        // de-structured way: why? to make it easier and readable
        const [deleteComment] = db.comments.splice(commentIndex, 1)

        pubsub.publish(`comment ${deleteComment.post}`, {
            comment: {
                mutation: 'DELETED',
                data: deleteComment
            }
        })
        return deleteComment
    },
    updateComment(parent, args, { db, pubsub }, info) {
        const comment = db.comments.find(comment => comment.id === args.id)

        if (!comment) {
            throw new Error('Comment not found')
        }

        if (typeof args.data.text === 'string') {
            comment.text = args.data.text
        } 

        pubsub.publish(`comment ${comment.post}`, {
            comment: {
                mutation: 'UPDATED',
                data: comment
            }
        })
        return comment
    }
}

export { Mutation as default }

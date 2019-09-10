const Subscription = {
    comment: {
        subscribe(parent, { postId }, {db, pubsub}, info) {
            // determine if the post exists && if its published
            const postExistsandPublished = db.posts.find((post) => post.id === postId && post.published)

            if (!postExistsandPublished) {
                throw new Error('Post not found')
            }
            // return asyncIterator with a good channelname
            return pubsub.asyncIterator(`comment ${postId}`)
        }
    },
    post: {
        subscribe(parent, args, { pubsub }, info) {
            return pubsub.asyncIterator(`post`)
        }
    }
}

export { Subscription as default}
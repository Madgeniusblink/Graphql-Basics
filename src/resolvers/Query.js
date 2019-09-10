
const Query = {
    users(parent, args, {db}, info) {
        if (!args.query) {
            return db.users
        }

        return db.users.filter((user) => {
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
    posts(parent, args, {db}, info) {
        if(!args.query) {
            return db.posts
        }
        
        return db.posts.filter((post) => {
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
    comments(parent, args, {db}, info) {
        return db.comments
    }

}

export { Query as default }
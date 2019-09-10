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


const comments = [{
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

const db = {
    users,
    posts,
    comments
}

export {
    db as default
}

// Example One
const Subscription = {
    count: {
        subscribe(parent, args, {pubsub}, info) {
            let count = 0

            setInterval(() => {
                count++
                // Publish data
                // pubsub.publish(channelName, object{data that should get send to the client})
                pubsub.publish('count', {
                    count
                })
            }, 1000)

            return pubsub.asyncIterator('count')
        }
    }
}

export { Subscription as default}
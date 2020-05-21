const _     = require('lodash')
const chalk = require('chalk')
const axios = require('axios')

let delay = function (t, v) 
{
    return new Promise(function(resolve) { 
        setTimeout(resolve.bind(null, v), t)
    })
 }

let auth = async function () 
{ 
    let wait = 0
    let tries = 50

    let credentials = {
        username: 'pravosudie',
        password: 'q2w1e4r3'
    }

    let response = await axios.post('https://staging-api.virtwish.com/api/v2/submit', {
        data: JSON.stringify(credentials),
        form: 'LoginForm'
    })

    if (!response.data.success || !response.data.data.attributes.success || _.isEmpty(response.data.data.attributes.result.token)) {
        return new Error('Failed to get token!') 
    }

    console.log(chalk.white.bgMagenta(`Token created. Server: ${response.data.data.attributes.result.server}, Time: ${response.data.data.attributes.result.time}`))

    let token = response.data.data.attributes.result.token

    let requests = []
    
    if (wait > 0) {
        console.log(`Waiting ${ wait / 1000 }s`)
        await delay(wait)
    }
    
    for (let i = 0; i < tries; i++) {
        requests.push(axios.get('https://staging-api.virtwish.com/api/v2/me', {
            headers: {
                authorization: `Bearer ${token}`
            }
        }))
    }

    let responses = await Promise.allSettled(requests)

    _.each(responses, (response, i) => {
        if (_.isEqual(response.status, 'fulfilled')) {
            let { server, time } = response.value.data.data.attributes

            console.log(chalk.green(`${i + 1}: Request 'api/v2/me' is OK: Server: ${server}, Time: ${time}`))
        } else {
            console.log(chalk.red(`${i + 1}: Request 'api/v2/me' is ERROR: ${response.reason.response.data.error.message}`))
        }
    })

    return 'Done'
}

let exit = function (data = null) 
{ 
    console.log('End:', data)
    process.exit(0)
}

auth().then((results) => {
    exit(results) 
}).catch((e) => {
    exit(e)
})
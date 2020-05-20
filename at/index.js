const _ = require('lodash')
const axios = require('axios')

let auth = async function () 
{ 
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

    let token = response.data.data.attributes.result.token

    let requests = []
     
    for (let i = 0; i < tries; i++) {
        requests.push(axios.get('https://staging-api.virtwish.com/api/v2/me', {
            headers: {
                authorization: `Bearer ${token}`
            }
        }))
    }

    let responses = await Promise.allSettled(requests)

    _.each(responses, (response, i) => {
        console.log(`${i}: Request is ${ response.status === 'fulfilled' ? 'OK' : 'ERROR'}`)
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
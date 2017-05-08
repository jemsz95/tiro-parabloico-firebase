var functions = require('firebase-functions');

// Launches that are not favorited will be deleted
// when they reach the launch count limit
const LAUNCH_LIMIT = 30;

exports.limitLaunches = functions.database.ref('/launches/{launch}')
    .onWrite(event => {
        const launchAuthor = event.data.child('author').val()
        const userLaunchesQuery = event.data.ref.parent.orderByChild('author').equalTo(launchAuthor)
        
        userLaunchesQuery.once('value', userLaunches => {
            let notFavorites = []

            userLaunches.forEach(launch => {
                if(!launch.child('favorite').val()) {
                    notFavorites.push(launch)   
                }
            })

            let count = 0;

            for(let i = notFavorites.length - 1; i >= 0; i--) {
                if(count < LAUNCH_LIMIT) {
                    count ++
                } else {
                    notFavorites[i].ref.remove()
                }
            }
        }, error => {
            console.log('Could not read launches of the user ' + launchAuthor)
        })
    });

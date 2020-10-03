const usersCollection = require('../db').db().collection('users')

let User = function(data) {
    this.data = data
    this.errors = [] 
}

User.prototype.cleanUp = function() { 
    //get rid of bogus properties
    this.data = {
        username : this.data.username.trim(),
        password : this.data.password
    }
}

User.prototype.login = function() {
    return new Promise((resolve,reject) => {
        this.cleanUp()
        usersCollection.findOne({username : this.data.username}).then((attemptedUser) => {
            if (attemptedUser && attemptedUser.password == this.data.password) {
                resolve("User Found")
            } else {
                console.log("user not found in model")
                reject("Invalid username/password")
            }
        }).catch(() => {
            console.log("db error")
        })
    })

}

module.exports = User
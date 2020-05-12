const stripe = require('stripe')
console.log(process.env.STRIPE_SECRET_KEY)
module.exports = stripe(process.env.STRIPE_SECRET_KEY)

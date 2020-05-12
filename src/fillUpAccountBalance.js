const stripe = require('./stripe')

;(async () => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 4000,
      currency: 'gbp',
      confirm: true,
      payment_method_data: {
        type: 'card',
        card: {
          number: '4242424242424242',
          exp_month: '12',
          exp_year: '24',
          cvc: '123',
        },
      },
      payment_method_types: ['card'],
    })
    console.log(paymentIntent)
  } catch (error) {
    console.error(error)
  }
})()

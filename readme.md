## Testing account verification

Docs: [https://stripe.com/docs/connect/testing](https://stripe.com/docs/connect/testing)

## Create an account which succeeds verification

See the code in [src/createAccount.js](https://glitch.com/edit/#!/uw-stripe-account-demo?path=src%2FcreateAccount.js%3A37%3A15)

Set `STRIPE_SECRET_KEY=sk_test_my_secret_key` in `.env` file
```
npm install
npm run createAccount
```

## Monitoring webhooks

Download [stripe-cli](https://stripe.com/docs/stripe-cli#install)

run: 

```
stripe login

stripe listen --print-json --events account.updated
```

Wait for ~1-2 minutes
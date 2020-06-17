## Testing account verification

Docs: https://stripe.com/docs/connect/testing#test-dobs

## Ct

## Monitoring webhooks

Download [stripe-cli](https://stripe.com/docs/stripe-cli#install)

run: 

```
stripe login

stripe listen --print-json --events account.updated
```

Wait for ~1-2 minutes
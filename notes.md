## Limited Payees

Limited payees is a feature that Stripe must explicitly enable on your account for this example to work.

## Possible failures

### Synchronous failures

- The call to create an account can fail (e.g. if the postcode isn't valid)
- Creating a transfer can fail (e.g. if there isn't enough balance in your account)

### Asynchronous failures

- Connect account verficiation fails or payouts do not get enabled.
- Payout to bank account fails

You can monitor these things with the webhooks below.

## Webhook events to monitor

- [account.updated](https://stripe.com/docs/api/events/types#event_types-account.updated)
- [transfer.paid](https://stripe.com/docs/api/events/types#event_types-transfer.paid)
- [transfer.failed](https://stripe.com/docs/api/events/types#event_types-transfer.failed)
- [payout.failed](https://stripe.com/docs/api/events/types#event_types-payout.failed)

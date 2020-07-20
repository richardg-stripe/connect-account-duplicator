## Prerequisites

Node 12. 

`npm install`


`.env` should contain: `STRIPE_SECRET_KEY=sk_xyz`

## Usage


`npm run migrate -- --help`

Example usage
`npm run migrate -- --before-date=2020-07-20 --dry-run=false --batch-size=10`

This command finds accounts eligible to migrate: no transfers, before before-date (RBO go live date), payouts disabled, and after the last processed account date.

Accounts are processed in order of creation


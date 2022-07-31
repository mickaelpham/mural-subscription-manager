# MURAL Subscription Manager

This is just a sample application using Node.js and TypeScript to demo the
different plans that can be purchased in the billing page for
[MURAL](https://mural.co).

## Setup

Checkout the repository and install the dependencies

```sh
git checkout https://github.com/mickaelpham/mural-subscription-manager.git
cd mural-subscription-manager
npm install
```

Configure your local database and Stripe API key

```sh
cp .env.sample .env
nano .env
```

Migrate the database and start the application

```sh
npx prisma migrate dev
npm start
```

## Usage

Create a workspace

```sh
curl --request POST \
  --url http://localhost:8080/workspaces/ \
  --header 'Content-Type: application/json' \
  --data '{
	"name": "Charlie'\''s Workspace",
	"billingEmail": "mickael.pham+charlie@gmail.com"
}'
```

Edit the billing address

```sh
curl --request POST \
  --url http://localhost:8080/workspaces/1/billing-address \
  --header 'Content-Type: application/json' \
  --data '{
	"line1": "1035 Market St",
	"city": "San Francisco",
	"postalCode": "94103",
	"state": "CA",
	"country": "US"
}'
```

Edit the workspace subscription

```sh
curl --request POST \
  --url http://localhost:8080/workspaces/1/subscription \
  --header 'Content-Type: application/json' \
  --data '{
	"plan": "business",
	"memberships": 5,
	"billingPeriod": "annual"
}'
```

## Webhooks

Use [these instructions](https://stripe.com/docs/stripe-cli/about-events) to
listen to incoming Stripe events in dev.

```sh
# Make sure you are logged in
stripe login

# Start forwarding events
stripe listen --forward-to localhost:8080/webhooks/stripe
```

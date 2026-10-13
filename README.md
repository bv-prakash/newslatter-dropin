# Newsletter drop-in

Email signup and subscription management for an Adobe Commerce storefront. Supported Node versions are 20 and 22.

Every on-screen label comes from the newsletter placeholder sheet. Put these rows in that sheet only.

## Install and run

```bash
npm install
```

Put the GraphQL endpoint in `.env`. Storybook reads it. The sandbox endpoint is set in `examples/html-host/index.html`.

```env
ENDPOINT="https://your-store.example/graphql"
```

```bash
npm run dev
```

- Sandbox: http://127.0.0.1:3000
- Storybook: http://localhost:6006

```bash
npm test
npm run build
```

## Labels

In the placeholders library, create a placeholder named `newsletter`. That publishes `placeholders/newsletter.json`, next to `placeholders/global.json`.

The sheet has the same two columns as global. After the placeholder exists, edit the Value cells. Keys you leave out keep the default in `placeholders/newsletter.json`.

| Key | Value |
| --- | --- |
| `Newsletter.Form.title` | Subscribe to our newsletter |
| `Newsletter.Form.description` | Be the first to hear about new products, offers, and stories. |
| `Newsletter.Form.emailLabel` | **Email address** |
| `Newsletter.Form.emailPlaceholder` | **Enter your email address** |
| `Newsletter.Form.submit` | Subscribe |
| `Newsletter.Form.submitting` | Subscribing... |
| `Newsletter.Form.invalidEmail` | Enter a valid email address. |
| `Newsletter.Form.success` | Thanks for subscribing. |
| `Newsletter.Form.error` | We couldn't subscribe you. Please try again. |
| `Newsletter.Minified.title` | Newsletter |
| `Newsletter.Minified.subscribed` | Subscribed to the general newsletter. |
| `Newsletter.Minified.unsubscribed` | Not subscribed. |
| `Newsletter.Minified.edit` | Edit |
| `Newsletter.Subscription.title` | Subscription option |
| `Newsletter.Subscription.general` | General Subscription |
| `Newsletter.Subscription.save` | SAVE |
| `Newsletter.Subscription.saving` | Saving... |
| `Newsletter.Subscription.saved` | Subscription saved. |
| `Newsletter.Subscription.error` | We couldn't update your subscription. Please try again. |
| `Newsletter.Status.loading` | Loading subscription... |
| `Newsletter.Status.loadError` | We couldn't load your subscription. Please try again. |

**Email address** (`Newsletter.Form.emailLabel`) is the accessible name of the field. The text inside the box is the placeholder, **Enter your email address** (`Newsletter.Form.emailPlaceholder`).

```js
import { initializers } from '@dropins/tools/initializer.js';
import * as newsletter from '@prakash.gurung/commerce-newsletter/api.js';

initializers.register(newsletter.initialize, {
  placeholderSheet: '/placeholders/newsletter.json',
});

initializers.mount();
```

## Mount

```js
import * as newsletter from '@prakash.gurung/commerce-newsletter/api.js';
import { render } from '@prakash.gurung/commerce-newsletter/render.js';
import NewsletterContainer from '@prakash.gurung/commerce-newsletter/containers/NewsletterContainer.js';

newsletter.setEndpoint('https://your-store.example/graphql');

render.render(NewsletterContainer, {
  // view options below
})(document.getElementById('newsletter'));
```

The page block is a table named `commerce-newsletter`.

| commerce-newsletter | |
| --- | --- |
| Minified view | `true`, `false`, or leave the row out |
| Newsletter page | optional Edit path |

| Minified view | What the shopper sees |
| --- | --- |
| row omitted | Email form |
| `true` | Subscription status and Edit |
| `false` | General Subscription checkbox and SAVE |

`minified` accepts the boolean or the string from the table cell (`"true"` / `"false"`). Signed-in customers are required for both minified views. The drop-in reads `customer.is_subscribed`.

## Edit path

Leave **Newsletter page** empty. Edit reads the current address, keeps the storefront root in front of `account`, and opens `{root}/account/newsletter`.

| Current page | Edit opens |
| --- | --- |
| `/root/account` | `/root/account/newsletter` |
| `/root/account/orders` | `/root/account/newsletter` |
| `/account` | `/account/newsletter` |

Set **Newsletter page** only when the checkbox page lives somewhere else.

| commerce-newsletter | |
| --- | --- |
| Minified view | true |
| Newsletter page | /customer/newsletter |

```js
render.render(NewsletterContainer, {
  minified: true,
  newsletterUrl: '/customer/newsletter',
})(document.getElementById('newsletter-summary'));
```

Place the checkbox view (`Minified view` = `false`) on the page Edit opens.

## 1. Normal form

Use this on a marketing or footer placement. Omit Minified view.

```js
render.render(NewsletterContainer, {})(document.getElementById('newsletter'));
```

The shopper sees the title, the description, the email placeholder, and Subscribe.

1. An empty or invalid address shows `Newsletter.Form.invalidEmail`.
2. A valid address is sent with `subscribeEmailToNewsletter`.
3. Status `SUBSCRIBED` or `UNCONFIRMED` shows the success text and clears the field.
4. Any other result shows the API message, or `Newsletter.Form.error`.

A successful subscribe emits `newsletter/subscribed` with `{ email, status }`.

`title`, `description`, and `placeholder` on the render call replace the sheet for that one mount:

```js
render.render(NewsletterContainer, {
  title: 'Join the list',
  description: 'Weekly notes.',
  placeholder: 'you@example.com',
})(document.getElementById('newsletter'));
```

## 2. Minified view true

Use this on the account summary. The shopper sees the subscription state and **Edit**.

| commerce-newsletter | |
| --- | --- |
| Minified view | true |

```js
render.render(NewsletterContainer, {
  minified: true,
})(document.getElementById('newsletter-summary'));
```

1. The drop-in loads the signed-in customer's subscription.
2. Subscribed customers see `Newsletter.Minified.subscribed`. Everyone else sees `Newsletter.Minified.unsubscribed`.
3. **Edit** follows the [Edit path](#edit-path).

## 3. Minified view false

Use this on the newsletter page. The shopper sees **Subscription option**, the **General Subscription** checkbox, and **SAVE**. Checking the box subscribes. Clearing it unsubscribes. The choice is sent only when the shopper chooses SAVE.

| commerce-newsletter | |
| --- | --- |
| Minified view | false |

```js
render.render(NewsletterContainer, {
  minified: false,
})(document.getElementById('newsletter'));
```

1. The drop-in loads `customer.is_subscribed` and checks the box when the customer is already subscribed.
2. The shopper checks or clears **General Subscription**.
3. SAVE sends `updateCustomerV2` with `{ input: { is_subscribed } }`. `true` subscribes. `false` unsubscribes.

4. The button reads `Newsletter.Subscription.saving` while the request runs, then `Newsletter.Subscription.saved`.
5. A failed save shows the API message, or `Newsletter.Subscription.error`.

A successful save emits `newsletter/updated` with `{ subscribed }`.

## Files

| Piece | File |
| --- | --- |
| Normal email form | `src/components/NewsletterForm/NewsletterForm.tsx` |
| Minified summary and checkbox | `src/components/NewsletterSubscription/NewsletterSubscription.tsx` |
| View and Edit path | `src/containers/NewsletterContainer/NewsletterContainer.tsx` |
| Subscribe, load, and save | `src/api/newsletter/newsletter.ts` |
| Default copy | `src/i18n/en_US.json` |
| Placeholder merge | `src/api/initialize/initialize.ts` |
| Newsletter label sheet | `placeholders/newsletter.json` |
| Local host page | `examples/html-host/index.html` |

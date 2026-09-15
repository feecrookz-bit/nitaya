# What we need to connect the new site

To whoever looks after nityastones.co.uk (WordPress and WooCommerce), the domain, and the stock tracker. Sent by Fee; Coleisha at the yard can do the account steps on the company email where no account exists yet.

The new site is built and audited. It is not connected to anything: it cannot take an order or read stock, and the domain still points at the old site. Everything below is what stands between that and go-live. Nothing changes for customers until the final step, and the old site stays up throughout.

## 1. A Cloudflare account in the company's name

This is where the new site, its address and (later) the stock system live. Free plan.

- If the company has no Cloudflare account: Coleisha creates one at dash.cloudflare.com with the company email, then Manage Account → Members → invite fee@ as Administrator.
- If one exists: add Fee as Administrator the same way.
- Membership is simpler and safer than an API token. If a token is preferred instead: My Profile → API Tokens → Create Token, with Account permissions Cloudflare Pages Edit, Workers Scripts Edit, D1 Edit, Access: Apps and Policies Edit, and Zone permissions DNS Edit and Workers Routes Edit for nityastones.co.uk.

## 2. The domain onto Cloudflare DNS

- In that Cloudflare account: Add a domain → nityastones.co.uk. Cloudflare reads the current DNS records and shows two nameservers.
- At the registrar (wherever nityastones.co.uk was bought): replace the nameservers with those two. Needs the registrar login; if Coleisha does not have it, whoever renews the domain does.
- The old site keeps working exactly as before. The switch to the new site is a separate, later step that we choose the day for.

## 3. WooCommerce

- A REST API key: WordPress admin → WooCommerce → Settings → Advanced → REST API → Add key. Description "New site", user an administrator, permissions Read/Write. It shows a consumer key and a consumer secret once. Send them by phone or WhatsApp, not email.
- Which payment plugins are installed (Stripe, PayPal, Klarna, WooPayments) and their test-mode keys, so trial orders charge nobody.
- Shipping zones and rates as they should be, under WooCommerce → Settings → Shipping, or the rates on paper for us to enter.
- A WordPress administrator login, or a staging copy of the site if the host provides one, for moving the blog and legal pages and setting the redirects.

## 4. A GitHub account for the company

The site's code moves to the company. Coleisha creates a GitHub organisation (or account) on the company email at github.com, then adds fee and Coleisha's own login as members. Fee transfers the repository into it.

## 5. The stock tracker (optional for now)

We have built the foundation of a stock system of our own, so this no longer holds anything up. If the existing tracker is to be kept alongside, we need view access to the "stock tracker main" sheet and the script's web app address, and Simar's confirmation of the two entry points described in the brief already sent.

## In what order

1. Cloudflare account and Fee as a member (Coleisha, 15 minutes).
2. GitHub organisation and Fee as a member (Coleisha, 10 minutes).
3. WooCommerce REST key, plugin list, shipping rates, admin login (the WordPress administrator, 20 minutes).
4. Domain nameservers to Cloudflare (whoever holds the registrar login, 10 minutes; a day for it to settle).
5. Fee connects the site, places test orders, and agrees the go-live day with the owner.

Send anything secret (keys, passwords) by phone or WhatsApp. Never in an email chain.

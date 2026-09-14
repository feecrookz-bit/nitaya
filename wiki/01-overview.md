# 1. Overview

## What it is

A complete new front end for nityastones.co.uk: a fast, single-page store built on the yard's own stock, prices and photographs, with an area-based ordering system, a patio builder, guides, projects, trade and contact pages, dark and light themes, and a 3D view of every stone. It runs behind a password gate on GitHub Pages for review, and is prepared to go live on Cloudflare Pages.

It replaces a WordPress/WooCommerce store whose listings contradict each other and whose pack sizes disagree with the warehouse. The new site takes its pack sizes from the warehouse database and its prices from the store, and computes everything else from those.

## What it is not yet

- **Connected.** It does not talk to WooCommerce or the warehouse stock tracker. The checkout stops at the last step. No payment is taken, nothing is stored on a server.
- **On the domain.** nityastones.co.uk still points at the old site.
- **Carrying the blog and legal pages.** The 45 blog posts, Terms, Privacy, Refunds, Delivery Terms and My Account stay on WordPress until moved; redirects for all of them are already written.

## The numbers

| | |
|---|---|
| Ranges | 36 as listed on the store, plus cladding as 6 colourways = 41 product pages, plus samples |
| Essentials (jointing, primer, steps, edging, granite) | 15 lines from the warehouse sheet, priced at the counter |
| Photographs | 109 gallery frames, 23 project photographs, 36 studio renders, 36 textures, all from the yard's own images |
| Guides | 9, with drawings to scale |
| Routes | 69 crawled |
| Source | about 3,700 lines across 11 files in `web/src` |
| Commits | 62, 10 to 14 September 2026 |
| Gated page weight | about 1.1 MB to unlock; images and the 3D code load on demand |

## Where everything lives

- Code: github.com/feecrookz-bit/nitaya, branch `main`. Every push rebuilds the preview by itself.
- Preview: https://feecrookz-bit.github.io/nitaya/ behind a password. The password is a repository secret named SITE_PASSWORD and is given by phone, never in an email chain.
- Owner pack: `present/Nitya-Stones-Website-Upgrade-Pack.pdf`, 23 pages, with `present/SCRIPT.md` for the presenter.
- Stock tracker brief: `present/Nitya-Stones-Stock-Tracker-Link.pdf`.
- Private web copies of the site, the pack, the handover and the updates list exist as Claude artifacts; Fee holds the links.

## The rules it is built to

Nothing invented; only the yard's own photographs; the original logo; pack sizes only from the warehouse sheet; the wet view simulated and labelled; delivery bands marked indicative; no fee or charge the yard has not stated. Page 9 has the full list.

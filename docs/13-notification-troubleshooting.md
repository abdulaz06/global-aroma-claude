# 13 — New-order notifications: troubleshooting plan

**Reported problem:** customers can order and pay, but staff are not notified, and cannot easily see who ordered, what and when.

**Status:** this is a plan. **Nothing has been checked on the live store**, because no WordPress access has been given and none was attempted. Every step below needs the owner's authorisation and an authorised WordPress login. Doc 07 §5–8 has the background; this doc puts it in order.

**Ground rules for whoever does this:** use an existing completed order; no new purchases; change one thing at a time and record it; no test emails until the owner agrees; redact customer details from anything shared outside the company.

## Step 0 — Before touching anything (15 min)

- Take a full backup (files + database), or confirm the host's automatic backup is recent and restorable.
- Write down the current values of every setting you might change (screenshots are fine, with customer details redacted).
- Pick **one recent paid order** as the reference case. Note its gateway transaction ID, amount and time.

## Step 1 — Does the order exist, and in what status? (10 min)

**WooCommerce → Orders.** Find the reference order by date, amount or customer email.

| You see | It means | Go to |
|---|---|---|
| Order present, status **Processing** or **Completed** | Checkout and payment confirmation work; the problem is notification or access | Step 2 |
| Order present, status **Pending payment** or **Failed**, although the gateway shows a successful payment | The gateway's confirmation callback isn't reaching WordPress, so WooCommerce never marks the order paid and never sends *New order* | Step 5 |
| No order at all | Payment taken outside WooCommerce (payment link, manual invoice) or a serious checkout fault | Stop. Escalate to the site's developer or host before anything else |

## Step 2 — Is the *New order* email switched on, and to whom? (10 min)

**WooCommerce → Settings → Emails → New order → Manage.**
- **Enabled** is ticked.
- **Recipient(s)** are current, monitored mailboxes (e.g. a shared `orders@` address plus named staff). Remove test, developer and former-staff addresses. The public contact page links to `test-sales@` / `test-info@` addresses (doc 07 §9), which suggests that test addresses may also be in use here. Check, don't assume.
- **From** address (bottom of the Emails tab) is on the company's own domain.

If the email was off or going to the wrong address, fix it (with authorisation) and go to Step 4 to confirm delivery.

## Step 3 — Can staff see orders without relying on email? (15 min)

Email is one channel; the Orders screen is the source of truth.
- Give each person who handles orders **their own** WordPress user with the **Shop manager** role. No shared admin passwords.
- Optionally set up the official WooCommerce mobile app on a work phone for new-order push notifications. *(Confirm availability and requirements at setup.)*
- Show staff how to search orders by number, email or name, and how to read an order page (doc 07 §3).

This alone answers "who, what, when" even while email is being fixed.

## Step 4 — Is the email actually being sent and delivered? (30–60 min)

1. **Is mail sent at all?** Install or open an SMTP/logging plugin (for example WP Mail SMTP or FluentSMTP) and check its **email log** for the reference order's time. No entry means WordPress never tried to send: go back to Steps 1–2.
2. **Is it accepted?** The log shows a send error. Most often the host blocks PHP `mail()`. Connect the plugin to the company's mail provider (Microsoft 365, Google Workspace, Zoho…) or a transactional email service, using that provider's recommended authentication.
3. **Is it delivered?** If the log says "sent" but nobody has it, check spam or quarantine, then the sending domain's DNS: **SPF** includes the sender, **DKIM** is enabled for it, and a **DMARC** record exists. Mail-tester-style tools show the result without involving customers.
4. **Confirm:** with the owner's agreement, send the plugin's test email to the recipients. Then, ideally, re-send *New order* for the reference order from its order page (**Order actions → Resend new order notification**) and confirm every recipient gets it.

## Step 5 — Payment confirmed but order stuck in *Pending payment* (30–90 min)

- **WooCommerce → Status → Logs**: open the gateway's log for the reference time.
- In the gateway's merchant dashboard, check the **webhook / notification / IPN URL**. It must point at the live site's current address over HTTPS, and recent deliveries should succeed.
- Check that no security plugin, firewall or host rule blocks the gateway's callback requests.
- Check the gateway plugin is up to date and in **live** (not test) mode with live keys.
- Fix with the gateway's documentation, then confirm with the next real order that the status moves to *Processing* automatically.

## Step 6 — Matching a payment to its order (ongoing)

Doc 07 §7 has the procedure: gateway reference or description → order number → compare amount, date and transaction ID. Whether *every* payment can be matched depends on what the installed gateway records. **Confirm this with real completed orders; it isn't guaranteed.**

## Step 7 — Keep it working

- Put a shared mailbox (e.g. `orders@`) in the recipient list, so notifications don't depend on one person.
- Keep the SMTP log enabled; check it monthly or when someone reports a missing email.
- When staff change, update both the recipient list and the WordPress users.
- After any plugin, gateway or host change, look at the next real order end-to-end.

## Expected result

| Check | Done when |
|---|---|
| Orders reach *Processing* after payment | Reference order and the next real order both do |
| *New order* email enabled, with correct recipients | Settings screenshot after the change |
| Email sent and delivered | SMTP log shows "sent"; every recipient confirms receipt |
| Staff can open orders themselves | Each named person logs in with their own Shop manager account |
| Payment ↔ order matching | One real payment traced to its order by reference, amount and time |

**Rough effort:** 2–5 hours with access, depending on what Steps 4–5 find. Not included: rebuilding the store, changing payment providers, or custom notification software.

/** @jsxImportSource preact */
/**
 * Staff Workspace (demonstration). Runs entirely in the browser on synthetic
 * orders from DemoOrderSource. The UI reads through the OrderSource interface,
 * so a future authorised source can replace the demo without UI changes.
 */
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { DemoOrderSource, type DemoProduct } from '../../staff/demo-source';
import { applyQuery, itemCount, paymentState, PAYMENT_LABEL, STATUS_LABEL, type Order, type OrderQuery, type OrderStatus } from '../../staff/types';

const TZ = 'Asia/Dubai';
const fmtMoney = (n: number, cur = 'AED') => `${cur} ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: TZ });
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: TZ });
const fmtFull = (iso: string) => new Date(iso).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: TZ }) + ' GST';
const dayKey = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: TZ });
function ago(iso: string, now: number) {
  const m = Math.round((now - +new Date(iso)) / 60000);
  if (m < 1) return 'just now'; if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60); if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24); return `${d} day${d > 1 ? 's' : ''} ago`;
}
function summary(o: Order) {
  const [first, ...rest] = o.lines;
  if (!first) return '—';
  return `${first.name}${first.quantity > 1 ? ` ×${first.quantity}` : ''}${rest.length ? ` + ${rest.length} more` : ''}`;
}

type Tab = 'all' | 'attention' | OrderStatus;
const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All' }, { id: 'attention', label: 'Needs action' }, { id: 'processing', label: 'Processing' },
  { id: 'pending', label: 'Pending payment' }, { id: 'on-hold', label: 'On hold' }, { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' }, { id: 'refunded', label: 'Refunded' },
];
type Range = 'any' | 'today' | '7' | '30' | 'custom';

function StatusBadge({ o }: { o: Order }) {
  return <span class={`sb sb-${o.status}`}>{STATUS_LABEL[o.status]}</span>;
}
function PayBadge({ o }: { o: Order }) {
  const p = paymentState(o);
  return <span class={`pb pb-${p}`}><i aria-hidden="true" />{PAYMENT_LABEL[p]}</span>;
}

export default function StaffApp({ products }: { products: DemoProduct[] }) {
  const source = useMemo(() => new DemoOrderSource(products), []);
  const [orders, setOrders] = useState<Order[]>(() => source.all());
  const [tab, setTab] = useState<Tab>('all');
  const [q, setQ] = useState('');
  const [range, setRange] = useState<Range>('any');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sort, setSort] = useState<NonNullable<OrderQuery['sort']>>('newest');
  const [openId, setOpenId] = useState<number | null>(null);
  const [emailFor, setEmailFor] = useState<Order | null>(null);
  const [toasts, setToasts] = useState<Order[]>([]);
  const [bellOpen, setBellOpen] = useState(false);
  const [now, setNow] = useState(Date.now());
  // Guided walkthrough for first-time visitors: each step can be done from here.
  const [guide, setGuide] = useState(true);
  const [done, setDone] = useState({ simulate: false, open: false, email: false, reset: false });
  const mark = (k: keyof typeof done) => setDone((d) => (d[k] ? d : { ...d, [k]: true }));
  const drawer = useRef<HTMLDialogElement>(null);
  const emailDlg = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t); }, []);

  const query: OrderQuery = useMemo(() => {
    const today = new Date(dayKey(new Date()) + 'T00:00:00+04:00');
    const f = range === 'today' ? today.toISOString()
      : range === '7' ? new Date(Date.now() - 7 * 864e5).toISOString()
      : range === '30' ? new Date(Date.now() - 30 * 864e5).toISOString()
      : range === 'custom' && from ? new Date(from + 'T00:00:00+04:00').toISOString() : undefined;
    const t = range === 'custom' && to ? new Date(to + 'T23:59:59+04:00').toISOString() : undefined;
    return { q, status: tab, from: f, to: t, sort };
  }, [q, tab, range, from, to, sort]);
  const visible = useMemo(() => applyQuery(orders, query), [orders, query]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length, attention: 0 };
    for (const o of orders) { c[o.status] = (c[o.status] ?? 0) + 1; if (o.status === 'processing' || o.status === 'pending' || o.status === 'on-hold') c.attention++; }
    return c;
  }, [orders]);
  const stats = useMemo(() => {
    const todayKey = dayKey(new Date(now));
    const paid = orders.filter((o) => paymentState(o) === 'paid');
    const today = paid.filter((o) => dayKey(new Date(o.paidAt ?? o.createdAt)) === todayKey);
    const week = paid.filter((o) => now - +new Date(o.paidAt ?? o.createdAt) < 7 * 864e5);
    return {
      unseen: orders.filter((o) => o.unseen).length,
      toFulfil: orders.filter((o) => o.status === 'processing').length,
      awaiting: orders.filter((o) => o.status === 'pending' || o.status === 'on-hold').length,
      todayTotal: today.reduce((s, o) => s + o.total, 0), todayCount: today.length,
      weekTotal: week.reduce((s, o) => s + o.total, 0), weekCount: week.length,
    };
  }, [orders, now]);
  const activity = useMemo(() => orders.flatMap((o) => o.events.map((e) => ({ ...e, o }))).filter((e) => +new Date(e.at) <= now).sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 8), [orders, now]);
  const open = openId ? orders.find((o) => o.id === openId) ?? null : null;

  function openOrder(id: number, el?: EventTarget | null) {
    opener.current = (el as HTMLElement) ?? (document.activeElement as HTMLElement);
    source.markSeen(id); setOrders([...source.all()]); setOpenId(id); setBellOpen(false);
    if (done.simulate) mark('open');
  }
  useEffect(() => {
    const d = drawer.current; if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  useEffect(() => {
    const d = emailDlg.current; if (!d) return;
    if (emailFor && !d.open) { d.showModal(); mark('email'); }
    if (!emailFor && d.open) d.close();
  }, [emailFor]);

  function simulate() {
    const o = source.simulate();
    setOrders([...source.all()]);
    mark('simulate');
    setToasts((t) => [o, ...t].slice(0, 3));
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== o.id)), 9000);
  }
  function reset() {
    if (!window.confirm) { /* no dialogs available */ }
    source.reset(); setOrders([...source.all()]); setOpenId(null); setToasts([]); setTab('all'); setQ(''); setRange('any');
    if (done.simulate) mark('reset');
  }
  const latest = orders[0];
  const unseenList = orders.filter((o) => o.unseen);

  return (
    <div class="sw">
      <div class="sw-demo" role="note"><b>Demonstration</b> — sample data only. Not connected to live customer orders. <a href="/review/">Review guide</a></div>
      {guide && (
        <section class="sw-guide" aria-label="Try the demonstration" data-testid="guide">
          <div class="sw-guide-hd">
            <p><b>Try it in four steps.</b> This is how staff would see a new order arrive. Everything here is fictional; nothing is sent.</p>
            <button type="button" class="sw-link" onClick={() => setGuide(false)}>Hide</button>
          </div>
          <ol class="sw-steps">
            <li class={done.simulate ? 'ok' : ''}><button type="button" onClick={simulate} data-testid="step-simulate"><span class="sw-n">{done.simulate ? '✓' : '1'}</span><span><b>Simulate a new order</b><small>A notification appears and the counters update</small></span></button></li>
            <li class={done.open ? 'ok' : ''}><button type="button" disabled={!done.simulate} onClick={(e) => { const o = unseenList[0] ?? orders[0]; if (o) openOrder(o.id, e.currentTarget); }} data-testid="step-open"><span class="sw-n">{done.open ? '✓' : '2'}</span><span><b>Open the order</b><small>Customer, products, volume, quantity, time, amount, payment and status</small></span></button></li>
            <li class={done.email ? 'ok' : ''}><button type="button" onClick={() => latest && setEmailFor(latest)} data-testid="step-email"><span class="sw-n">{done.email ? '✓' : '3'}</span><span><b>View the new-order email</b><small>An example of the alert staff would receive</small></span></button></li>
            <li class={done.reset ? 'ok' : ''}><button type="button" onClick={reset} data-testid="step-reset"><span class="sw-n">{done.reset ? '✓' : '4'}</span><span><b>Reset the demonstration</b><small>Back to the original sample orders</small></span></button></li>
          </ol>
        </section>
      )}
      <header class="sw-top">
        <div class="sw-brand"><span class="sw-mark" aria-hidden="true" /><span><b>Global Aroma</b> <span class="sw-sub">Staff · Orders</span></span></div>
        <div class="sw-top-acts">
          <div class="sw-bell-wrap">
            <button type="button" class="sw-icon-btn" aria-label={`Notifications, ${stats.unseen} new`} aria-expanded={bellOpen} onClick={() => setBellOpen(!bellOpen)}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0" fill="none" stroke="currentColor" stroke-width="1.6" /></svg>
              {stats.unseen > 0 && <span class="sw-dot" data-testid="bell-count">{stats.unseen}</span>}
            </button>
            {bellOpen && (
              <div class="sw-bell" role="dialog" aria-label="New orders">
                <p class="sw-bell-h">New orders</p>
                {unseenList.length ? unseenList.map((o) => (
                  <button type="button" class="sw-bell-item" onClick={(e) => openOrder(o.id, e.currentTarget)}>
                    <b>#{o.number}</b> {o.customer.name} · {fmtMoney(o.total)}<span>{ago(o.createdAt, now)}</span>
                  </button>
                )) : <p class="sw-muted">No new orders. Use “Simulate new order” to see one arrive.</p>}
              </div>
            )}
          </div>
          <button type="button" class="sw-btn sw-btn-ghost" onClick={() => latest && setEmailFor(latest)}>Example email</button>
          <button type="button" class="sw-btn sw-btn-ghost" onClick={reset} data-testid="reset">Reset demo</button>
          <button type="button" class="sw-btn sw-btn-primary" onClick={simulate} data-testid="simulate">Simulate new order</button>
        </div>
      </header>

      <section class="sw-stats" aria-label="Overview">
        <div class={`sw-stat${stats.unseen ? ' hot' : ''}`}><span class="sw-stat-l">New, not yet opened</span><b data-testid="stat-new">{stats.unseen}</b><span class="sw-stat-s">orders</span></div>
        <button type="button" class="sw-stat" onClick={() => setTab('processing')}><span class="sw-stat-l">To fulfil</span><b data-testid="stat-processing">{stats.toFulfil}</b><span class="sw-stat-s">processing</span></button>
        <button type="button" class="sw-stat" onClick={() => setTab('attention')}><span class="sw-stat-l">Awaiting payment</span><b>{stats.awaiting}</b><span class="sw-stat-s">pending or on hold</span></button>
        <div class="sw-stat"><span class="sw-stat-l">Payments recorded today</span><b data-testid="stat-today">{fmtMoney(stats.todayTotal)}</b><span class="sw-stat-s">{stats.todayCount} order{stats.todayCount === 1 ? '' : 's'} · sample</span></div>
        <div class="sw-stat"><span class="sw-stat-l">Last 7 days</span><b>{fmtMoney(stats.weekTotal)}</b><span class="sw-stat-s">{stats.weekCount} paid orders · sample</span></div>
      </section>

      <div class="sw-main">
        <section class="sw-orders" aria-labelledby="sw-orders-h">
          <div class="sw-orders-head">
            <h1 id="sw-orders-h">Orders</h1>
            <p class="sw-muted" aria-live="polite" data-testid="result-count">{visible.length} of {orders.length}</p>
          </div>
          <div class="sw-tabs" role="tablist" aria-label="Order status">
            {TABS.map((t) => (
              <button type="button" role="tab" aria-selected={tab === t.id} class="sw-tab" onClick={() => setTab(t.id)}>
                {t.label} <span>{counts[t.id] ?? 0}</span>
              </button>
            ))}
          </div>
          <div class="sw-filters">
            <label class="sw-search"><span class="vh">Search orders</span>
              <input type="search" placeholder="Search order no., customer, email or product" value={q} onInput={(e) => setQ((e.target as HTMLInputElement).value)} data-testid="search" />
            </label>
            <label><span class="vh">Date</span>
              <select value={range} onChange={(e) => setRange((e.target as HTMLSelectElement).value as Range)} data-testid="range">
                <option value="any">Any date</option><option value="today">Today</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="custom">Custom range…</option>
              </select>
            </label>
            {range === 'custom' && <>
              <label class="sw-date"><span>From</span><input type="date" value={from} onInput={(e) => setFrom((e.target as HTMLInputElement).value)} /></label>
              <label class="sw-date"><span>To</span><input type="date" value={to} onInput={(e) => setTo((e.target as HTMLInputElement).value)} /></label>
            </>}
            <label><span class="vh">Sort</span>
              <select value={sort} onChange={(e) => setSort((e.target as HTMLSelectElement).value as typeof sort)} data-testid="sort">
                <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="total-desc">Highest total</option><option value="total-asc">Lowest total</option>
              </select>
            </label>
          </div>

          {visible.length === 0 ? (
            <div class="sw-empty" data-testid="empty">
              <p><b>No orders match.</b></p>
              <p class="sw-muted">Try another search or status, or <button type="button" class="sw-link" onClick={() => { setTab('all'); setQ(''); setRange('any'); }}>clear the filters</button>.</p>
            </div>
          ) : (
            <>
              <table class="sw-table" data-testid="orders-table">
                <thead><tr><th scope="col">Order</th><th scope="col">Placed</th><th scope="col">Customer</th><th scope="col">Products</th><th scope="col" class="r">Items</th><th scope="col" class="r">Total</th><th scope="col">Payment</th><th scope="col">Status</th></tr></thead>
                <tbody>
                  {visible.map((o) => (
                    <tr class={o.unseen ? 'unseen' : ''} onClick={(e) => openOrder(o.id, e.currentTarget)} data-order={o.number}>
                      <td><button type="button" class="sw-row-btn" onClick={(e) => { e.stopPropagation(); openOrder(o.id, e.currentTarget); }}>#{o.number}</button>{o.unseen && <span class="sw-new">New</span>}</td>
                      <td><span class="sw-nowrap">{fmtDate(o.createdAt)}</span> <span class="sw-muted">{fmtTime(o.createdAt)}</span></td>
                      <td>{o.customer.name}</td>
                      <td class="sw-prod">{summary(o)}</td>
                      <td class="r">{itemCount(o)}</td>
                      <td class="r sw-num">{fmtMoney(o.total, o.currency)}</td>
                      <td><PayBadge o={o} /></td>
                      <td><StatusBadge o={o} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ul class="sw-cards" data-testid="orders-cards">
                {visible.map((o) => (
                  <li>
                    <button type="button" class={`sw-card${o.unseen ? ' unseen' : ''}`} onClick={(e) => openOrder(o.id, e.currentTarget)}>
                      <span class="sw-card-top"><b>#{o.number}</b>{o.unseen && <span class="sw-new">New</span>}<span class="sw-num">{fmtMoney(o.total, o.currency)}</span></span>
                      <span class="sw-card-c">{o.customer.name} · {itemCount(o)} item{itemCount(o) === 1 ? '' : 's'}</span>
                      <span class="sw-card-p">{summary(o)}</span>
                      <span class="sw-card-b"><span class="sw-muted">{fmtDate(o.createdAt)}, {fmtTime(o.createdAt)}</span><PayBadge o={o} /><StatusBadge o={o} /></span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <aside class="sw-side" aria-labelledby="sw-act-h">
          <h2 id="sw-act-h">Recent activity</h2>
          <ol class="sw-activity">
            {activity.map((e) => (
              <li><span class={`sw-ev sw-ev-${e.kind}`} aria-hidden="true" /><div><button type="button" class="sw-link" onClick={(ev) => openOrder(e.o.id, ev.currentTarget)}>#{e.o.number}</button> {e.text}<span class="sw-muted"> · {ago(e.at, now)}</span></div></li>
            ))}
          </ol>
          <div class="sw-howto">
            <h2>How staff hear about orders</h2>
            <p>Each paid order would arrive three ways: in this list, as a notification, and as WooCommerce’s “New order” email to the shop’s chosen inboxes. <button type="button" class="sw-link" onClick={() => latest && setEmailFor(latest)}>See an example email</button>.</p>
          </div>
        </aside>
      </div>

      <div class="sw-toasts" aria-live="polite" aria-atomic="false">
        {toasts.map((o) => (
          <div class="sw-toast" role="status" data-testid="toast">
            <span class="sw-toast-dot" aria-hidden="true" />
            <div><b>New order #{o.number}</b><span>{o.customer.name} · {itemCount(o)} item{itemCount(o) === 1 ? '' : 's'} · {fmtMoney(o.total)}</span></div>
            <button type="button" class="sw-btn sw-btn-sm" onClick={(e) => { openOrder(o.id, e.currentTarget); setToasts((t) => t.filter((x) => x.id !== o.id)); }}>Open</button>
            <button type="button" class="sw-x" aria-label="Dismiss" onClick={() => setToasts((t) => t.filter((x) => x.id !== o.id))}>×</button>
          </div>
        ))}
      </div>

      <dialog ref={drawer} class="sw-drawer" aria-labelledby="sw-d-title" onClose={() => { setOpenId(null); opener.current?.focus?.(); }} onClick={(e) => { if (e.target === drawer.current) drawer.current?.close(); }}>
        {open && (
          <div class="sw-d" data-testid="order-detail">
            <div class="sw-d-head">
              <div>
                <p class="sw-muted sw-d-k">Order · sample</p>
                <h2 id="sw-d-title">#{open.number}</h2>
                <p class="sw-d-when">{fmtFull(open.createdAt)}</p>
              </div>
              <button type="button" class="sw-btn sw-btn-ghost" onClick={() => drawer.current?.close()}>Close</button>
            </div>
            <div class="sw-d-badges"><PayBadge o={open} /><StatusBadge o={open} /></div>

            <section class="sw-d-sec">
              <h3>Customer</h3>
              <p class="sw-d-name">{open.customer.name} <span class="sw-sample">Sample</span></p>
              <p><a href={`mailto:${open.customer.email}`}>{open.customer.email}</a>{open.customer.phone && <> · <span class="sw-nowrap">{open.customer.phone}</span></>}</p>
              {open.customer.address && <p class="sw-muted">{open.customer.address}</p>}
              {open.customerNote && <p class="sw-note">“{open.customerNote}”</p>}
            </section>

            <section class="sw-d-sec">
              <h3>Items <span class="sw-muted">({itemCount(open)})</span></h3>
              <table class="sw-items">
                <thead><tr><th scope="col">Product</th><th scope="col" class="r">Qty</th><th scope="col" class="r">Unit</th><th scope="col" class="r">Total</th></tr></thead>
                <tbody>
                  {open.lines.map((l) => (
                    <tr><td><b>{l.name}</b>{l.variation && <span class="sw-muted"> · {l.variation}</span>}{l.sku && <span class="sw-sku">SKU {l.sku}</span>}</td><td class="r">{l.quantity}</td><td class="r sw-num">{fmtMoney(l.unitPrice)}</td><td class="r sw-num">{fmtMoney(l.total)}</td></tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr><td colSpan={3}>Subtotal</td><td class="r sw-num">{fmtMoney(open.subtotal)}</td></tr>
                  <tr><td colSpan={3}>Shipping</td><td class="r sw-num">{open.shipping ? fmtMoney(open.shipping) : 'Free'}</td></tr>
                  <tr><td colSpan={3}>VAT <span class="sw-muted">(sample rate)</span></td><td class="r sw-num">{fmtMoney(open.tax)}</td></tr>
                  <tr class="sw-total"><td colSpan={3}>Total</td><td class="r sw-num">{fmtMoney(open.total, open.currency)}</td></tr>
                </tfoot>
              </table>
            </section>

            <section class="sw-d-sec sw-d-pay">
              <h3>Payment</h3>
              <dl>
                <div><dt>Status</dt><dd>{PAYMENT_LABEL[paymentState(open)]}{open.paidAt && <span class="sw-muted"> · {fmtFull(open.paidAt)}</span>}</dd></div>
                <div><dt>Method</dt><dd>{open.paymentMethod ?? '—'}</dd></div>
                <div><dt>Transaction ref.</dt><dd class="sw-mono">{open.transactionId ?? '—'}</dd></div>
              </dl>
              <p class="sw-muted sw-fine">Card numbers are never shown or stored here. The transaction reference matches the payment provider’s record.</p>
            </section>

            <section class="sw-d-sec">
              <h3>History</h3>
              <ol class="sw-hist">
                {[...open.events].reverse().map((e) => <li><span class={`sw-ev sw-ev-${e.kind}`} aria-hidden="true" /><div>{e.text}<span class="sw-muted">{fmtFull(e.at)}</span></div></li>)}
              </ol>
            </section>

            <div class="sw-d-foot">
              <button type="button" class="sw-btn sw-btn-ghost" onClick={() => setEmailFor(open)}>View the New order email</button>
              <span class="sw-muted sw-fine">In the live system, changes (status, refunds) stay in WooCommerce admin. This view is read-only.</span>
            </div>
          </div>
        )}
      </dialog>

      <dialog ref={emailDlg} class="sw-email-dlg" aria-labelledby="sw-e-title" onClose={() => setEmailFor(null)} onClick={(e) => { if (e.target === emailDlg.current) emailDlg.current?.close(); }}>
        {emailFor && (
          <div class="sw-email-wrap" data-testid="email-preview">
            <div class="sw-email-meta">
              <p class="sw-demo-inline">Example only. No email has been sent.</p>
              <dl>
                <div><dt>From</dt><dd>Global Aroma store &lt;orders@example.com&gt;</dd></div>
                <div><dt>To</dt><dd>orders@example.com, manager@example.com <span class="sw-muted">(sample recipients)</span></dd></div>
                <div><dt>Subject</dt><dd id="sw-e-title">[Global Aroma]: New order #{emailFor.number}</dd></div>
              </dl>
              <button type="button" class="sw-btn sw-btn-ghost" onClick={() => emailDlg.current?.close()}>Close</button>
            </div>
            <div class="sw-email">
              <div class="sw-email-hd">New order: #{emailFor.number}</div>
              <div class="sw-email-bd">
                <p>You’ve received the following order from {emailFor.customer.name}:</p>
                <p class="sw-email-h2">[Order #{emailFor.number}] ({fmtFull(emailFor.createdAt)})</p>
                <table>
                  <thead><tr><th>Product</th><th>Quantity</th><th>Price</th></tr></thead>
                  <tbody>{emailFor.lines.map((l) => <tr><td>{l.name}{l.variation && <small><br />{l.variation}</small>}{l.sku && <small> (#{l.sku})</small>}</td><td>{l.quantity}</td><td>{fmtMoney(l.total)}</td></tr>)}</tbody>
                  <tfoot>
                    <tr><th colSpan={2}>Subtotal:</th><td>{fmtMoney(emailFor.subtotal)}</td></tr>
                    <tr><th colSpan={2}>Shipping:</th><td>{emailFor.shipping ? fmtMoney(emailFor.shipping) : 'Free shipping'}</td></tr>
                    <tr><th colSpan={2}>VAT:</th><td>{fmtMoney(emailFor.tax)}</td></tr>
                    <tr><th colSpan={2}>Payment method:</th><td>{emailFor.paymentMethod}</td></tr>
                    <tr><th colSpan={2}>Total:</th><td>{fmtMoney(emailFor.total)}</td></tr>
                  </tfoot>
                </table>
                <p class="sw-email-h2">Billing address</p>
                <address>{emailFor.customer.name}<br />{emailFor.customer.address}<br />{emailFor.customer.phone}<br />{emailFor.customer.email}</address>
                <p class="sw-muted">Congratulations on the sale.</p>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}

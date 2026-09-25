"use client";

/*
 * Coordinator panel — today's emails from the coordinator (Aditya), reply from
 * here, and the whole thing clears to "All done for the day" once every one is
 * answered. Reading & sending go through faculty-gated API routes backed by the
 * Hostinger Mail API; "answered" is the mailbox's own \Answered flag, so a reply
 * sent in Outlook/webmail counts too.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchCoordinatorMail, fetchMailBody, sendCoordinatorReply, markCoordinatorDone } from "@/lib/coordinator-mail";

function timeLabel(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function stripHtml(html) {
  if (!html) return "";
  return String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<\/(p|div|br|li|tr|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function CoordinatorTool({ onChanged }) {
  const [state, setState] = useState({ loading: true });
  const [selUid, setSelUid] = useState(null);
  const [body, setBody] = useState({ loading: false, text: "", html: "" });
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [flagging, setFlagging] = useState(null); // uid currently being toggled
  const [sendErr, setSendErr] = useState("");
  const [flash, setFlash] = useState("");
  const replyRef = useRef(null);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const data = await fetchCoordinatorMail();
      setState({ loading: false, ...data });
      return data;
    } catch (e) {
      setState({ loading: false, error: e?.message || "Could not load mail." });
      return null;
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const messages = state.messages || [];
  const firstPending = useMemo(() => messages.find((m) => !m.answered) || null, [messages]);

  // Keep a sensible selection: current if still present, else first unanswered, else first.
  useEffect(() => {
    if (!messages.length) { setSelUid(null); return; }
    const stillThere = messages.some((m) => m.uid === selUid);
    if (!stillThere) setSelUid((firstPending || messages[0]).uid);
  }, [messages, selUid, firstPending]);

  const selected = messages.find((m) => m.uid === selUid) || null;

  // Fetch the selected email's body.
  useEffect(() => {
    if (selUid == null) { setBody({ loading: false, text: "", html: "" }); return; }
    let alive = true;
    setBody({ loading: true, text: "", html: "" });
    fetchMailBody(selUid)
      .then((b) => { if (alive) setBody({ loading: false, text: b.text || "", html: b.html || "" }); })
      .catch(() => { if (alive) setBody({ loading: false, text: "", html: "", error: true }); });
    return () => { alive = false; };
  }, [selUid]);

  const bodyText = body.text || stripHtml(body.html);

  async function doSend() {
    if (!selected || !reply.trim() || sending) return;
    setSending(true); setSendErr("");
    try {
      await sendCoordinatorReply({ uid: selected.uid, subject: selected.subject, text: reply.trim() });
      setReply("");
      setFlash(`Reply sent to ${selected.from?.name || "the coordinator"}.`);
      const data = await load();
      onChanged?.();
      // advance to the next unanswered, if any
      const nextPending = (data?.messages || []).find((m) => !m.answered);
      if (nextPending) setSelUid(nextPending.uid);
      setTimeout(() => setFlash(""), 3500);
    } catch (e) {
      setSendErr(e?.message || "Could not send the reply.");
    } finally {
      setSending(false);
    }
  }

  function onReplyKey(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); doSend(); }
  }

  // Tick / untick an email as handled without sending a reply.
  async function toggleDone(m) {
    if (!m || flagging != null) return;
    setFlagging(m.uid); setSendErr("");
    const markingDone = !m.answered;
    try {
      await markCoordinatorDone({ uid: m.uid, done: markingDone });
      const data = await load();
      onChanged?.();
      if (markingDone) {
        const next = (data?.messages || []).find((x) => !x.answered);
        if (next) setSelUid(next.uid);
      }
    } catch (e) {
      setSendErr(e?.message || "Could not update.");
    } finally {
      setFlagging(null);
    }
  }

  // ── status banner ──
  const total = state.total || 0;
  const pending = state.pending || 0;
  const configured = state.configured !== false && !state.error;
  let banner = null;
  if (state.configured === false) {
    banner = { kind: "setup" };
  } else if (state.error) {
    banner = { kind: "err", text: state.error };
  } else if (total === 0) {
    banner = { kind: "done", text: "No emails from the coordinator today — nothing to reply to." };
  } else if (pending === 0) {
    banner = { kind: "done", text: `All done for the day ✅  — you've replied to all ${total}.` };
  } else {
    banner = { kind: "progress", text: `${total - pending} of ${total} replied · ${pending} to go` };
  }

  return (
    <div className="prof-panel cm-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="prof-panel-h">
        <h2>Coordinator</h2>
        {state.coordinator && <span className="cm-addr">{state.coordinator}</span>}
        <div className="cm-h-spacer" />
        <button className="cm-refresh" onClick={load} disabled={state.loading} title="Refresh">
          {state.loading ? "…" : "↻"}
        </button>
      </div>

      {banner?.kind === "setup" && (
        <div className="cm-note setup">
          <b>Mailbox not connected yet.</b>
          <p>Create an API token in Hostinger webmail → <i>Settings → Agentic Mail → API Access</i>, then set it on the server as <code>HOSTINGER_MAIL_TOKEN</code> and redeploy. The token stays server-side.</p>
        </div>
      )}
      {banner?.kind === "err" && (
        <div className="cm-note err">Couldn't load mail: {banner.text} <button className="cm-linkbtn" onClick={load}>retry</button></div>
      )}
      {banner?.kind === "done" && <div className="cm-banner done">{banner.text}</div>}
      {banner?.kind === "progress" && <div className="cm-banner">{banner.text}</div>}
      {flash && <div className="cm-flash">{flash}</div>}

      {configured && total > 0 && (
        <div className="cm-grid">
          {/* list of today's emails */}
          <div className="cm-list" role="list">
            {messages.map((m) => (
              <div
                key={m.uid}
                role="listitem"
                className={"cm-row" + (m.uid === selUid ? " on" : "") + (m.answered ? " done" : "")}
              >
                <button
                  className={"cm-dot" + (m.answered ? " done" : "")}
                  onClick={() => toggleDone(m)}
                  disabled={flagging === m.uid}
                  title={m.answered ? "Mark not done" : "Mark done (no reply)"}
                  aria-pressed={m.answered}
                >{m.answered ? "✓" : ""}</button>
                <button className="cm-row-main" onClick={() => setSelUid(m.uid)}>
                  <span className="cm-row-subj">{m.subject}</span>
                  <span className="cm-row-meta">
                    {m.from?.name || m.from?.address}
                    {m.hasAttachments && <span className="cm-clip" title="Has attachment">📎</span>}
                    <span className="cm-row-time">{timeLabel(m.date)}</span>
                  </span>
                </button>
              </div>
            ))}
          </div>

          {/* detail + reply */}
          <div className="cm-detail">
            {selected ? (
              <>
                <div className="cm-d-head">
                  <div className="cm-d-subj">{selected.subject}</div>
                  <div className="cm-d-from">
                    <b>{selected.from?.name || selected.from?.address}</b>
                    <span>{selected.from?.address}</span>
                    <span className="cm-d-time">{timeLabel(selected.date)}</span>
                    {selected.answered
                      ? <span className="cm-tag done">Replied</span>
                      : <span className="cm-tag pending">Awaiting reply</span>}
                  </div>
                </div>

                <div className="cm-body">
                  {body.loading ? <div className="cm-muted">Loading message…</div>
                    : bodyText ? <pre className="cm-body-text">{bodyText}</pre>
                    : <div className="cm-muted">No text content.</div>}
                </div>

                <div className="cm-reply">
                  <div className="cm-reply-to">
                    Reply to <b>{selected.from?.name || selected.from?.address}</b> · <span className="cm-muted">Re: {selected.subject}</span>
                  </div>
                  <textarea
                    ref={replyRef}
                    className="cm-reply-in"
                    placeholder="Write your reply…  (⌘/Ctrl+Enter to send)"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={onReplyKey}
                    rows={5}
                  />
                  {sendErr && <div className="cm-note err small">{sendErr}</div>}
                  <div className="cm-reply-actions">
                    <button
                      className="cm-secondary"
                      onClick={() => toggleDone(selected)}
                      disabled={flagging === selected.uid}
                    >
                      {selected.answered ? "↩ Mark not done" : "✓ Mark done, no reply"}
                    </button>
                    <button className="cm-send" onClick={doSend} disabled={sending || !reply.trim()}>
                      {sending ? "Sending…" : "Send reply →"}
                    </button>
                  </div>
                  <div className="cm-muted small cm-hint">A reply sends from your mailbox, threaded. Either way marks this email done.</div>
                </div>
              </>
            ) : (
              <div className="cm-muted">Select an email.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const CSS = `
.cm-root .prof-panel-h{align-items:center}
.cm-addr{font-family:var(--mono);font-size:11px;color:var(--dim);background:var(--panel-2);border:1px solid var(--line);border-radius:20px;padding:3px 10px}
.cm-h-spacer{flex:1}
.cm-refresh{flex:none;width:32px;height:32px;border-radius:9px;border:1px solid var(--line-2);background:var(--panel);color:var(--ink);font-size:15px;cursor:pointer}
.cm-refresh:hover{border-color:var(--accent);color:var(--accent)}
.cm-banner{font-size:13px;font-family:var(--mono);color:var(--dim);background:var(--panel-2);border:1px solid var(--line);border-radius:10px;padding:10px 12px;margin-bottom:14px}
.cm-banner.done{color:var(--green);border-color:color-mix(in srgb,var(--green) 40%,transparent);background:color-mix(in srgb,var(--green) 8%,transparent)}
.cm-flash{font-size:13px;color:var(--green);background:color-mix(in srgb,var(--green) 10%,transparent);border:1px solid color-mix(in srgb,var(--green) 40%,transparent);border-radius:10px;padding:9px 12px;margin-bottom:12px}
.cm-note{font-size:13px;color:var(--ink-soft);border-radius:11px;padding:12px 14px;margin-bottom:14px;line-height:1.5}
.cm-note.setup{background:var(--accent-soft);border:1px solid var(--accent)}
.cm-note.setup code{font-family:var(--mono);font-size:12px;background:var(--panel);padding:1px 5px;border-radius:4px}
.cm-note.err{background:color-mix(in srgb,var(--red) 8%,transparent);border:1px solid color-mix(in srgb,var(--red) 40%,transparent);color:var(--red)}
.cm-note.small{font-size:12px;padding:8px 10px;margin:8px 0 0}
.cm-linkbtn{background:none;border:none;color:var(--accent);font-weight:600;cursor:pointer;padding:0}
.cm-grid{display:grid;grid-template-columns:minmax(220px,300px) 1fr;gap:16px;align-items:start}
@media(max-width:820px){.cm-grid{grid-template-columns:1fr}}
.cm-list{display:flex;flex-direction:column;gap:7px;max-height:520px;overflow:auto}
.cm-row{display:flex;gap:9px;align-items:flex-start;text-align:left;background:var(--panel-2);border:1px solid var(--line);border-radius:11px;padding:10px 11px;cursor:pointer;transition:.14s;color:var(--ink)}
.cm-row:hover{border-color:var(--accent)}
.cm-row.on{border-color:var(--accent);background:var(--accent-soft)}
.cm-row.done{opacity:.62}
.cm-dot{flex:none;width:20px;height:20px;border-radius:6px;border:1.5px solid var(--line-2);background:var(--panel);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#fff;margin-top:1px;cursor:pointer;transition:.14s}
.cm-dot:hover:not(:disabled){border-color:var(--accent)}
.cm-dot:disabled{opacity:.55;cursor:default}
.cm-dot.done{background:var(--green);border-color:var(--green)}
.cm-row-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;background:none;border:none;padding:0;font:inherit;color:inherit;text-align:left;cursor:pointer}
.cm-row-subj{font-size:13px;font-weight:600;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cm-row-meta{display:flex;align-items:center;gap:7px;font-family:var(--mono);font-size:10.5px;color:var(--dim)}
.cm-row-time{margin-left:auto}
.cm-clip{font-size:10px}
.cm-detail{min-width:0;background:var(--panel-2);border:1px solid var(--line);border-radius:13px;padding:16px}
.cm-d-subj{font-family:var(--serif);font-size:18px;font-weight:800;line-height:1.25;margin-bottom:6px}
.cm-d-from{display:flex;align-items:center;gap:9px;flex-wrap:wrap;font-size:12px;color:var(--dim)}
.cm-d-from b{color:var(--ink);font-size:12.5px}
.cm-d-time{font-family:var(--mono)}
.cm-tag{font-family:var(--mono);font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;border-radius:20px;padding:2px 8px}
.cm-tag.done{color:var(--green);border:1px solid color-mix(in srgb,var(--green) 45%,transparent)}
.cm-tag.pending{color:var(--gold);border:1px solid rgba(226,171,65,.4)}
.cm-body{margin:12px 0;padding:12px;background:var(--panel);border:1px solid var(--line);border-radius:10px;max-height:280px;overflow:auto}
.cm-body-text{margin:0;font-family:var(--sans);font-size:13.5px;line-height:1.55;color:var(--ink-soft);white-space:pre-wrap;word-break:break-word}
.cm-muted{color:var(--dim);font-size:13px}
.cm-muted.small{font-size:11.5px}
.cm-reply{margin-top:14px;border-top:1px solid var(--line);padding-top:14px}
.cm-reply-to{font-size:12.5px;color:var(--ink-soft);margin-bottom:8px}
.cm-reply-to b{color:var(--ink)}
.cm-reply-in{width:100%;box-sizing:border-box;font-family:var(--sans);font-size:14px;line-height:1.5;color:var(--ink);background:var(--panel);border:1px solid var(--line-2);border-radius:10px;padding:11px 12px;outline:none;resize:vertical}
.cm-reply-in:focus{border-color:var(--accent)}
.cm-reply-actions{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:10px;flex-wrap:wrap}
.cm-secondary{flex:none;font-family:var(--sans);font-size:13px;font-weight:600;border:1px solid var(--line-2);border-radius:10px;padding:9px 14px;background:var(--panel);color:var(--ink);cursor:pointer;transition:.15s}
.cm-secondary:hover:not(:disabled){border-color:var(--accent);color:var(--accent)}
.cm-secondary:disabled{opacity:.5;cursor:default}
.cm-send{flex:none;font-family:var(--sans);font-size:13.5px;font-weight:700;border:none;border-radius:10px;padding:10px 18px;background:var(--accent);color:#fff;cursor:pointer;transition:.15s}
.cm-send:hover:not(:disabled){filter:brightness(1.07)}
.cm-send:disabled{opacity:.5;cursor:default}
.cm-hint{margin-top:8px}
`;

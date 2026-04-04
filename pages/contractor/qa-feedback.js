// pages/contractor/qa-feedback.js
// QA Feedback dashboard — only accessible to michael@spanglerbuilt.com

import Layout from '../../components/Layout'
import { useState, useEffect } from 'react'

var OWNER_EMAIL = 'michael@spanglerbuilt.com'

var TYPE_BADGE = {
  bug:         { bg: 'rgba(192,57,43,.2)',  color: '#e57373', label: '🐛 Bug'         },
  suggestion:  { bg: 'rgba(24,95,165,.2)',  color: '#64b5f6', label: '💡 Suggestion'  },
  looks_wrong: { bg: 'rgba(108,52,131,.2)', color: '#ce93d8', label: '👁 Looks wrong' },
  works_great: { bg: 'rgba(39,174,96,.2)',  color: '#81c784', label: '✅ Works great'  },
}

var STATUS_BADGE = {
  open:        { bg: 'rgba(255,140,0,.15)',  color: '#FF8C00',  label: 'Open'        },
  in_progress: { bg: 'rgba(24,95,165,.15)',  color: '#64b5f6',  label: 'In Progress' },
  resolved:    { bg: 'rgba(39,174,96,.15)',  color: '#81c784',  label: 'Resolved'    },
}

var STATUSES = ['open', 'in_progress', 'resolved']

var FILTER_TABS = [
  { key: 'all',         label: 'All' },
  { key: 'open',        label: 'Open' },
  { key: 'bug',         label: '🐛 Bug' },
  { key: 'suggestion',  label: '💡 Suggestion' },
  { key: 'looks_wrong', label: '👁 Looks wrong' },
  { key: 'works_great', label: '✅ Works great' },
]

export default function QAFeedback() {
  var [items,        setItems]        = useState([])
  var [loading,      setLoading]      = useState(true)
  var [filter,       setFilter]       = useState('all')
  var [expandImg,    setExpandImg]    = useState(null)
  var [showInvite,   setShowInvite]   = useState(false)
  var [invEmail,     setInvEmail]     = useState('')
  var [invName,      setInvName]      = useState('')
  var [invLoading,   setInvLoading]   = useState(false)
  var [invMsg,       setInvMsg]       = useState('')

  useEffect(function() {
    try {
      var auth = JSON.parse(localStorage.getItem('sb_auth') || 'null')
      if (!auth || auth.role !== 'contractor') { window.location.href = '/login'; return }
    } catch(e) { window.location.href = '/login'; return }
    fetchFeedback()
  }, [])

  function fetchFeedback() {
    setLoading(true)
    fetch('/api/qa/list-feedback')
      .then(function(r) { return r.json() })
      .then(function(json) { setItems(json.items || []); setLoading(false) })
      .catch(function() { setLoading(false) })
  }

  function updateStatus(id, newStatus) {
    fetch('/api/qa/update-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    }).then(function() {
      setItems(function(prev) {
        return prev.map(function(item) {
          return item.id === id ? Object.assign({}, item, { status: newStatus }) : item
        })
      })
    })
  }

  function nextStatus(current) {
    var idx = STATUSES.indexOf(current)
    return STATUSES[(idx + 1) % STATUSES.length]
  }

  function sendInvite(e) {
    e.preventDefault()
    if (!invEmail.trim()) return
    setInvLoading(true); setInvMsg('')
    fetch('/api/invite-qa-tester', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: invEmail.trim(), name: invName.trim() }),
    })
      .then(function(r) { return r.json().then(function(d) { return { ok: r.ok, data: d } }) })
      .then(function(res) {
        setInvLoading(false)
        if (!res.ok) { setInvMsg('Error: ' + (res.data.error || 'Failed')); return }
        setInvMsg('Invited! Email sent to ' + invEmail)
        setInvEmail(''); setInvName('')
      })
      .catch(function() { setInvLoading(false); setInvMsg('Network error') })
  }

  var filtered = items.filter(function(item) {
    if (filter === 'all') return true
    if (filter === 'open') return item.status === 'open'
    return item.feedback_type === filter
  })

  var inp = {
    padding: '8px 10px',
    background: '#0d1117',
    border: '1px solid rgba(255,255,255,.12)',
    borderRadius: 4,
    color: 'rgba(255,255,255,.85)',
    fontSize: 12,
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <Layout>
      <div style={{maxWidth: 1400, margin: '0 auto'}}>

        {/* Header */}
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 10}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <span style={{fontSize: 18, fontWeight: 700, color: '#fff'}}>QA Feedback</span>
            <span style={{background: 'rgba(255,140,0,.15)', color: '#FF8C00', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10}}>
              {items.filter(function(i){ return i.status === 'open' }).length} open
            </span>
            <span style={{background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.4)', fontSize: 11, padding: '2px 8px', borderRadius: 10}}>
              {items.length} total
            </span>
          </div>
          <div style={{display: 'flex', gap: 8}}>
            <button
              onClick={fetchFeedback}
              style={{background: 'transparent', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.5)', fontSize: 11, padding: '7px 12px', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit'}}
            >
              ↻ Refresh
            </button>
            <button
              onClick={function(){ setShowInvite(function(s){ return !s }) }}
              style={{background: '#FF8C00', border: 'none', color: '#fff', fontSize: 11, fontWeight: 700, padding: '7px 14px', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit'}}
            >
              + Invite Tester
            </button>
          </div>
        </div>

        {/* Invite modal */}
        {showInvite && (
          <div style={{background: '#1a1f2e', border: '1px solid rgba(255,140,0,.3)', borderRadius: 6, padding: '1.25rem', marginBottom: '1.25rem', maxWidth: 480}}>
            <div style={{fontSize: 13, fontWeight: 700, color: '#FF8C00', marginBottom: 12}}>Invite a QA Tester</div>
            <form onSubmit={sendInvite}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10}}>
                <div>
                  <label style={{display: 'block', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4}}>Name</label>
                  <input value={invName} onChange={function(e){ setInvName(e.target.value) }} placeholder="First name" style={Object.assign({}, inp, {width: '100%'})}/>
                </div>
                <div>
                  <label style={{display: 'block', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4}}>Email *</label>
                  <input type="email" value={invEmail} onChange={function(e){ setInvEmail(e.target.value) }} placeholder="tester@email.com" required style={Object.assign({}, inp, {width: '100%'})}/>
                </div>
              </div>
              {invMsg && (
                <div style={{fontSize: 11, color: invMsg.startsWith('Error') ? '#e57373' : '#81c784', marginBottom: 8, padding: '6px 10px', background: invMsg.startsWith('Error') ? 'rgba(192,57,43,.15)' : 'rgba(39,174,96,.1)', borderRadius: 4}}>
                  {invMsg}
                </div>
              )}
              <div style={{display: 'flex', gap: 8}}>
                <button type="button" onClick={function(){ setShowInvite(false); setInvMsg('') }} style={{background: 'transparent', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.4)', fontSize: 11, padding: '7px 12px', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit'}}>
                  Cancel
                </button>
                <button type="submit" disabled={invLoading || !invEmail.trim()} style={{background: '#FF8C00', border: 'none', color: '#fff', fontSize: 11, fontWeight: 700, padding: '7px 14px', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', opacity: invLoading ? 0.6 : 1}}>
                  {invLoading ? 'Sending…' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter tabs */}
        <div style={{display: 'flex', gap: 4, marginBottom: '1rem', flexWrap: 'wrap'}}>
          {FILTER_TABS.map(function(tab) {
            var active = filter === tab.key
            return (
              <button
                key={tab.key}
                onClick={function(){ setFilter(tab.key) }}
                style={{
                  padding: '6px 12px',
                  background: active ? 'rgba(255,140,0,.15)' : 'rgba(255,255,255,.04)',
                  border: '1px solid ' + (active ? '#FF8C00' : 'rgba(255,255,255,.08)'),
                  borderRadius: 4,
                  color: active ? '#FF8C00' : 'rgba(255,255,255,.5)',
                  fontSize: 11,
                  fontWeight: active ? 700 : 400,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{textAlign: 'center', color: 'rgba(255,255,255,.3)', padding: '3rem', fontSize: 13}}>Loading feedback…</div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign: 'center', color: 'rgba(255,255,255,.3)', padding: '3rem', fontSize: 13}}>No feedback yet for this filter.</div>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
            {filtered.map(function(item) {
              var typeBadge   = TYPE_BADGE[item.feedback_type]   || TYPE_BADGE.bug
              var statusBadge = STATUS_BADGE[item.status]        || STATUS_BADGE.open
              var next        = nextStatus(item.status)
              var nextLabel   = (STATUS_BADGE[next] || STATUS_BADGE.open).label

              return (
                <div key={item.id} style={{background: '#1a1f2e', border: '1px solid rgba(255,255,255,.07)', borderRadius: 6, padding: '14px 16px'}}>
                  <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap'}}>

                    {/* Left */}
                    <div style={{flex: 1, minWidth: 0}}>
                      {/* Badges row */}
                      <div style={{display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap'}}>
                        <span style={{background: typeBadge.bg, color: typeBadge.color, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 3}}>
                          {typeBadge.label}
                        </span>
                        <span style={{background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.5)', fontSize: 10, padding: '2px 8px', borderRadius: 3}}>
                          {item.tester_name || item.tester_email}
                        </span>
                        <span style={{fontSize: 10, color: 'rgba(255,255,255,.25)'}}>
                          {new Date(item.created_at).toLocaleDateString('en-US', {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}
                        </span>
                      </div>

                      {/* Page */}
                      <a
                        href={item.page_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{fontSize: 11, color: '#FF8C00', textDecoration: 'none', display: 'block', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}
                      >
                        {item.page_name || item.page_url}
                      </a>

                      {/* Comment */}
                      <div style={{fontSize: 13, color: 'rgba(255,255,255,.8)', lineHeight: 1.6, whiteSpace: 'pre-wrap'}}>
                        {item.comment}
                      </div>

                      {/* Screenshot thumbnail */}
                      {item.screenshot_url && (
                        <div style={{marginTop: 10}}>
                          <img
                            src={item.screenshot_url}
                            alt="screenshot"
                            onClick={function(){ setExpandImg(item.screenshot_url) }}
                            style={{maxWidth: 180, maxHeight: 120, borderRadius: 4, border: '1px solid rgba(255,255,255,.1)', cursor: 'pointer', objectFit: 'cover'}}
                          />
                        </div>
                      )}
                    </div>

                    {/* Right: status toggle */}
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0}}>
                      <span style={{background: statusBadge.bg, color: statusBadge.color, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 3}}>
                        {statusBadge.label}
                      </span>
                      <button
                        onClick={function(){ updateStatus(item.id, next) }}
                        style={{
                          background: 'transparent',
                          border: '1px solid rgba(255,255,255,.1)',
                          color: 'rgba(255,255,255,.4)',
                          fontSize: 10,
                          padding: '4px 8px',
                          borderRadius: 3,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        → {nextLabel}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>

      {/* Expanded screenshot modal */}
      {expandImg && (
        <div
          onClick={function(){ setExpandImg(null) }}
          style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'}}
        >
          <img src={expandImg} alt="screenshot" style={{maxWidth: '90vw', maxHeight: '85vh', borderRadius: 6, boxShadow: '0 8px 40px rgba(0,0,0,.6)'}}/>
        </div>
      )}
    </Layout>
  )
}

export async function getServerSideProps() { return { props: {} } }

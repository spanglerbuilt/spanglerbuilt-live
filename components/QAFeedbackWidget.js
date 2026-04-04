// components/QAFeedbackWidget.js
// Floating feedback widget — only renders when NEXT_PUBLIC_APP_ENV === 'qa'

import { useState, useEffect } from 'react'

var TYPES = [
  { value: 'bug',        label: 'Bug',         icon: '🐛' },
  { value: 'suggestion', label: 'Suggestion',  icon: '💡' },
  { value: 'looks_wrong',label: 'Looks wrong', icon: '👁' },
  { value: 'works_great',label: 'Works great', icon: '✅' },
]

export default function QAFeedbackWidget() {
  var [open,        setOpen]        = useState(false)
  var [type,        setType]        = useState('bug')
  var [comment,     setComment]     = useState('')
  var [screenshot,  setScreenshot]  = useState(null)
  var [submitting,  setSubmitting]  = useState(false)
  var [success,     setSuccess]     = useState(false)
  var [error,       setError]       = useState('')
  var [testerEmail, setTesterEmail] = useState('')
  var [testerName,  setTesterName]  = useState('')

  // Only render in QA environment
  if (process.env.NEXT_PUBLIC_APP_ENV !== 'qa') return null

  useEffect(function() {
    if (typeof window !== 'undefined') {
      setTesterEmail(localStorage.getItem('qa_tester_email') || '')
      setTesterName(localStorage.getItem('qa_tester_name') || '')
    }
  }, [])

  function handleFileChange(e) {
    var file = e.target.files && e.target.files[0]
    setScreenshot(file || null)
  }

  function reset() {
    setComment('')
    setScreenshot(null)
    setType('bug')
    setError('')
    setSuccess(false)
  }

  function handleClose() {
    setOpen(false)
    reset()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!comment.trim()) { setError('Please enter a comment.'); return }
    setSubmitting(true); setError('')

    try {
      var screenshotUrl = null

      // Upload screenshot if attached
      if (screenshot) {
        var formData = new FormData()
        formData.append('file', screenshot)
        formData.append('tester', testerEmail || 'unknown')
        var uploadRes = await fetch('/api/qa/upload-screenshot', {
          method: 'POST',
          body: formData,
        })
        if (uploadRes.ok) {
          var uploadJson = await uploadRes.json()
          screenshotUrl = uploadJson.url || null
        }
      }

      // Submit feedback
      var res = await fetch('/api/qa/submit-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tester_email:   testerEmail || 'unknown',
          tester_name:    testerName  || 'Tester',
          page_url:       typeof window !== 'undefined' ? window.location.href : '',
          page_name:      typeof document !== 'undefined' ? document.title : '',
          feedback_type:  type,
          comment:        comment.trim(),
          screenshot_url: screenshotUrl,
        }),
      })

      if (!res.ok) {
        var j = await res.json()
        throw new Error(j.error || 'Submission failed')
      }

      setSuccess(true)
      setSubmitting(false)
      // Auto-collapse after 2 seconds
      setTimeout(function() {
        setOpen(false)
        reset()
      }, 2000)

    } catch (err) {
      setError(err.message || 'Submission failed. Try again.')
      setSubmitting(false)
    }
  }

  var panelStyle = {
    position: 'fixed',
    bottom: 80,
    right: 20,
    width: 340,
    background: '#1a1f2e',
    border: '1px solid rgba(255,140,0,.3)',
    borderRadius: 8,
    boxShadow: '0 8px 32px rgba(0,0,0,.6)',
    zIndex: 9999,
    fontFamily: 'Poppins, sans-serif',
    overflow: 'hidden',
  }

  var headerStyle = {
    background: '#FF8C00',
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }

  var inp = {
    width: '100%',
    padding: '8px 10px',
    background: '#0d1117',
    border: '1px solid rgba(255,255,255,.12)',
    borderRadius: 4,
    color: 'rgba(255,255,255,.85)',
    fontSize: 12,
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    outline: 'none',
  }

  return (
    <>
      {/* Expanded panel */}
      {open && (
        <div style={panelStyle}>
          {/* Panel header */}
          <div style={headerStyle}>
            <span style={{fontSize: 13, fontWeight: 700, color: '#fff'}}>💬 Submit Feedback</span>
            <button
              onClick={handleClose}
              style={{background:'transparent', border:'none', color:'rgba(255,255,255,.8)', fontSize:18, cursor:'pointer', lineHeight:1, padding:0}}
            >×</button>
          </div>

          {success ? (
            <div style={{padding: '2rem', textAlign: 'center'}}>
              <div style={{fontSize: 32, marginBottom: 8}}>✅</div>
              <div style={{fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4}}>Feedback submitted!</div>
              <div style={{fontSize: 12, color: 'rgba(255,255,255,.5)'}}>Thanks — closing in a moment…</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{padding: '14px'}}>

              {/* Page auto-filled info */}
              <div style={{fontSize: 10, color: 'rgba(255,255,255,.3)', marginBottom: 10, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                Page: {typeof window !== 'undefined' ? window.location.pathname : ''}
              </div>

              {/* Type selector */}
              <div style={{marginBottom: 10}}>
                <div style={{fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6}}>
                  Feedback type
                </div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6}}>
                  {TYPES.map(function(t) {
                    var active = type === t.value
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={function() { setType(t.value) }}
                        style={{
                          padding: '7px 6px',
                          background: active ? 'rgba(255,140,0,.2)' : 'rgba(255,255,255,.05)',
                          border: '1px solid ' + (active ? '#FF8C00' : 'rgba(255,255,255,.1)'),
                          borderRadius: 4,
                          color: active ? '#FF8C00' : 'rgba(255,255,255,.6)',
                          fontSize: 11,
                          fontWeight: active ? 700 : 400,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          textAlign: 'center',
                        }}
                      >
                        {t.icon} {t.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Comment */}
              <div style={{marginBottom: 10}}>
                <label style={{display: 'block', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6}}>
                  Comment *
                </label>
                <textarea
                  value={comment}
                  onChange={function(e) { setComment(e.target.value); setError('') }}
                  placeholder="Describe what you found or what you'd like to suggest…"
                  rows={4}
                  required
                  style={Object.assign({}, inp, {resize: 'vertical', lineHeight: 1.5})}
                />
              </div>

              {/* Screenshot upload */}
              <div style={{marginBottom: 12}}>
                <label style={{display: 'block', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6}}>
                  Screenshot (optional)
                </label>
                <label style={{
                  display: 'block',
                  padding: '8px 10px',
                  background: '#0d1117',
                  border: '1px dashed rgba(255,255,255,.15)',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 11,
                  color: screenshot ? '#FF8C00' : 'rgba(255,255,255,.4)',
                  textAlign: 'center',
                }}>
                  {screenshot ? ('📎 ' + screenshot.name) : '📎 Attach screenshot'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{display: 'none'}}
                  />
                </label>
              </div>

              {/* Tester identity (from localStorage) */}
              {!testerName && (
                <div style={{marginBottom: 10}}>
                  <label style={{display: 'block', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6}}>
                    Your name
                  </label>
                  <input
                    type="text"
                    value={testerName}
                    onChange={function(e) { setTesterName(e.target.value) }}
                    placeholder="How should we address you?"
                    style={inp}
                  />
                </div>
              )}

              {error && (
                <div style={{fontSize: 11, color: '#e57373', background: 'rgba(192,57,43,.15)', border: '1px solid rgba(192,57,43,.3)', padding: '7px 10px', borderRadius: 4, marginBottom: 10}}>
                  {error}
                </div>
              )}

              <div style={{display: 'flex', gap: 8}}>
                <button
                  type="button"
                  onClick={handleClose}
                  style={{
                    flex: 1,
                    padding: '9px',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,.12)',
                    borderRadius: 4,
                    color: 'rgba(255,255,255,.4)',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !comment.trim()}
                  style={{
                    flex: 2,
                    padding: '9px',
                    background: (submitting || !comment.trim()) ? '#7a4400' : '#FF8C00',
                    border: 'none',
                    borderRadius: 4,
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: (submitting || !comment.trim()) ? 'default' : 'pointer',
                    fontFamily: 'inherit',
                    opacity: (submitting || !comment.trim()) ? 0.6 : 1,
                  }}
                >
                  {submitting ? 'Submitting…' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Floating trigger button */}
      <button
        onClick={function() { setOpen(function(o) { return !o }) }}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          background: '#FF8C00',
          color: '#fff',
          border: 'none',
          borderRadius: 50,
          padding: '10px 18px',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'Poppins, sans-serif',
          boxShadow: '0 4px 16px rgba(255,140,0,.4)',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transition: 'transform .15s, box-shadow .15s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={function(e) { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,140,0,.55)' }}
        onMouseLeave={function(e) { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,140,0,.4)' }}
      >
        💬 Feedback
      </button>
    </>
  )
}

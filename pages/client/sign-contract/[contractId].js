import Layout from '../../../components/Layout'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'

export default function SignContract() {
  var router       = useRouter()
  var { contractId } = router.query

  var [contract,    setContract]    = useState(null)
  var [loading,     setLoading]     = useState(true)
  var [scrolled,    setScrolled]    = useState(false)
  var [signer1,     setSigner1]     = useState('')
  var [signer2,     setSigner2]     = useState('')
  var [agreed,      setAgreed]      = useState(false)
  var [signing,     setSigning]     = useState(false)
  var [signed,      setSigned]      = useState(false)
  var [error,       setError]       = useState('')
  var [auth,        setAuth]        = useState(null)
  var iframeRef    = useRef(null)
  var scrollerRef  = useRef(null)

  useEffect(function() {
    // Auth check
    try {
      var a = JSON.parse(localStorage.getItem('sb_auth') || '{}')
      if (!a.role) { window.location.href = '/login'; return }
      setAuth(a)
    } catch(e) { window.location.href = '/login'; return }
  }, [])

  useEffect(function() {
    if (!contractId) return
    // Fetch contract details via API
    fetch('/api/contracts/get?id=' + contractId)
      .then(function(r){ return r.json() })
      .then(function(j) {
        setContract(j.contract || null)
        setLoading(false)
        // Pre-fill signer name from auth
        if (j.contract?.projects?.client_name) {
          setSigner1(j.contract.projects.client_name)
        }
      })
      .catch(function(){ setLoading(false) })
  }, [contractId])

  function handleScroll(e) {
    var el = e.currentTarget
    var atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50
    if (atBottom) setScrolled(true)
  }

  function handleSign(e) {
    e.preventDefault()
    if (!signer1.trim()) { setError('Please enter your full legal name to sign.'); return }
    if (!agreed) { setError('Please check the agreement box.'); return }
    if (!scrolled) { setError('Please scroll through the entire contract before signing.'); return }

    setSigning(true); setError('')

    fetch('/api/contracts/sign', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        contractId,
        signer1Name: signer1.trim(),
        signer2Name: signer2.trim() || undefined,
      }),
    })
      .then(function(r){ return r.json() })
      .then(function(j) {
        setSigning(false)
        if (j.ok) {
          setSigned(true)
        } else {
          setError(j.error || 'Signature failed. Please try again.')
        }
      })
      .catch(function(){ setSigning(false); setError('Network error. Please try again.') })
  }

  var hasSecondSigner = contract?.projects?.client_2_name || false
  var projectNum      = contract?.projects?.project_number || ''
  var projectType     = contract?.projects?.project_type   || ''
  var clientName      = contract?.projects?.client_name    || ''

  // Already signed
  if (contract?.status === 'signed' && !signed) {
    return (
      <Layout>
        <div style={{maxWidth:700, margin:'0 auto', padding:'2rem', textAlign:'center'}}>
          <div style={{fontSize:48, marginBottom:16}}>✓</div>
          <div style={{fontSize:20, fontWeight:700, color:'#fff', marginBottom:8}}>Contract Already Signed</div>
          <div style={{fontSize:13, color:'rgba(255,255,255,.5)', marginBottom:'1.5rem'}}>
            This contract was signed by {contract.signer_1_name}{contract.signer_2_name ? ' & ' + contract.signer_2_name : ''}.
          </div>
          {contract.pdf_url && (
            <a href={contract.pdf_url} target="_blank" rel="noreferrer"
              style={{background:'#D06830',color:'#fff',padding:'11px 24px',borderRadius:4,textDecoration:'none',fontWeight:700,fontSize:13}}>
              Download Signed Contract PDF
            </a>
          )}
          <div style={{marginTop:'1.5rem'}}>
            <a href="/client/dashboard" style={{fontSize:12,color:'#D06830',textDecoration:'none'}}>← Back to Dashboard</a>
          </div>
        </div>
      </Layout>
    )
  }

  // Signing success
  if (signed) {
    return (
      <Layout>
        <div style={{maxWidth:700, margin:'0 auto', padding:'2rem', textAlign:'center'}}>
          <div style={{fontSize:48, marginBottom:16}}>🎉</div>
          <div style={{fontSize:22, fontWeight:700, color:'#fff', marginBottom:8}}>Contract Signed!</div>
          <div style={{fontSize:14, color:'rgba(255,255,255,.6)', lineHeight:1.7, marginBottom:'1.5rem'}}>
            Thank you, <strong>{signer1}</strong>. Your SpanglerBuilt {projectType} contract is signed and on file.<br/>
            A confirmation has been emailed to you and Michael.
          </div>
          <div style={{background:'rgba(208,104,48,.1)', border:'1px solid rgba(208,104,48,.3)', borderRadius:4, padding:'1rem 1.25rem', marginBottom:'1.5rem', fontSize:13, color:'rgba(255,255,255,.6)', textAlign:'left'}}>
            <strong style={{color:'#D06830'}}>Next steps:</strong>
            <ul style={{marginTop:6, paddingLeft:18, lineHeight:2}}>
              <li>Michael will call to confirm your start date</li>
              <li>Your first draw invoice will be sent per the payment schedule</li>
              <li>Material selections are ready to complete in your portal</li>
            </ul>
          </div>
          <a href="/client/dashboard"
            style={{background:'#D06830',color:'#fff',padding:'12px 28px',borderRadius:4,textDecoration:'none',fontWeight:700,fontSize:14}}>
            Go to My Dashboard →
          </a>
          <div style={{marginTop:'1rem'}}>
            <a href="tel:4044927650" style={{fontSize:12,color:'rgba(255,255,255,.4)',textDecoration:'none'}}>(404) 492-7650 — Call Michael any time</a>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{maxWidth:900, margin:'0 auto', padding:'1.5rem'}}>

        {/* Header */}
        <div style={{marginBottom:'1.25rem'}}>
          <div style={{fontSize:20, fontWeight:700, color:'#fff', marginBottom:4}}>Review & Sign Your Contract</div>
          {projectNum && (
            <div style={{fontSize:11, color:'rgba(255,255,255,.4)'}}>
              {projectNum} · {projectType} · {clientName}
            </div>
          )}
        </div>

        {loading ? (
          <div style={{textAlign:'center', padding:'3rem', color:'rgba(255,255,255,.4)', fontSize:13}}>Loading contract…</div>
        ) : !contract ? (
          <div style={{textAlign:'center', padding:'3rem', color:'#e57373', fontSize:13}}>Contract not found. Contact michael@spanglerbuilt.com.</div>
        ) : (
          <>
            {/* Scroll instruction */}
            {!scrolled && (
              <div style={{background:'rgba(208,104,48,.1)', border:'1px solid rgba(208,104,48,.35)', borderRadius:4, padding:'10px 14px', marginBottom:'1rem', fontSize:12, color:'rgba(255,255,255,.7)'}}>
                📜 <strong style={{color:'#D06830'}}>Please scroll through the entire contract</strong> before signing. The signature section will become active when you reach the bottom.
              </div>
            )}

            {/* Contract viewer */}
            <div style={{background:'#fff', borderRadius:4, marginBottom:'1.25rem', overflow:'hidden', border:'1px solid rgba(255,255,255,.12)'}}>
              {contract.pdf_url ? (
                // PDF iframe viewer
                <iframe
                  ref={iframeRef}
                  src={contract.pdf_url + '#toolbar=0&navpanes=0&scrollbar=1'}
                  style={{width:'100%', height:700, border:'none', display:'block'}}
                  title="Contract"
                  onLoad={function() {
                    // For PDF iframes we can't detect scroll — set scrolled after 10s
                    setTimeout(function(){ setScrolled(true) }, 10000)
                  }}
                />
              ) : contract.contract_html ? (
                // HTML viewer with scroll detection
                <div
                  ref={scrollerRef}
                  onScroll={handleScroll}
                  style={{height:700, overflowY:'auto', padding:'2rem', background:'#fff', color:'#111', fontSize:11}}
                  dangerouslySetInnerHTML={{ __html: contract.contract_html }}
                />
              ) : (
                <div style={{padding:'2rem', textAlign:'center', color:'#999', fontSize:13}}>
                  No contract content available. <a href="/client/dashboard" style={{color:'#D06830'}}>Contact Michael.</a>
                </div>
              )}
            </div>

            {scrolled && (
              <div style={{background:'rgba(129,199,132,.15)', border:'1px solid rgba(129,199,132,.4)', borderRadius:4, padding:'8px 14px', marginBottom:'1rem', fontSize:11, color:'#81c784'}}>
                ✓ You've reviewed the full contract. You may now sign below.
              </div>
            )}

            {/* Signature form */}
            <form onSubmit={handleSign}>
              <div style={{background:'#161616', border:'1px solid rgba(255,255,255,.09)', borderRadius:4, padding:'1.25rem'}}>
                <div style={{fontSize:13, fontWeight:700, color:'rgba(255,255,255,.85)', marginBottom:'1rem'}}>
                  Electronic Signature
                </div>

                <div style={{marginBottom:12}}>
                  <label style={{display:'block', fontSize:11, fontWeight:600, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6}}>
                    Your Full Legal Name *
                  </label>
                  <input
                    type="text"
                    value={signer1}
                    onChange={function(e){ setSigner1(e.target.value); setError('') }}
                    placeholder="Type your full legal name exactly as it appears on the contract"
                    required
                    style={{width:'100%', padding:'11px 14px', background:'#0a0a0a', border:'1px solid rgba(255,255,255,.12)', borderRadius:3, color:'rgba(255,255,255,.85)', fontSize:13, outline:'none', fontFamily:"'Times New Roman', serif", fontStyle:'italic', letterSpacing:'.02em'}}
                  />
                </div>

                {hasSecondSigner && (
                  <div style={{marginBottom:12}}>
                    <label style={{display:'block', fontSize:11, fontWeight:600, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6}}>
                      Second Signer Full Legal Name
                    </label>
                    <input
                      type="text"
                      value={signer2}
                      onChange={function(e){ setSigner2(e.target.value) }}
                      placeholder="Second signer full legal name (if applicable)"
                      style={{width:'100%', padding:'11px 14px', background:'#0a0a0a', border:'1px solid rgba(255,255,255,.12)', borderRadius:3, color:'rgba(255,255,255,.85)', fontSize:13, outline:'none', fontFamily:"'Times New Roman', serif", fontStyle:'italic'}}
                    />
                  </div>
                )}

                <div style={{marginBottom:'1rem'}}>
                  <label style={{display:'flex', alignItems:'flex-start', gap:10, cursor:'pointer'}}>
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={function(e){ setAgreed(e.target.checked); setError('') }}
                      style={{marginTop:2, flexShrink:0, accentColor:'#D06830'}}
                    />
                    <span style={{fontSize:12, color:'rgba(255,255,255,.6)', lineHeight:1.6}}>
                      I have read and understand the full contract above. By typing my name and clicking "Sign Contract", I agree to be legally bound by its terms. I understand this electronic signature is legally equivalent to a handwritten signature under the Georgia Electronic Records and Signatures Act (O.C.G.A. § 10-12-1 et seq.).
                    </span>
                  </label>
                </div>

                {error && (
                  <div style={{background:'rgba(192,57,43,.15)', border:'1px solid rgba(192,57,43,.3)', borderRadius:3, padding:'8px 12px', marginBottom:'1rem', fontSize:12, color:'#e57373'}}>
                    {error}
                  </div>
                )}

                <div style={{display:'flex', gap:10, alignItems:'center', flexWrap:'wrap'}}>
                  <button
                    type="submit"
                    disabled={signing || !scrolled || !signer1.trim() || !agreed}
                    style={{
                      background: (signing || !scrolled || !signer1.trim() || !agreed) ? 'rgba(208,104,48,.35)' : '#D06830',
                      color: '#fff', border: 'none', padding: '13px 28px',
                      fontSize: 13, fontWeight: 700, borderRadius: 4,
                      cursor: (signing || !scrolled || !signer1.trim() || !agreed) ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit', letterSpacing: '.06em', textTransform: 'uppercase',
                    }}>
                    {signing ? 'Signing…' : '✍ Sign Contract'}
                  </button>
                  {!scrolled && (
                    <span style={{fontSize:11, color:'rgba(255,255,255,.3)'}}>Scroll through the contract to enable signing</span>
                  )}
                </div>

                <div style={{marginTop:12, fontSize:10, color:'rgba(255,255,255,.25)', lineHeight:1.7}}>
                  Your IP address and timestamp will be recorded. A confirmation email with the signed contract will be sent to both parties. Questions? Call Michael at (404) 492-7650.
                </div>
              </div>
            </form>

          </>
        )}

      </div>
    </Layout>
  )
}

export async function getServerSideProps() { return { props: {} } }

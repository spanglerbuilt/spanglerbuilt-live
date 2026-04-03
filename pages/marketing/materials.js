import { useEffect, useState } from 'react'
import MarketingNav from './_nav'

export default function MarketingMaterials() {
  useEffect(function() {
    if (typeof window === 'undefined') return
    try {
      var a = JSON.parse(localStorage.getItem('sb_auth') || '{}')
      if (a.role !== 'marketing') { window.location.href = '/login'; return }
    } catch(e) { window.location.href = '/login' }
  }, [])

  var categories = [
    { label: 'Project photos',   desc: 'Before & after, in-progress shots for social and portfolio' },
    { label: 'Brochures & PDFs', desc: 'Service brochures, capability statements, leave-behinds' },
    { label: 'Brand assets',     desc: 'Logos, color palette, fonts, usage guidelines' },
    { label: 'Proposal templates', desc: 'Master templates Cari manages for Michael to customize' },
  ]

  return (
    <div style={{minHeight:'100vh', background:'#111', fontFamily:'Poppins,sans-serif'}}>
      <MarketingNav />
      <div style={{maxWidth:960, margin:'0 auto', padding:'1.5rem'}}>

        <div style={{fontSize:20, fontWeight:700, color:'#fff', marginBottom:4}}>Marketing materials</div>
        <div style={{fontSize:12, color:'rgba(255,255,255,.35)', marginBottom:'1.5rem'}}>Manage brand assets, photos, and collateral.</div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12, marginBottom:'1.5rem'}}>
          {categories.map(function(c) {
            return (
              <div key={c.label} style={{background:'#161616', border:'1px solid rgba(255,255,255,.08)', borderLeft:'4px solid #D06830', borderRadius:4, padding:'1.25rem 1.5rem'}}>
                <div style={{fontSize:14, fontWeight:700, color:'rgba(255,255,255,.85)', marginBottom:4}}>{c.label}</div>
                <div style={{fontSize:12, color:'rgba(255,255,255,.35)', marginBottom:16, lineHeight:1.6}}>{c.desc}</div>
                <label style={{
                  display:'inline-block', background:'rgba(208,104,48,.15)', border:'1px solid rgba(208,104,48,.3)',
                  color:'#D06830', fontSize:12, fontWeight:600, padding:'7px 14px', borderRadius:3, cursor:'pointer',
                }}>
                  Upload file
                  <input type="file" style={{display:'none'}} onChange={function(e){ alert('File upload coming soon — connect cloud storage (S3 or Supabase Storage) to enable.') }}/>
                </label>
              </div>
            )
          })}
        </div>

        <div style={{background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.06)', borderRadius:4, padding:'1rem 1.5rem', fontSize:12, color:'rgba(255,255,255,.3)', lineHeight:1.7}}>
          File storage connects to Supabase Storage or Amazon S3. Ask Michael to enable storage in the Supabase dashboard to activate uploads.
        </div>

      </div>
    </div>
  )
}

export async function getServerSideProps() { return { props: {} } }

import { useEffect, useState } from 'react'
import MarketingNav from './_nav'

var PLATFORMS = [
  {
    id:       'google_ads',
    name:     'Google Search Ads',
    icon:     'G',
    color:    '#4285F4',
    desc:     'Search campaigns targeting renovation keywords in Metro Atlanta.',
    manageUrl:'https://ads.google.com',
    fields:   ['Monthly budget', 'Spend to date', 'Clicks', 'Leads', 'Cost per lead'],
  },
  {
    id:       'google_lsa',
    name:     'Google Local Services',
    icon:     'LSA',
    color:    '#34A853',
    desc:     'Pay-per-lead ads shown at the top of Google for local contractor searches.',
    manageUrl:'https://localservices.google.com',
    fields:   ['Monthly budget', 'Leads received', 'Cost per lead', 'Avg rating'],
  },
  {
    id:       'meta_ads',
    name:     'Meta Ads',
    icon:     'M',
    color:    '#1877F2',
    desc:     'Facebook & Instagram campaigns for brand awareness and lead generation.',
    manageUrl:'https://business.facebook.com/adsmanager',
    fields:   ['Monthly budget', 'Spend to date', 'Impressions', 'Leads', 'Cost per lead'],
  },
  {
    id:       'nextdoor',
    name:     'Nextdoor Ads',
    icon:     'ND',
    color:    '#00B246',
    desc:     'Hyper-local ads reaching homeowners in your service neighborhoods.',
    manageUrl:'https://business.nextdoor.com',
    fields:   ['Monthly budget', 'Impressions', 'Clicks', 'Leads'],
  },
  {
    id:       'yelp',
    name:     'Yelp Ads',
    icon:     'Y',
    color:    '#D32323',
    desc:     'Sponsored placement on Yelp searches for contractors in Atlanta.',
    manageUrl:'https://biz.yelp.com',
    fields:   ['Monthly budget', 'Impressions', 'Clicks', 'Leads'],
  },
]

var STORAGE_KEY = 'sb_ads_metrics'

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch(_) { return {} }
}

function savePlatform(id, data) {
  var all = loadSaved()
  all[id] = data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export default function AdsPage() {
  var [metrics,  setMetrics]  = useState({})
  var [editing,  setEditing]  = useState(null)   // platform id
  var [draft,    setDraft]    = useState({})

  useEffect(function() {
    if (typeof window === 'undefined') return
    try {
      var a = JSON.parse(localStorage.getItem('sb_auth') || '{}')
      if (a.role !== 'marketing') { window.location.href = '/login'; return }
    } catch(e) { window.location.href = '/login' }
    setMetrics(loadSaved())
  }, [])

  function startEdit(platform) {
    setDraft(metrics[platform.id] || {})
    setEditing(platform.id)
  }

  function saveEdit(platformId) {
    savePlatform(platformId, draft)
    setMetrics(function(prev) { return Object.assign({}, prev, { [platformId]: draft }) })
    setEditing(null)
  }

  // Totals across all platforms
  function sumField(fieldPartial) {
    return PLATFORMS.reduce(function(sum, p) {
      var m = metrics[p.id] || {}
      var key = Object.keys(m).find(function(k) { return k.toLowerCase().includes(fieldPartial) })
      var val = key ? parseFloat((m[key]||'').replace(/[^0-9.]/g,'')) : 0
      return sum + (isNaN(val) ? 0 : val)
    }, 0)
  }

  var totalBudget  = sumField('budget')
  var totalSpend   = sumField('spend')
  var totalLeads   = sumField('leads')

  var inp = {
    width:'100%', padding:'8px 10px', background:'#0d0d0d',
    border:'1px solid rgba(255,255,255,.1)', borderRadius:3,
    color:'rgba(255,255,255,.8)', fontSize:12, outline:'none', boxSizing:'border-box',
  }

  return (
    <div style={{minHeight:'100vh', background:'#111', fontFamily:'Poppins,sans-serif'}}>
      <MarketingNav />
      <div style={{maxWidth:1040, margin:'0 auto', padding:'1.5rem'}}>

        {/* Header */}
        <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:8}}>
          <div>
            <div style={{fontSize:20, fontWeight:700, color:'#fff'}}>Ad platforms</div>
            <div style={{fontSize:12, color:'rgba(255,255,255,.35)', marginTop:3}}>
              Track spend and performance across all channels. Live API sync coming soon.
            </div>
          </div>
        </div>

        {/* Summary bar */}
        {(totalBudget > 0 || totalSpend > 0 || totalLeads > 0) && (
          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:'1.5rem'}}>
            {[
              { label:'Total monthly budget', value:'$' + totalBudget.toLocaleString() },
              { label:'Total spend to date',  value:'$' + totalSpend.toLocaleString()  },
              { label:'Total leads (all platforms)', value: totalLeads },
            ].map(function(s) {
              return (
                <div key={s.label} style={{background:'#161616', border:'1px solid rgba(255,255,255,.08)', borderRadius:4, padding:'1rem 1.25rem'}}>
                  <div style={{fontSize:22, fontWeight:700, color:'#fff', marginBottom:3}}>{s.value}</div>
                  <div style={{fontSize:11, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.07em'}}>{s.label}</div>
                </div>
              )
            })}
          </div>
        )}

        {/* Platform cards */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(2,minmax(0,1fr))', gap:14}}>
          {PLATFORMS.map(function(platform) {
            var m       = metrics[platform.id] || {}
            var isEdit  = editing === platform.id
            var hasData = Object.keys(m).some(function(k){ return m[k] })

            return (
              <div key={platform.id} style={{
                background:'#161616', border:'1px solid rgba(255,255,255,.08)',
                borderTop:'3px solid ' + platform.color, borderRadius:4, padding:'1.25rem',
              }}>

                {/* Platform header */}
                <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10}}>
                  <div style={{
                    width:36, height:36, borderRadius:6, flexShrink:0,
                    background: platform.color + '22',
                    border:'1px solid ' + platform.color + '44',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:11, fontWeight:800, color:platform.color, letterSpacing:-.5,
                  }}>{platform.icon}</div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:13, fontWeight:700, color:'rgba(255,255,255,.9)'}}>{platform.name}</div>
                    <div style={{fontSize:11, color:'rgba(255,255,255,.35)', lineHeight:1.4, marginTop:2}}>{platform.desc}</div>
                  </div>
                  <a href={platform.manageUrl} target="_blank" rel="noopener noreferrer"
                    style={{flexShrink:0, fontSize:11, color:platform.color, background: platform.color + '15', border:'1px solid ' + platform.color + '33', padding:'5px 10px', borderRadius:3, textDecoration:'none', whiteSpace:'nowrap'}}>
                    Manage ↗
                  </a>
                </div>

                {/* Metrics — view mode */}
                {!isEdit && (
                  <div style={{marginBottom:10}}>
                    {hasData ? (
                      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px 12px'}}>
                        {platform.fields.map(function(field) {
                          return (
                            <div key={field} style={{padding:'5px 0', borderBottom:'1px solid rgba(255,255,255,.04)'}}>
                              <div style={{fontSize:10, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:2}}>{field}</div>
                              <div style={{fontSize:13, fontWeight:600, color: m[field] ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.2)'}}>
                                {m[field] || '—'}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div style={{fontSize:12, color:'rgba(255,255,255,.25)', fontStyle:'italic', padding:'6px 0 10px'}}>
                        No metrics logged yet.
                      </div>
                    )}
                  </div>
                )}

                {/* Edit form */}
                {isEdit && (
                  <div style={{marginBottom:12}}>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10}}>
                      {platform.fields.map(function(field) {
                        return (
                          <div key={field}>
                            <label style={{display:'block', fontSize:10, fontWeight:600, color:'rgba(255,255,255,.35)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:4}}>{field}</label>
                            <input
                              type="text"
                              value={draft[field] || ''}
                              onChange={function(e) {
                                var val = e.target.value
                                setDraft(function(d) { return Object.assign({}, d, { [field]: val }) })
                              }}
                              placeholder={field.toLowerCase().includes('budget') || field.toLowerCase().includes('spend') || field.toLowerCase().includes('cost') ? '$0' : '0'}
                              style={inp}
                            />
                          </div>
                        )
                      })}
                    </div>
                    <div style={{display:'flex', gap:8}}>
                      <button onClick={function(){ saveEdit(platform.id) }} style={{background:'#D06830', color:'#fff', border:'none', padding:'7px 16px', fontSize:12, fontWeight:700, borderRadius:3, cursor:'pointer'}}>
                        Save
                      </button>
                      <button onClick={function(){ setEditing(null) }} style={{background:'transparent', border:'1px solid rgba(255,255,255,.12)', color:'rgba(255,255,255,.4)', padding:'7px 14px', fontSize:12, borderRadius:3, cursor:'pointer'}}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Edit toggle */}
                {!isEdit && (
                  <button onClick={function(){ startEdit(platform) }} style={{background:'transparent', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.4)', fontSize:11, padding:'6px 14px', borderRadius:3, cursor:'pointer', width:'100%'}}>
                    {hasData ? 'Update metrics' : '+ Log metrics'}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div style={{marginTop:'1.25rem', fontSize:11, color:'rgba(255,255,255,.2)', lineHeight:1.8}}>
          Metrics are saved locally in your browser. Live API sync (Google Ads, Meta) will pull real-time data automatically once connected.
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps() { return { props: {} } }

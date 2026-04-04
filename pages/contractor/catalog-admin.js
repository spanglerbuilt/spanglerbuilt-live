import Layout from '../../components/Layout'
import { useState, useEffect } from 'react'

var CATEGORIES = ['Flooring','Tile','Countertops','Cabinets','Fixtures','Bath','Hardware','Doors and Trim','Lighting','Appliances','Kitchen','Other']
var TIERS      = ['Good','Better','Best','Luxury']
var UNITS      = ['SF','EA','LF','Allowance','Per Quote']

// Supplier quick-search links per category
var SUPPLIER_LINKS = {
  'Flooring':       [
    { name:'Home Depot', url:'https://www.homedepot.com/s/lvp+flooring?NCNI-5' },
    { name:'Wayfair',    url:'https://www.wayfair.com/flooring/cat/flooring-c45974.html' },
  ],
  'Tile':           [
    { name:'The Tile Shop', url:'https://www.tileshop.com/floor-tile' },
    { name:'Home Depot',    url:'https://www.homedepot.com/b/Flooring-Tile/N-5yc1vZar3z' },
  ],
  'Countertops':    [
    { name:'MSI Surfaces',   url:'https://www.msisurfaces.com/quartz-countertops/quartz-collections/' },
    { name:'Cambria',        url:'https://www.cambria.com/designs/' },
    { name:'Caesarstone',    url:'https://www.caesarstoneus.com/quartz-countertops/' },
    { name:'Solid Surface',  url:'https://www.solidsurface.com/solid-surface/' },
    { name:'Home Depot',     url:'https://www.homedepot.com/b/Kitchen-Countertops/N-5yc1vZar58' },
  ],
  'Cabinets':       [
    { name:'Cabinets.com',   url:'https://www.cabinets.com/kitchen-cabinets/' },
    { name:'Home Depot',     url:'https://www.homedepot.com/b/Kitchen-Cabinets-Cabinet-Packages/N-5yc1vZar4e' },
    { name:'Wayfair',        url:'https://www.wayfair.com/storage-organization/cat/kitchen-cabinets-c1862977.html' },
  ],
  'Fixtures':       [
    { name:'Ferguson', url:'https://www.fergusonhome.com/bath/faucets' },
    { name:'Wayfair',  url:'https://www.wayfair.com/keyword.php?keyword=bathroom+faucet' },
  ],
  'Bath':           [
    { name:'Ferguson',   url:'https://www.fergusonhome.com/bath' },
    { name:'Home Depot', url:'https://www.homedepot.com/b/Bath/N-5yc1vZc3oo' },
    { name:'Wayfair',    url:'https://www.wayfair.com/bathroom-fixtures/cat/bathroom-fixtures-c45866.html' },
  ],
  'Hardware':       [
    { name:'Home Depot', url:'https://www.homedepot.com/b/Hardware-Cabinet-Hardware/N-5yc1vZc2dc' },
    { name:'Wayfair',    url:'https://www.wayfair.com/keyword.php?keyword=cabinet+pulls' },
  ],
  'Doors and Trim': [
    { name:'Home Depot', url:'https://www.homedepot.com/b/Doors-Windows-Doors/N-5yc1vZar6d' },
  ],
  'Lighting':       [
    { name:'Progressive Lighting', url:'https://www.progressivelighting.com/collections/all' },
    { name:'Wayfair',              url:'https://www.wayfair.com/lighting/cat/lighting-c45974.html' },
    { name:'Home Depot',           url:'https://www.homedepot.com/b/Lighting-Ceiling-Fans/N-5yc1vZbvkv' },
  ],
  'Appliances':     [
    { name:'Home Depot', url:'https://www.homedepot.com/b/Appliances/N-5yc1vZc3pl' },
    { name:'Wayfair',    url:'https://www.wayfair.com/appliances/cat/appliances-c215323.html' },
  ],
  'Kitchen':        [
    { name:'Ferguson',   url:'https://www.fergusonhome.com/kitchen' },
    { name:'Home Depot', url:'https://www.homedepot.com/b/Kitchen/N-5yc1vZbr9m' },
  ],
}

var BLANK = {
  category:'', subcategory:'', brand:'', product_name:'', style_type:'',
  size:'', finish:'', trim_style:'', unit:'EA', material_cost:'', labor_cost:'',
  total_installed:'', tier:'Good', photo_url:'', manufacturer_url:'', description:'',
}

export default function CatalogAdmin() {
  var [materials, setMaterials]   = useState([])
  var [loading,   setLoading]     = useState(true)
  var [form,      setForm]        = useState(BLANK)
  var [editing,   setEditing]     = useState(null)  // id of row being edited
  var [search,    setSearch]      = useState('')
  var [filterCat, setFilterCat]   = useState('all')
  var [saving,    setSaving]      = useState(false)
  var [msg,       setMsg]         = useState('')
  var [showForm,  setShowForm]    = useState(false)
  var [pasteURL,    setPasteURL]    = useState('')
  var [fetching,    setFetching]    = useState(false)
  var [uploading,   setUploading]   = useState(false)
  var [fillingPhotos, setFillingPhotos] = useState(false)

  useEffect(function() {
    if (typeof window === 'undefined') return
    try {
      var a = JSON.parse(localStorage.getItem('sb_auth') || '{}')
      if (a.role !== 'contractor') { window.location.href = '/login'; return }
    } catch(e) { window.location.href = '/login' }
    loadMaterials()
  }, [])

  function loadMaterials() {
    setLoading(true)
    fetch('/api/materials')
      .then(r => r.json())
      .then(d => { setMaterials(d.materials || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  function setF(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function openNew() {
    setForm(BLANK); setEditing(null); setShowForm(true)
    setTimeout(() => document.getElementById('admin-form')?.scrollIntoView({ behavior:'smooth' }), 100)
  }

  function openEdit(m) {
    setForm({
      category: m.category || '', subcategory: m.subcategory || '', brand: m.brand || '',
      product_name: m.product_name || '', style_type: m.style_type || '', size: m.size || '',
      finish: m.finish || '', trim_style: m.trim_style || '', unit: m.unit || 'EA',
      material_cost: m.material_cost || '', labor_cost: m.labor_cost || '',
      total_installed: m.total_installed || '', tier: m.tier || 'Good',
      photo_url: m.photo_url || '', manufacturer_url: m.manufacturer_url || '',
      description: m.description || '',
    })
    setEditing(m.id); setShowForm(true)
    setTimeout(() => document.getElementById('admin-form')?.scrollIntoView({ behavior:'smooth' }), 100)
  }

  async function save() {
    if (!form.product_name || !form.category) { setMsg('Product name and category are required.'); return }
    setSaving(true); setMsg('')

    var finalForm = { ...form }

    // Auto-fetch photo if none set
    if (!finalForm.photo_url || !finalForm.photo_url.trim()) {
      setMsg('Finding product photo…')
      try {
        var pr = await fetch('/api/catalog/find-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brand: finalForm.brand, product_name: finalForm.product_name, category: finalForm.category }),
        })
        var pd = await pr.json()
        if (pd.ok && pd.url) finalForm.photo_url = pd.url
      } catch(e) { /* photo fetch failure is non-fatal */ }
      setMsg('')
    }

    const body   = editing ? { ...finalForm, id: editing } : finalForm
    const method = editing ? 'PUT' : 'POST'
    const res    = await fetch('/api/catalog/add', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const d = await res.json()
    setSaving(false)
    if (!d.ok) { setMsg('Error: ' + (d.error || 'Unknown')); return }
    setMsg(editing ? 'Updated!' : 'Added!')
    setShowForm(false); setEditing(null); setForm(BLANK)
    loadMaterials()
    setTimeout(() => setMsg(''), 3000)
  }

  // Bulk-fill photos for all items currently missing a photo_url
  async function fillMissingPhotos() {
    var missing = materials.filter(m => !m.photo_url || !m.photo_url.trim())
    if (missing.length === 0) { setMsg('All items already have photos.'); setTimeout(() => setMsg(''), 3000); return }
    if (!confirm('Find photos for ' + missing.length + ' items missing photos? This uses Google Search API quota (~' + missing.length + ' queries).')) return

    setFillingPhotos(true); setMsg('Finding photos — 0 / ' + missing.length + '…')

    // Process in batches of 10 to stay within rate limits
    var BATCH = 10
    var filled = 0
    for (var i = 0; i < missing.length; i += BATCH) {
      var batch = missing.slice(i, i + BATCH)
      try {
        var r = await fetch('/api/catalog/find-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: batch.map(m => m.id) }),
        })
        var d = await r.json()
        if (d.ok) filled += (d.filled || 0)
      } catch(e) {}
      setMsg('Finding photos — ' + Math.min(i + BATCH, missing.length) + ' / ' + missing.length + '…')
    }

    setFillingPhotos(false)
    setMsg(filled + ' photos added.')
    loadMaterials()
    setTimeout(() => setMsg(''), 4000)
  }

  async function deleteMaterial(id, name) {
    if (!confirm(`Delete "${name}"?`)) return
    await fetch('/api/catalog/add', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    loadMaterials()
  }

  // Upload Excel file and import all rows into Supabase
  async function uploadExcel(e) {
    var file = e.target.files && e.target.files[0]
    if (!file) return
    setUploading(true); setMsg('')
    var fd = new FormData()
    fd.append('file', file)
    try {
      var res = await fetch('/api/catalog/upload-excel', { method: 'POST', body: fd })
      var d = await res.json()
      if (d.ok) {
        setMsg(d.upserted + ' items imported from Excel' + (d.errors > 0 ? ' (' + d.errors + ' errors)' : '') + '.')
        loadMaterials()
      } else {
        setMsg('Import error: ' + (d.error || 'Unknown'))
      }
    } catch(err) { setMsg('Upload failed: ' + err.message) }
    setUploading(false)
    e.target.value = ''
  }

  // Fetch basic info from a product URL using Open Graph tags
  async function fetchFromURL() {
    if (!pasteURL.trim()) return
    setFetching(true)
    try {
      const res = await fetch('/api/catalog/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: pasteURL.trim() }),
      })
      const d = await res.json()
      if (d.ok) {
        setForm(f => ({
          ...f,
          product_name:     d.title   || f.product_name,
          photo_url:        d.image   || f.photo_url,
          manufacturer_url: pasteURL.trim(),
          brand:            d.brand   || f.brand,
          total_installed:  d.price   || f.total_installed,
          description:      d.desc    || f.description,
        }))
        setMsg('Product info loaded — review and save.')
      } else {
        setMsg('Could not auto-fill. Enter details manually.')
      }
    } catch(e) { setMsg('Fetch failed — enter manually.') }
    setFetching(false); setPasteURL('')
  }

  // Filtered list
  var filtered = materials.filter(m => {
    var matchCat  = filterCat === 'all' || m.category === filterCat
    var matchTxt  = !search || [m.product_name, m.brand, m.subcategory].join(' ').toLowerCase().includes(search.toLowerCase())
    return matchCat && matchTxt
  })

  var inp = { width:'100%', padding:'8px 10px', background:'#1a1a1a', border:'1px solid rgba(255,255,255,.1)', borderRadius:3, color:'rgba(255,255,255,.8)', fontSize:13, outline:'none', boxSizing:'border-box', fontFamily:'Poppins,sans-serif' }
  var lbl = { display:'block', fontSize:10, fontWeight:600, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:5 }

  return (
    <Layout>
      <div style={{maxWidth:1900, margin:'0 auto', padding:'1.5rem'}}>

        {/* Header */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:8}}>
          <div>
            <div style={{fontSize:20, fontWeight:700, color:'#fff'}}>Catalog admin</div>
            <div style={{fontSize:12, color:'rgba(255,255,255,.35)', marginTop:2}}>{materials.length} items · <a href="/contractor/catalog" style={{color:'#D06830', textDecoration:'none'}}>View public catalog ↗</a></div>
          </div>
          <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
            {msg && <span style={{fontSize:12, color: msg.startsWith('Error') || msg.startsWith('Import error') || msg.startsWith('Upload') ? '#e57373' : '#22c55e', alignSelf:'center'}}>{msg}</span>}
            <label style={{background:'#1a1a1a', color:'rgba(255,255,255,.7)', border:'1px solid rgba(255,255,255,.15)', padding:'7px 14px', fontSize:12, fontWeight:600, borderRadius:3, cursor: uploading ? 'wait' : 'pointer', fontFamily:'Poppins,sans-serif', display:'inline-block'}}>
              {uploading ? 'Importing…' : '⬆ Import Excel'}
              <input type="file" accept=".xlsx,.xls" style={{display:'none'}} onChange={uploadExcel} disabled={uploading} />
            </label>
            <button onClick={fillMissingPhotos} disabled={fillingPhotos || loading}
              style={{background:'#1a1a1a', color:'rgba(255,255,255,.7)', border:'1px solid rgba(255,255,255,.15)', padding:'7px 14px', fontSize:12, fontWeight:600, borderRadius:3, cursor: fillingPhotos ? 'wait' : 'pointer', fontFamily:'Poppins,sans-serif', opacity: fillingPhotos ? .6 : 1}}>
              {fillingPhotos ? 'Searching…' : '⬡ Fill photos'}
            </button>
            <button onClick={openNew} style={{background:'#D06830', color:'#fff', border:'none', padding:'8px 18px', fontSize:12, fontWeight:700, borderRadius:3, cursor:'pointer', fontFamily:'Poppins,sans-serif'}}>+ Add item</button>
          </div>
        </div>

        {/* Supplier quick-links */}
        <div style={{marginBottom:'1.25rem'}}>
          <div style={{fontSize:10, fontWeight:600, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8}}>Browse suppliers (opens in new tab with your pro account)</div>
          <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
            {Object.entries(SUPPLIER_LINKS).flatMap(([cat, links]) =>
              links.map(l => (
                <a key={cat+l.name} href={l.url} target="_blank" rel="noopener noreferrer" style={{
                  background:'#161616', border:'1px solid rgba(255,255,255,.08)', borderRadius:3,
                  padding:'5px 10px', fontSize:11, color:'rgba(255,255,255,.6)', textDecoration:'none',
                  whiteSpace:'nowrap',
                }}>
                  {l.name} · {cat} ↗
                </a>
              ))
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div style={{display:'flex', gap:8, marginBottom:'1rem', flexWrap:'wrap', alignItems:'center'}}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            style={{...inp, width:220}}/>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            style={{...inp, width:160}}>
            <option value="all">All categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <span style={{fontSize:11, color:'rgba(255,255,255,.35)', marginLeft:4}}>{filtered.length} items</span>
        </div>

        {/* Add/Edit form */}
        {showForm && (
          <div id="admin-form" style={{background:'#161616', border:'2px solid #D06830', borderRadius:4, padding:'1.5rem', marginBottom:'1.5rem'}}>
            <div style={{fontSize:14, fontWeight:700, color:'#D06830', marginBottom:'1rem'}}>
              {editing ? 'Edit item' : 'Add new item'}
            </div>

            {/* Paste from URL */}
            <div style={{background:'rgba(208,104,48,.06)', border:'1px solid rgba(208,104,48,.2)', borderRadius:3, padding:'10px 14px', marginBottom:'1rem'}}>
              <div style={{fontSize:11, color:'rgba(255,255,255,.5)', marginBottom:6}}>
                Found a product on Home Depot, Wayfair, Ferguson, etc.? Paste the URL below to auto-fill.
              </div>
              <div style={{display:'flex', gap:8}}>
                <input value={pasteURL} onChange={e => setPasteURL(e.target.value)}
                  placeholder="https://www.homedepot.com/p/..."
                  style={{...inp, flex:1}}/>
                <button onClick={fetchFromURL} disabled={fetching || !pasteURL.trim()}
                  style={{background:'rgba(208,104,48,.8)', color:'#fff', border:'none', padding:'8px 14px', fontSize:12, fontWeight:600, borderRadius:3, cursor:'pointer', whiteSpace:'nowrap', opacity: fetching||!pasteURL.trim() ? .5 : 1}}>
                  {fetching ? 'Loading…' : 'Auto-fill ↗'}
                </button>
              </div>
            </div>

            <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12, marginBottom:12}}>
              <div>
                <label style={lbl}>Category *</label>
                <select value={form.category} onChange={e => setF('category', e.target.value)} style={inp}>
                  <option value="">Select...</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Subcategory</label>
                <input value={form.subcategory} onChange={e => setF('subcategory', e.target.value)} placeholder="e.g. LVP, Porcelain" style={inp}/>
              </div>
              <div>
                <label style={lbl}>Tier</label>
                <select value={form.tier} onChange={e => setF('tier', e.target.value)} style={inp}>
                  {TIERS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="sb-grid-2" style={{marginBottom:12}}>
              <div>
                <label style={lbl}>Brand</label>
                <input value={form.brand} onChange={e => setF('brand', e.target.value)} placeholder="Shaw Floors, Moen, etc." style={inp}/>
              </div>
              <div>
                <label style={lbl}>Product name *</label>
                <input value={form.product_name} onChange={e => setF('product_name', e.target.value)} placeholder="Product name" style={inp}/>
              </div>
            </div>

            <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12, marginBottom:12}}>
              <div>
                <label style={lbl}>Style / Type</label>
                <input value={form.style_type} onChange={e => setF('style_type', e.target.value)} placeholder="Shaker, Plank..." style={inp}/>
              </div>
              <div>
                <label style={lbl}>Size</label>
                <input value={form.size} onChange={e => setF('size', e.target.value)} placeholder="24x24, 3cm..." style={inp}/>
              </div>
              <div>
                <label style={lbl}>Finish</label>
                <input value={form.finish} onChange={e => setF('finish', e.target.value)} placeholder="Matte Black, Polished..." style={inp}/>
              </div>
              <div>
                <label style={lbl}>Unit</label>
                <select value={form.unit} onChange={e => setF('unit', e.target.value)} style={inp}>
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12, marginBottom:12}}>
              <div>
                <label style={lbl}>Material cost ($)</label>
                <input type="number" step="0.01" value={form.material_cost} onChange={e => setF('material_cost', e.target.value)} placeholder="0.00" style={inp}/>
              </div>
              <div>
                <label style={lbl}>Labor cost ($)</label>
                <input type="number" step="0.01" value={form.labor_cost} onChange={e => setF('labor_cost', e.target.value)} placeholder="0.00" style={inp}/>
              </div>
              <div>
                <label style={lbl}>Total installed (display)</label>
                <input value={form.total_installed} onChange={e => setF('total_installed', e.target.value)} placeholder="28.00 or Allowance" style={inp}/>
              </div>
            </div>

            <div className="sb-grid-2" style={{marginBottom:12}}>
              <div>
                <label style={lbl}>Product URL (pro account link)</label>
                <input value={form.manufacturer_url} onChange={e => setF('manufacturer_url', e.target.value)} placeholder="https://www.homedepot.com/p/..." style={inp}/>
              </div>
              <div>
                <label style={lbl}>Photo URL <span style={{color:'rgba(255,255,255,.25)', fontWeight:400, textTransform:'none', letterSpacing:0}}>(auto-filled on save if blank)</span></label>
                <div style={{display:'flex', gap:6}}>
                  <input value={form.photo_url} onChange={e => setF('photo_url', e.target.value)} placeholder="Leave blank to auto-search…" style={{...inp, flex:1}}/>
                  <button type="button" disabled={fetching || !form.product_name}
                    onClick={async () => {
                      setFetching(true)
                      try {
                        var r = await fetch('/api/catalog/find-photo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ brand: form.brand, product_name: form.product_name, category: form.category }) })
                        var d = await r.json()
                        if (d.ok && d.url) setF('photo_url', d.url)
                        else setMsg('No photo found — try a different product name.')
                      } catch(e) { setMsg('Photo search failed.') }
                      setFetching(false)
                    }}
                    style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.12)', color:'rgba(255,255,255,.6)', padding:'8px 10px', fontSize:11, borderRadius:3, cursor: fetching||!form.product_name ? 'default' : 'pointer', whiteSpace:'nowrap', opacity: !form.product_name ? .4 : 1, fontFamily:'Poppins,sans-serif'}}>
                    {fetching ? '…' : '⬡ Search'}
                  </button>
                </div>
              </div>
            </div>

            <div style={{marginBottom:'1rem'}}>
              <label style={lbl}>Description / notes</label>
              <textarea value={form.description} onChange={e => setF('description', e.target.value)}
                placeholder="Any notes about this product..."
                rows={2} style={{...inp, resize:'vertical', lineHeight:1.6}}/>
            </div>

            {form.photo_url && (
              <div style={{marginBottom:'1rem'}}>
                <img src={form.photo_url} alt="" style={{height:80, objectFit:'contain', borderRadius:3, border:'1px solid rgba(255,255,255,.1)'}}
                  onError={e => e.target.style.display='none'}/>
              </div>
            )}

            <div style={{display:'flex', gap:8}}>
              <button onClick={save} disabled={saving} style={{background:'#D06830', color:'#fff', border:'none', padding:'10px 24px', fontSize:13, fontWeight:700, borderRadius:3, cursor:'pointer', fontFamily:'Poppins,sans-serif', opacity: saving ? .6 : 1}}>
                {saving ? 'Saving…' : (editing ? 'Update item' : 'Add to catalog')}
              </button>
              <button onClick={() => { setShowForm(false); setEditing(null); setForm(BLANK) }}
                style={{background:'transparent', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.4)', padding:'10px 16px', fontSize:12, cursor:'pointer', borderRadius:3, fontFamily:'Poppins,sans-serif'}}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Materials table */}
        {loading ? (
          <div style={{background:'#161616', border:'1px solid rgba(255,255,255,.08)', borderRadius:4, padding:'3rem', textAlign:'center', fontSize:13, color:'rgba(255,255,255,.4)'}}>Loading catalog…</div>
        ) : (
          <div className="sb-table-wrap" style={{background:'#161616', border:'1px solid rgba(255,255,255,.08)', borderRadius:4, overflow:'hidden'}}>
            <div style={{display:'grid', gridTemplateColumns:'44px 1fr 1fr 100px 90px 100px 110px', gap:8, padding:'8px 14px', background:'#0a0a0a', fontSize:10, fontWeight:600, color:'#D06830', textTransform:'uppercase', letterSpacing:'.05em', minWidth:640}}>
              <span></span><span>Product</span><span>Category</span><span>Tier</span><span>Unit</span><span>Price</span><span>Actions</span>
            </div>
            {filtered.length === 0 && (
              <div style={{padding:'2rem', textAlign:'center', fontSize:13, color:'rgba(255,255,255,.3)'}}>No items match.</div>
            )}
            {filtered.map((m, i) => (
              <div key={m.id} style={{display:'grid', gridTemplateColumns:'44px 1fr 1fr 100px 90px 100px 110px', gap:8, padding:'9px 14px', alignItems:'center', borderTop: i===0 ? 'none' : '1px solid rgba(255,255,255,.05)', fontSize:12, minWidth:640}}>
                <div style={{width:36, height:36, borderRadius:3, overflow:'hidden', background:'#0a0a0a', border:'1px solid rgba(255,255,255,.07)', flexShrink:0}}>
                  {m.photo_url
                    ? <img src={m.photo_url} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} onError={e => { e.target.style.display='none'; e.target.parentNode.style.background='#111' }}/>
                    : <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color:'rgba(255,255,255,.1)'}}>◻</div>
                  }
                </div>
                <div style={{minWidth:0}}>
                  <div style={{fontWeight:600, color:'rgba(255,255,255,.8)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{m.product_name}</div>
                  <div style={{fontSize:10, color:'rgba(255,255,255,.35)'}}>{m.brand}</div>
                </div>
                <div style={{minWidth:0}}>
                  <div style={{color:'rgba(255,255,255,.6)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{m.category}</div>
                  <div style={{fontSize:10, color:'rgba(255,255,255,.35)'}}>{m.subcategory}</div>
                </div>
                <span>
                  <span style={{background: m.tier==='Good'?'#eaf3de':m.tier==='Better'?'#e3f2fd':m.tier==='Best'?'#eeedfe':'#fff3e0',
                    color: m.tier==='Good'?'#3B6D11':m.tier==='Better'?'#0d47a1':m.tier==='Best'?'#534AB7':'#e65100',
                    fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:3}}>{m.tier}</span>
                </span>
                <span style={{color:'rgba(255,255,255,.4)', fontSize:11}}>{m.unit}</span>
                <span style={{fontWeight:600, color:'#D06830', fontSize:13}}>{m.total_installed ? (isNaN(m.total_installed) ? m.total_installed : '$'+parseFloat(m.total_installed).toFixed(2)) : '—'}</span>
                <div style={{display:'flex', gap:4}}>
                  {m.manufacturer_url && (
                    <a href={m.manufacturer_url} target="_blank" rel="noopener noreferrer"
                      style={{fontSize:9, color:'rgba(255,255,255,.5)', textDecoration:'none', border:'1px solid rgba(255,255,255,.1)', padding:'2px 6px', borderRadius:2}}>↗</a>
                  )}
                  <button onClick={() => openEdit(m)}
                    style={{background:'rgba(208,104,48,.15)', border:'1px solid rgba(208,104,48,.3)', color:'#D06830', fontSize:10, padding:'3px 8px', borderRadius:2, cursor:'pointer', fontFamily:'Poppins,sans-serif', fontWeight:600}}>Edit</button>
                  <button onClick={() => deleteMaterial(m.id, m.product_name)}
                    style={{background:'rgba(192,57,43,.15)', border:'1px solid rgba(192,57,43,.25)', color:'#e57373', fontSize:10, padding:'3px 8px', borderRadius:2, cursor:'pointer', fontFamily:'Poppins,sans-serif'}}>Del</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export async function getServerSideProps() { return { props: {} } }

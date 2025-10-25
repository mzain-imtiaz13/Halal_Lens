import React, { useEffect, useState } from 'react'
import {
  listShops,
  createShop,
  updateShop,
  deleteShop,
  addProduct,
  updateProduct,
  deleteProduct
} from '../api/services/shops'

/* File -> dataURL for preview */
const readAsDataURL = (file) => new Promise((res, rej) => {
  const fr = new FileReader()
  fr.onload = () => res(fr.result)
  fr.onerror = rej
  fr.readAsDataURL(file)
})

/* ====== Shop Form (small) ====== */
function ShopForm({ initial = { name:'', address:'' }, onCancel, onSave, saving }) {
  const [name, setName] = useState(initial.name || '')
  const [address, setAddress] = useState(initial.address || '')
  return (
    <div className="card">
      <div className="section-head">Shop</div>
      <div className="form-grid">
        <div className="form-item">
          <label className="label">Shop name <span className="req">*</span></label>
          <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Al-Noor Mart" />
        </div>
        <div className="form-item">
          <label className="label">Address</label>
          <input className="input" value={address} onChange={e=>setAddress(e.target.value)} placeholder="Street, City" />
        </div>
      </div>

      <div className="row" style={{justifyContent:'flex-end', marginTop:10}}>
        <button className="btn pill ghost" onClick={onCancel}>Cancel</button>
        <button className="btn pill primary" onClick={()=>onSave({name, address})} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}

/* ====== Ingredients row ====== */
const emptyIngredient = () => ({
  name: '',
  status: 'suspicious',
  reason: '',
  halalVotes: 0,
  suspiciousVotes: 0,
  haramVotes: 0,
  votedUserIds: []
})

function IngredientRow({ value, onChange, onRemove }) {
  const [x, setX] = useState(value || emptyIngredient())
  useEffect(()=>{ setX(value || emptyIngredient()) }, [value])
  const upd = (patch) => { const n={...x, ...patch}; setX(n); onChange(n) }

  return (
    <div className="ing-row">
      <input className="input" placeholder="Name" value={x.name} onChange={e=>upd({name:e.target.value})}/>
      <select className="select" value={x.status} onChange={e=>upd({status:e.target.value})}>
        <option value="halal">halal</option>
        <option value="haram">haram</option>
        <option value="suspicious">suspicious</option>
      </select>
      <input className="input" placeholder="Reason" value={x.reason} onChange={e=>upd({reason:e.target.value})}/>
      <input className="input num" type="number" min="0" value={x.halalVotes} onChange={e=>upd({halalVotes:Number(e.target.value||0)})}/>
      <input className="input num" type="number" min="0" value={x.suspiciousVotes} onChange={e=>upd({suspiciousVotes:Number(e.target.value||0)})}/>
      <input className="input num" type="number" min="0" value={x.haramVotes} onChange={e=>upd({haramVotes:Number(e.target.value||0)})}/>
      <input className="input" placeholder="user1, user2" value={(x.votedUserIds||[]).join(', ')}
             onChange={e=>upd({votedUserIds:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})}/>
      <button className="btn small danger" onClick={onRemove}>Remove</button>
    </div>
  )
}

/* ====== Reference row ====== */
const emptyRef = () => ({ title:'', url:'', notes:'' })
function ReferenceRow({ value, onChange, onRemove }) {
  const [x, setX] = useState(value || emptyRef())
  useEffect(()=>{ setX(value || emptyRef()) }, [value])
  const upd = (patch) => { const n={...x, ...patch}; setX(n); onChange(n) }
  return (
    <div className="ref-row">
      <input className="input" placeholder="Title" value={x.title} onChange={e=>upd({title:e.target.value})}/>
      <input className="input" placeholder="URL" value={x.url} onChange={e=>upd({url:e.target.value})}/>
      <input className="input" placeholder="Notes" value={x.notes} onChange={e=>upd({notes:e.target.value})}/>
      <button className="btn small danger" onClick={onRemove}>Remove</button>
    </div>
  )
}

/* ====== Tag input (chips) ====== */
/* NEW: commits on Enter, comma, Tab, and onBlur. Supports pasting comma-separated values. */
function TagInput({ value = [], onChange, placeholder }) {
  const [text, setText] = useState('')

  const addToken = (raw) => {
    const parts = String(raw || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    if (!parts.length) return
    const set = new Set([...(value || [])])
    parts.forEach(p => set.add(p))
    onChange(Array.from(set))
  }

  const addFromText = () => {
    if (!text.trim()) return
    addToken(text)
    setText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Tab' || e.key === ',') {
      e.preventDefault()
      addFromText()
    }
    if (e.key === 'Backspace' && !text && (value||[]).length) {
      onChange(value.slice(0, -1))
    }
  }

  const remove = (i) => onChange((value||[]).filter((_,idx)=>idx!==i))

  return (
    <div className="tag-input">
      {(value||[]).map((t, i)=>(
        <span key={i} className="tag">
          {t} <button className="tag-x" onClick={()=>remove(i)} title="remove">×</button>
        </span>
      ))}
      <input
        className="input"
        value={text}
        onChange={e=>setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addFromText}
        placeholder={placeholder}
      />
    </div>
  )
}

/* ====== Dynamic nutriments (any key/value) ====== */
const emptyNutri = () => ({ key:'', value:'' })

function NutrimentRow({ value, onChange, onRemove }) {
  const [x, setX] = useState(value || emptyNutri())
  useEffect(()=>{ setX(value || emptyNutri()) }, [value])
  const upd = (patch) => { const n={...x, ...patch}; setX(n); onChange(n) }
  return (
    <div className="nutri-row">
      <input className="input" placeholder="Key (e.g., energy-kcal_100g)" value={x.key} onChange={e=>upd({key:e.target.value})}/>
      <input className="input" type="number" placeholder="Value" value={x.value} onChange={e=>upd({value:e.target.value})}/>
      <button className="btn small danger" onClick={onRemove}>Remove</button>
    </div>
  )
}

/* ====== Product Form ====== */
function ProductForm({ initial = {}, onCancel, onSave, saving }) {
  // core
  const [productName, setProductName] = useState(initial.productName || initial.name || '')
  const [barcode, setBarcode]       = useState(initial.barcode || '')
  const [brands, setBrands]         = useState(initial.brands || initial.brand || '')

  // status & flags
  const [overallStatus, setOverallStatus] = useState(initial.overallStatus || '')
  const [statusReason, setStatusReason]   = useState(initial.statusReason || '')
  const [isVerified, setIsVerified]       = useState(!!initial.isVerified || !!initial.verified)

  // images
  const [frontImage, setFrontImage] = useState(initial.frontImageUrl || initial.frontImage || initial.picture || '')
  const [backImage,  setBackImage]  = useState(initial.backImageUrl || initial.backImage || '')
  const onPickFront = async (e) => { const f=e.target.files?.[0]; if(!f) return; setFrontImage(await readAsDataURL(f)) }
  const onPickBack  = async (e) => { const f=e.target.files?.[0]; if(!f) return; setBackImage(await readAsDataURL(f)) }

  // optional/meta
  const [quantity, setQuantity]     = useState(initial.quantity || '')
  const [categories, setCategories] = useState(
    Array.isArray(initial.categories) ? initial.categories : (initial.category ? [initial.category] : [])
  )
  const [allergens, setAllergens]   = useState(Array.isArray(initial.allergens) ? initial.allergens : [])
  const [additives, setAdditives]   = useState(Array.isArray(initial.additives) ? initial.additives : [])
  const [nutriscore, setNutriscore] = useState(initial.nutriscore || '')

  // nutriments dynamic rows (from object map)
  const initRows = []
  if (initial.nutriments && typeof initial.nutriments === 'object') {
    Object.entries(initial.nutriments).forEach(([k,v]) => {
      initRows.push({ key: k, value: String(v) })
    })
  }
  const [nutrimentsRows, setNutrimentsRows] = useState(initRows.length ? initRows : [emptyNutri()])
  const addNutriRow = () => setNutrimentsRows(p => [...p, emptyNutri()])
  const updNutriRow = (idx, val) => setNutrimentsRows(p => p.map((it,i)=> i===idx ? val : it))
  const rmNutriRow  = (idx) => setNutrimentsRows(p => p.filter((_,i)=> i!==idx))

  // ingredients + references
  const [ingredients, setIngredients] = useState(
    Array.isArray(initial.ingredients) && initial.ingredients.length
      ? initial.ingredients
      : [emptyIngredient()]
  )
  const addIng = () => setIngredients(p => [...p, emptyIngredient()])
  const updIng = (idx, val) => setIngredients(p => p.map((it,i)=> i===idx ? val : it))
  const rmIng  = (idx) => setIngredients(p => p.filter((_,i)=> i!==idx))

  const [references, setReferences] = useState(Array.isArray(initial.references) ? initial.references : [])
  const addRef = () => setReferences(p => [...p, emptyRef()])
  const updRef = (idx, val) => setReferences(p => p.map((r,i)=> i===idx ? val : r))
  const rmRef  = (idx) => setReferences(p => p.filter((_,i)=> i!==idx))

  const toNutriObject = (rows) => {
    const o = {}
    rows.forEach(r => {
      const k = (r.key || '').trim()
      if (!k) return
      const n = Number(r.value)
      o[k] = isNaN(n) ? r.value : n
    })
    return Object.keys(o).length ? o : null
  }

  const handleSave = () => {
    onSave({
      productName,
      barcode,
      brands,
      overallStatus: (overallStatus || '').trim(),
      statusReason: (statusReason || '').trim(),
      isVerified,

      // images
      frontImage,
      backImage,

      // arrays/meta
      quantity: (quantity || '').trim(),
      categories,
      allergens,
      additives,
      nutriscore: (nutriscore || '').trim(),
      nutriments: toNutriObject(nutrimentsRows),

      ingredients,
      references
    })
  }

  return (
    <div className="card">
      {/* OVERVIEW */}
      <div className="section-head">Overview</div>
      <div className="form-grid">
        <div className="form-item">
          <label className="label">Product name <span className="req">*</span></label>
          <input className="input" value={productName} onChange={e=>setProductName(e.target.value)} placeholder="Prince Goût Chocolat" />
        </div>
        <div className="form-item">
          <label className="label">Barcode</label>
          <input className="input" value={barcode} onChange={e=>setBarcode(e.target.value)} placeholder="7622210449283" />
        </div>
        <div className="form-item">
          <label className="label">Brands</label>
          <input className="input" value={brands} onChange={e=>setBrands(e.target.value)} placeholder="Lu" />
        </div>
        <div className="form-item">
          <label className="label">Quantity</label>
          <input className="input" value={quantity} onChange={e=>setQuantity(e.target.value)} placeholder="300 g" />
        </div>
      </div>

      {/* IMAGES & VERIFY */}
      <div className="section-head">Images</div>
      <div className="row" style={{gap:14, alignItems:'center', flexWrap:'wrap'}}>
        <label className="btn ghost pill" style={{cursor:'pointer'}}>
          Upload Front
          <input type="file" accept="image/*" onChange={onPickFront} style={{display:'none'}} />
        </label>
        {frontImage ? <img src={frontImage} alt="front" className="product-thumb"/> : <span className="helper">No front image</span>}

        <label className="btn ghost pill" style={{cursor:'pointer'}}>
          Upload Back
          <input type="file" accept="image/*" onChange={onPickBack} style={{display:'none'}} />
        </label>
        {backImage ? <img src={backImage} alt="back" className="product-thumb"/> : <span className="helper">No back image</span>}

        <label className="row" style={{marginLeft:'auto'}}>
          <input type="checkbox" checked={isVerified} onChange={e=>setIsVerified(e.target.checked)} style={{marginRight:8}} />
          Verified
        </label>
      </div>

      {/* INGREDIENTS */}
      <div className="section-head">Ingredients</div>
      <div className="ing-grid">
        <div className="ing-head">Name</div>
        <div className="ing-head">Status</div>
        <div className="ing-head">Reason</div>
        <div className="ing-head ing-num">Halal</div>
        <div className="ing-head ing-num">Susp.</div>
        <div className="ing-head ing-num">Haram</div>
        <div className="ing-head">Voted User IDs</div>
        <div className="ing-head">Action</div>
      </div>
      {ingredients.map((ing, idx)=>(
        <IngredientRow key={idx} value={ing} onChange={(v)=>updIng(idx, v)} onRemove={()=>rmIng(idx)} />
      ))}
      <button className="btn pill" onClick={addIng}>+ Add ingredient</button>

      {/* ARRAYS */}
      <div className="section-head">Categories / Allergens / Additives</div>
      <div className="form-grid">
        <div className="form-item">
          <label className="label">Categories</label>
          <TagInput value={categories} onChange={setCategories} placeholder="en:snacks, en:biscuits..." />
        </div>
        <div className="form-item">
          <label className="label">Allergens</label>
          <TagInput value={allergens} onChange={setAllergens} placeholder="eggs, gluten, milk..." />
        </div>
        <div className="form-item">
          <label className="label">Additives</label>
          <TagInput value={additives} onChange={setAdditives} placeholder="E100, E322..." />
        </div>
      </div>

      {/* NUTRIMENTS (dynamic) */}
      <div className="section-head">Nutriments</div>
      <div className="nutri-grid">
        <div className="nutri-head">Key</div>
        <div className="nutri-head">Value</div>
        <div className="nutri-head">Action</div>
      </div>
      {nutrimentsRows.map((row, idx)=>(
        <NutrimentRow key={idx} value={row} onChange={(v)=>updNutriRow(idx, v)} onRemove={()=>rmNutriRow(idx)} />
      ))}
      <button className="btn pill" onClick={addNutriRow}>+ Add nutriment</button>

      {/* VERDICT */}
      <div className="section-head">Verdict</div>
      <div className="form-grid">
        <div className="form-item">
          <label className="label">Overall Status</label>
          <select className="select" value={overallStatus} onChange={e=>setOverallStatus(e.target.value)}>
            <option value="">—</option>
            <option value="halal">halal</option>
            <option value="haram">haram</option>
            <option value="suspicious">suspicious</option>
          </select>
        </div>
        <div className="form-item">
          <label className="label">Reason</label>
          <textarea className="input" rows={3} value={statusReason} onChange={e=>setStatusReason(e.target.value)} placeholder="Optional" />
        </div>
      </div>

      {/* REFERENCES */}
      <div className="section-head">References</div>
      {references.map((r, idx)=>(
        <ReferenceRow key={idx} value={r} onChange={(v)=>updRef(idx, v)} onRemove={()=>rmRef(idx)} />
      ))}
      <button className="btn pill" onClick={addRef}>+ Add reference</button>

      {/* SAVE */}
      <div className="row" style={{justifyContent:'flex-end', marginTop:16}}>
        <button className="btn pill ghost" onClick={onCancel}>Cancel</button>
        <button className="btn pill primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save product'}
        </button>
      </div>
    </div>
  )
}

/* ====== Page: Shops ====== */
export default function Shops() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const [creatingShop, setCreatingShop] = useState(false)
  const [editingShopId, setEditingShopId] = useState(null)
  const [savingShop, setSavingShop] = useState(false)

  const [addingForShop, setAddingForShop] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)
  const [savingProduct, setSavingProduct] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try{
      const resp = await listShops({})
      setRows(resp.data)
    } finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [])

  const handleCreateShop = async (data) => {
    setSavingShop(true)
    try{
      await createShop(data)
      setCreatingShop(false)
      await fetchData()
    } finally { setSavingShop(false) }
  }
  const handleUpdateShop = async (shopId, data) => {
    setSavingShop(true)
    try{
      await updateShop(shopId, data)
      setEditingShopId(null)
      await fetchData()
    } finally { setSavingShop(false) }
  }
  const handleDeleteShop = async (shopId) => {
    if (!confirm('Delete this shop?')) return
    await deleteShop(shopId)
    await fetchData()
  }

  const handleAddProduct = async (shopId, payload) => {
    setSavingProduct(true)
    try{
      await addProduct(shopId, payload)
      setAddingForShop(null)
      await fetchData()
    } finally { setSavingProduct(false) }
  }
  const handleUpdateProduct = async (shopId, productId, payload) => {
    setSavingProduct(true)
    try{
      await updateProduct(shopId, productId, payload)
      setEditingProduct(null)
      await fetchData()
    } finally { setSavingProduct(false) }
  }
  const handleDeleteProduct = async (shopId, productId) => {
    if (!confirm('Delete this product?')) return
    await deleteProduct(shopId, productId)
    await fetchData()
  }

  return (
    <>
      <div className="card-header">
        <h2 className="card-title">Shops & Products</h2>
        <div className="btn-group">
          {!creatingShop && <button className="btn primary pill" onClick={()=>setCreatingShop(true)}>Add Shop</button>}
        </div>
      </div>

      {creatingShop && (
        <ShopForm
          onCancel={()=>setCreatingShop(false)}
          onSave={handleCreateShop}
          saving={savingShop}
        />
      )}

      {loading ? 'Loading...' : (
        <div className="shop-grid">
          {rows.map(shop => (
            <div key={shop.id} className="shop-card">
              <div className="shop-head">
                <div>
                  <div className="shop-title">{shop.name}</div>
                  <div className="shop-sub">{shop.address}</div>
                </div>
                <div className="shop-toolbar">
                  <button className="btn ghost pill" onClick={()=>setEditingShopId(shop.id)}>Edit</button>
                  <button className="btn outline pill" onClick={()=>setAddingForShop(shop.id)}>Add Product</button>
                  <button className="btn danger pill" onClick={()=>handleDeleteShop(shop.id)}>Delete</button>
                </div>
              </div>

              {editingShopId === shop.id && (
                <div className="shop-body">
                  <ShopForm
                    initial={{ name: shop.name, address: shop.address }}
                    onCancel={()=>setEditingShopId(null)}
                    onSave={(data)=>handleUpdateShop(shop.id, data)}
                    saving={savingShop}
                  />
                </div>
              )}

              {addingForShop === shop.id && (
                <div className="shop-body">
                  <ProductForm
                    onCancel={()=>setAddingForShop(null)}
                    onSave={(data)=>handleAddProduct(shop.id, data)}
                    saving={savingProduct}
                  />
                </div>
              )}

              <div className="shop-body">
                <div className="shop-section-title">Products</div>
                {shop.products?.length ? (
                  <div style={{overflowX:'auto'}}>
                    <table className="table compact">
                      <thead>
                        <tr>
                          <th>Picture</th>
                          <th>Product</th>
                          <th>Barcode</th>
                          <th>Brands</th>
                          <th>Overall Status</th>
                          <th>Verified</th>
                          <th style={{textAlign:'right'}}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shop.products.map(p => (
                          <tr key={p.id}>
                            <td>
                              {p.frontImage ? (
                                <img src={p.frontImage} alt="" className="product-thumb" />
                              ) : p.picture ? (
                                <img src={p.picture} alt="" className="product-thumb" />
                              ) : <span className="helper">—</span>}
                            </td>
                            <td>{p.name}</td>
                            <td>{p.barcode}</td>
                            <td>{p.brand || p.brands}</td>
                            <td>{p.overallStatus || '-'}</td>
                            <td>
                              <span className={`chip ${p.verified ? 'green' : 'amber'}`}>
                                <span className="dot" />
                                {p.verified ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td style={{textAlign:'right'}}>
                              <div className="btn-group" style={{justifyContent:'flex-end'}}>
                                <button className="btn small ghost" onClick={()=>setEditingProduct({ shopId: shop.id, product: p })}>Edit</button>
                                <button className="btn small danger" onClick={()=>handleDeleteProduct(shop.id, p.id)}>Delete</button>
                              </div>

                              {editingProduct?.shopId === shop.id && editingProduct?.product?.id === p.id && (
                                <div style={{marginTop:10}}>
                                  <ProductForm
                                    initial={{
                                      ...p,
                                      productName: p.name,
                                      brands: p.brand || p.brands || '',
                                      frontImageUrl: p.frontImage || p.picture || '',
                                      backImageUrl: p.backImage || '',
                                      overallStatus: p.overallStatus || '',
                                      isVerified: p.verified
                                    }}
                                    onCancel={()=>setEditingProduct(null)}
                                    onSave={(data)=>handleUpdateProduct(shop.id, p.id, data)}
                                    saving={savingProduct}
                                  />
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="table-empty">No products yet. Click “Add Product”.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

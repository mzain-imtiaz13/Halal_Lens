import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  getDoc
} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage, ref as sref, uploadString, getDownloadURL } from 'firebase/storage'
import { db } from '../../firebase'

/* ---------- helpers ---------- */
const auth = getAuth()
const storage = getStorage()

// convert dataURL->Storage URL; if already a URL, return as-is; if falsy, return ''.
async function ensureImageUrl(input, ownerId, kind /* 'front'|'back' */) {
  if (!input) return ''
  if (typeof input === 'string' && input.startsWith('http')) return input
  if (typeof input === 'string' && input.startsWith('data:image')) {
    const safeOwner = ownerId || 'unknown'
    const path = `products/${safeOwner}/${kind}_${Date.now()}.jpg`
    const r = sref(storage, path)
    await uploadString(r, input, 'data_url')
    const url = await getDownloadURL(r)
    return url
  }
  return '' // unknown type
}

const normStrings = (arr) =>
  Array.isArray(arr)
    ? arr.map(s => String(s).trim()).filter(Boolean)
    : []

/* ---------- shops ---------- */
export async function listShops() {
  const shopsSnap = await getDocs(query(collection(db, 'shops'), orderBy('createdAt','desc')))
  const data = []
  for (const s of shopsSnap.docs) {
    const shop = { id: s.id, ...(s.data() || {}) }
    const prodsSnap = await getDocs(collection(db, `shops/${s.id}/products`))
    shop.products = prodsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    data.push(shop)
  }
  return { data, status: 200 }
}

export async function createShop(payload) {
  const ref = await addDoc(collection(db, 'shops'), {
    name: payload.name || '',
    address: payload.address || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
  return { data: { id: ref.id }, status: 200 }
}

export async function updateShop(id, payload) {
  await updateDoc(doc(db, 'shops', id), {
    name: payload.name || '',
    address: payload.address || '',
    updatedAt: serverTimestamp()
  })
  return { data: { ok: true }, status: 200 }
}

export async function deleteShop(id) {
  const prodsSnap = await getDocs(collection(db, `shops/${id}/products`))
  for (const p of prodsSnap.docs) {
    const prod = p.data()
    if (prod?.productsV2Id) {
      try { await deleteDoc(doc(db, 'products_v2', prod.productsV2Id)) } catch {}
    }
    await deleteDoc(doc(db, `shops/${id}/products`, p.id))
  }
  await deleteDoc(doc(db, 'shops', id))
  return { data: { ok: true }, status: 200 }
}

/** Create product: full object in products_v2 + mirror under shop */
export async function addProduct(shopId, payload) {
  const uid = auth.currentUser?.uid || null

  // upload images to Storage if they are data URLs
  const frontUrl = await ensureImageUrl(payload.frontImage || '', uid || 'admin', 'front')
  const backUrl  = await ensureImageUrl(payload.backImage || '',  uid || 'admin', 'back')  
  const v2 = {
    productName: payload.productName || '',
    barcode: payload.barcode || '',
    brands: payload.brands || '',
    categories: normStrings(payload.categories),
    ingredients: Array.isArray(payload.ingredients) ? payload.ingredients : [],
    nutriments: payload.nutriments || null,
    nutriscore: payload.nutriscore || null,
    allergens: normStrings(payload.allergens),
    additives: normStrings(payload.additives),
    frontImageUrl: frontUrl,
    backImageUrl: backUrl,
    quantity: payload.quantity || null,
    overallStatus: (payload.overallStatus || '').trim(),
    statusReason: payload.statusReason || '',
    dataSource: 'admin',
    references: Array.isArray(payload.references) ? payload.references : [],
    isVerified: !!payload.isVerified,
    addedByUserId: uid || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const v2Ref = await addDoc(collection(db, 'products_v2'), v2)
  await updateDoc(v2Ref, { id: v2Ref.id })

  const mirror = {
    name: v2.productName,
    barcode: v2.barcode,
    brand: v2.brands,
    overallStatus: v2.overallStatus || '',
    verified: !!v2.isVerified,
    frontImage: v2.frontImageUrl || '',
    backImage: v2.backImageUrl || '',
    picture: v2.frontImageUrl || '',
    ingredientsPreview: (v2.ingredients || []).map(x=>x?.name).filter(Boolean).slice(0,6).join(', '),
    productsV2Id: v2Ref.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
  const shopRef = await addDoc(collection(db, `shops/${shopId}/products`), mirror)

  return { data: { id: shopRef.id }, status: 200 }
}

export async function updateProduct(shopId, productId, payload) {
  const uid = auth.currentUser?.uid || null
  const frontUrl = await ensureImageUrl(payload.frontImage || '', uid || 'admin', 'front')
  const backUrl  = await ensureImageUrl(payload.backImage || '',  uid || 'admin', 'back')
  console.log("payload", payload)
  const v2 = {
    productName: payload.productName || '',
    barcode: payload.barcode || '',
    brands: payload.brands || '',
    categories: normStrings(payload.categories),
    ingredients: Array.isArray(payload.ingredients) ? payload.ingredients : [],
    nutriments: payload.nutriments || null,
    nutriscore: payload.nutriscore || null,
    allergens: normStrings(payload.allergens),
    additives: normStrings(payload.additives),
    frontImageUrl: frontUrl,
    backImageUrl: backUrl,
    quantity: payload.quantity || null,
    overallStatus: (payload.overallStatus || '').trim(),
    statusReason: payload.statusReason || '',
    dataSource: 'admin',
    references: Array.isArray(payload.references) ? payload.references : [],
    isVerified: !!payload.isVerified,
    addedByUserId: uid || null,
    updatedAt: serverTimestamp()
  }

  // update mirror in shop
  const prodRef = doc(db, `shops/${shopId}/products`, productId)
  await updateDoc(prodRef, {
    name: v2.productName,
    barcode: v2.barcode,
    brand: v2.brands,
    overallStatus: v2.overallStatus || '',
    verified: !!v2.isVerified,
    frontImage: v2.frontImageUrl || '',
    backImage: v2.backImageUrl || '',
    picture: v2.frontImageUrl || '',
    ingredientsPreview: (v2.ingredients || []).map(x=>x?.name).filter(Boolean).slice(0,6).join(', '),
    updatedAt: serverTimestamp()
  })

  // update products_v2
  const snap = await getDoc(prodRef)
  const v2Id = snap.data()?.productsV2Id
  if (v2Id) {
    await updateDoc(doc(db, 'products_v2', v2Id), v2)
  }
  return { data: { ok: true }, status: 200 }
}

export async function deleteProduct(shopId, productId) {
  const prodRef = doc(db, `shops/${shopId}/products`, productId)
  const snap = await getDoc(prodRef)
  const v2Id = snap.data()?.productsV2Id
  if (v2Id) {
    try { await deleteDoc(doc(db, 'products_v2', v2Id)) } catch {}
  }
  await deleteDoc(prodRef)
  return { data: { ok: true }, status: 200 }
}

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
  getDoc,
  where,
  setDoc
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

/* ---------- ADD PRODUCT WITH BARCODE CHECK (FIXED) ---------- */
export async function addProduct(shopId, payload) {
  const uid = auth.currentUser?.uid || null

  // normalize barcode to avoid type/whitespace mismatches
  const barcode = String(payload.barcode || '').trim()
  if (!barcode) {
    return { data: { error: 'barcode_required' }, status: 400 }
  }

  // upload images to Storage if they are data URLs
  const frontUrl = await ensureImageUrl(payload.frontImage || '', uid || 'admin', 'front')
  const backUrl  = await ensureImageUrl(payload.backImage || '',  uid || 'admin', 'back')
  console.log(payload)
  // Build v2 object (use normalized barcode)
  const v2 = {
    productName: payload.productName || '',
    origin: payload.origin,
    barcode: barcode,
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

  // Query products_v2 for matching barcode
  const qRef = query(collection(db, 'products_v2'), where('barcode', '==', barcode))
  const qSnap = await getDocs(qRef)

  let v2DocId = null

  if (!qSnap.empty) {
    // Found existing product - OVERWRITE it (setDoc will replace fields)
    const existingDoc = qSnap.docs[0]
    v2DocId = existingDoc.id
    const targetRef = doc(db, 'products_v2', v2DocId)

    // Overwrite existing doc with the new v2 data; keep an 'id' field
    await setDoc(targetRef, { ...v2, id: v2DocId, updatedAt: serverTimestamp() }, { merge: false })
  } else {
    // Not found - create new product_v2 doc (use generated id, set id field)
    const newRef = doc(collection(db, 'products_v2')) // generate id
    v2DocId = newRef.id
    await setDoc(newRef, { ...v2, createdAt: serverTimestamp(), id: v2DocId })
  }

  // Build shop mirror (make sure productsV2Id points to v2DocId)
  const mirror = {
    name: v2.productName,
    barcode: v2.barcode,
    brand: v2.brands,
    origin: payload.origin,
    overallStatus: v2.overallStatus || '',
    verified: !!v2.isVerified,
    frontImage: v2.frontImageUrl || '',
    backImage: v2.backImageUrl || '',
    picture: v2.frontImageUrl || '',
    ingredientsPreview: (v2.ingredients || []).map(x => x?.name).filter(Boolean).slice(0,6).join(', '),
    productsV2Id: v2DocId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  // Check if shop already has a product with same barcode — update if present
  const shopBarcodeCheck = query(collection(db, `shops/${shopId}/products`), where('barcode', '==', barcode))
  const shopSnap = await getDocs(shopBarcodeCheck)

  if (!shopSnap.empty) {
    const shopProdDoc = shopSnap.docs[0]
    await setDoc(shopProdDoc.ref, mirror, { merge: false })
    return { data: { id: shopProdDoc.id, productsV2Id: v2DocId }, status: 200 }
  }

  // Not found in shop → create mirror entry
  const shopRef = await addDoc(collection(db, `shops/${shopId}/products`), mirror)

  return { data: { id: shopRef.id, productsV2Id: v2DocId }, status: 200 }
}

/* ---------- UPDATE PRODUCT ---------- */
export async function updateProduct(shopId, productId, payload) {
  const uid = auth.currentUser?.uid || null
  const frontUrl = await ensureImageUrl(payload.frontImage || '', uid || 'admin', 'front')
  const backUrl  = await ensureImageUrl(payload.backImage || '',  uid || 'admin', 'back')

  const barcode = String(payload.barcode || '').trim()

  const v2 = {
    productName: payload.productName || '',
    barcode: barcode,
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

  // Update mirror in shop (overwrite)
  const prodRef = doc(db, `shops/${shopId}/products`, productId)
  await setDoc(prodRef, {
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
  }, { merge: true })

  // Update products_v2 linked to this shop product (if exists)
  const snap = await getDoc(prodRef)
  const v2Id = snap.data()?.productsV2Id
  if (v2Id) {
    const v2Ref = doc(db, 'products_v2', v2Id)
    await updateDoc(v2Ref, v2)
  }

  return { data: { ok: true }, status: 200 }
}

/* ---------- DELETE PRODUCT ---------- */
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

/* ---------- FETCH FULL PRODUCT_V2 BY ID ---------- */
export async function getProductV2ById(id) {
  if (!id) return { data: null, status: 400 }

  const ref = doc(db, 'products_v2', id)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    return { data: null, status: 404 }
  }

  return { data: { id: snap.id, ...(snap.data() || {}) }, status: 200 }
}
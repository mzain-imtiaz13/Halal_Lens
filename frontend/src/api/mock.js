/* ------------------------- mock.js (FULL) ------------------------- */

const wait = (ms) => new Promise(res => setTimeout(res, ms))
// Default to mock unless explicitly set to "false"
const useMock = String(import.meta.env.VITE_USE_MOCK ?? 'true').toLowerCase() !== 'false'

export async function maybeMock(data, ms = 250){
  if (useMock){ await wait(ms); return { data, status:200 } }
  return null
}

/* helpers (NOW EXPORTED) */
export function applySearch(arr, keys, q=''){
  if(!q) return arr
  const s = q.toLowerCase()
  return arr.filter(o => keys.some(k => String(o[k] ?? '').toLowerCase().includes(s)))
}
export function applyEq(arr, field, value){
  if(!value) return arr
  return arr.filter(o => String(o[field] ?? '') === String(value))
}
export function paginate(arr, page=1, pageSize=10){
  const start = (page-1)*pageSize
  return { items: arr.slice(start, start+pageSize), total: arr.length, page, pageSize }
}

/* ---------- Dashboard data ---------- */
const days = ['01','02','03','04','05','06','07','08','09','10','11','12']
export const mockMetrics = {
  totalUsers: 1287,
  activeSubscriptionsCount: 342,
  activeSubscriptionsAmount: 2140,
  revenueEarned: 13250,
  productsScanned: 8612,
  verdictBreakdown: { halal: 5120, haram: 2480, suspicious: 1012 },
  series: {
    days,
    scansPerDay: [420,510,380,460,590,610,530,480,640,700,620,580],
    usersPerDay: [30,24,33,31,29,35,26,28,36,38,40,37],
    revenuePerDay: [320,410,390,450,520,610,540,500,640,680,620,700],
    mediumWise: { barcode: 62, camera: 38 }
  },
  recent: [
    { id:1, title:'Manual verification approved', time:'2m', type:'ok' },
    { id:2, title:'High votes for ingredient E471 (suspicious)', time:'18m', type:'warn' },
    { id:3, title:'New shop added — Fresh Mart', time:'1h', type:'ok' },
    { id:4, title:'AI re-check completed for 6 products', time:'2h', type:'ok' },
  ],
  topProducts: [
    { id:11, name:'Barley Porridge', scans: 182, verdict:'halal' },
    { id:12, name:'Berry Yogurt', scans: 149, verdict:'suspicious' },
    { id:13, name:'Gummy Mix', scans: 133, verdict:'haram' }
  ]
}

/* ---------- Users ---------- */
export const mockUsers = Array.from({ length: 48 }).map((_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  subscription_plan: i % 3 ? 'Premium' : 'Free',
  price: (i % 3 ? 9.99 : 0),
  subscription_start: '2025-09-01',
  subscription_end: '2026-09-01',
  status: i % 4 ? 'Active' : 'Inactive',
  active_months: 3 + (i % 12),
  total_scans: 6 + (i * 2)
}))

export async function mockListUsers(params = {}){
  const { search = '', plan = '', status = '', page = 1, pageSize = 10 } = params
  let arr = [...mockUsers]
  arr = applySearch(arr, ['name','email'], search)
  arr = applyEq(arr, 'subscription_plan', plan)
  arr = applyEq(arr, 'status', status)
  const { items, total } = paginate(arr, Number(page), Number(pageSize))
  return maybeMock({ items, total, page:Number(page), pageSize:Number(pageSize) })
}

/* ---------- AI Products ---------- */
export const mockAIProducts = Array.from({ length: 60 }).map((_, i) => ({
  id: i + 1,
  product_name: `Product ${i + 1}`,
  medium: i % 2 ? 'barcode' : 'camera',
  ingredients_preview: i % 4 ? 'sugar, water, color E120' : 'milk, gelatin, E471',
  ai_verdict: ['halal', 'haram', 'suspicious'][i % 3],
  haram_ingredients: i % 3 === 1 ? 'E120' : '',
  suspicious_ingredients: i % 3 === 2 ? 'E471' : '',
  api_source: i % 2 ? 'OpenFoodFacts' : 'Spoonacular',
  date_added: '2025-10-10'
}))

/* ---------- Manual Products (OFFLINE-SAFE images) ---------- */
const PLACEHOLDER_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="80">
      <rect width="120" height="80" fill="#e5e7eb"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            font-family="Arial" font-size="10" fill="#6b7280">No Image</text>
    </svg>
  `)

export let mockManualProducts = Array.from({ length: 25 }).map((_, i) => ({
  id: i + 1,
  product_name: `Manual Product ${i + 1}`,
  img_front_url: PLACEHOLDER_IMG,
  img_ingredients_url: PLACEHOLDER_IMG,
  admin_verdict: ['halal', 'haram', 'suspicious'][i % 3],
  submitted_at: '2025-10-09'
}))

export async function mockListManualProducts(params = {}){
  const { verdict = '', q = '', page = 1, pageSize = 10 } = params
  let arr = [...mockManualProducts]
  arr = applyEq(arr, 'admin_verdict', verdict)
  arr = applySearch(arr, ['product_name'], q)
  const { items, total } = paginate(arr, Number(page), Number(pageSize))
  return maybeMock({ items, total, page:Number(page), pageSize:Number(pageSize) })
}

/* ---------- Votes ---------- */
export const mockVotes = Array.from({ length: 97 }).map((_, i) => ({
  id: i + 1,
  product_name: `Product ${1 + (i%12)}`,
  product_id: 1 + (i%12),
  ingredient_name: ['E120', 'E471', 'Gelatin'][i % 3],
  user_name: `User ${1 + (i%30)}`,
  vote_type: ['halal', 'haram', 'suspicious'][i % 3],
  created_at: '2025-10-08',
  ai_status_at_vote: ['halal', 'haram', 'suspicious'][ (i+1) % 3 ]
}))

export const mockVotesSummary = Array.from({ length: 34 }).map((_, i) => ({
  id: i + 1,
  product_name: `Product ${1 + (i%15)}`,
  ingredient_name: ['E120', 'E471', 'Gelatin'][i % 3],
  halal_votes: 20 + (i%13),
  haram_votes: 5 + (i%7),
  suspicious_votes: 3 + (i%5),
  total_votes: 28 + (i%17),
  ai_status: ['halal', 'haram', 'suspicious'][i % 3]
}))

/* ---------------- Revenue (MUTABLE in mock mode) ---------------- */
let mockRevenueState = Array.from({ length: 6 }).map((_, i) => ({
  id: i + 1,
  month: `2025-0${(i % 9) + 1}`,
  total_revenue: 2000 + i * 300,
  total_subscriptions: 300 + i * 20,
  arpu: +(6.7 + i * 0.2).toFixed(1),
  transaction_source: i % 2 ? 'App Store' : 'Play Store',
  generated_on: '2025-10-01'
}))
let revAutoId = mockRevenueState.length + 1

export async function mockGetRevenue(){
  const sorted = [...mockRevenueState].sort((a,b)=> b.month.localeCompare(a.month))
  return maybeMock(sorted)
}

export async function mockGenerateRevenue(month){
  const idx = mockRevenueState.findIndex(r => r.month === month)
  const now = new Date()
  const newRow = {
    id: idx >= 0 ? mockRevenueState[idx].id : (revAutoId++),
    month,
    total_revenue: 2500 + Math.floor(Math.random()*1500),
    total_subscriptions: 300 + Math.floor(Math.random()*120),
    arpu: +(5 + Math.random()*4).toFixed(1),
    transaction_source: Math.random() > .5 ? 'App Store' : 'Play Store',
    generated_on: now.toISOString().slice(0,10)
  }
  if (idx >= 0){
    mockRevenueState[idx] = newRow
  } else {
    mockRevenueState.push(newRow)
  }
  return maybeMock({ ok:true, row:newRow })
}

/* ---------- Shops (FULL CRUD, MUTABLE) ---------- */
/** Shape:
 * shop: { id, name, address, products: Product[] }
 * product: { id, name, picture, barcode, brand, category, ingredients, verified }
 */

export const mockShops = Array.from({ length: 5 }).map((_, i) => ({
  id: i + 1,
  name: `Shop ${i + 1}`,
  address: `Street ${i + 1}, City`,
  products: [
    {
      id: 101 + i,
      name: `Product A${i}`,
      picture: '', // dataURL or http url
      barcode: '1234567890123',
      brand: 'Brand A',
      category: 'Snacks',
      ingredients: 'Sugar, Oil, E471',
      verified: i % 2 === 0
    },
    {
      id: 201 + i,
      name: `Product B${i}`,
      picture: '',
      barcode: '9999999999999',
      brand: 'Brand B',
      category: 'Dairy',
      ingredients: 'Milk, Gelatin',
      verified: i % 2 !== 0
    }
  ]
}))

let shopAutoId = mockShops.length + 1
let productAutoId = 1000

export async function mockListShops(params = {}) {
  // (Optionally handle search/filter later)
  return maybeMock([...mockShops]) // shallow clone array for safety
}

export async function mockCreateShop(payload) {
  const newShop = {
    id: shopAutoId++,
    name: payload?.name?.trim() || 'Untitled Shop',
    address: payload?.address?.trim() || '',
    products: []
  }
  mockShops.push(newShop)
  return maybeMock({ ok: true, shop: newShop })
}

export async function mockUpdateShop(id, payload) {
  const idx = mockShops.findIndex(s => s.id === Number(id))
  if (idx === -1) return maybeMock({ ok: false, error: 'Shop not found' })
  // mutate in place to keep reference stable
  mockShops[idx].name = payload?.name?.trim() ?? mockShops[idx].name
  mockShops[idx].address = payload?.address?.trim() ?? mockShops[idx].address
  return maybeMock({ ok: true, shop: mockShops[idx] })
}

export async function mockDeleteShop(id) {
  const idx = mockShops.findIndex(s => s.id === Number(id))
  if (idx === -1) return maybeMock({ ok: false, error: 'Shop not found' })
  mockShops.splice(idx, 1)
  return maybeMock({ ok: true })
}

/* ---------- product CRUD within a shop ---------- */
export async function mockAddProduct(shopId, product) {
  const shop = mockShops.find(s => s.id === Number(shopId))
  if (!shop) return maybeMock({ ok: false, error: 'Shop not found' })

  const newProduct = {
    id: ++productAutoId,
    name: product?.name?.trim() || 'Untitled Product',
    picture: product?.picture || '',
    barcode: product?.barcode?.trim() || '',
    brand: product?.brand?.trim() || '',
    category: product?.category?.trim() || '',
    ingredients: product?.ingredients?.trim() || '',
    verified: !!product?.verified
  }
  shop.products.push(newProduct)
  return maybeMock({ ok: true, product: newProduct, shopId: shop.id })
}

export async function mockUpdateProduct(shopId, productId, data) {
  const shop = mockShops.find(s => s.id === Number(shopId))
  if (!shop) return maybeMock({ ok: false, error: 'Shop not found' })
  const p = shop.products.find(x => x.id === Number(productId))
  if (!p) return maybeMock({ ok: false, error: 'Product not found' })

  p.name = data?.name?.trim() ?? p.name
  p.picture = data?.picture ?? p.picture
  p.barcode = data?.barcode?.trim() ?? p.barcode
  p.brand = data?.brand?.trim() ?? p.brand
  p.category = data?.category?.trim() ?? p.category
  p.ingredients = data?.ingredients?.trim() ?? p.ingredients
  if (typeof data?.verified === 'boolean') p.verified = data.verified

  return maybeMock({ ok: true, product: p, shopId: shop.id })
}

export async function mockDeleteProduct(shopId, productId) {
  const shop = mockShops.find(s => s.id === Number(shopId))
  if (!shop) return maybeMock({ ok: false, error: 'Shop not found' })
  const idx = shop.products.findIndex(x => x.id === Number(productId))
  if (idx === -1) return maybeMock({ ok: false, error: 'Product not found' })
  shop.products.splice(idx, 1)
  return maybeMock({ ok: true, shopId: shop.id })
}

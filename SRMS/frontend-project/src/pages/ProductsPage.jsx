import { useState, useEffect } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api'
import { Plus, Search, Package, Hash, DollarSign, BarChart2, Edit2, Trash2, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const emptyForm = { productCode: '', productName: '', quantitySold: '', unitPrice: '' }
const fmt = (n) => new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(n || 0)

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try { const r = await getProducts(); setProducts(r.data) }
    catch { toast.error('Failed to load products') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = products.filter(p =>
    [p.productName, p.productCode].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing) { await updateProduct(editing, form); toast.success('Product updated!') }
      else { await createProduct(form); toast.success('Product added!') }
      setShowForm(false); setForm(emptyForm); setEditing(null); load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally { setSaving(false) }
  }

  const handleEdit = (p) => {
    setForm({ productCode: p.productCode, productName: p.productName, quantitySold: p.quantitySold, unitPrice: p.unitPrice })
    setEditing(p._id); setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try { await deleteProduct(id); toast.success('Product deleted'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed') }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package size={22} className="text-violet-500" /> Products
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{products.length} products in inventory</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm) }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {showForm && (
        <div className="card p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-slate-800 dark:text-white">{editing ? 'Edit Product' : 'New Product'}</h2>
            <button onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm) }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500"><X size={16} /></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="label">Product Code</label>
                <div className="relative">
                  <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className="input pl-9" placeholder="PRD-001" value={form.productCode}
                    onChange={e => setForm({ ...form, productCode: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="label">Product Name</label>
                <div className="relative">
                  <Package size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className="input pl-9" placeholder="Samsung Galaxy A54" value={form.productName}
                    onChange={e => setForm({ ...form, productName: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="label">Quantity Sold</label>
                <div className="relative">
                  <BarChart2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="number" className="input pl-9" placeholder="0" min="0" value={form.quantitySold}
                    onChange={e => setForm({ ...form, quantitySold: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="label">Unit Price (RWF)</label>
                <div className="relative">
                  <DollarSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="number" className="input pl-9" placeholder="150000" min="0" value={form.unitPrice}
                    onChange={e => setForm({ ...form, unitPrice: e.target.value })} required />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                <Check size={15} /> {saving ? 'Saving...' : editing ? 'Update' : 'Save Product'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm) }} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input pl-10 max-w-sm" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading && <div className="col-span-full text-center py-12 text-slate-400">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />Loading...
        </div>}
        {!loading && filtered.length === 0 && <div className="col-span-full text-center py-12 text-slate-400">No products found</div>}
        {filtered.map(p => (
          <div key={p._id} className="card p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <Package size={18} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(p)} className="p-1.5 hover:bg-brand-50 dark:hover:bg-brand-900/30 text-brand-600 rounded-lg"><Edit2 size={13} /></button>
                <button onClick={() => handleDelete(p._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg"><Trash2 size={13} /></button>
              </div>
            </div>
            <p className="font-mono text-xs text-violet-600 dark:text-violet-400 font-semibold mb-1">{p.productCode}</p>
            <p className="font-semibold text-slate-800 dark:text-white text-sm leading-snug mb-3">{p.productName}</p>
            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-700">
              <div className="text-center">
                <p className="text-xs text-slate-500">Qty Sold</p>
                <p className="font-bold text-slate-800 dark:text-white text-sm">{p.quantitySold}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">Unit Price</p>
                <p className="font-bold text-brand-600 dark:text-brand-400 text-sm">{fmt(p.unitPrice)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

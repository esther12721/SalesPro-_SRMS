import { useState, useEffect } from 'react'
import { getSales, getCustomers, getProducts, createSale, updateSale, deleteSale } from '../api'
import { Plus, Search, ShoppingCart, Edit2, Trash2, X, Check, PlusCircle, MinusCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const fmt = (n) => new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(n || 0)
const emptyForm = { invoiceNumber: '', salesDate: new Date().toISOString().split('T')[0], paymentMethod: 'Cash', totalAmountPaid: '', customer: '', products: [{ product: '', quantity: 1, unitPrice: 0 }] }

const PAYMENT_METHODS = ['Cash', 'Mobile Money', 'Bank Transfer', 'Credit Card', 'Cheque']

export default function SalesPage() {
  const [sales, setSales] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [viewSale, setViewSale] = useState(null)

  const load = async () => {
    try {
      const [s, c, p] = await Promise.all([getSales(), getCustomers(), getProducts()])
      setSales(s.data); setCustomers(c.data); setProducts(p.data)
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const calcTotal = (prods) => prods.reduce((sum, p) => sum + (p.quantity * (p.unitPrice || 0)), 0)

  const handleProductLine = (idx, field, value) => {
    const updated = [...form.products]
    updated[idx] = { ...updated[idx], [field]: value }
    if (field === 'product') {
      const prod = products.find(p => p._id === value)
      if (prod) updated[idx].unitPrice = prod.unitPrice
    }
    const total = calcTotal(updated)
    setForm({ ...form, products: updated, totalAmountPaid: total })
  }

  const addLine = () => setForm({ ...form, products: [...form.products, { product: '', quantity: 1, unitPrice: 0 }] })
  const removeLine = (idx) => {
    if (form.products.length === 1) return
    const updated = form.products.filter((_, i) => i !== idx)
    setForm({ ...form, products: updated, totalAmountPaid: calcTotal(updated) })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.customer) return toast.error('Please select a customer')
    if (form.products.some(p => !p.product)) return toast.error('Please select all products')
    setSaving(true)
    try {
      if (editing) { await updateSale(editing, form); toast.success('Sale updated!') }
      else { await createSale(form); toast.success('Sale recorded!') }
      setShowForm(false); setForm(emptyForm); setEditing(null); load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally { setSaving(false) }
  }

  const handleEdit = (s) => {
    setForm({
      invoiceNumber: s.invoiceNumber, salesDate: new Date(s.salesDate).toISOString().split('T')[0],
      paymentMethod: s.paymentMethod, totalAmountPaid: s.totalAmountPaid,
      customer: s.customer?._id || s.customer,
      products: s.products.map(p => ({ product: p.product?._id || p.product, quantity: p.quantity, unitPrice: p.unitPrice }))
    })
    setEditing(s._id); setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this sale?')) return
    try { await deleteSale(id); toast.success('Sale deleted'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed') }
  }

  const filtered = sales.filter(s =>
    [s.invoiceNumber, s.customer?.firstName, s.customer?.lastName, s.paymentMethod]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )

  const badgeColor = (m) => ({ 'Cash': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', 'Mobile Money': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', 'Bank Transfer': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', 'Credit Card': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', 'Cheque': 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' })[m] || 'bg-slate-100 text-slate-600'

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart size={22} className="text-emerald-500" /> Sales
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{sales.length} total transactions recorded</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm) }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Sale
        </button>
      </div>

      {/* Sale Form */}
      {showForm && (
        <div className="card p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-slate-800 dark:text-white">{editing ? 'Edit Sale' : 'New Sale Invoice'}</h2>
            <button onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm) }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500"><X size={16} /></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="label">Invoice Number</label>
                <input className="input" placeholder="INV-2026-001" value={form.invoiceNumber}
                  onChange={e => setForm({ ...form, invoiceNumber: e.target.value })} required />
              </div>
              <div>
                <label className="label">Sales Date</label>
                <input type="date" className="input" value={form.salesDate}
                  onChange={e => setForm({ ...form, salesDate: e.target.value })} required />
              </div>
              <div>
                <label className="label">Customer</label>
                <select className="input" value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })} required>
                  <option value="">Select customer</option>
                  {customers.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName} ({c.customerNumber})</option>)}
                </select>
              </div>
              <div>
                <label className="label">Payment Method</label>
                <select className="input" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            {/* Product lines */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Products</label>
                <button type="button" onClick={addLine} className="text-xs text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline">
                  <PlusCircle size={13} /> Add line
                </button>
              </div>
              <div className="space-y-2">
                {form.products.map((line, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <select className="input flex-1" value={line.product}
                      onChange={e => handleProductLine(idx, 'product', e.target.value)} required>
                      <option value="">Select product</option>
                      {products.map(p => <option key={p._id} value={p._id}>{p.productName} — {fmt(p.unitPrice)}</option>)}
                    </select>
                    <input type="number" className="input w-20" min="1" placeholder="Qty" value={line.quantity}
                      onChange={e => handleProductLine(idx, 'quantity', parseInt(e.target.value) || 1)} />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 min-w-[90px] text-right">
                      {fmt(line.quantity * line.unitPrice)}
                    </span>
                    {form.products.length > 1 && (
                      <button type="button" onClick={() => removeLine(idx)} className="text-red-400 hover:text-red-600"><MinusCircle size={16} /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mb-5 p-4 bg-brand-50 dark:bg-brand-900/20 rounded-xl">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Total Amount</span>
              <span className="font-display font-bold text-xl text-brand-600 dark:text-brand-400">{fmt(form.totalAmountPaid)}</span>
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                <Check size={15} /> {saving ? 'Saving...' : editing ? 'Update Sale' : 'Record Sale'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm) }} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input pl-10 max-w-sm" placeholder="Search sales..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60">
              <tr>
                {['Invoice', 'Customer', 'Date', 'Payment', 'Amount', 'Items', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">
                  <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />Loading...
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">No sales found</td></tr>
              ) : filtered.map(s => (
                <tr key={s._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer" onClick={() => setViewSale(viewSale?._id === s._id ? null : s)}>
                  <td className="px-4 py-3 font-mono text-xs text-brand-600 dark:text-brand-400 font-semibold">{s.invoiceNumber}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{s.customer?.firstName} {s.customer?.lastName}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{new Date(s.salesDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><span className={`badge ${badgeColor(s.paymentMethod)}`}>{s.paymentMethod}</span></td>
                  <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">{fmt(s.totalAmountPaid)}</td>
                  <td className="px-4 py-3 text-slate-500">{s.products?.length} item(s)</td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(s)} className="p-1.5 hover:bg-brand-50 dark:hover:bg-brand-900/30 text-brand-600 rounded-lg"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(s._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel */}
      {viewSale && (
        <div className="card p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-slate-800 dark:text-white">Invoice Detail — {viewSale.invoiceNumber}</h3>
            <button onClick={() => setViewSale(null)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500"><X size={16} /></button>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mb-4 text-sm">
            <div><p className="text-slate-500 text-xs">Customer</p><p className="font-semibold text-slate-800 dark:text-white">{viewSale.customer?.firstName} {viewSale.customer?.lastName}</p></div>
            <div><p className="text-slate-500 text-xs">Date</p><p className="font-semibold text-slate-800 dark:text-white">{new Date(viewSale.salesDate).toLocaleDateString()}</p></div>
            <div><p className="text-slate-500 text-xs">Payment</p><p className="font-semibold text-slate-800 dark:text-white">{viewSale.paymentMethod}</p></div>
          </div>
          <table className="w-full text-sm mb-4">
            <thead><tr className="bg-slate-50 dark:bg-slate-800 rounded-lg">
              {['Product', 'Qty', 'Unit Price', 'Subtotal'].map(h => <th key={h} className="text-left px-3 py-2 text-xs text-slate-500 font-semibold">{h}</th>)}
            </tr></thead>
            <tbody>
              {viewSale.products?.map((p, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
                  <td className="px-3 py-2">{p.product?.productName || '—'}</td>
                  <td className="px-3 py-2">{p.quantity}</td>
                  <td className="px-3 py-2">{fmt(p.unitPrice)}</td>
                  <td className="px-3 py-2 font-semibold text-brand-600">{fmt(p.quantity * p.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end">
            <div className="text-right"><p className="text-xs text-slate-500">Total Amount Paid</p><p className="font-display font-bold text-xl text-emerald-600 dark:text-emerald-400">{fmt(viewSale.totalAmountPaid)}</p></div>
          </div>
        </div>
      )}
    </div>
  )
}

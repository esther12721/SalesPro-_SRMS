import { useState, useEffect } from 'react'
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api'
import { Plus, Search, Users, Phone, MapPin, Hash, Edit2, Trash2, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const emptyForm = { customerNumber: '', firstName: '', lastName: '', telephone: '', address: '' }

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try { const r = await getCustomers(); setCustomers(r.data) }
    catch { toast.error('Failed to load customers') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = customers.filter(c =>
    [c.firstName, c.lastName, c.customerNumber, c.telephone, c.address]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing) {
        await updateCustomer(editing, form)
        toast.success('Customer updated!')
      } else {
        await createCustomer(form)
        toast.success('Customer added!')
      }
      setShowForm(false); setForm(emptyForm); setEditing(null); load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally { setSaving(false) }
  }

  const handleEdit = (c) => {
    setForm({ customerNumber: c.customerNumber, firstName: c.firstName, lastName: c.lastName, telephone: c.telephone, address: c.address })
    setEditing(c._id); setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer?')) return
    try { await deleteCustomer(id); toast.success('Customer deleted'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed') }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users size={22} className="text-brand-500" /> Customers
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{customers.length} total customers registered</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm) }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6 border-brand-200 dark:border-brand-800 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-slate-800 dark:text-white">{editing ? 'Edit Customer' : 'New Customer'}</h2>
            <button onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm) }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500"><X size={16} /></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
              {[
                { key: 'customerNumber', label: 'Customer Number', placeholder: 'CUS-001', icon: Hash },
                { key: 'firstName', label: 'First Name', placeholder: 'John', icon: Users },
                { key: 'lastName', label: 'Last Name', placeholder: 'Doe', icon: Users },
                { key: 'telephone', label: 'Telephone', placeholder: '+250788000000', icon: Phone },
                { key: 'address', label: 'Address', placeholder: 'Kigali, Rwanda', icon: MapPin },
              ].map(({ key, label, placeholder, icon: Icon }) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <div className="relative">
                    <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input className="input pl-9" placeholder={placeholder} value={form[key]}
                      onChange={e => setForm({ ...form, [key]: e.target.value })} required />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                <Check size={15} /> {saving ? 'Saving...' : editing ? 'Update' : 'Save Customer'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm) }} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input pl-10 max-w-sm" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60">
              <tr>
                {['Cust. No.', 'Name', 'Telephone', 'Address', 'Registered', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">
                  <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />Loading...
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">No customers found</td></tr>
              ) : filtered.map(c => (
                <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-brand-600 dark:text-brand-400 font-semibold">{c.customerNumber}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {c.firstName[0]}
                      </div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{c.firstName} {c.lastName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{c.telephone}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{c.address}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-500 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(c)} className="p-1.5 hover:bg-brand-50 dark:hover:bg-brand-900/30 text-brand-600 rounded-lg transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(c._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

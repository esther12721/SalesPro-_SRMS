import { useState, useEffect } from 'react'
import { getReport } from '../api'
import { BarChart3, TrendingUp, Calendar, DollarSign, ShoppingCart, Package } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts'
import toast from 'react-hot-toast'

const fmt = (n) => new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(n || 0)
const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']

export default function ReportsPage() {
  const [type, setType] = useState('daily')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = async (t = type) => {
    setLoading(true)
    try { const r = await getReport(t); setReport(r.data) }
    catch { toast.error('Failed to load report') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleType = (t) => { setType(t); load(t) }

  const paymentData = report ? Object.entries(report.paymentBreakdown || {}).map(([name, value]) => ({ name, value })) : []

  const salesByDate = report?.sales?.reduce((acc, s) => {
    const date = new Date(s.salesDate).toLocaleDateString()
    const existing = acc.find(d => d.date === date)
    if (existing) { existing.amount += s.totalAmountPaid; existing.count += 1 }
    else acc.push({ date, amount: s.totalAmountPaid, count: 1 })
    return acc
  }, []) || []

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 size={22} className="text-amber-500" /> Sales Reports
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Automatically generated sales analytics</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          {['daily', 'weekly', 'monthly'].map(t => (
            <button key={t} onClick={() => handleType(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${type === t ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="text-center py-20"><div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-slate-500">Generating report...</p></div>}

      {!loading && report && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: ShoppingCart, label: 'Transactions', value: report.totalTransactions, color: 'bg-blue-500' },
              { icon: DollarSign, label: 'Total Revenue', value: fmt(report.totalRevenue), color: 'bg-emerald-500' },
              { icon: Package, label: 'Top Products', value: report.topProducts?.length || 0, color: 'bg-violet-500' },
              { icon: Calendar, label: 'Period', value: type.charAt(0).toUpperCase() + type.slice(1), color: 'bg-amber-500' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="card p-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} mb-3`}>
                  <Icon size={18} className="text-white" />
                </div>
                <p className="font-display text-xl font-bold text-slate-900 dark:text-white">{value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Revenue over time */}
            <div className="card p-6">
              <h3 className="font-display font-bold text-slate-800 dark:text-white mb-1">Revenue Trend</h3>
              <p className="text-xs text-slate-500 mb-4 capitalize">{type} breakdown</p>
              {salesByDate.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={salesByDate}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={v => [fmt(v), 'Revenue']} contentStyle={{ borderRadius: 10, border: 'none', background: 'rgba(15,23,42,0.9)', color: '#fff' }} />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">No data for this period</div>}
            </div>

            {/* Payment methods */}
            <div className="card p-6">
              <h3 className="font-display font-bold text-slate-800 dark:text-white mb-1">Payment Methods</h3>
              <p className="text-xs text-slate-500 mb-4">Revenue by payment type</p>
              {paymentData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={paymentData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name">
                      {paymentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => fmt(v)} contentStyle={{ borderRadius: 10, border: 'none', background: 'rgba(15,23,42,0.9)', color: '#fff' }} />
                    <Legend iconType="circle" iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">No payment data</div>}
            </div>
          </div>

          {/* Top products */}
          {report.topProducts?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-display font-bold text-slate-800 dark:text-white mb-4">Top Products by Revenue</h3>
              <div className="space-y-3">
                {report.topProducts.map((p, i) => {
                  const maxRev = report.topProducts[0].revenue
                  const pct = Math.round((p.revenue / maxRev) * 100)
                  return (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-xs font-bold text-brand-600 dark:text-brand-400 flex-shrink-0">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{p.name} <span className="text-xs text-slate-400 ml-1">({p.code})</span></p>
                          <div className="text-right ml-4 flex-shrink-0">
                            <p className="text-sm font-bold text-brand-600 dark:text-brand-400">{fmt(p.revenue)}</p>
                            <p className="text-xs text-slate-400">{p.qty} sold</p>
                          </div>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Sales table */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-display font-bold text-slate-800 dark:text-white">
                {type.charAt(0).toUpperCase() + type.slice(1)} Sales ({report.totalTransactions} transactions)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60">
                  <tr>
                    {['Invoice', 'Customer', 'Products', 'Payment', 'Date', 'Amount'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {report.sales.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-10 text-slate-400">No sales in this period</td></tr>
                  ) : report.sales.map(s => (
                    <tr key={s._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono text-xs text-brand-600 dark:text-brand-400 font-semibold">{s.invoiceNumber}</td>
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{s.customer?.firstName} {s.customer?.lastName}</td>
                      <td className="px-4 py-3 text-slate-500">{s.products?.length} item(s)</td>
                      <td className="px-4 py-3"><span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">{s.paymentMethod}</span></td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{new Date(s.salesDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">{fmt(s.totalAmountPaid)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

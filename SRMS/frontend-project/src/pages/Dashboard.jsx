import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getReportSummary, getSales } from '../api'
import { useAuth } from '../context/AuthContext'
import {
  TrendingUp, Users, Package, ShoppingCart, DollarSign,
  ArrowUpRight, Calendar, Activity
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const StatCard = ({ icon: Icon, label, value, sub, color, to }) => (
  <Link to={to} className="card p-5 hover:shadow-md transition-shadow group">
    <div className="flex items-start justify-between">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <ArrowUpRight size={16} className="text-slate-400 group-hover:text-brand-500 transition-colors" />
    </div>
    <div className="mt-4">
      <p className="text-2xl font-bold font-display text-slate-900 dark:text-white">{value}</p>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>}
    </div>
  </Link>
)

export default function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [recentSales, setRecentSales] = useState([])
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    getReportSummary().then(r => setSummary(r.data)).catch(() => {})
    getSales().then(r => {
      const sales = r.data.slice(0, 5)
      setRecentSales(sales)
      // Build chart data from last 7 days
      const days = {}
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const key = d.toLocaleDateString('en-US', { weekday: 'short' })
        days[key] = 0
      }
      r.data.forEach(s => {
        const day = new Date(s.salesDate).toLocaleDateString('en-US', { weekday: 'short' })
        if (days[day] !== undefined) days[day] += s.totalAmountPaid
      })
      setChartData(Object.entries(days).map(([day, amount]) => ({ day, amount })))
    }).catch(() => {})
  }, [])

  const fmt = (n) => new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(n || 0)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.username} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {new Date().toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full text-xs font-semibold">
          <Activity size={12} /> System Active
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Customers" value={summary?.totalCustomers ?? '—'} sub="Registered customers" color="bg-blue-500" to="/customers" />
        <StatCard icon={Package} label="Total Products" value={summary?.totalProducts ?? '—'} sub="Available products" color="bg-violet-500" to="/products" />
        <StatCard icon={ShoppingCart} label="Total Sales" value={summary?.totalSales ?? '—'} sub={`${summary?.todaySalesCount ?? 0} today`} color="bg-emerald-500" to="/sales" />
        <StatCard icon={DollarSign} label="Total Revenue" value={summary ? fmt(summary.totalRevenue) : '—'} sub={`${fmt(summary?.todayRevenue)} today`} color="bg-amber-500" to="/reports" />
      </div>

      {/* Chart + Recent */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-slate-800 dark:text-white">Sales This Week</h2>
            <span className="badge bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400">7 days</span>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={v => [fmt(v), 'Revenue']} contentStyle={{ borderRadius: 12, border: 'none', background: 'rgba(15,23,42,0.9)', color: '#fff' }} />
                <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">No sales data yet</div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-slate-800 dark:text-white">Recent Sales</h2>
            <Link to="/sales" className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {recentSales.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No sales recorded yet</p>}
            {recentSales.map(s => (
              <div key={s._id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{s.invoiceNumber}</p>
                  <p className="text-xs text-slate-500">{s.customer?.firstName} {s.customer?.lastName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-brand-600 dark:text-brand-400">{fmt(s.totalAmountPaid)}</p>
                  <p className="text-xs text-slate-400">{new Date(s.salesDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Add Customer', to: '/customers', icon: Users, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Add Product', to: '/products', icon: Package, color: 'text-violet-500 bg-violet-50 dark:bg-violet-900/20' },
          { label: 'New Sale', to: '/sales', icon: ShoppingCart, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'View Reports', to: '/reports', icon: TrendingUp, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
        ].map(({ label, to, icon: Icon, color }) => (
          <Link key={to} to={to} className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={16} />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

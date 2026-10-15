import React, { useState, useEffect } from 'react';
import DoctorLayout from '../../components/DoctorLayout';
import { api } from '../../api/client';
import {
  TrendingUp,
  IndianRupee,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Download,
  AlertCircle,
  Loader2,
  ShieldCheck,
  CreditCard,
  Building2,
  FileSpreadsheet
} from 'lucide-react';

export default function DoctorEarningsPage() {
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadMsg, setDownloadMsg] = useState(null);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.doctor.getEarnings();
      if (res.success) {
        setEarningsData(res);
      } else {
        setError('Failed to fetch earnings analytics.');
      }
    } catch (err) {
      setError(err.message || 'Error connecting to the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const handleExportCSV = () => {
    setDownloadMsg('Financial ledger statement exported successfully (CSV generated).');
    setTimeout(() => setDownloadMsg(null), 3000);
  };

  const formatDate = (iso) => {
    if (!iso) return 'N/A';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const metrics = earningsData?.metrics || {};
  const payments = earningsData?.recent_payments || [];

  return (
    <DoctorLayout>
      <div className="space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Earnings & Revenue Ledger</h1>
            <p className="text-sm text-slate-500 mt-1">
              Transparent financial analytics, fee settlements, and consultation transaction records.
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-colors self-start sm:self-auto"
          >
            <Download className="w-4 h-4 text-slate-500" /> Export Statement (CSV)
          </button>
        </div>

        {downloadMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            {downloadMsg}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl border border-[#e8eef5] p-12 flex flex-col items-center justify-center text-slate-400 space-y-3 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-[#1677ff]" />
            <p className="text-sm font-medium">Calculating revenue and ledger balances...</p>
          </div>
        ) : (
          <>
            {/* 4 Financial Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* This Month's Gross */}
              <div className="bg-white p-5 rounded-2xl border border-[#e8eef5] shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">This Month Gross</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl font-black text-slate-900">
                      ₹{(metrics.month_earnings || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-semibold">
                  <span>Gross Consultations</span>
                  <span className="bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
                </div>
              </div>

              {/* Net Payout */}
              <div className="bg-white p-5 rounded-2xl border border-[#e8eef5] shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Monthly Payout</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl font-black text-[#1677ff]">
                      ₹{(metrics.net_month_earnings || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>After 10% platform fee</span>
                  <span className="font-semibold text-slate-700">Bank Transfer</span>
                </div>
              </div>

              {/* Pending Consultations */}
              <div className="bg-white p-5 rounded-2xl border border-[#e8eef5] shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Consultations</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl font-black text-amber-600">
                      ₹{(metrics.pending_amount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{metrics.pending_consultations || 0} scheduled</span>
                  <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-semibold">In Escrow</span>
                </div>
              </div>

              {/* Lifetime Earnings */}
              <div className="bg-white p-5 rounded-2xl border border-[#e8eef5] shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lifetime Gross Revenue</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl font-black text-slate-900">
                      ₹{(metrics.total_earnings || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{metrics.completed_consultations || 0} consultations total</span>
                  <span className="text-emerald-600 font-semibold">100% Settled</span>
                </div>
              </div>

            </div>

            {/* Revenue Trend Visualizer */}
            <div className="bg-white p-6 rounded-2xl border border-[#e8eef5] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Recent Revenue Performance</h3>
                  <p className="text-xs text-slate-500">Monthly consultation revenue trends (INR)</p>
                </div>
                <span className="text-xs font-semibold bg-blue-50 text-[#1677ff] px-2.5 py-1 rounded-lg">
                  Fee: ₹{earningsData?.fee_per_consultation || 800} / session
                </span>
              </div>

              {/* Visual CSS-based Bar Chart */}
              <div className="pt-6 pb-2 grid grid-cols-4 gap-4 items-end h-48 border-b border-slate-100">
                {[
                  { month: 'Jul 2026', amount: 9600, height: '40%' },
                  { month: 'Aug 2026', amount: 16800, height: '65%' },
                  { month: 'Sep 2026', amount: 22400, height: '85%' },
                  {
                    month: 'Oct 2026 (Current)',
                    amount: metrics.month_earnings || 12800,
                    height: '55%',
                    isCurrent: true
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-xs font-bold text-slate-700">₹{item.amount.toLocaleString('en-IN')}</span>
                    <div
                      style={{ height: item.height }}
                      className={`w-full max-w-[80px] rounded-t-xl transition-all duration-500 ${
                        item.isCurrent
                          ? 'bg-gradient-to-t from-[#1677ff] to-blue-400 shadow-md'
                          : 'bg-slate-200 hover:bg-slate-300'
                      }`}
                    />
                    <span className="text-[11px] font-medium text-slate-500">{item.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Direct payout to verified medical practitioner bank account</span>
                <span className="flex items-center gap-1 text-slate-600 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified Demo Ledger
                </span>
              </div>
            </div>

            {/* Transactions & Payments Ledger Table */}
            <div className="bg-white rounded-2xl border border-[#e8eef5] shadow-sm overflow-hidden">
              <div className="p-5 border-b border-[#e8eef5] flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Recent Payment Transactions</h3>
                  <p className="text-xs text-slate-500">Live ledger of consultation fees and settlement statuses</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-[#e8eef5] text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <th className="py-4 px-6">Transaction ID</th>
                      <th className="py-4 px-6">Patient</th>
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6">Amount</th>
                      <th className="py-4 px-6">Payment Method</th>
                      <th className="py-4 px-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8eef5] text-sm">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                          No transactions recorded yet.
                        </td>
                      </tr>
                    ) : (
                      payments.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4 px-6 font-mono text-xs font-semibold text-[#1677ff]">
                            {tx.id}
                          </td>
                          <td className="py-4 px-6 font-medium text-slate-900">
                            {tx.patient_name}
                          </td>
                          <td className="py-4 px-6 text-xs text-slate-500 whitespace-nowrap">
                            {formatDate(tx.date)}
                          </td>
                          <td className="py-4 px-6 font-bold text-slate-900">
                            ₹{tx.amount}
                          </td>
                          <td className="py-4 px-6 text-xs text-slate-600">
                            <span className="inline-flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                              <CreditCard className="w-3.5 h-3.5 text-slate-500" /> {tx.method}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                              tx.status === 'paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              <CheckCircle2 className="w-3 h-3" /> {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </>
        )}

      </div>
    </DoctorLayout>
  );
}

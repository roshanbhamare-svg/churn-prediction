import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  DollarSign, 
  Activity, 
  TrendingDown, 
  TrendingUp,
  Briefcase,
  Rocket,
  PhoneCall,
  Gift,
  ShieldCheck,
  ArrowRight,
  User,
  ChevronRight
} from 'lucide-react';

export default function RevenueAtRisk() {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (location.state && location.state.result) {
      setData(location.state);
    } else {
      const saved = localStorage.getItem('last_prediction');
      if (saved) {
        try {
          setData(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse saved prediction", e);
        }
      }
    }
  }, [location]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${(value * 100).toFixed(0)}%`;
  };

  if (!data || !data.result || !data.customer) {
    return (
      <div className="flex flex-col items-center justify-center p-6 animate-fade-in" style={{ minHeight: '70vh' }}>
        <div className="glass-card max-w-md w-full p-10 text-center">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-500">
            <Activity size={32} />
          </div>
          <h2 className="text-xl font-extrabold text-white mb-3">Analysis Unavailable</h2>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed">
            Please perform a customer churn prediction first. The financial impact analysis is generated only after a valid prediction.
          </p>
          <Link 
            to="/predict"
            className="btn-primary-custom w-full flex items-center justify-center gap-2 group text-decoration-none"
          >
            Go to Prediction Page
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  const { result, customer } = data;
  

  const monthlyRevenue = customer.MonthlyCharges * 80; 
  const churnProbability = result.probability;
  const expectedCustomerValue = monthlyRevenue * 12; 
  const weightedRevenueRisk = expectedCustomerValue * churnProbability;
  const retentionCost = monthlyRevenue * 0.3; 
  const expectedNetBenefit = weightedRevenueRisk - retentionCost;


  const getActions = () => {
    const list = [];
    if (result.risk_level === 'High') {
      list.push({ title: 'Priority Outreach', desc: 'Call customer within 24h via senior agent.', icon: PhoneCall, color: 'text-red-500' });
    }
    if (customer.Contract === 'Month-to-month') {
      list.push({ title: 'Contract Incentives', desc: 'Offer 15% discount for 12-month upgrade.', icon: Gift, color: 'text-indigo-500' });
    }
    if (customer.MonthlyCharges > 70) {
      list.push({ title: 'Pricing Loyalty Review', desc: 'Apply loyalty credit or downgrade check.', icon: Rocket, color: 'text-orange-500' });
    }
    list.push({ title: 'Service Support Bundle', desc: 'Provide 3-month free Security trial.', icon: ShieldCheck, color: 'text-blue-500' });
    return list;
  };

  const actions = getActions();

  return (
    <div className="fade-in-up" style={{ paddingBottom: '60px' }}>
      

      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>
            Revenue Impact <span className="gradient-text">Analysis</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
            Customer-specific financial risk profile and retention strategy
          </p>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-30 var(--accent-blue)">
        <MetricCard label="Revenue at Risk" value={formatCurrency(expectedCustomerValue)} sub="Projected 12-month value" icon={<AlertTriangle size={20} className="text-red-500" />} />
        <MetricCard label="Monthly Revenue" value={formatCurrency(monthlyRevenue)} sub="Current billing" icon={<DollarSign size={20} className="text-blue-500" />} />
        <MetricCard label="Churn Probability" value={formatPercent(churnProbability)} sub="Model calculation" icon={<Activity size={20} className="text-orange-500" />} />
        <MetricCard label="Weighted Risk" value={formatCurrency(weightedRevenueRisk)} sub="Probabilistic loss" icon={<TrendingDown size={20} className="text-indigo-500" />} highlighted />
      </div>

 
      <div className="fade-in-up-3" style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(79, 142, 247, 0.3), transparent)', margin: '40px 0 40px 0' }} />

      <div className="glass-card mb-12 p-8 overflow-hidden">
        <h2 className="text-lg font-bold text-white mb-6 pt-3 px-3 pb-2 flex items-center gap-2">
          <Rocket className="text-blue-400 " size={20} />
          Recommended Retention Actions
        </h2>
        <div className="flex flex-col gap-1 border-t border-[rgba(255,255,255,0.05)] pt-2">
          {actions.map((action, i) => {
            const Icon = action.icon;
            return (
              <div key={i} className="group flex items-center justify-between p-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors rounded-xl border-b border-[rgba(255,255,255,0.03)] last:border-0">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-lg bg-[rgba(255,255,255,0.05)] ${action.color}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">{action.title}</div>
                    <div className="text-slate-500 text-xs">{action.desc}</div>
                  </div>
                </div>
                <ChevronRight className="text-slate-700 group-hover:text-blue-400 transition-colors" size={18} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="fade-in-up-3" style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(79, 142, 247, 0.3), transparent)', margin: '40px 0 40px 0' }} />


      <div>
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 px-2">
          <Briefcase className="text-blue-400 " size={20} />
          Financial Impact Breakdown
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-1">
          
          <div className="glass-card p-6 flex flex-col gap-5">
            <BreakdownRow label="Monthly Revenue" val={formatCurrency(monthlyRevenue)} />
            <BreakdownRow label="Expected Remaining customer Value" val={formatCurrency(expectedCustomerValue)} />
            <BreakdownRow label="Churn Probability" val={formatPercent(churnProbability)} last />
          </div>

          <div className="glass-card p-6 flex flex-col gap-5 bg-gradient-to-br from-[rgba(20,28,46,0.8)] to-[rgba(10,14,26,0.8)]">
            <BreakdownRow label="Weighted Revenue Risk" val={formatCurrency(weightedRevenueRisk)} />
            <BreakdownRow label="Estimated Retention Cost" val={formatCurrency(retentionCost)} />
            <div className="pt-4 mt-2 flex items-center justify-between border-t border-blue-500/20">
              <div className="text-blue-400 font-bold text-xs uppercase tracking-wider pb-3 px-3">Expected Net Benefit</div>
              <div className="text-2xl font-black text-white pb-3 px-3">{formatCurrency(expectedNetBenefit)}</div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

function MetricCard({ label, value, sub, icon, highlighted }) {
  return (
    <div className={`rounded-2xl p-6 shadow-xl transition-all duration-300 ${highlighted ? 'border-2 border-blue-500/30' : 'border border-transparent'} bg-var(--accent-blue) text-white`}>
      <div className="flex items-center justify-between mb-4">
        <div className="pt-1 px-1 size-7 bg-var(--accent-blue) mx-2 mt-2  rounded-xl">
          {icon}
        </div>
    
      </div>
      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">{label}</div>
      <div className="text-2xl font-black mb-1 px-2">{value}</div>
      <div className="text-[16px] font-medium px-2 text-slate-500 mb-2">{sub}</div>
    </div>
  );
}

function BreakdownRow({ label, val, last }) {
  return (
    <div className={`flex items-center justify-between pb-4 ${last ? '' : 'border-b border-[rgba(255,255,255,0.03)]'}`}>
      <div className="text-sm font-medium text-slate-400 px-3 pt-3">{label}</div>
      <div className="text-lg font-bold text-white tabular-nums px-3 pt-3">{val}</div>
    </div>
  );
}

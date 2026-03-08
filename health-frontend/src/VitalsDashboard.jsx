import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { 
  Heart, Droplets, Wind, Thermometer, Activity, Moon, Sun, Download, ShieldAlert, LogOut, ChevronUp, Zap, Gauge, CloudRain, Compass, X, Save
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';

const VitalsDashboard = () => {
  const navigate = useNavigate();
  const [historyVitals, setHistoryVitals] = useState([]);
  const [latest, setLatest] = useState({ pulse_rate: 0, spo2: 0, eco2: 0, tvoc: 0, temp: 0, humidity: 0, pressure: 0 });
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [showReport, setShowReport] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const theme = {
    bg: isDarkMode ? '#020617' : '#f8fafc',
    nav: isDarkMode ? 'rgba(2, 6, 23, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    card: isDarkMode ? '#0f172a' : '#ffffff',
    text: isDarkMode ? '#f8fafc' : '#0f172a',
    subText: isDarkMode ? '#94a3b8' : '#64748b',
    border: isDarkMode ? '#1e293b' : '#f1f5f9',
    accent: '#6366f1',
  };

  useEffect(() => {
    document.body.style.backgroundColor = theme.bg;
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

    const style = document.createElement('style');
    style.innerHTML = `
      @media (max-width: 768px) {
        nav { padding: 15px !important; flex-wrap: wrap !important; gap: 20px !important; align-items: flex-start !important; }
        
        .nav-left-col { order: 1; display: flex !important; flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
        .nav-right-col { order: 2; display: flex !important; flex-direction: column !important; align-items: flex-end !important; gap: 12px !important; }
        
        .brand-section { order: 1; }
        
        /* Palakihan ang Dark Mode Button */
        .theme-toggle { 
          order: 2; 
          padding-left: 5px !important; 
          transform: scale(1.3) !important; 
          transform-origin: left center !important;
        }

        /* Ibaba nang kaunti ang System Live */
        .system-live-status { 
          order: 3; 
          margin-top: 8px !important; 
        }

        .user-avatar { order: 1; margin-top: 5px !important; }
        .logout-btn { order: 2; margin-top: 40px !important; } 

        main { padding: 20px 15px !important; }
        .grid-container { grid-template-columns: 1fr !important; gap: 20px !important; }
        .modal-content { width: 95% !important; height: 90vh !important; padding: 20px !important; }
        table { display: block !important; overflow-x: auto !important; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, [isDarkMode, theme.bg]);

  const fetchLive = async () => {
    try {
      const res = await axios.get('http://10.140.83.66:8000/api/vitals/live');
      if (res.data && Object.keys(res.data).length > 0) {
        setLatest(res.data);
      }
    } catch (err) { console.error("Live fetch error:", err); }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://10.140.83.66:8000/api/vitals');
      setHistoryVitals(res.data);
      setLoading(false);
    } catch (err) { console.error("History fetch error:", err); }
  };

  useEffect(() => {
    fetchHistory(); 
    fetchLive();
    const interval = setInterval(fetchLive, 1000); 
    return () => clearInterval(interval);
  }, []);

  const handleSaveToDB = async () => {
    setIsSaving(true);
    try {
      await axios.post('http://10.140.83.66:8000/api/vitals/save');
      alert("Snapshot Saved to Database!");
      fetchHistory(); 
    } catch (err) {
      console.error(err);
      alert("Failed to save data.");
    }
    setIsSaving(false);
  };

  const chartData = historyVitals.length > 0 ? [...historyVitals].reverse() : [];
  const username = localStorage.getItem('user') || "gio";

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(historyVitals);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Health Report");
    XLSX.writeFile(wb, `Health_Intelligence_Full_Report.xlsx`);
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const StatCard = ({ title, value, unit, icon: Icon, color, isLarge = false }) => (
    <div style={{ 
      background: theme.card, padding: isLarge ? '32px' : '20px', borderRadius: '24px', border: `1px solid ${theme.border}`, 
      flex: '1', minWidth: isLarge ? '350px' : '200px', boxShadow: isDarkMode ? 'none' : '0 4px 10px rgba(0,0,0,0.02)', transition: '0.3s'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ background: `${color}15`, padding: '10px', borderRadius: '12px' }}>
          <Icon color={color} size={isLarge ? 28 : 22} />
        </div>
        <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', fontSize: '11px', fontWeight: '800' }}>
          <ChevronUp size={14} /> LIVE
        </div>
      </div>
      <p style={{ margin: 0, fontSize: '11px', color: theme.subText, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
        <h3 style={{ margin: 0, fontSize: isLarge ? '38px' : '28px', fontWeight: '900', color: theme.text }}>{value}</h3>
        <span style={{ fontSize: '14px', color: theme.subText, fontWeight: '600' }}>{unit}</span>
      </div>
    </div>
  );

  return (
    <div style={{ color: theme.text, fontFamily: "'Inter', sans-serif", minHeight: '100vh', transition: '0.3s' }}>
      
      <nav style={{ 
        position: 'sticky', top: 0, zIndex: 100, background: theme.nav, backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${theme.border}`, padding: '12px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div className="nav-left-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
            <div className="brand-section" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ background: theme.accent, padding: '10px', borderRadius: '12px' }}>
                    <Zap color="white" size={20} fill="white" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h1 style={{ margin: 0, fontSize: 'clamp(14px, 4vw, 18px)', fontWeight: '900', letterSpacing: '-0.3px', lineHeight: 1 }}>HEALTH INTELLIGENCE</h1>
                    <p style={{ margin: 0, fontSize: '9px', color: theme.subText, fontWeight: 'bold', textTransform: 'uppercase' }}>Real-time Health Monitoring</p>
                </div>
            </div>

            <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.subText }}>
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="system-live-status" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isDarkMode ? '#0f172a' : '#f1f5f9', padding: '6px 16px', borderRadius: '24px', border: `1px solid ${theme.border}` }}>
                <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }}></div>
                <span style={{ fontSize: '11px', fontWeight: '800' }}>SYSTEM LIVE</span>
            </div>
        </div>

        <div className="nav-right-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div className="user-avatar" style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', boxShadow: '0 4px 10px rgba(99, 102, 241, 0.4)' }}>
              {username.charAt(0).toUpperCase()}
            </div>
            <button className="logout-btn" onClick={() => navigate('/')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '12px' }}>Log Out</button>
        </div>
      </nav>

      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '32px 40px' }}>
        {/* Ang rest ng code ay hindi ginalaw para masiguro ang stability */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: '900', margin: 0 }}>Dashboard Overview</h2>
            <p style={{ color: theme.subText, marginTop: '4px', fontSize: '14px' }}>Your Current Real Time Health and Environmental Status</p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button 
              onClick={handleSaveToDB} 
              disabled={isSaving}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#10b981', border: 'none', padding: '10px 24px', borderRadius: '12px', cursor: 'pointer', color: 'white', fontWeight: '700', fontSize: '14px', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }}
            >
              <Save size={18} /> {isSaving ? 'Saving...' : 'Save to Database'}
            </button>
            <button onClick={exportToExcel} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: theme.card, border: `1px solid ${theme.border}`, padding: '10px 24px', borderRadius: '12px', cursor: 'pointer', color: theme.text, fontWeight: '700', fontSize: '14px' }}>
              <Download size={18} /> Export
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
          <StatCard title="Heart Rate" value={latest.pulse_rate} unit="BPM" icon={Heart} color="#f43f5e" />
          <StatCard title="Oxygen Level" value={latest.spo2} unit="%" icon={Droplets} color="#0ea5e9" />
          <StatCard title="eCO2 Level" value={latest.eco2} unit="PPM" icon={Wind} color="#10b981" />
          <StatCard title="TVOCS Level" value={latest.tvoc} unit="PPB" icon={Gauge} color="#f59e0b" />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
          <StatCard title="Ambient Temp" value={latest.temp} unit="°C" icon={Thermometer} color="#f97316" isLarge={true} />
          <StatCard title="Humidity" value={latest.humidity} unit="%" icon={CloudRain} color="#8b5cf6" isLarge={true} />
          <StatCard title="Atm. Pressure" value={latest.pressure} unit="hPa" icon={Compass} color="#06b6d4" isLarge={true} />
        </div>

        <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(580px, 1fr))', gap: '32px', marginBottom: '32px' }}>
          <div style={{ background: theme.card, padding: '30px', borderRadius: '32px', border: `1px solid ${theme.border}` }}>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: '900' }}>Biometrics History</h3>
            <div style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBpm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.border} />
                  <XAxis dataKey="created_at" tickFormatter={formatTime} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: theme.subText }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: theme.subText }} />
                  <Tooltip labelFormatter={formatTime} contentStyle={{ borderRadius: '16px', background: theme.card, border: `1px solid ${theme.border}` }} />
                  <Area type="monotone" dataKey="pulse_rate" name="Heart Rate (BPM)" stroke="#f43f5e" fillOpacity={1} fill="url(#colorBpm)" strokeWidth={3} />
                  <Area type="monotone" dataKey="spo2" name="Oxygen Level (%)" stroke="#0ea5e9" strokeWidth={3} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ background: theme.card, padding: '30px', borderRadius: '32px', border: `1px solid ${theme.border}` }}>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: '900' }}>Air Quality Analysis</h3>
            <div style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.border} />
                  <XAxis dataKey="created_at" tickFormatter={formatTime} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: theme.subText }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: theme.subText }} />
                  <Tooltip labelFormatter={formatTime} contentStyle={{ borderRadius: '16px', background: theme.card, border: `1px solid ${theme.border}` }} />
                  <Line type="monotone" dataKey="eco2" name="eCO2 Level (PPM)" stroke="#10b981" strokeWidth={3} dot={true} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', padding: '50px', borderRadius: '40px', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h3 style={{ fontSize: '28px', fontWeight: '900', margin: '0 0 12px 0' }}>Be Proactive with Your Health</h3>
            <button onClick={() => setShowReport(true)} style={{ background: 'white', color: theme.accent, border: 'none', padding: '14px 35px', borderRadius: '16px', fontWeight: '900', cursor: 'pointer' }}>View Logs</button>
          </div>
          <Activity size={260} style={{ position: 'absolute', right: '-40px', bottom: '-40px', opacity: 0.15 }} />
        </div>
      </main>

      {showReport && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: theme.card, width: '90%', maxWidth: '1200px', height: '80vh', borderRadius: '40px', padding: '40px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <button onClick={() => setShowReport(false)} style={{ position: 'absolute', top: '30px', right: '30px', background: 'none', border: 'none', color: theme.text, cursor: 'pointer' }}><X size={32} /></button>
            <h2 style={{ fontSize: '30px', fontWeight: '900', marginBottom: '20px' }}>Historical Logs</h2>
            <div style={{ flex: 1, overflowY: 'auto', border: `1px solid ${theme.border}`, borderRadius: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ position: 'sticky', top: 0, background: theme.card }}>
                  <tr style={{ color: theme.subText, fontSize: '12px', borderBottom: `1px solid ${theme.border}` }}>
                    <th style={{ padding: '20px' }}>TIME</th>
                    <th style={{ padding: '20px' }}>BPM</th>
                    <th style={{ padding: '20px' }}>SPO2</th>
                    <th style={{ padding: '20px' }}>ECO2</th>
                    <th style={{ padding: '20px' }}>TVOC</th>
                    <th style={{ padding: '20px' }}>TEMP</th>
                    <th style={{ padding: '20px' }}>HUMIDITY</th>
                    <th style={{ padding: '20px' }}>PRESSURE</th>
                  </tr>
                </thead>
                <tbody>
                  {historyVitals.map((v, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${theme.border}`, color: theme.text }}>
                      <td style={{ padding: '15px 20px' }}>{v.created_at ? new Date(v.created_at).toLocaleString() : 'N/A'}</td>
                      <td style={{ padding: '15px 20px', fontWeight: '700' }}>{v.pulse_rate}</td>
                      <td style={{ padding: '15px 20px' }}>{v.spo2}%</td>
                      <td style={{ padding: '15px 20px' }}>{v.eco2} PPM</td>
                      <td style={{ padding: '15px 20px' }}>{v.tvoc} PPB</td>
                      <td style={{ padding: '15px 20px' }}>{v.temp}°C</td>
                      <td style={{ padding: '15px 20px' }}>{v.humidity}%</td>
                      <td style={{ padding: '15px 20px' }}>{v.pressure} hPa</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VitalsDashboard;
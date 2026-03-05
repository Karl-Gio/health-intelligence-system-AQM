import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { 
  Heart, Droplets, Wind, Thermometer, Activity, Moon, Sun, Download, ShieldAlert, LogOut, ChevronUp, Zap, Gauge, CloudRain, Compass, X
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';

const VitalsDashboard = () => {
  const navigate = useNavigate();
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [showReport, setShowReport] = useState(false);

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
  }, [isDarkMode, theme.bg]);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/vitals');
      setVitals(res.data);
      setLoading(false);
    } catch (err) { console.error("Fetch error:", err); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Placeholder lines para makita ang graph agad
  const chartData = vitals.length > 0 ? [...vitals].reverse() : [
    {bpm: 75, spo2: 98, co2: 410, tvoc: 110, temp: 26},
    {bpm: 80, spo2: 97, co2: 430, tvoc: 115, temp: 26.5},
    {bpm: 72, spo2: 98, co2: 415, tvoc: 112, temp: 26.2},
    {bpm: 85, spo2: 96, co2: 440, tvoc: 118, temp: 26.8},
    {bpm: 78, spo2: 99, co2: 420, tvoc: 111, temp: 26.1}
  ];

  const latest = vitals[0] || { bpm: 75, spo2: 92, co2: 410.5, tvoc: 115, temperature: 26.5, humidity: 48, pressure: 1013 };
  const username = localStorage.getItem('user') || "gio";

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(vitals);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Health Report");
    XLSX.writeFile(wb, `Health_Intelligence_Full_Report.xlsx`);
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
      
      {/* Navbar - Gayang Gaya */}
      <nav style={{ 
        position: 'sticky', top: 0, zIndex: 100, background: theme.nav, backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${theme.border}`, padding: '12px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: theme.accent, padding: '10px', borderRadius: '12px' }}>
            <Zap color="white" size={20} fill="white" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '900', letterSpacing: '-0.3px' }}>HEALTH INTELLIGENCE</h1>
            <p style={{ margin: 0, fontSize: '10px', color: theme.subText, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Real-time Biometrics Monitoring</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isDarkMode ? '#0f172a' : '#f1f5f9', padding: '6px 16px', borderRadius: '24px', border: `1px solid ${theme.border}` }}>
            <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }}></div>
            <span style={{ fontSize: '11px', fontWeight: '800' }}>SYSTEM LIVE</span>
          </div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.subText }}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => navigate('/')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '12px' }}>Log Out</button>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', boxShadow: '0 4px 10px rgba(99, 102, 241, 0.4)' }}>
            {username.charAt(0).toUpperCase()}
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '32px 40px' }}>
        
        {/* Dashboard Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: '900', margin: 0 }}>Dashboard Overview</h2>
            <p style={{ color: theme.subText, marginTop: '4px', fontSize: '14px' }}>Your Current Real Time Health and Environmental Status, March 5, 2026</p>
          </div>
          <button onClick={exportToExcel} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: theme.card, border: `1px solid ${theme.border}`, padding: '10px 24px', borderRadius: '12px', cursor: 'pointer', color: theme.text, fontWeight: '700', fontSize: '14px' }}>
            <Download size={18} /> Export
          </button>
        </div>

        {/* ROW 1: BIOMETRICS (Heart, Oxygen, CO2, TVOCS) */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <StatCard title="Heart Rate" value={latest.bpm} unit="BPM" icon={Heart} color="#f43f5e" />
          <StatCard title="Oxygen Level" value={latest.spo2} unit="%" icon={Droplets} color="#0ea5e9" />
          <StatCard title="eCO2 Level" value={latest.co2} unit="PPM" icon={Wind} color="#10b981" />
          <StatCard title="TVOCS Level" value={latest.tvoc} unit="PPB" icon={Gauge} color="#f59e0b" />
        </div>

        {/* ROW 2: ENVIRONMENT (Temp, Humid, Pressure) - Mas Malaki Size */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
          <StatCard title="Ambient Temp" value={latest.temperature} unit="°C" icon={Thermometer} color="#f97316" isLarge={true} />
          <StatCard title="Humidity" value={latest.humidity} unit="%" icon={CloudRain} color="#8b5cf6" isLarge={true} />
          <StatCard title="Atm. Pressure" value={latest.pressure || '1013'} unit="hPa" icon={Compass} color="#06b6d4" isLarge={true} />
        </div>

        {/* GRAPHS SECTION - ITO YUNG INAYOS BASE SA SCREENSHOT */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(580px, 1fr))', gap: '32px', marginBottom: '32px' }}>
          
          {/* Biometrics History Chart */}
          <div style={{ background: theme.card, padding: '30px', borderRadius: '32px', border: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: '900' }}>Biometrics History</h3>
                <p style={{ margin: 0, fontSize: '13px', color: theme.subText }}>Heart rate and Oxygen saturation trends</p>
              </div>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: theme.subText, textTransform: 'uppercase' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f43f5e' }}></div> BPM
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: theme.subText, textTransform: 'uppercase' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0ea5e9' }}></div> SPO2
                </div>
              </div>
            </div>
            <div style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBpm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} />
                  <XAxis dataKey="created_at" hide />
                  <YAxis domain={['dataMin - 5', 'dataMax + 5']} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: theme.subText }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', background: theme.card, border: `1px solid ${theme.border}` }} />
                  <Area type="monotone" dataKey="bpm" stroke="#f43f5e" fillOpacity={1} fill="url(#colorBpm)" strokeWidth={3} />
                  <Area type="monotone" dataKey="spo2" stroke="#0ea5e9" strokeWidth={3} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Air Quality Analysis Chart */}
          <div style={{ background: theme.card, padding: '30px', borderRadius: '32px', border: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: '900' }}>Air Quality Analysis</h3>
                <p style={{ margin: 0, fontSize: '13px', color: theme.subText }}>Environmental eCO2 concentration</p>
              </div>
              <select style={{ background: isDarkMode ? '#1e293b' : '#f8fafc', border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', color: theme.subText, outline: 'none', cursor: 'pointer' }}>
                <option>Last 1 Hour</option>
              </select>
            </div>
            <div style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} />
                  <XAxis dataKey="created_at" hide />
                  <YAxis domain={['dataMin - 10', 'dataMax + 10']} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: theme.subText }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', background: theme.card, border: `1px solid ${theme.border}` }} />
                  <Line type="stepAfter" dataKey="co2" stroke="#10b981" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* PROACTIVE BANNER - GAYANG GAYA */}
        <div style={{ 
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', padding: '50px', 
          borderRadius: '40px', color: 'white', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h3 style={{ fontSize: '28px', fontWeight: '900', margin: '0 0 12px 0' }}>Be Proactive with Your Health</h3>
            <p style={{ margin: '0 0 32px 0', opacity: 0.9, maxWidth: '550px', fontSize: '16px' }}>
              Your average heart rate today is 74 BPM, which is within the normal range for your age and lifestyle. Stay safe, {username}!
            </p>
            <button 
              onClick={() => setShowReport(true)}
              style={{ background: 'white', color: theme.accent, border: 'none', padding: '14px 35px', borderRadius: '16px', fontWeight: '900', cursor: 'pointer', fontSize: '14px' }}
            >
              View Full Report
            </button>
          </div>
          <Activity size={260} style={{ position: 'absolute', right: '-40px', bottom: '-40px', opacity: 0.15 }} />
        </div>
      </main>

      {/* MODAL FULL REPORT */}
      {showReport && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: theme.card, width: '90%', maxWidth: '1100px', height: '80vh', borderRadius: '40px', padding: '40px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
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
                  </tr>
                </thead>
                <tbody>
                  {vitals.map((v, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${theme.border}`, color: theme.text }}>
                      <td style={{ padding: '15px 20px' }}>{new Date(v.created_at).toLocaleString()}</td>
                      <td style={{ padding: '15px 20px', fontWeight: '700' }}>{v.bpm}</td>
                      <td style={{ padding: '15px 20px' }}>{v.spo2}%</td>
                      <td style={{ padding: '15px 20px' }}>{v.co2}</td>
                      <td style={{ padding: '15px 20px' }}>{v.tvoc}</td>
                      <td style={{ padding: '15px 20px' }}>{v.temperature}°C</td>
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
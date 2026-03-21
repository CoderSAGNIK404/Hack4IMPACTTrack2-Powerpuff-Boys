import React, { useState, useEffect } from 'react';
import { Pill, Clock, Calendar, CheckCircle2, Trash2, Loader2, FileSearch, AlertCircle, Sparkles } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL || '/api';

const MedTimeline = () => {
  const [meds, setMeds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTextScan, setShowTextScan] = useState(false);
  const [reportText, setReportText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState('');
  const email = localStorage.getItem('suraksha_user_email') || '';

  // Load medications from both MongoDB and localStorage
  const loadMeds = async () => {
    setIsLoading(true);
    let localMeds = [];
    try {
      localMeds = JSON.parse(localStorage.getItem('suraksha_med_timeline') || '[]');
      // Retroactively fix any missing IDs for meds saved before the fix
      let needsSave = false;
      localMeds = localMeds.map(m => {
        if (!m._id) {
          needsSave = true;
          return { ...m, _id: Date.now().toString() + Math.random().toString(36).substr(2, 9) };
        }
        return m;
      });
      if (needsSave) {
        localStorage.setItem('suraksha_med_timeline', JSON.stringify(localMeds));
      }
    } catch { /* ignore */ }

    if (email) {
      try {
        const res = await fetch(`${API}/meds/${email}`, { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            // If backend succeeds, prefer backend data but merge with local that might not have synced yet
            const serverIds = new Set(data.map(m => m._id || `${m.name}-${m.dosage}`));
            const unsyncedLocal = localMeds.filter(lm => !serverIds.has(lm._id || `${lm.name}-${lm.dosage}`));
            const merged = [...data, ...unsyncedLocal];
            setMeds(merged);
            localStorage.setItem('suraksha_med_timeline', JSON.stringify(merged));
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend fetch failed, falling back to localStorage');
      }
    }
    
    // Fallback if no email or backend fails
    setMeds(localMeds);
    setIsLoading(false);
  };

  useEffect(() => { loadMeds(); }, [email]);

  // Text scan via backend Groq
  const handleTextScan = async () => {
    if (!reportText.trim()) { setError('Please paste a report.'); return; }
    setIsScanning(true);
    setError('');
    setAnalysis('');

    try {
      const res = await fetch(`${API}/scan-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportText })
      });
      const data = await res.json();

      if (data.medications?.length > 0) {
        // Save to local first
        const existing = JSON.parse(localStorage.getItem('suraksha_med_timeline') || '[]');
        const newMeds = data.medications.map(m => ({ ...m, savedAt: new Date().toISOString(), _id: Date.now().toString() + Math.random() }));
        const updatedLocal = [...existing, ...newMeds];
        localStorage.setItem('suraksha_med_timeline', JSON.stringify(updatedLocal));
        
        if (email) {
          try {
            const saveRes = await fetch(`${API}/meds/${email}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ medications: data.medications })
            });
            if (saveRes.ok) {
              const allMeds = await saveRes.json();
              if (Array.isArray(allMeds)) {
                setMeds(allMeds);
                localStorage.setItem('suraksha_med_timeline', JSON.stringify(allMeds));
              }
            } else { setMeds(updatedLocal); }
          } catch { setMeds(updatedLocal); }
        } else {
          setMeds(updatedLocal);
        }
        
        setReportText('');
        setShowTextScan(false);
      }
      if (data.analysis) setAnalysis(data.analysis);
      if (!data.medications?.length) setError('No medications found. Try Mrs. Suraksha for image/PDF analysis.');
    } catch (err) {
      setError('Server error. Use Mrs. Suraksha to scan prescriptions instead.');
    } finally {
      setIsScanning(false);
    }
  };

  const toggleTaken = async (medId) => {
    // Update local state first
    const updatedMeds = meds.map(m => m._id === medId || `${m.name}-${m.dosage}` === medId ? { ...m, takenToday: !m.takenToday } : m);
    setMeds(updatedMeds);
    localStorage.setItem('suraksha_med_timeline', JSON.stringify(updatedMeds));

    // Then update backend
    if (email) {
      try { await fetch(`${API}/meds/${email}/${medId}`, { method: 'PATCH' }); }
      catch (err) { /* silent fallback */ }
    }
  };

  const deleteMed = async (medId) => {
    // Update local state first
    const updatedMeds = meds.filter(m => m._id !== medId && `${m.name}-${m.dosage}` !== medId);
    setMeds(updatedMeds);
    localStorage.setItem('suraksha_med_timeline', JSON.stringify(updatedMeds));

    // Then update backend
    if (email) {
      try { await fetch(`${API}/meds/${email}/${medId}`, { method: 'DELETE' }); }
      catch (err) { /* silent fallback */ }
    }
  };

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const takenCount = meds.filter(m => m.takenToday).length;
  const compliance = meds.length > 0 ? Math.round((takenCount / meds.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-[slide-up-fade_0.8s_ease-out]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Med<span className="text-emerald-500">Timeline</span></h2>
          <p className="text-emerald-50/40 font-medium">Your AI-generated medication schedule — managed from Mrs. Suraksha</p>
        </div>
        <button
          onClick={() => setShowTextScan(!showTextScan)}
          className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 text-white/50 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
        >
          <FileSearch size={16} />
          {showTextScan ? 'Close' : 'Paste Text'}
        </button>
      </div>

      {/* Tip Banner */}
      <div className="flex items-center gap-4 p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
        <Sparkles className="text-emerald-400 shrink-0" size={20} />
        <p className="text-xs text-emerald-50/50 font-medium">
          <span className="text-emerald-400 font-black">Tip:</span> Open <span className="text-white font-bold">Mrs. Suraksha</span> from the top navbar, upload or paste your prescription/report, and she'll analyze it. Click <span className="text-emerald-400 font-bold">"Save to Med Timeline"</span> to add medications here automatically.
        </p>
      </div>

      {/* Optional Text Scan */}
      {showTextScan && (
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4 animate-[fade-in-modal_0.4s_ease-out]">
          <textarea
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder="Paste prescription text here..."
            rows={4}
            className="w-full p-4 bg-black/30 border border-white/10 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-emerald-500/50 transition-all resize-none placeholder:text-white/10"
          />
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          {analysis && (
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
              <p className="text-xs text-emerald-400 font-black uppercase tracking-widest mb-2">Analysis</p>
              <p className="text-sm text-white/60 whitespace-pre-wrap">{analysis}</p>
            </div>
          )}
          <button
            onClick={handleTextScan}
            disabled={isScanning || !reportText.trim()}
            className="w-full py-4 bg-emerald-500 text-black rounded-xl font-black uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
          >
            {isScanning ? <><Loader2 size={14} className="animate-spin" /> Scanning...</> : <><FileSearch size={14} /> Extract & Save</>}
          </button>
        </div>
      )}

      {/* Medication Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <Calendar size={14} className="text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{today}</span>
            </div>
            <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{meds.length} Active</span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="text-emerald-400 animate-spin" size={32} />
            </div>
          ) : meds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-[3rem] text-center">
              <Pill size={48} className="text-white/10 mb-4" />
              <p className="text-white/20 font-black uppercase tracking-widest text-xs mb-2">No Medications Yet</p>
              <p className="text-white/10 text-xs max-w-sm">Open Mrs. Suraksha, share your prescription, and save medications to build your timeline.</p>
            </div>
          ) : (
            <div className="relative space-y-3">
              <div className="absolute left-[31px] top-8 bottom-8 w-0.5 bg-white/5"></div>
              {meds.map((med) => (
                <div key={med._id} className="relative flex items-center gap-5 group">
                  <div className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center border transition-all relative ${
                    med.takenToday ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-white/20 group-hover:border-emerald-500/20'
                  }`}>
                    <Pill size={22} />
                    {med.takenToday && (
                      <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-[#05070a]">
                        <CheckCircle2 size={8} className="text-black" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all">
                    <div className="min-w-0 space-y-1">
                      <h4 className="text-base font-black tracking-tight truncate">{med.name}</h4>
                      <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest">{med.dosage} • {med.frequency}</p>
                      {med.notes && <p className="text-[9px] text-white/15 italic">{med.notes}</p>}
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-black text-emerald-400">{med.time}</p>
                        <p className="text-[9px] font-bold text-white/15 uppercase">{med.duration}</p>
                      </div>
                      <button
                        onClick={() => toggleTaken(med._id)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          med.takenToday ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-500 text-black hover:bg-emerald-400'
                        }`}
                      >
                        {med.takenToday ? 'Done' : 'Take'}
                      </button>
                      <button onClick={() => deleteMed(med._id)} className="p-2 text-white/10 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-4">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-emerald-400">
              <Clock size={20} />
            </div>
            <h3 className="font-black text-white">Smart Reminders</h3>
            <p className="text-xs text-white/40 leading-relaxed font-medium">Medications are auto-extracted by Mrs. Suraksha and synced to your database. Mark each dose as taken throughout the day.</p>
          </div>

          <div className="p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem] space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60">Today's Compliance</span>
              <span className="text-[10px] font-black text-emerald-400">{compliance}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 shadow-[0_0_12px_#10b981] transition-all duration-500" style={{ width: `${compliance}%` }}></div>
            </div>
            <p className="text-[10px] text-white/20 font-bold">{takenCount} of {meds.length} doses taken</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedTimeline;

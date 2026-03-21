import React, { useState, useEffect } from 'react';
import { Shield, UserPlus, Trash2, Phone, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL || '/api';
const STORAGE_KEY = 'suraksha_emergency_contacts';
const HELPLINE = '+911234567890'; // SurakshaAI helpline

const SOSContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [saved, setSaved] = useState(false);
  const email = localStorage.getItem('suraksha_user_email') || '';

  // Load contacts
  useEffect(() => {
    setLoading(true);
    const loadLocal = () => {
      try { setContacts(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); } catch { setContacts([]); }
      setLoading(false);
    };

    if (email) {
      fetch(`${API}/emergency/${email}`, { signal: AbortSignal.timeout(3000) })
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setContacts(data);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          } else { loadLocal(); }
          setLoading(false);
        })
        .catch(() => loadLocal());
    } else { loadLocal(); }
  }, [email]);

  const saveContacts = async (updated) => {
    setSaving(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setContacts(updated);

    if (email) {
      try {
        const res = await fetch(`${API}/emergency/${email}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contacts: updated }),
          signal: AbortSignal.timeout(3000)
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setContacts(data);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          }
        }
      } catch { /* local saved already */ }
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const addContact = () => {
    if (!newName.trim() || !newPhone.trim() || contacts.length >= 2) return;
    saveContacts([...contacts, { name: newName, phone: newPhone, relation: newRelation || 'Emergency Contact' }]);
    setNewName(''); setNewPhone(''); setNewRelation('');
    setShowForm(false);
  };

  const deleteContact = (index) => {
    saveContacts(contacts.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black italic tracking-tighter text-white">
          <span className="text-red-500">SOS</span> BOARD
        </h1>
        <p className="text-white/30 mt-2">Manage your emergency contacts. When SOS is activated, an SMS alert is sent to these contacts.</p>
      </div>

      {/* Helpline Info */}
      <div className="p-5 bg-red-500/5 border border-red-500/15 rounded-2xl flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
          <Phone size={20} />
        </div>
        <div className="flex-1">
          <p className="text-xs font-black text-red-400 uppercase tracking-widest">SurakshaAI Helpline</p>
          <p className="text-white/50 text-[11px] mt-0.5">When you press SOS, our helpline agent is called immediately.</p>
        </div>
        <span className="text-red-400 font-mono text-sm font-bold">{HELPLINE}</span>
      </div>

      {/* Saved Notification */}
      {saved && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 animate-[fade-in-modal_0.3s_ease-out]">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span className="text-emerald-300 text-xs font-bold">Contacts saved successfully!</span>
        </div>
      )}

      {/* Contact Cards */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="text-white/20 animate-spin" size={28} /></div>
      ) : (
        <div className="space-y-4">
          {contacts.map((c, i) => (
            <div key={i} className="flex items-center gap-5 p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-red-500/15 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 shrink-0 shadow-lg shadow-red-900/10">
                <Shield size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-white tracking-tight">{c.name}</h3>
                <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-0.5">{c.relation}</p>
                <p className="text-sm text-red-400/80 font-mono mt-1">{c.phone}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`tel:${c.phone}`}
                  className="p-3 bg-green-500/10 text-green-400 rounded-xl hover:bg-green-500 hover:text-black transition-all"
                  title="Call"
                >
                  <Phone size={18} />
                </a>
                <button
                  onClick={() => deleteContact(i)}
                  className="p-3 text-white/10 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                  title="Remove contact"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {contacts.length === 0 && !showForm && (
            <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl">
              <AlertTriangle className="mx-auto text-red-500/20 mb-4" size={40} />
              <p className="text-white/15 text-sm font-bold">No emergency contacts added yet</p>
              <p className="text-white/10 text-xs mt-1">Add up to 2 contacts who will receive SMS when SOS is triggered</p>
            </div>
          )}

          {/* Add Contact Form */}
          {showForm && (
            <div className="p-6 bg-white/[0.02] border border-white/10 rounded-2xl space-y-4 animate-[fade-in-modal_0.3s_ease-out]">
              <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">New Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Full name"
                  className="p-3.5 bg-black/30 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-red-500/40 transition-colors"
                />
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="Phone (+91 98765 43210)"
                  className="p-3.5 bg-black/30 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-red-500/40 transition-colors"
                />
                <input
                  type="text"
                  value={newRelation}
                  onChange={(e) => setNewRelation(e.target.value)}
                  placeholder="Relation (Father, Mother...)"
                  className="p-3.5 bg-black/30 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-red-500/40 transition-colors"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={addContact}
                  disabled={!newName.trim() || !newPhone.trim() || saving}
                  className="flex-1 py-3.5 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                  {saving ? 'Saving...' : 'Save Contact'}
                </button>
                <button
                  onClick={() => { setShowForm(false); setNewName(''); setNewPhone(''); setNewRelation(''); }}
                  className="px-6 py-3.5 bg-white/5 text-white/30 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Add Button */}
          {contacts.length < 2 && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-5 border-2 border-dashed border-white/10 text-white/20 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-red-500/30 hover:text-red-400/50 transition-all flex items-center justify-center gap-2"
            >
              <UserPlus size={16} /> Add Emergency Contact ({contacts.length}/2)
            </button>
          )}
        </div>
      )}

      {/* SOS Trigger Info */}
      <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
        <h3 className="text-xs font-black text-white/30 uppercase tracking-widest mb-3">When SOS is activated</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
              <Phone size={14} />
            </div>
            <div>
              <p className="text-sm font-bold text-white/60">Helpline Call</p>
              <p className="text-[10px] text-white/20 mt-0.5">Immediate call to SurakshaAI helpline agent</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <Shield size={14} />
            </div>
            <div>
              <p className="text-sm font-bold text-white/60">SMS Alert</p>
              <p className="text-[10px] text-white/20 mt-0.5">Emergency SMS sent to all your saved contacts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOSContacts;

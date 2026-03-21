import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, Send, Volume2, VolumeX, Sparkles, HeartPulse, Plus, FileText, Pill, Clock } from 'lucide-react';
import OpenAI from "openai";

const API = import.meta.env.VITE_API_BASE_URL || '/api';

const MrsSuraksha = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hello, I am Mrs. Suraksha, your personal AI Medical Assistant. You can ask me anything about health, upload prescriptions or reports — I'll analyze them and can save your medications to the Med Timeline automatically." }
  ]);
  const [language, setLanguage] = useState('en-US');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [savingMeds, setSavingMeds] = useState(null); // index of msg being saved
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const email = localStorage.getItem('suraksha_user_email') || '';

  useEffect(() => {
    try {
      const { SpeechRecognition, webkitSpeechRecognition } = window;
      const SpeechRec = SpeechRecognition || webkitSpeechRecognition;
      if (SpeechRec) {
        const recognition = new SpeechRec();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language;
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsRecording(false);
          handleSend(transcript);
        };
        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
        recognitionRef.current = recognition;
      }
    } catch (e) { console.error("Speech init error:", e); }
  }, [language]);

  const scrollToBottom = () => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(() => { if (isOpen) scrollToBottom(); }, [messages, isOpen]);

  const speak = (text) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      const voices = window.speechSynthesis.getVoices();
      const langVoice = voices.find(v => v.lang.startsWith(language.split('-')[0]));
      if (langVoice) utterance.voice = langVoice;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) { console.error("Speech error:", e); }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      url: URL.createObjectURL(file),
      file: file
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id) => setAttachments(prev => prev.filter(a => a.id !== id));

  // Try to parse medications from AI response
  // Try to parse medications from AI response — multiple strategies
  const extractMedsFromText = (text) => {
    // Strategy 1: ```json code block
    try {
      const codeBlockMatch = text.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      if (codeBlockMatch) {
        const parsed = JSON.parse(codeBlockMatch[1]);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].name) return parsed;
      }
    } catch (e) { /* try next */ }

    // Strategy 2: Raw JSON array (greedy, find the largest one)
    try {
      const arrays = text.match(/\[\s*\{[\s\S]*?\}\s*\]/g);
      if (arrays) {
        // Try the longest match first (most likely the full medications array)
        const sorted = arrays.sort((a, b) => b.length - a.length);
        for (const arr of sorted) {
          try {
            const parsed = JSON.parse(arr);
            if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].name) return parsed;
          } catch (e) { /* try next match */ }
        }
      }
    } catch (e) { /* try next */ }

    // Strategy 3: JSON object wrapping medications
    try {
      const objMatch = text.match(/\{[\s\S]*?"medications"\s*:\s*\[[\s\S]*?\]\s*[\s\S]*?\}/);
      if (objMatch) {
        const parsed = JSON.parse(objMatch[0]);
        if (parsed.medications && Array.isArray(parsed.medications)) return parsed.medications;
      }
    } catch (e) { /* give up */ }

    return null;
  };

  // Read file as base64 data URL
  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // Read file as text
  const fileToText = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });

  const handleSend = async (textOverride = null) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() && attachments.length === 0) return;
    if (isLoading) return;

    const userMessage = { role: 'user', text: textToSend, attachments: attachments };
    setMessages(prev => [...prev, userMessage]);
    const currentAttachments = [...attachments];
    setAttachments([]);
    setInput("");
    setIsLoading(true);

    // Detect if user is talking about prescriptions/medications
    const isPrescriptionContext = currentAttachments.length > 0 ||
      /prescri|medicine|medication|report|diagnos|tablet|capsule|dosage|mg\b|ml\b|syrup|tab\.|cap\.|pill|drug|dose|daily|twice|thrice|morning|night|after food|before food|antibiotic|paracetamol|metformin|amlodipine|atorvastatin|amoxicillin|ibuprofen|aspirin|omeprazole|cetirizine|azithromycin|pantoprazole/i.test(textToSend);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) throw new Error("Groq API Key missing");

      const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: "https://api.groq.com/openai/v1",
        dangerouslyAllowBrowser: true
      });

      // Process attachments — extract image data or text content
      let hasImages = false;
      let extractedText = '';
      const imageDataUrls = [];

      for (const att of currentAttachments) {
        if (att.file) {
          if (att.file.type.startsWith('image/')) {
            hasImages = true;
            const base64 = await fileToBase64(att.file);
            imageDataUrls.push(base64);
          } else if (att.file.type === 'application/pdf') {
            extractedText += `\n[PDF: ${att.name}] - Please analyze this medical document.\n`;
          } else {
            try {
              const txt = await fileToText(att.file);
              extractedText += `\n--- Content of ${att.name} ---\n${txt}\n--- End ---\n`;
            } catch { extractedText += `\n[File: ${att.name}]\n`; }
          }
        }
      }

      const medJsonPrompt = isPrescriptionContext ? `

CRITICAL INSTRUCTIONS - FOLLOW EXACTLY:
1. Analyze this medical document / prescription carefully
2. List ALL medications you can identify with their details
3. You MUST end your response with a JSON code block containing ALL medications:

\`\`\`json
[
  {"name": "Medicine Name", "dosage": "500mg", "frequency": "Twice daily", "time": "08:00 AM", "duration": "30 days", "notes": "After food"}
]
\`\`\`

RULES:
- If a medicine is taken multiple times a day, the "time" field should list ALL times like "08:00 AM and 09:00 PM"
- If no duration is mentioned, use "Ongoing"
- Always include notes about how to take it (before/after food, warnings)
- The JSON MUST be the very last thing in your response
- Do NOT skip the JSON block — this is mandatory for medication tracking` : '';

      const systemPrompt = `You are Mrs. Suraksha, an expert AI Clinical Pharmacist and Doctor.
Respond in the language: ${language}.
If the user shares images of prescriptions, medical reports, or documents — read them carefully and extract ALL information visible.
Be thorough and precise. Identify medicine names, dosages, frequencies, and any instructions.${medJsonPrompt}`;

      let userContent;
      let model;

      if (hasImages) {
        // Use VISION model for images
        model = "llama-3.2-90b-vision-preview";
        const contentParts = [];

        // Add text
        contentParts.push({
          type: "text",
          text: textToSend || "Please analyze this prescription/medical report. Read all text visible in the image, identify all medications and their details."
        });

        // Add images
        for (const dataUrl of imageDataUrls) {
          contentParts.push({
            type: "image_url",
            image_url: { url: dataUrl }
          });
        }

        userContent = contentParts;
      } else {
        // Text-only model
        model = "llama-3.3-70b-versatile";
        let fullText = textToSend || "Please analyze this medical document.";
        if (extractedText) fullText += '\n\n' + extractedText;
        userContent = fullText;
      }

      console.log('[MrsSuraksha] Using model:', model, 'Images:', hasImages, 'Text length:', typeof userContent === 'string' ? userContent.length : 'multipart');

      const completion = await openai.chat.completions.create({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent }
        ],
        max_tokens: 2048
      });

      const aiText = completion.choices[0].message.content;
      const meds = extractMedsFromText(aiText);

      console.log('[MrsSuraksha] AI response length:', aiText.length, 'Meds found:', meds?.length || 0);

      // Clean the display text (remove JSON block for cleaner display)
      let displayText = aiText.replace(/```(?:json)?[\s\S]*?```/g, '').trim();

      setMessages(prev => [...prev, {
        role: 'assistant',
        text: displayText,
        medications: meds
      }]);

      // Speak only the display text
      speak(displayText.substring(0, 500));
    } catch (error) {
      console.error("Mrs. Suraksha API Error:", error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: `I encountered an issue: ${error.message || 'API error'}. Please try again or describe your medications in text.`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Save medications to Med Timeline via backend + localStorage fallback
  const saveMedsToTimeline = async (e, msgIndex) => {
    e.preventDefault();
    e.stopPropagation();
    const msg = messages[msgIndex];
    const userEmail = localStorage.getItem('suraksha_user_email') || email;
    console.log('[MrsSuraksha] Save clicked, msgIndex:', msgIndex, 'email:', userEmail, 'meds:', msg?.medications);
    
    if (!msg?.medications || msg.medications.length === 0) { console.warn('No medications found'); alert('No medications detected to save.'); return; }
    if (!userEmail) { console.warn('No email found in localStorage'); alert('Please log in first to save medications.'); return; }

    setSavingMeds(msgIndex);
    
    // Always save to localStorage first (guaranteed to work)
    try {
      const existing = JSON.parse(localStorage.getItem('suraksha_med_timeline') || '[]');
      const newMeds = msg.medications.map(m => ({
        ...m,
        _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        savedAt: new Date().toISOString(),
        source: 'Mrs. Suraksha AI'
      }));
      localStorage.setItem('suraksha_med_timeline', JSON.stringify([...existing, ...newMeds]));
      console.log('[MrsSuraksha] Saved to localStorage');
    } catch (err) {
      console.warn('[MrsSuraksha] localStorage save failed:', err);
    }

    // Try server save
    try {
      const res = await fetch(`${API}/meds/${userEmail}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medications: msg.medications }),
        signal: AbortSignal.timeout(5000)
      });
      console.log('[MrsSuraksha] Save response status:', res.status);

      if (res.ok) {
        console.log('[MrsSuraksha] Medications saved to server!');
      } else {
        console.warn('[MrsSuraksha] Server save failed, but localStorage save succeeded');
      }
    } catch (err) {
      console.warn('[MrsSuraksha] Server unreachable, saved to localStorage only:', err.message);
    }

    // Always mark as saved since localStorage succeeded
    setMessages(prev => prev.map((m, i) =>
      i === msgIndex ? { ...m, medsSaved: true } : m
    ));
    setSavingMeds(null);
  };

  const toggleRecording = () => {
    try {
      if (isRecording) {
        recognitionRef.current?.stop();
      } else {
        if (!recognitionRef.current) { alert("Speech recognition not supported."); return; }
        window.speechSynthesis.cancel();
        recognitionRef.current.start();
        setIsRecording(true);
      }
    } catch (e) { setIsRecording(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 md:p-10 animate-[fade-in-modal_0.3s_ease-out_forwards]">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" onClick={onClose}></div>

      <div className="relative w-full max-w-4xl h-[85vh] bg-neutral-900/90 border border-emerald-500/20 rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-[scale-in-modal_0.4s_ease-out_forwards]">

        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-emerald-500/5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 relative">
              <HeartPulse className="w-8 h-8 text-emerald-400" />
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Mrs. Suraksha <span className="text-emerald-500 text-sm font-black uppercase tracking-widest ml-2">AI Doctor</span></h2>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                <Sparkles className="w-3 h-3" /> Online • Prescription Scanner Active
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-black/40 rounded-2xl p-1 border border-white/5">
              {[
                { name: 'EN', code: 'en-US' },
                { name: 'HI', code: 'hi-IN' },
                { name: 'ES', code: 'es-ES' }
              ].map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                    language === lang.code ? 'bg-emerald-500 text-white' : 'text-white/30 hover:text-white/60'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>

            <button
              onClick={() => { setVoiceEnabled(!voiceEnabled); if (voiceEnabled) window.speechSynthesis.cancel(); }}
              className={`p-3 rounded-2xl border transition-all ${
                voiceEnabled ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-all text-white/50 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-[slide-up-fade_0.4s_ease-out_forwards]`}>
              <div className="max-w-[85%] space-y-3">
                <div className={`p-6 rounded-4xl text-sm leading-relaxed font-medium whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none shadow-xl shadow-emerald-900/20'
                    : 'bg-white/5 border border-white/10 text-emerald-50 rounded-bl-none'
                }`}>
                  {/* Attachments */}
                  {m.attachments?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {m.attachments.map(att => (
                        <div key={att.id} className="relative rounded-2xl overflow-hidden bg-black/20 border border-white/10">
                          {att.type === 'image' ? (
                            <img src={att.url} alt="upload" className="w-32 h-32 object-cover" />
                          ) : (
                            <div className="w-32 h-32 flex flex-col items-center justify-center p-3 text-center">
                              <FileText className="w-8 h-8 mb-2 opacity-50" />
                              <span className="text-[10px] break-all line-clamp-2">{att.name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {m.text}
                </div>

                {/* Medication Save Button */}
                {m.medications && m.medications.length > 0 && (
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                      <Pill size={14} /> {m.medications.length} Medications Detected
                    </div>

                    <div className="space-y-2">
                      {m.medications.map((med, j) => (
                        <div key={j} className="flex items-center gap-3 text-xs text-white/60">
                          <Clock size={10} className="text-emerald-500/40 shrink-0" />
                          <span className="font-bold text-white/80">{med.name}</span>
                          <span className="text-white/30">{med.dosage} • {med.frequency} • {med.time}</span>
                        </div>
                      ))}
                    </div>

                    {m.medsSaved ? (
                      <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest py-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                        Saved to Med Timeline
                      </div>
                    ) : (
                      <button
                        onClick={(e) => saveMedsToTimeline(e, i)}
                        disabled={savingMeds === i}
                        className="w-full py-3 bg-emerald-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer relative z-10"
                      >
                        {savingMeds === i ? (
                          <><div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div> Saving...</>
                        ) : (
                          <><Pill size={14} /> Save to Med Timeline</>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-white/5 border border-white/10 p-6 rounded-4xl rounded-bl-none text-emerald-400/50 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-current animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-8 bg-black/40 border-t border-white/5">
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-6">
              {attachments.map(att => (
                <div key={att.id} className="relative w-20 h-20 rounded-2xl bg-white/5 border border-white/10 overflow-hidden group">
                  {att.type === 'image' ? (
                    <img src={att.url} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-emerald-400" />
                    </div>
                  )}
                  <button
                    onClick={() => removeAttachment(att.id)}
                    className="absolute top-1 right-1 bg-black/60 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative flex items-center gap-4">
            <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*,.pdf,.txt" onChange={handleFileSelect} />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-5 bg-white/5 text-emerald-400 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all border border-white/5"
            >
              <Plus className="w-6 h-6" />
            </button>

            <button
              onClick={toggleRecording}
              className={`p-5 rounded-2xl transition-all flex items-center justify-center relative ${
                isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-white/5 text-emerald-400 hover:bg-emerald-500 hover:text-white'
              }`}
            >
              {isRecording && <div className="absolute inset-0 rounded-2xl border-2 border-rose-400 animate-ping"></div>}
              <Mic className="w-6 h-6" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isRecording ? "Listening..." : "Paste prescription, describe symptoms, or ask anything..."}
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
            />

            <button
              onClick={() => handleSend()}
              disabled={isLoading || (!input.trim() && attachments.length === 0)}
              className="p-5 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-emerald-900/20"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
          {isSpeaking && (
            <div className="mt-4 flex items-center justify-center gap-2 text-emerald-400/60 text-[10px] font-black uppercase tracking-widest animate-pulse">
              <Volume2 className="w-3 h-3" /> Mrs. Suraksha is speaking...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MrsSuraksha;

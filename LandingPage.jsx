import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight } from 'lucide-react';

/* ───────────────────────────────────────────
   Professional ECG Monitor (Canvas‑based)
   Draws a real‑time scrolling PQRST waveform
   ─────────────────────────────────────────── */
function ECGMonitor() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const xRef = useRef(0);

  // Classic PQRST waveform lookup (single heartbeat cycle)
  const getECGValue = useCallback((phase) => {
    // phase 0‒1 maps to one full heartbeat
    if (phase < 0.10) return 0;                                         // Baseline
    if (phase < 0.15) return Math.sin((phase - 0.10) / 0.05 * Math.PI) * 8;  // P wave
    if (phase < 0.20) return 0;                                         // PR segment
    if (phase < 0.22) return -6;                                        // Q dip
    if (phase < 0.28) return -6 + ((phase - 0.22) / 0.06) * 80;         // R spike up
    if (phase < 0.34) return 74 - ((phase - 0.28) / 0.06) * 86;         // R spike down → S
    if (phase < 0.38) return -12 + ((phase - 0.34) / 0.04) * 12;        // S return
    if (phase < 0.48) return 0;                                         // ST segment
    if (phase < 0.58) return Math.sin((phase - 0.48) / 0.10 * Math.PI) * 12; // T wave
    return 0;                                                           // Baseline
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Slight beat-to-beat variation for uneven, organic feel
    let beatJitter = 0;

    const columns = []; // Store column values for scrolling trail
    const maxCols = 1200;
    const speed = 2.5; // pixels per frame
    let beatPhase = 0;
    const bpm = 72;
    const samplesPerBeat = (60 / bpm) * 60; // at ~60fps

    const draw = () => {
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      const midY = h * 0.5;

      // Generate new sample with jitter for uneven beats
      const jitteredRate = 1 / (samplesPerBeat + beatJitter);
      beatPhase = beatPhase + jitteredRate;
      if (beatPhase >= 1) {
        beatPhase = beatPhase % 1;
        beatJitter = (Math.random() - 0.5) * 15; // vary each beat slightly
      }
      const val = getECGValue(beatPhase);
      columns.push(val);
      if (columns.length > maxCols) columns.shift();

      // Clear
      ctx.clearRect(0, 0, w, h);

      // Grid lines (subtle)
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.07)';
      ctx.lineWidth = 0.5;
      for (let gy = 0; gy < h; gy += 25) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
      }
      for (let gx = 0; gx < w; gx += 25) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
      }

      // Draw ECG trace (dimmed)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.25)';
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(34, 197, 94, 0.15)';
      ctx.shadowBlur = 6;

      const startX = w - columns.length * speed / dpr;
      for (let i = 0; i < columns.length; i++) {
        const px = startX + i * (speed / dpr);
        const py = midY - columns[i] * 1.8;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Glow dot at the head 
      ctx.shadowBlur = 0;
      const headX = startX + (columns.length - 1) * (speed / dpr);
      const headY = midY - columns[columns.length - 1] * 1.8;
      ctx.beginPath();
      ctx.arc(headX, headY, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(74,222,128,0.35)';
      ctx.shadowColor = 'rgba(34,197,94,0.2)';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // BPM overlay (subtle)
      ctx.font = '600 13px Inter, sans-serif';
      ctx.fillStyle = 'rgba(34,197,94,0.2)';
      ctx.textAlign = 'left';
      ctx.fillText('♥ ' + bpm + ' BPM', 16, 28);

      // Label
      ctx.font = '500 10px Inter, sans-serif';
      ctx.fillStyle = 'rgba(34,197,94,0.15)';
      ctx.textAlign = 'right';
      ctx.fillText('ECG Lead II', w - 16, 28);

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [getECGValue]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
    />
  );
}

/* ───────────────────────────────────────────
   Landing Page
   ─────────────────────────────────────────── */
const LandingPage = () => {
  const [isExpanding, setIsExpanding] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    setIsExpanding(true);
    setTimeout(() => {
      navigate('/home');
    }, 1400);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#070a0d]">

      {/* Full‑screen ECG Background */}
      <ECGMonitor />

      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#070a0d_100%)] z-[1] pointer-events-none"></div>

      {/* Center Content Card */}
      <div className={`relative z-10 flex flex-col items-center text-center max-w-xl px-6 transition-all duration-1000 animate-[fade-in-modal_1s_ease-out] ${isExpanding ? 'opacity-0 scale-90' : 'opacity-100'}`}>
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/60 text-emerald-400 text-sm font-semibold border border-emerald-800/40 mb-6 backdrop-blur-sm shadow-lg shadow-emerald-900/20">
          <Activity className="w-4 h-4" />
          <span>SurakshaAI</span>
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white mb-4 drop-shadow-lg">
          Every beat <br />
          <span className="text-emerald-400 drop-shadow-[0_0_20px_rgba(34,197,94,0.4)]">matters.</span>
        </h1>

        <p className="text-base md:text-lg text-gray-400 max-w-md mb-8">
          Real‑time health risk prediction, preventive lifestyle coaching, and instant emergency response—powered by AI.
        </p>

        <button
          onClick={handleGetStarted}
          className="group flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-full shadow-[0_0_25px_rgba(34,197,94,0.35)] hover:shadow-[0_0_40px_rgba(34,197,94,0.55)] hover:scale-105 active:scale-95 transition-all outline-none font-semibold text-lg"
        >
          Get Started
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2.5} />
        </button>
      </div>

      {/* Expanding transition */}
      {isExpanding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <div className="w-4 h-4 bg-emerald-500 rounded-full animate-[expand-circle_1.5s_ease-in-out_forwards] shadow-2xl"></div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;

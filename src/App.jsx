import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, LogOut, Zap, ChevronRight } from 'lucide-react';

// ==========================================
// بنك الأسئلة المدمج 
// ==========================================
const QUESTIONS_DATABASE = [
  { id: "isl_1", topic: "إسلاميات", q: "من أول من ركب الخيل من الأنبياء؟", a: ["إسماعيل عليه السلام", "إبراهيم", "سليمان", "صالح"] },
  { id: "isl_2", topic: "إسلاميات", q: "أول فدائية في الإسلام هي؟", a: ["أسماء بنت أبي بكر", "سمية بنت خياط", "خديجة", "فاطمة"] },
  { id: "geo_1", topic: "جغرافيا", q: "ما هو أعرض أنهار العالم؟", a: ["الأمازون", "النيل", "الفرات", "الدانوب"] },
  { id: "his_1", topic: "تاريخ", q: "من القائد الفاطمي الذي بنى القاهرة؟", a: ["جوهر الصقلي", "صلاح الدين", "بيبرس", "قطز"] },
  { id: "sci_1", topic: "علوم", q: "مكتشف الدورة الدموية الصغرى؟", a: ["ابن النفيس", "ابن سينا", "الرازي", "البيروني"] },
  { id: "gen_1", topic: "عامة", q: "ما الشيء الذي اسمه على لونه؟", a: ["البرتقال", "البيضة", "الموز", "البطيخ"] }
];

const TOPICS = ['إسلاميات', 'جغرافيا', 'تاريخ', 'علوم', 'أدب', 'فن', 'رياضة', 'عامة'];

// ==========================================
// التنسيقات الفخمة الأصلية
// ==========================================
const CSS_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&family=Amiri:wght@700&display=swap');
  
  body, html { 
    font-family: 'Tajawal', sans-serif; 
    margin: 0; padding: 0;
    background-color: #020617; color: white;
    user-select: none;
    overflow: hidden !important; 
    width: 100vw; height: 100dvh; 
  }

  .classic-title { font-family: 'Amiri', serif; }
  
  .glass-box {
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(40px);
    border: 1px solid rgba(255,255,255,0.1);
  }

  .neon-glow { filter: blur(30px); opacity: 0.6; }

  .input-field {
    width: 100%;
    background: rgba(30, 41, 59, 0.7);
    border: 2px solid rgba(255,255,255,0.1);
    color: white !important;
    text-align: center;
    padding: 1.2rem;
    border-radius: 1.5rem;
    font-size: 1.2rem;
    font-weight: 700;
    outline: none;
    transition: all 0.2s;
  }
  .input-field:focus { border-color: #3b82f6; background: rgba(30, 41, 59, 1); }

  /* الخط الذكي للشبكة */
  .hex-text { 
    font-weight: 900; 
    fill: white;
    pointer-events: none; /* يمنع النص من إعاقة الضغط على الخلية */
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8));
    font-family: 'Tajawal', sans-serif;
  }
  @media (max-width: 767px) { .hex-text { font-size: 40px; } }
  @media (min-width: 768px) { .hex-text { font-size: 28px; } }

  .hex-group { 
    transition: filter 0.2s ease-out; 
    cursor: pointer; 
  }
  .hex-group:hover { filter: brightness(1.4); }
`;

// ==========================================
// إعدادات الشبكة السداسية
// ==========================================
const GRID_SIZE = 5;
const HEX_RADIUS = 95; 
const HEX_WIDTH = Math.sqrt(3) * HEX_RADIUS;
const HEX_HEIGHT = 2 * HEX_RADIUS;
const VERT_DIST = HEX_HEIGHT * 0.75;
const VB_WIDTH = (GRID_SIZE * HEX_WIDTH) + (HEX_WIDTH / 2);
const VB_HEIGHT = ((GRID_SIZE - 1) * VERT_DIST) + HEX_HEIGHT;
const VB_PADDING = 120; 

export default function App() {
  const [view, setView] = useState('START'); 
  const [pNames, setPNames] = useState({ p1: '', p2: '' });
  const [currentRound, setCurrentRound] = useState(1);
  const [grid, setGrid] = useState([]);
  const [turn, setTurn] = useState('P1');
  const [activeQ, setActiveQ] = useState(null);

  const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

  const roundConfig = useMemo(() => {
    const isP1Vertical = currentRound % 2 !== 0;
    return {
      P1: { dir: isP1Vertical ? 'VERT' : 'HORIZ', color: '#10b981', label: isP1Vertical ? 'رأسي (أخضر)' : 'أفقي (أخضر)' },
      P2: { dir: isP1Vertical ? 'HORIZ' : 'VERT', color: '#ef4444', label: isP1Vertical ? 'أفقي (أحمر)' : 'رأسي (أحمر)' },
      bg: { 
        vSide: isP1Vertical ? '#10b981' : '#ef4444', 
        hSide: isP1Vertical ? '#ef4444' : '#10b981' 
      }
    };
  }, [currentRound]);

  const handleStartGame = () => {
    if (!pNames.p1 || !pNames.p2) return;
    const newGrid = [];
    const topicsList = shuffle([...TOPICS, ...TOPICS, ...TOPICS, ...TOPICS]); 
    let idx = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        newGrid.push({ id: `${r}-${c}`, r, c, label: topicsList[idx++], owner: null });
      }
    }
    setGrid(newGrid);
    setTurn('P1');
    setView('GAME');
  };

  const handleTileClick = (tile) => {
    if (tile.owner) return; // إذا كانت الخلية محجوزة لا تفعل شيئاً
    
    const possibleQs = QUESTIONS_DATABASE.filter(q => q.topic === tile.label);
    const selectedQ = possibleQs.length > 0 
        ? possibleQs[Math.floor(Math.random() * possibleQs.length)] 
        : { topic: tile.label, q: `سؤال إضافي في قسم ${tile.label}؟`, a: ["الخيار 1", "الخيار 2", "الخيار 3", "الخيار 4"] };

    setActiveQ({ 
        tile, 
        q: selectedQ.q, 
        opts: shuffle([...selectedQ.a]), 
        ans: selectedQ.a[0] 
    });
  };

  const submitAnswer = (opt) => {
    if (opt === activeQ.ans) {
      const newGrid = [...grid];
      const idx = newGrid.findIndex(t => t.id === activeQ.tile.id);
      newGrid[idx].owner = turn;
      setGrid(newGrid);
    }
    setActiveQ(null);
    setTurn(turn === 'P1' ? 'P2' : 'P1');
  };

  return (
    <div className="w-full h-[100dvh] flex flex-col bg-[#020617] overflow-hidden" dir="rtl">
      <style>{CSS_STYLES}</style>

      {/* ========================================== */}
      {/* شاشة الدخول الفخمة (حسب الصورة الثانية تماماً) */}
      {/* ========================================== */}
      {view === 'START' && (
        <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-4 space-y-10">
          <div className="text-center space-y-4">
            <h1 className="text-[clamp(4rem,15vw,10rem)] leading-none classic-title font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-500 drop-shadow-2xl">
              سباق المعرفة
            </h1>
            <p className="text-white font-bold text-[clamp(1.2rem,5vw,2.5rem)] m-0 drop-shadow-lg">
              محمد القرني
            </p>
          </div>
          <div className="glass-box p-8 md:p-12 rounded-[2rem] w-full max-w-xl flex flex-col gap-6 shadow-2xl border border-white/10">
            <input type="text" placeholder="اسم المتسابق الأول" className="input-field" value={pNames.p1} onChange={e => setPNames({...pNames, p1: e.target.value})} />
            <input type="text" placeholder="اسم المتسابق الثاني" className="input-field" value={pNames.p2} onChange={e => setPNames({...pNames, p2: e.target.value})} />
            <button onClick={handleStartGame} disabled={!pNames.p1 || !pNames.p2} className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-[1.5rem] font-black text-[clamp(1.2rem,4vw,2rem)] active:scale-95 transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-50 mt-2">
              ابدأ التحدي
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* شاشة اللعب والشبكة */}
      {/* ========================================== */}
      {view === 'GAME' && (
        <div className="flex-1 flex flex-col w-full h-full min-h-0 overflow-hidden">
          
          <header className="shrink-0 h-[10vh] min-h-[70px] max-h-[90px] p-2 md:px-6 glass-box flex justify-between items-center z-50 border-b border-white/10 gap-2">
            <div className={`flex-1 h-full max-w-[200px] px-2 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${turn === 'P1' ? 'bg-emerald-500/20 border-emerald-500 scale-105' : 'opacity-40 border-transparent'}`}>
              <span className="text-[10px] md:text-sm font-black opacity-70">{roundConfig.P1.label}</span>
              <div className="text-sm md:text-xl font-black truncate w-full text-center">{pNames.p1}</div>
            </div>
            <div className="shrink-0 px-2 text-center">
               <div className="classic-title text-xl md:text-3xl whitespace-nowrap text-blue-400">الجولة {currentRound}</div>
            </div>
            <div className={`flex-1 h-full max-w-[200px] px-2 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${turn === 'P2' ? 'bg-rose-500/20 border-rose-500 scale-105' : 'opacity-40 border-transparent'}`}>
              <span className="text-[10px] md:text-sm font-black opacity-70">{roundConfig.P2.label}</span>
              <div className="text-sm md:text-xl font-black truncate w-full text-center">{pNames.p2}</div>
            </div>
          </header>

          {/* الحل النهائي للقص والضغط: استخدام flex-1 min-h-0 مع object-contain */}
          <main className="flex-1 min-h-0 w-full flex items-center justify-center bg-[#010409] p-2 md:p-6">
             <svg 
                  viewBox={`${-VB_PADDING} ${-VB_PADDING} ${VB_WIDTH + VB_PADDING * 2} ${VB_HEIGHT + VB_PADDING * 2}`} 
                  className="w-full h-full max-h-full object-contain"
                  preserveAspectRatio="xMidYMid meet"
              >
                  {/* الأطراف الملونة */}
                  <g className="neon-glow pointer-events-none">
                      <rect x={0} y={-40} width={VB_WIDTH} height={120} fill={roundConfig.bg.vSide} rx="30" />
                      <rect x={0} y={VB_HEIGHT - 80} width={VB_WIDTH} height={120} fill={roundConfig.bg.vSide} rx="30" />
                      <rect x={-40} y={0} width={120} height={VB_HEIGHT} fill={roundConfig.bg.hSide} rx="30" />
                      <rect x={VB_WIDTH - 80} y={0} width={120} height={VB_HEIGHT} fill={roundConfig.bg.hSide} rx="30" />
                  </g>

                  {/* الشبكة السداسية */}
                  <g>
                  {grid.map(c => {
                      const xOff = (c.r % 2 === 0) ? 0 : (HEX_WIDTH / 2);
                      const cx = (c.c * HEX_WIDTH) + xOff + (HEX_WIDTH / 2);
                      const cy = (c.r * VERT_DIST) + (HEX_HEIGHT / 2);
                      return (
                      <g 
                         key={c.id} 
                         className="hex-group" 
                         onClick={() => handleTileClick(c)}
                         pointerEvents="all" /* يضمن استجابة الخلية للضغط */
                      >
                          <polygon 
                             points={Array.from({length: 6}).map((_, i) => `${cx + HEX_RADIUS * Math.cos((Math.PI/180)*(60*i-30))},${cy + HEX_RADIUS * Math.sin((Math.PI/180)*(60*i-30))}`).join(' ')} 
                             fill={c.owner === 'P1' ? "#10b981" : c.owner === 'P2' ? "#ef4444" : "#1e293b"} 
                             stroke="#475569" 
                             strokeWidth="6" 
                          />
                          {!c.owner && (
                              <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="hex-text">
                                  {c.label}
                              </text>
                          )}
                      </g>
                      );
                  })}
                  </g>
              </svg>
          </main>
          
          <footer className="shrink-0 h-[6vh] min-h-[40px] max-h-[60px] flex items-center justify-center z-50">
             <button onClick={() => window.location.reload()} className="px-6 py-2 rounded-full text-slate-400 text-sm font-bold border border-white/5 bg-white/5 hover:bg-white/10 transition flex items-center gap-2">
               <LogOut size={14}/> إنهاء المسابقة
             </button>
          </footer>
        </div>
      )}

      {/* ========================================== */}
      {/* مودال السؤال */}
      {/* ========================================== */}
      {activeQ && (
        <div className="fixed inset-0 w-screen h-[100dvh] bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="glass-box border-2 flex flex-col w-full max-w-4xl rounded-[2rem] p-6 md:p-12 text-center space-y-8 shadow-[0_0_50px_rgba(59,130,246,0.3)]" style={{ borderColor: turn === 'P1' ? '#10b981' : '#ef4444' }}>
            <div className={`inline-block px-10 py-3 rounded-full font-black text-2xl shadow-lg self-center ${turn === 'P1' ? 'bg-emerald-600' : 'bg-rose-600'}`}>{activeQ.tile.label}</div>
            <h3 className="text-[clamp(1.5rem,4vh,3.5rem)] leading-tight font-black">{activeQ.q}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full pt-4">
              {activeQ.opts.map((o, i) => (
                <button key={i} onClick={() => submitAnswer(o)} className="w-full bg-slate-800 p-6 rounded-2xl border-2 border-white/5 hover:bg-blue-700 transition-all text-xl md:text-3xl font-bold active:scale-95">
                  {o}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


import React, { useState, useMemo } from 'react';
import { LogOut } from 'lucide-react';

const QUESTIONS_DATABASE = [
  { id: "isl_1", topic: "إسلاميات", q: "من أول من ركب الخيل من الأنبياء؟", a: ["إسماعيل عليه السلام", "إبراهيم", "سليمان", "صالح"] },
  { id: "isl_2", topic: "إسلاميات", q: "أول فدائية في الإسلام هي؟", a: ["أسماء بنت أبي بكر", "سمية بنت خياط", "خديجة", "فاطمة"] },
  { id: "geo_1", topic: "جغرافيا", q: "ما هو أعرض أنهار العالم؟", a: ["الأمازون", "النيل", "الفرات", "الدانوب"] },
  { id: "his_1", topic: "تاريخ", q: "من القائد الفاطمي الذي بنى القاهرة؟", a: ["جوهر الصقلي", "صلاح الدين", "بيبرس", "قطز"] },
  { id: "sci_1", topic: "علوم", q: "مكتشف الدورة الدموية الصغرى؟", a: ["ابن النفيس", "ابن سينا", "الرازي", "البيروني"] },
  { id: "gen_1", topic: "عامة", q: "ما الشيء الذي اسمه على لونه؟", a: ["البرتقال", "البيضة", "الموز", "البطيخ"] }
];

const TOPICS = ['إسلاميات', 'جغرافيا', 'تاريخ', 'علوم', 'أدب', 'فن', 'رياضة', 'عامة'];

const CSS_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&family=Amiri:wght@700&display=swap');
  
  body, html { 
    font-family: 'Tajawal', sans-serif; 
    overflow: hidden !important; 
  }

  .classic-title { font-family: 'Amiri', serif; }
  
  .glass-box {
    background: rgba(15, 23, 42, 0.7);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.1);
  }

  .input-field {
    width: 100%;
    background: rgba(30, 41, 59, 0.8);
    border: 2px solid rgba(255,255,255,0.1);
    color: white !important;
    text-align: center;
    padding: 1.2rem;
    border-radius: 1rem;
    font-size: 1.2rem;
    font-weight: 700;
    outline: none;
    transition: all 0.3s;
  }
  .input-field:focus { border-color: #3b82f6; background: rgba(30, 41, 59, 1); }

  .hex-text { 
    font-weight: 900; 
    fill: white;
    pointer-events: none !important; /* هذا يمنع النص من سرقة ضغطة الماوس */
    filter: drop-shadow(0 2px 4px rgba(0,0,0,1));
    font-family: 'Tajawal', sans-serif;
  }
  
  @media (max-width: 767px) { .hex-text { font-size: 38px; } }
  @media (min-width: 768px) { .hex-text { font-size: 26px; } }
`;

const GRID_SIZE = 5;
const HEX_RADIUS = 90; 
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
      bg: { vSide: isP1Vertical ? '#10b981' : '#ef4444', hSide: isP1Vertical ? '#ef4444' : '#10b981' }
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
    if (tile.owner) return; 
    
    const possibleQs = QUESTIONS_DATABASE.filter(q => q.topic === tile.label);
    const selectedQ = possibleQs.length > 0 
        ? possibleQs[Math.floor(Math.random() * possibleQs.length)] 
        : { topic: tile.label, q: `سؤال إضافي في قسم ${tile.label}؟`, a: ["الخيار 1", "الخيار 2", "الخيار 3", "الخيار 4"] };

    setActiveQ({ tile, q: selectedQ.q, opts: shuffle([...selectedQ.a]), ans: selectedQ.a[0] });
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
    <div className="w-screen h-screen flex flex-col bg-[#020617] text-white overflow-hidden" dir="rtl">
      <style>{CSS_STYLES}</style>

      {/* ==================== شاشة الدخول الفخمة ==================== */}
      {view === 'START' && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 w-full h-full relative">
          <div className="text-center space-y-4 mb-10 z-10">
            <h1 className="text-[clamp(4rem,14vw,9rem)] leading-none classic-title font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-200 to-blue-500 drop-shadow-2xl">
              سباق المعرفة
            </h1>
            <p className="text-white font-bold text-[clamp(1.2rem,4vw,2.5rem)] m-0 drop-shadow-md">
              محمد القرني
            </p>
          </div>
          
          <div className="glass-box p-8 md:p-12 rounded-[2rem] w-full max-w-xl flex flex-col gap-6 z-10 shadow-2xl">
            <input type="text" placeholder="اسم المتسابق الأول" className="input-field" value={pNames.p1} onChange={e => setPNames({...pNames, p1: e.target.value})} />
            <input type="text" placeholder="اسم المتسابق الثاني" className="input-field" value={pNames.p2} onChange={e => setPNames({...pNames, p2: e.target.value})} />
            <button onClick={handleStartGame} disabled={!pNames.p1 || !pNames.p2} className="w-full bg-blue-600 hover:bg-blue-500 py-4 mt-2 rounded-[1rem] font-black text-[clamp(1.2rem,4vw,2rem)] active:scale-95 transition-all shadow-lg disabled:opacity-50">
              ابدأ التحدي
            </button>
          </div>
        </div>
      )}

      {/* ==================== شاشة اللعب ==================== */}
      {view === 'GAME' && (
        <div className="flex-1 flex flex-col w-full h-full overflow-hidden relative">
          
          {/* الهيدر */}
          <header className="h-[80px] shrink-0 p-2 md:px-6 glass-box flex justify-between items-center z-20 border-b border-white/10">
            <div className={`flex-1 h-full max-w-[200px] px-2 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${turn === 'P1' ? 'bg-emerald-500/30 border-emerald-500 scale-105' : 'opacity-40 border-transparent'}`}>
              <span className="text-[10px] md:text-sm font-black opacity-80">{roundConfig.P1.label}</span>
              <div className="text-sm md:text-xl font-black truncate w-full text-center">{pNames.p1}</div>
            </div>
            <div className="shrink-0 px-2 text-center">
               <div className="classic-title text-xl md:text-3xl whitespace-nowrap text-blue-400">الجولة {currentRound}</div>
            </div>
            <div className={`flex-1 h-full max-w-[200px] px-2 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${turn === 'P2' ? 'bg-rose-500/30 border-rose-500 scale-105' : 'opacity-40 border-transparent'}`}>
              <span className="text-[10px] md:text-sm font-black opacity-80">{roundConfig.P2.label}</span>
              <div className="text-sm md:text-xl font-black truncate w-full text-center">{pNames.p2}</div>
            </div>
          </header>

          {/* مساحة اللعب - تم إجبارها على التوسيط وعدم القص */}
          <main className="flex-1 relative w-full h-full bg-[#010409]">
             <div className="absolute inset-0 flex items-center justify-center p-4">
                 <svg 
                      viewBox={`${-VB_PADDING} ${-VB_PADDING} ${VB_WIDTH + VB_PADDING * 2} ${VB_HEIGHT + VB_PADDING * 2}`} 
                      className="w-full h-full drop-shadow-2xl"
                      style={{ maxHeight: '100%', maxWidth: '100%' }}
                      preserveAspectRatio="xMidYMid meet"
                  >
                      {/* الأطراف الملونة (pointer-events-none تمنع إعاقة الضغط) */}
                      <g className="opacity-50 pointer-events-none">
                          <rect x={0} y={-40} width={VB_WIDTH} height={120} fill={roundConfig.bg.vSide} rx="30" />
                          <rect x={0} y={VB_HEIGHT - 80} width={VB_WIDTH} height={120} fill={roundConfig.bg.vSide} rx="30" />
                          <rect x={-40} y={0} width={120} height={VB_HEIGHT} fill={roundConfig.bg.hSide} rx="30" />
                          <rect x={VB_WIDTH - 80} y={0} width={120} height={VB_HEIGHT} fill={roundConfig.bg.hSide} rx="30" />
                      </g>

                      {/* الخلايا السداسية */}
                      <g>
                      {grid.map(c => {
                          const xOff = (c.r % 2 === 0) ? 0 : (HEX_WIDTH / 2);
                          const cx = (c.c * HEX_WIDTH) + xOff + (HEX_WIDTH / 2);
                          const cy = (c.r * VERT_DIST) + (HEX_HEIGHT / 2);
                          return (
                          <g key={c.id}>
                              {/* هنا نضع أمر الضغط على الشكل نفسه */}
                              <polygon 
                                 className="cursor-pointer hover:brightness-125 transition-all duration-200"
                                 onClick={() => handleTileClick(c)}
                                 style={{ pointerEvents: 'all' }}
                                 points={Array.from({length: 6}).map((_, i) => `${cx + HEX_RADIUS * Math.cos((Math.PI/180)*(60*i-30))},${cy + HEX_RADIUS * Math.sin((Math.PI/180)*(60*i-30))}`).join(' ')} 
                                 fill={c.owner === 'P1' ? "#10b981" : c.owner === 'P2' ? "#ef4444" : "#1e293b"} 
                                 stroke="#475569" 
                                 strokeWidth="5" 
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
             </div>
          </main>
          
          {/* الفوتر */}
          <footer className="h-[60px] shrink-0 flex items-center justify-center z-20 glass-box border-t border-white/10 relative">
             <button onClick={() => window.location.reload()} className="px-6 py-2 rounded-full text-slate-300 text-sm font-bold border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center gap-2">
               <LogOut size={16}/> إنهاء المسابقة
             </button>
          </footer>
        </div>
      )}

      {/* ==================== النافذة المنبثقة للسؤال (المودال) ==================== */}
      {/* تم إعادة تفعيل الكلاسات التي تجعلها عائمة فوق الشاشة بالكامل */}
      {activeQ && (
        <div className="fixed inset-0 z-[100] w-screen h-screen bg-black/95 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="glass-box border-2 flex flex-col w-full max-w-4xl rounded-[2rem] p-6 md:p-12 text-center space-y-8" style={{ borderColor: turn === 'P1' ? '#10b981' : '#ef4444' }}>
            <div className={`inline-block px-10 py-3 rounded-full font-black text-2xl shadow-lg self-center ${turn === 'P1' ? 'bg-emerald-600' : 'bg-rose-600'}`}>{activeQ.tile.label}</div>
            <h3 className="text-[clamp(1.5rem,4vh,3.5rem)] leading-tight font-black text-white">{activeQ.q}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full pt-4">
              {activeQ.opts.map((o, i) => (
                <button key={i} onClick={() => submitAnswer(o)} className="w-full bg-slate-800 text-white p-6 rounded-2xl border-2 border-white/5 hover:bg-blue-700 transition-all text-xl md:text-3xl font-bold active:scale-95">
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


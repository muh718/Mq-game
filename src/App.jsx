import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, LogOut, Zap, ChevronRight } from 'lucide-react';
import { QUESTIONS_DATABASE } from './questionsData';

const TOPICS = ['إسلاميات', 'جغرافيا', 'تاريخ', 'علوم', 'أدب', 'فن', 'رياضة', 'عامة'];
const GRID_SIZE = 5;
const HEX_RADIUS = 95;
const HEX_WIDTH = Math.sqrt(3) * HEX_RADIUS;
const HEX_HEIGHT = 2 * HEX_RADIUS;
const VERT_DIST = HEX_HEIGHT * 0.75;
const VB_WIDTH = (GRID_SIZE * HEX_WIDTH) + (HEX_WIDTH / 2);
const VB_HEIGHT = ((GRID_SIZE - 1) * VERT_DIST) + HEX_HEIGHT;

export default function App() {
  const [view, setView] = useState('START');
  const [pNames, setPNames] = useState({ p1: '', p2: '' });
  const [grid, setGrid] = useState([]);
  const [turn, setTurn] = useState('P1');
  const [activeQ, setActiveQ] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // مستشعر ذكي لمقاس الشاشة لضبط الخطوط فوراً
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleStartGame = () => {
    if (!pNames.p1 || !pNames.p2) return;
    const shuffledTopics = [...TOPICS, ...TOPICS, ...TOPICS, ...TOPICS].sort(() => Math.random() - 0.5);
    const newGrid = [];
    let idx = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        newGrid.push({ id: `${r}-${c}`, r, c, label: shuffledTopics[idx++], owner: null });
      }
    }
    setGrid(newGrid);
    setView('GAME');
  };

  const handleTileClick = (tile) => {
    if (tile.owner) return;
    const topicQs = QUESTIONS_DATABASE.filter(q => q.topic === tile.label);
    const selectedQ = topicQs[Math.floor(Math.random() * topicQs.length)] || QUESTIONS_DATABASE[0];
    setActiveQ({ 
      tile, 
      q: selectedQ.q, 
      opts: [...selectedQ.a].sort(() => Math.random() - 0.5), 
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
    <div className="w-screen h-screen fixed inset-0 bg-[#020617] text-white overflow-hidden flex flex-col font-sans select-none" dir="rtl">
      <style>{`
        @import url('[https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&family=Amiri:wght@700&display=swap](https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&family=Amiri:wght@700&display=swap)');
        .classic-title { font-family: 'Amiri', serif; }
        .glass-box { background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); }
      `}</style>

      {view === 'START' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8 animate-in fade-in">
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-500 drop-shadow-2xl text-center classic-title">سباق المعرفة</h1>
          <div className="w-full max-w-md glass-box p-8 rounded-[2.5rem] space-y-5 shadow-2xl">
            <input className="w-full bg-slate-800 border-2 border-white/5 p-4 rounded-2xl text-center text-xl font-bold outline-none focus:border-blue-500" placeholder="المتسابق الأول" value={pNames.p1} onChange={e => setPNames({...pNames, p1: e.target.value})} />
            <input className="w-full bg-slate-800 border-2 border-white/5 p-4 rounded-2xl text-center text-xl font-bold outline-none focus:border-blue-500" placeholder="المتسابق الثاني" value={pNames.p2} onChange={e => setPNames({...pNames, p2: e.target.value})} />
            <button onClick={handleStartGame} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black text-2xl shadow-xl active:scale-95 transition-all">ابدأ التحدي</button>
          </div>
          <p className="text-blue-400 font-bold tracking-widest uppercase">إعداد: محمد القرني</p>
        </div>
      )}

      {view === 'GAME' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <header className="h-[12vh] bg-slate-900/90 backdrop-blur-xl flex justify-between items-center px-4 border-b border-white/10 shadow-lg">
            <div className={`flex-1 p-3 rounded-2xl text-center transition-all ${turn === 'P1' ? 'bg-emerald-600 ring-4 ring-emerald-500/30' : 'opacity-30'}`}>
              <div className="font-black text-xl truncate">{pNames.p1}</div>
            </div>
            <div className="px-6 text-2xl font-black italic text-blue-400 whitespace-nowrap">الجولة 1</div>
            <div className={`flex-1 p-3 rounded-2xl text-center transition-all ${turn === 'P2' ? 'bg-rose-600 ring-4 ring-rose-500/30' : 'opacity-30'}`}>
              <div className="font-black text-xl truncate">{pNames.p2}</div>
            </div>
          </header>

          <main className="flex-1 flex items-center justify-center p-2 relative bg-[#010409]">
            <svg viewBox={`-50 -50 ${VB_WIDTH + 100} ${VB_HEIGHT + 100}`} className="w-full h-full object-contain">
              {grid.map(c => {
                const xOff = (c.r % 2 === 0) ? 0 : (HEX_WIDTH / 2);
                const cx = (c.c * HEX_WIDTH) + xOff + (HEX_WIDTH / 2);
                const cy = (c.r * VERT_DIST) + (HEX_HEIGHT / 2);
                return (
                  <g key={c.id} className="cursor-pointer group" onClick={() => handleTileClick(c)}>
                    <polygon 
                      points={Array.from({length: 6}).map((_, i) => `${cx + HEX_RADIUS * Math.cos((Math.PI/180)*(60*i-30))},${cy + HEX_RADIUS * Math.sin((Math.PI/180)*(60*i-30))}`).join(' ')} 
                      fill={c.owner === 'P1' ? "#10b981" : c.owner === 'P2' ? "#ef4444" : "#1e293b"} 
                      stroke="rgba(255,255,255,0.2)" strokeWidth="6" 
                      className="transition-all duration-200 group-hover:brightness-150"
                    />
                    {!c.owner && (
                      <text 
                        x={cx} y={cy} 
                        textAnchor="middle" 
                        dominantBaseline="central" 
                        fill="white" 
                        fontWeight="900"
                        fontSize={isMobile ? "45" : "26"} 
                        style={{ pointerEvents: 'none', filter: 'drop-shadow(0 2px 4px black)' }}
                      >
                        {c.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </main>
          
          <footer className="h-[8vh] flex items-center justify-center p-2">
             <button onClick={() => window.location.reload()} className="bg-white/5 border border-white/10 px-6 py-2 rounded-full text-slate-400 font-bold hover:bg-white/10 transition-all flex items-center gap-2">
                <LogOut size={18}/> إنهاء المسابقة
             </button>
          </footer>
        </div>
      )}

      {activeQ && (
        <div className="fixed inset-0 bg-black/98 z-[100] flex items-center justify-center p-4 backdrop-blur-3xl animate-in zoom-in duration-200">
          <div className="bg-slate-900 border-4 border-blue-500/40 w-full max-w-4xl rounded-[4rem] p-6 md:p-12 space-y-8 text-center shadow-[0_0_100px_rgba(59,130,246,0.3)]">
            <div className={`inline-block px-10 py-3 rounded-full text-2xl font-black mb-4 shadow-lg ${turn === 'P1' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
              {activeQ.tile.label}
            </div>
            <h3 className="text-3xl md:text-5xl font-black leading-tight text-white">{activeQ.q}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
              {activeQ.opts.map((o, i) => (
                <button key={i} onClick={() => submitAnswer(o)} className="bg-slate-800 hover:bg-blue-700 p-6 md:p-8 rounded-[2.5rem] text-2xl md:text-3xl font-bold transition-all border border-white/5 active:scale-95 shadow-lg">
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

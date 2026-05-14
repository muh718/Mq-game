import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, LogOut, Zap, ChevronRight } from 'lucide-react';
import { QUESTIONS_DATABASE } from './questionsData';

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

const TOPICS = ['إسلاميات', 'جغرافيا', 'تاريخ', 'علوم', 'أدب', 'فن', 'رياضة', 'عامة'];

// ==========================================
// التنسيقات والتحسينات البصرية
// ==========================================
const CSS_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&family=Amiri:wght@700&display=swap');
  
  body, html { 
    font-family: 'Tajawal', sans-serif; 
    margin: 0;
    padding: 0;
    background-color: #020617;
    color: white;
    user-select: none;
    overflow: hidden !important; 
    position: fixed;
    width: 100vw;
    height: 100dvh; 
  }

  .classic-title { font-family: 'Amiri', serif; }
  
  .glass-box {
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(40px);
    border: 1px solid rgba(255,255,255,0.1);
  }

  .neon-glow { filter: blur(30px); opacity: 0.6; }
  @media (min-width: 768px) {
    .neon-glow { filter: blur(50px); }
  }

  .input-field {
    width: 100%;
    background: rgba(30, 41, 59, 0.7);
    border: 2px solid rgba(255,255,255,0.1);
    color: white !important;
    text-align: center;
    padding: clamp(0.5rem, 2vh, 1.5rem);
    border-radius: clamp(1rem, 3vh, 2rem);
    font-size: clamp(1rem, 3vh, 1.5rem);
    font-weight: 700;
    outline: none;
  }
  .input-field:focus { border-color: #3b82f6; background: rgba(30, 41, 59, 1); }

  .win-text-huge { font-size: clamp(2rem, 8vw, 8rem); font-weight: 900; }
  .btn-match { font-size: clamp(1rem, 3vw, 1.5rem); padding: 1rem 2rem; border-radius: 2rem; font-weight: 900; }
  
  /* تم إزالة مقاس الخط من هنا ليتم التحكم به بذكاء من داخل الكود البرمجي */
  .hex-text { 
    fill: white;
    pointer-events: none;
    filter: drop-shadow(0 3px 6px rgba(0,0,0,0.9));
  }

  .hex-group { 
    transition: filter 0.2s ease-out; 
    cursor: pointer;
  }
  .hex-group:hover { 
    filter: brightness(1.4) drop-shadow(0 0 8px rgba(255,255,255,0.4)); 
  }
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
const VB_PADDING = 100; 

export default function App() {
  const [view, setView] = useState('START'); 
  const [pNames, setPNames] = useState({ p1: '', p2: '' });
  const [matchRounds, setMatchRounds] = useState(3);
  const [currentRound, setCurrentRound] = useState(1);
  const [scores, setScores] = useState({ P1: 0, P2: 0 });
  
  const [grid, setGrid] = useState([]);
  const [turn, setTurn] = useState('P1');
  const [activeQ, setActiveQ] = useState(null);
  const [roundWinner, setRoundWinner] = useState(null);

  // ميزة اكتشاف نوع الجهاز (جوال أو كمبيوتر) لضبط حجم الخط
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // التحقق من عرض الشاشة عند بدء التطبيق
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    // مراقبة تغيير حجم الشاشة
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
    const newGrid = [];
    const topicsList = shuffle([...TOPICS, ...TOPICS, ...TOPICS, ...TOPICS]); 
    
    let idx = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        newGrid.push({ id: `${r}-${c}`, r, c, label: topicsList[idx], owner: null });
        idx++;
      }
    }
    setGrid(newGrid);
    setTurn('P1');
    setRoundWinner(null);
    setView('GAME');
  };

  const getNeighbors = (r, c) => {
    const parity = r % 2;
    const offsets = parity === 0 ? [[0, -1], [0, 1], [-1, -1], [-1, 0], [1, -1], [1, 0]] : [[0, -1], [0, 1], [-1, 0], [-1, 1], [1, 0], [1, 1]];
    return offsets.map(([dr, dc]) => ({ r: r + dr, c: c + dc }))
      .filter(p => p.r >= 0 && p.r < GRID_SIZE && p.c >= 0 && p.c < GRID_SIZE);
  };

  const checkWin = (currentGrid, player) => {
    const dir = roundConfig[player].dir;
    const starts = currentGrid.filter(cell => cell.owner === player && (dir === 'VERT' ? cell.r === 0 : cell.c === GRID_SIZE - 1));
    if (starts.length === 0) return false;
    const visited = new Set();
    const queue = [...starts];
    while (queue.length > 0) {
      const curr = queue.shift();
      const key = `${curr.r}-${curr.c}`;
      if (visited.has(key)) continue;
      visited.add(key);
      if (dir === 'VERT' ? curr.r === GRID_SIZE - 1 : curr.c === 0) return true;
      getNeighbors(curr.r, curr.c).forEach(pos => {
        const nb = currentGrid.find(n => n.r === pos.r && n.c === pos.c);
        if (nb && nb.owner === player && !visited.has(`${pos.r}-${pos.c}`)) queue.push(nb);
      });
    }
    return false;
  };

  const handleTileClick = (tile) => {
    if (tile.owner || roundWinner) return;

    let history = JSON.parse(localStorage.getItem('quiz_history') || '{}');
    const now = Date.now();
    let isHistoryUpdated = false;
    for (let id in history) {
      if (now - history[id] > TWENTY_FOUR_HOURS) {
        delete history[id];
        isHistoryUpdated = true;
      }
    }
    if (isHistoryUpdated) {
      localStorage.setItem('quiz_history', JSON.stringify(history));
    }

    let possibleQs = QUESTIONS_DATABASE.filter(q => q.topic === tile.label && !history[q.id]);
    
    if (possibleQs.length === 0) {
      possibleQs = QUESTIONS_DATABASE.filter(q => q.topic === tile.label);
    }

    if (possibleQs.length === 0) {
        possibleQs = [{ id: "fallback", topic: tile.label, q: `لا توجد أسئلة حالياً في قسم (${tile.label})`, a: ["تخطي"] }];
    }
    
    const selectedQ = possibleQs[Math.floor(Math.random() * possibleQs.length)]; 

    setActiveQ({ 
        tile, 
        qId: selectedQ.id,
        q: selectedQ.q, 
        opts: shuffle(selectedQ.a), 
        ans: selectedQ.a[0] 
    });
  };

  const submitAnswer = (opt) => {
    const isCorrect = opt === activeQ.ans;
    const newGrid = [...grid];
    const idx = newGrid.findIndex(t => t.id === activeQ.tile.id);

    if (activeQ.qId !== "fallback") {
        let history = JSON.parse(localStorage.getItem('quiz_history') || '{}');
        history[activeQ.qId] = Date.now();
        localStorage.setItem('quiz_history', JSON.stringify(history));
    }

    if (isCorrect) {
      newGrid[idx].owner = turn;
      if (checkWin(newGrid, turn)) {
        const nextScores = { ...scores, [turn]: scores[turn] + 1 };
        setScores(nextScores);
        setRoundWinner(turn);
        const majority = Math.floor(matchRounds / 2) + 1;
        setTimeout(() => {
          if (nextScores[turn] >= majority) setView('MATCH_OVER');
          else setView('ROUND_OVER');
        }, 1500);
      }
    }
    
    setGrid(newGrid);
    setActiveQ(null);
    if (!roundWinner) setTurn(turn === 'P1' ? 'P2' : 'P1');
  };

  return (
    <div className="w-screen h-[100dvh] fixed inset-0 flex flex-col bg-[#020617] overflow-hidden" dir="rtl">
      <style>{CSS_STYLES}</style>

      {view === 'START' && (
        <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-4 animate-in fade-in space-y-4 md:space-y-8 min-h-0">
          <div className="text-center space-y-2 shrink-0">
            <h1 className="text-[clamp(3.5rem,12vw,9rem)] leading-none classic-title font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-500 drop-shadow-2xl">
              سباق المعرفة
            </h1>
            <p className="text-blue-300 font-bold text-[clamp(1rem,4vw,2rem)] tracking-widest uppercase m-0">
              محمد القرني
            </p>
          </div>
          <div className="glass-box p-6 md:p-10 rounded-[2rem] w-full max-w-xl flex flex-col gap-3 md:gap-5 shadow-2xl shrink-0">
            <input type="text" placeholder="اسم المتسابق الأول" className="input-field" value={pNames.p1} onChange={e => setPNames({...pNames, p1: e.target.value})} />
            <input type="text" placeholder="اسم المتسابق الثاني" className="input-field" value={pNames.p2} onChange={e => setPNames({...pNames, p2: e.target.value})} />
            <button onClick={() => setView('ROUND_SELECT')} disabled={!pNames.p1 || !pNames.p2} className="w-full bg-blue-600 py-3 md:py-5 mt-2 rounded-[1.5rem] font-black text-[clamp(1.2rem,4vw,2rem)] active:scale-95 transition-all shadow-xl disabled:opacity-50">
              ابدأ التحدي
            </button>
          </div>
        </div>
      )}

      {view === 'ROUND_SELECT' && (
        <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-4 animate-in zoom-in space-y-4 md:space-y-8 min-h-0">
          <Trophy className="w-[15vh] h-[15vh] max-h-[140px] text-yellow-500 animate-bounce shrink-0" />
          <h2 className="text-[clamp(2rem,6vw,5rem)] font-black classic-title text-center shrink-0">اختر طول المسابقة</h2>
          <div className="grid grid-cols-2 gap-3 md:gap-6 w-full max-w-2xl h-[40vh] max-h-[400px]">
             {[1, 3, 5, 7].map(num => (
               <button key={num} onClick={() => { setMatchRounds(num); handleStartGame(); }} className="group h-full w-full flex flex-col items-center justify-center bg-slate-900 border-2 md:border-4 border-slate-700 rounded-[2rem] hover:border-blue-500 transition-all active:scale-95">
                  <span className="text-[clamp(3rem,10vh,8rem)] leading-none font-black block">{num}</span>
                  <span className="text-[clamp(0.8rem,3vh,1.5rem)] font-bold text-slate-500">جولات فوز</span>
               </button>
             ))}
          </div>
        </div>
      )}

      {view === 'GAME' && (
        <div className="flex-1 flex flex-col w-full h-[100dvh] min-h-0 overflow-hidden">
          
          <header className="shrink-0 h-[10vh] min-h-[60px] max-h-[100px] p-2 glass-box flex justify-between items-center z-50 border-b border-white/10 gap-2">
            <div className={`flex-1 h-full px-2 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${turn === 'P1' ? 'ring-2 ring-emerald-500/30 bg-emerald-500/20' : 'opacity-40 grayscale'}`} style={{ borderColor: '#10b981' }}>
              <span className="text-[clamp(0.6rem,1.5vh,1rem)] font-black mb-1">{roundConfig.P1.label}</span>
              <div className="text-[clamp(0.9rem,2.5vh,1.5rem)] font-black truncate w-full text-center">{pNames.p1} • {scores.P1}</div>
            </div>
            <div className="shrink-0 px-2 md:px-6 text-center">
               <div className="classic-title text-[clamp(1rem,3vh,2.5rem)] whitespace-nowrap">الجولة {currentRound}</div>
            </div>
            <div className={`flex-1 h-full px-2 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${turn === 'P2' ? 'ring-2 ring-rose-500/30 bg-rose-500/20' : 'opacity-40 grayscale'}`} style={{ borderColor: '#ef4444' }}>
              <span className="text-[clamp(0.6rem,1.5vh,1rem)] font-black mb-1">{roundConfig.P2.label}</span>
              <div className="text-[clamp(0.9rem,2.5vh,1.5rem)] font-black truncate w-full text-center">{pNames.p2} • {scores.P2}</div>
            </div>
          </header>

          <main className="flex-1 min-h-0 w-full flex items-center justify-center relative bg-[#010409] overflow-hidden p-2">
            <svg viewBox={`${-VB_PADDING} ${-VB_PADDING} ${VB_WIDTH + VB_PADDING * 2} ${VB_HEIGHT + VB_PADDING * 2}`} className="w-full h-full object-contain drop-shadow-[0_0_40px_rgba(0,0,0,0.8)]">
                <g className="neon-glow">
                    <rect x={0} y={-15} width={VB_WIDTH} height={130} fill={roundConfig.bg.vSide} rx="30" />
                    <rect x={0} y={VB_HEIGHT - 115} width={VB_WIDTH} height={130} fill={roundConfig.bg.vSide} rx="30" />
                    <rect x={-15} y={0} width={130} height={VB_HEIGHT} fill={roundConfig.bg.hSide} rx="30" />
                    <rect x={VB_WIDTH - 115} y={0} width={130} height={VB_HEIGHT} fill={roundConfig.bg.hSide} rx="30" />
                </g>
                <g>
                  {grid.map(c => {
                    const xOff = (c.r % 2 === 0) ? 0 : (HEX_WIDTH / 2);
                    const cx = (c.c * HEX_WIDTH) + xOff + (HEX_WIDTH / 2);
                    const cy = (c.r * VERT_DIST) + (HEX_HEIGHT / 2);
                    return (
                      <g key={c.id} className="hex-group" onClick={() => handleTileClick(c)}>
                        <polygon points={Array.from({length: 6}).map((_, i) => `${cx + HEX_RADIUS * Math.cos((Math.PI/180)*(60*i-30))},${cy + HEX_RADIUS * Math.sin((Math.PI/180)*(60*i-30))}`).join(' ')} fill={c.owner === 'P1' ? "#10b981" : c.owner === 'P2' ? "#ef4444" : "#1e293b"} stroke={c.owner ? "#ffffff" : "#475569"} strokeWidth="6" />
                        {!c.owner && (
                           // التعديل الذكي هنا: إذا كان جوال يكون الخط 40، إذا كمبيوتر يكون الخط 24
                          <text 
                             x={cx} y={cy} 
                             textAnchor="middle" 
                             dominantBaseline="central" 
                             className="hex-text"
                             fontSize={isMobile ? "40" : "24"} 
                             fontWeight="900"
                          >
                            {c.label}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
            </svg>
          </main>
          
          <footer className="shrink-0 h-[8vh] min-h-[50px] max-h-[80px] flex items-center justify-center z-50">
             <button onClick={() => window.location.reload()} className="h-[70%] text-slate-400 text-[clamp(0.8rem,2vh,1.2rem)] font-bold px-6 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 transition flex items-center gap-2"><LogOut size={16}/> إنهاء المسابقة</button>
          </footer>
        </div>
      )}

      {activeQ && (
        <div className="fixed inset-0 w-screen h-[100dvh] bg-black/98 z-[100] flex items-center justify-center p-3 md:p-6 animate-in fade-in backdrop-blur-3xl overflow-hidden">
          <div className="glass-box border-2 md:border-4 flex flex-col w-full h-full max-h-full md:max-h-[90vh] max-w-5xl rounded-[2rem] md:rounded-[4rem] overflow-hidden animate-in zoom-in" style={{ borderColor: turn === 'P1' ? '#10b981' : '#ef4444' }}>
            
            <div className="shrink-0 h-[20%] min-h-[80px] bg-white/5 px-4 flex justify-between items-center border-b border-white/10">
               <div className={`h-[70%] px-6 rounded-[1rem] flex items-center justify-center font-black text-[clamp(1.5rem,4vh,3rem)] shadow-xl ${turn === 'P1' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                 {activeQ.tile.label}
               </div>
               <div className="text-[clamp(1.5rem,5vw,3rem)] font-black classic-title pr-4">سؤال التحدي</div>
            </div>

            <div className="flex-1 flex flex-col p-4 md:p-8 space-y-4 min-h-0 h-[80%]">
              
              <div className="flex-1 flex items-center justify-center min-h-0">
                 <h3 className="text-center text-[clamp(1.2rem,4vh,3rem)] leading-snug md:leading-tight font-black overflow-hidden break-words">
                   {activeQ.q}
                 </h3>
              </div>
              
              <div className="flex-[2] grid grid-cols-1 md:grid-cols-2 gap-3 min-h-0 pb-2">
                {activeQ.opts.map((o, i) => (
                  <button key={i} onClick={() => submitAnswer(o)} className="w-full h-full min-h-0 bg-slate-800/60 hover:bg-blue-700 rounded-[1rem] md:rounded-[2rem] border-2 border-white/10 transition-all flex items-center justify-center text-center px-2 text-[clamp(1rem,3vh,2.2rem)] font-bold active:scale-95 leading-snug overflow-hidden">
                    {o}
                  </button>
                ))}
              </div>

            </div>
          </div>
        </div>
      )}

      {view === 'ROUND_OVER' && (
        <div className="fixed inset-0 w-screen h-[100dvh] bg-[#020617] z-[200] flex flex-col items-center justify-center p-6 animate-in zoom-in overflow-hidden text-center">
          <Zap className={`w-[20vh] h-[20vh] mb-6 ${roundWinner === 'P1' ? 'text-emerald-400' : 'text-rose-400'} animate-pulse`} />
          <h2 className="text-[clamp(2.5rem,8vw,6rem)] font-black classic-title mb-8 leading-tight">فوز مستحق لـ<br/><span style={{ color: roundConfig[roundWinner].color }}>{roundWinner === 'P1' ? pNames.p1 : pNames.p2}</span></h2>
          <button onClick={() => { setCurrentRound(n => n + 1); handleStartGame(); }} className="btn-match bg-blue-600 text-white shadow-2xl active:scale-95 flex items-center gap-4">الجولة التالية <ChevronRight className="w-6 h-6"/></button>
        </div>
      )}

      {view === 'MATCH_OVER' && (
        <div className="fixed inset-0 w-screen h-[100dvh] bg-[#020617] z-[300] flex flex-col items-center justify-center p-6 animate-in zoom-in overflow-hidden text-center">
          <Trophy className="w-[25vh] h-[25vh] text-yellow-400 drop-shadow-[0_0_100px_rgba(234,179,8,0.4)] mb-8" />
          <h2 className="text-[clamp(2rem,6vw,5rem)] font-black classic-title text-white mb-4">بطل المسابقة النهائي!</h2>
          <p className="text-[clamp(3.5rem,10vw,8rem)] font-black italic mb-12 break-words max-w-full" style={{ color: scores.P1 > scores.P2 ? '#10b981' : '#ef4444' }}>
            {scores.P1 > scores.P2 ? pNames.p1 : pNames.p2}
          </p>
          <button onClick={() => window.location.reload()} className="btn-match bg-white text-blue-950 shadow-2xl active:scale-95">بدء تحدي جديد</button>
        </div>
      )}
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Plus, Minus, ArrowRight, X } from 'lucide-react';

const translations = {
  en: { 
    logSet: 'LOG SET', history: 'HISTORY', exercises: 'EXERCISES',
    reps: 'REPS', kg: 'KG', workoutName: 'WORKOUT NAME',
    search: 'SEARCH EXERCISE...', addCustom: '+ CREATE CUSTOM', 
    today: 'TODAY\'S SETS', save: 'SAVE', customPlaceholder: 'EXERCISE NAME'
  },
  ru: { 
    logSet: 'ЗАПИСАТЬ', history: 'ИСТОРИЯ', exercises: 'УПРАЖНЕНИЯ',
    reps: 'ПОВТ', kg: 'КГ', workoutName: 'НАЗВАНИЕ ТРЕНИРОВКИ',
    search: 'ПОИСК УПРАЖНЕНИЯ...', addCustom: '+ СОЗДАТЬ СВОЕ', 
    today: 'ПОДХОДЫ ЗА СЕГОДНЯ', save: 'СОХРАНИТЬ', customPlaceholder: 'НАЗВАНИЕ'
  }
};

const initialExercises = [

  { id: 1, name_en: 'BENCH PRESS', name_ru: 'ЖИМ ЛЕЖА', target: 'Chest' },
  { id: 2, name_en: 'INCLINE BENCH PRESS', name_ru: 'ЖИМ ЛЕЖА ПОД УГЛОМ', target: 'Chest' },
  { id: 3, name_en: 'CHEST FLYES', name_ru: 'СВЕДЕНИЕ РУК (БАБОЧКА)', target: 'Chest' },

  { id: 4, name_en: 'PULL-UPS', name_ru: 'ПОДТЯГИВАНИЯ', target: 'Back' },
  { id: 5, name_en: 'LAT PULLDOWN', name_ru: 'ТЯГА ВЕРХНЕГО БЛОКА', target: 'Back' },
  { id: 6, name_en: 'SEATED CABLE ROW', name_ru: 'ТЯГА НИЖНЕГО БЛОКА', target: 'Back' },
  { id: 7, name_en: 'BARBELL ROW', name_ru: 'ТЯГА ШТАНГИ В НАКЛОНЕ', target: 'Back' },

  { id: 8, name_en: 'SQUAT', name_ru: 'ПРИСЕДАНИЯ СО ШТАНГОЙ', target: 'Legs' },
  { id: 9, name_en: 'LEG PRESS', name_ru: 'ЖИМ НОГАМИ', target: 'Legs' },
  { id: 10, name_en: 'ROMANIAN DEADLIFT', name_ru: 'РУМЫНСКАЯ ТЯГА', target: 'Legs' },
  { id: 11, name_en: 'LEG EXTENSION', name_ru: 'РАЗГИБАНИЕ НОГ', target: 'Legs' },
  { id: 12, name_en: 'LEG CURL', name_ru: 'СГИБАНИЕ НОГ', target: 'Legs' },
  { id: 13, name_en: 'CALF RAISES', name_ru: 'ПОДЪЕМ НА ИКРЫ', target: 'Legs' },

  { id: 14, name_en: 'OVERHEAD PRESS', name_ru: 'АРМЕЙСКИЙ ЖИМ', target: 'Shoulders' },
  { id: 15, name_en: 'LATERAL RAISES', name_ru: 'МАХИ ГАНТЕЛЯМИ В СТОРОНЫ', target: 'Shoulders' },

  { id: 16, name_en: 'BICEP CURL', name_ru: 'ПОДЪЕМ НА БИЦЕПС', target: 'Arms' },
  { id: 17, name_en: 'TRICEP EXTENSION', name_ru: 'РАЗГИБАНИЯ НА ТРИЦЕПС', target: 'Arms' },
  { id: 18, name_en: 'DIPS', name_ru: 'ОТЖИМАНИЯ НА БРУСЬЯХ', target: 'Arms' }
];

export default function App() {
  const [lang, setLang] = useState('ru');
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState('log');
  const [exercisesList, setExercisesList] = useState(initialExercises);
  const [activeExercise, setActiveExercise] = useState(initialExercises[14]);
  const [weight, setWeight] = useState(80);
  const [reps, setReps] = useState(5);
  const [workoutName, setWorkoutName] = useState('FULL BODY');
  const [sets, setSets] = useState([]);
  
  const [showExercises, setShowExercises] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customName, setCustomName] = useState('');

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.expand();
      const tgLang = window.Telegram.WebApp.initDataUnsafe?.user?.language_code;
      if (tgLang === 'en' || tgLang === 'ru') {
        setLang(tgLang);
      }
    }
  }, []);

  const handleWeightChange = (delta) => {
    setWeight(prev => {
      const newWeight = +(prev + delta).toFixed(2);
      return Math.max(0, newWeight);
    });
  };

  const handleRepsChange = (delta) => {
    setReps(prev => Math.max(1, prev + delta));
  };

  const handleLogSet = () => {
    const newSet = {
      id: Date.now(),
      exercise: lang === 'en' ? activeExercise.name_en : activeExercise.name_ru,
      weight,
      reps
    };
    setSets([newSet, ...sets]);
    
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');

      fetch('/api/sets', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': window.Telegram.WebApp.initData || ''
        },
        body: JSON.stringify({
          exercise_id: activeExercise.id,
          weight: weight,
          reps: reps
        })
      }).catch(err => console.error("Failed to log set:", err));
    }
  };

  const handleSaveCustom = () => {
    if (!customName.trim()) return;
    const newEx = {
      id: Date.now(),
      name_en: customName.toUpperCase(),
      name_ru: customName.toUpperCase(),
      target: 'Custom'
    };
    setExercisesList([newEx, ...exercisesList]);
    setActiveExercise(newEx);
    setIsCreatingCustom(false);
    setShowExercises(false);
    setCustomName('');
  };

  const filteredExercises = exercisesList.filter(ex => 
    ex.name_en.includes(searchQuery.toUpperCase()) || 
    ex.name_ru.toUpperCase().includes(searchQuery.toUpperCase())
  );

  const getWeightFontSize = (w) => {
    const len = w.toString().length;
    if (len <= 2) return 'text-[11rem]';
    if (len === 3) return 'text-[9rem]';
    if (len === 4) return 'text-[7.5rem]';
    return 'text-[5.5rem]';
  };

  const currentDate = new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  
  const activeExName = lang === 'en' ? activeExercise.name_en : activeExercise.name_ru;

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#E5E0D8] relative overflow-hidden uppercase text-[#111]">
      
      {}
      <div 
        className="bg-[#111] text-[#E5E0D8] p-4 flex justify-between items-start cursor-pointer active:bg-black transition-colors"
        onClick={() => { setShowExercises(true); setIsCreatingCustom(false); setSearchQuery(''); }}
      >
        <div 
          className={`font-bold leading-[0.85] pt-2 pr-4 break-words ${
            activeExName.length > 18 ? 'text-3xl' : 'text-4xl'
          }`}
        >
          {activeExName}
        </div>
        
        <div className="bg-[#C4281C] text-white px-2 pt-1 flex-shrink-0 mt-1 shadow-[4px_4px_0px_0px_rgba(229,224,216,0.1)]">
          <ChevronDown size={32} />
        </div>
      </div>

      {}
      <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        
        {activeTab === 'log' ? (
          <div className="flex flex-col h-full">
            <div 
              className="bg-[#C4281C] text-[#E5E0D8] py-8 px-6 flex justify-center items-end -mt-2 shadow-2xl relative z-10"
              style={{ clipPath: 'polygon(0 0, 100% 5%, 100% 100%, 0 95%)' }}
            >
              <span 
                className={`${getWeightFontSize(weight)} font-bold tracking-tighter transition-all duration-200`} 
                style={{ lineHeight: '0.75' }}
              >
                {weight}
              </span>
              <span className="text-5xl font-bold mb-2 ml-2">{t.kg}</span>
            </div>

            <div className="px-4 py-6 space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {[-5, -2.5, +2.5, +5].map(val => (
                  <button key={val} onClick={() => handleWeightChange(val)} className="bg-[#111] text-[#E5E0D8] text-3xl font-bold py-3 pt-4 leading-none active:scale-95">
                    {val > 0 ? `+${val}` : val}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <button onClick={() => handleWeightChange(-1.25)} className="bg-[#111] text-[#E5E0D8] text-3xl font-bold py-2 pt-3 leading-none active:scale-95">-1.25</button>
                 <button onClick={() => handleWeightChange(1.25)} className="bg-[#111] text-[#E5E0D8] text-3xl font-bold py-2 pt-3 leading-none active:scale-95">+1.25</button>
              </div>

              <div className="flex justify-between items-stretch gap-2 mt-4 h-24">
                <div className="bg-[#111] text-[#E5E0D8] rounded-full w-24 h-24 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-6xl font-bold leading-none mt-2">{reps}</span>
                  <span className="text-lg leading-none tracking-widest">{t.reps}</span>
                </div>
                <button onClick={() => handleRepsChange(-1)} className="flex-1 border-4 border-[#111] text-[#111] flex items-center justify-center active:bg-black/10">
                  <Minus size={40} strokeWidth={4} />
                </button>
                <button onClick={() => handleRepsChange(1)} className="flex-1 bg-[#C4281C] text-white flex items-center justify-center active:bg-red-800">
                  <Plus size={40} strokeWidth={4} />
                </button>
              </div>

              <button onClick={handleLogSet} className="w-full bg-[#111] flex mt-4 active:scale-95 transition-transform">
                <div className="flex-1 text-[#E5E0D8] text-5xl font-bold text-left px-6 py-4 pt-6 leading-none">
                  {t.logSet}
                </div>
                <div className="bg-[#C4281C] w-20 flex items-center justify-center text-white">
                  <ArrowRight size={40} strokeWidth={4} />
                </div>
              </button>
              
              {sets.length > 0 && (
                <div className="mt-8 border-t-4 border-[#111] pt-4">
                  <h3 className="text-3xl font-bold mb-2">{t.today}</h3>
                  {sets.slice(0, 3).map((set, i) => (
                    <div key={set.id} className="flex justify-between items-center border-b-4 border-[#111] py-2 text-3xl font-bold">
                      <span className="opacity-50 w-8">{(sets.length - i).toString().padStart(2, '0')}</span>
                      <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap pr-2">{set.exercise}</span>
                      <span className="whitespace-nowrap">{set.weight} {t.kg} × {set.reps}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-6">
            <div className="border-4 border-[#111] bg-[#C4281C] p-4 shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] relative">
              <button 
                onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
                className="absolute top-4 right-4 border-2 border-[#111] bg-white text-[#111] px-2 pt-1 font-bold text-xl leading-none active:bg-gray-200"
              >
                {lang.toUpperCase()}
              </button>
              <div className="text-[#111] text-2xl mb-1 font-bold">{t.workoutName}</div>
              <input 
                type="text" 
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value.toUpperCase())}
                className="w-[80%] bg-transparent text-[#E5E0D8] text-5xl font-bold outline-none border-b-4 border-[#111] placeholder-[#111]/30 leading-none pt-2"
              />
              <div className="text-[#111] text-4xl font-bold mt-3 pt-2 border-t-4 border-[#111]">
                {currentDate}
              </div>
            </div>

            <div className="space-y-4 pt-4">
               <div className="border-4 border-[#111] bg-white p-4 shadow-[8px_8px_0px_0px_rgba(17,17,17,1)]">
                  <h3 className="text-4xl font-bold border-b-4 border-[#111] pb-2 mb-2 leading-none pt-2 truncate">
                    {sets[0]?.exercise || 'NO SETS YET'}
                  </h3>
                  {sets.map((set, idx) => (
                    <div key={set.id} className="flex justify-between items-center text-3xl py-2 font-bold border-b-2 border-[#111]/20 last:border-0">
                      <span className="w-10 opacity-40">{(sets.length - idx).toString().padStart(2, '0')}</span>
                      <span className="flex-1">{set.weight} {t.kg}</span>
                      <span className="mr-6">× {set.reps}</span>
                      <button onClick={() => setSets(sets.filter(s => s.id !== set.id))} className="text-[#C4281C]">
                        <X size={32} strokeWidth={4} />
                      </button>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 w-full flex border-t-4 border-[#111] bg-[#E5E0D8] z-40">
        <button 
          onClick={() => setActiveTab('log')}
          className={`flex-1 text-4xl font-bold py-3 pt-5 leading-none transition-colors border-r-4 border-[#111] ${activeTab === 'log' ? 'bg-[#111] text-[#E5E0D8]' : 'text-[#111]'}`}
        >
          {t.logSet}
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 text-4xl font-bold py-3 pt-5 leading-none transition-colors ${activeTab === 'history' ? 'bg-[#111] text-[#E5E0D8]' : 'text-[#111]'}`}
        >
          {t.history}
        </button>
      </div>

      {showExercises && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/80">
          <div className="bg-[#E5E0D8] h-[85vh] border-t-4 border-[#111] flex flex-col shadow-[0_-8px_0px_0px_rgba(196,40,28,1)]">
            <div className="p-4 border-b-4 border-[#111] flex justify-between items-center bg-[#111] text-[#E5E0D8]">
              <span className="text-4xl font-bold pt-2 leading-none">
                {isCreatingCustom ? t.addCustom : t.exercises}
              </span>
              <button onClick={() => setShowExercises(false)} className="bg-[#C4281C] p-1 border-2 border-white">
                <X size={32} color="white" strokeWidth={4} />
              </button>
            </div>
            
            {isCreatingCustom ? (
              <div className="p-6 flex flex-col gap-6">
                <input 
                  type="text" 
                  autoFocus
                  placeholder={t.customPlaceholder}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-white border-4 border-[#111] text-4xl font-bold outline-none p-4 pt-6 placeholder-[#111]/40 uppercase shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] focus:shadow-[8px_8px_0px_0px_rgba(196,40,28,1)] transition-shadow"
                />
                <button 
                  onClick={handleSaveCustom}
                  className="w-full bg-[#111] text-[#E5E0D8] text-4xl font-bold p-4 pt-6 active:scale-95 transition-transform"
                >
                  {t.save}
                </button>
                <button 
                  onClick={() => setIsCreatingCustom(false)}
                  className="w-full bg-transparent border-4 border-[#111] text-[#111] text-4xl font-bold p-4 pt-6 active:bg-gray-200"
                >
                  НАЗАД
                </button>
              </div>
            ) : (
              <>
                <div className="p-4 border-b-4 border-[#111] bg-white">
                  <div className="flex items-center border-4 border-[#111] bg-[#E5E0D8] px-3">
                    <Search size={28} className="text-[#111]" strokeWidth={4} />
                    <input 
                      type="text" 
                      placeholder={t.search}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-3xl font-bold outline-none p-2 pt-4 placeholder-[#111]/40 leading-none uppercase"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto pb-20 no-scrollbar">
                  {filteredExercises.map(ex => (
                    <button 
                      key={ex.id}
                      onClick={() => { setActiveExercise(ex); setShowExercises(false); }}
                      className="w-full text-left p-4 border-b-4 border-[#111] hover:bg-[#C4281C] hover:text-white active:bg-[#C4281C] active:text-white"
                    >
                      <div className="text-4xl font-bold leading-none pt-2">{lang === 'en' ? ex.name_en : ex.name_ru}</div>
                      <div className="text-2xl font-bold opacity-60 leading-none mt-1">{ex.target}</div>
                    </button>
                  ))}
                  <button 
                    onClick={() => setIsCreatingCustom(true)}
                    className="w-full p-6 text-center text-4xl font-bold bg-[#111] text-[#E5E0D8] pt-8 leading-none sticky bottom-0"
                  >
                    {t.addCustom}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
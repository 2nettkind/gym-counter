import React, { useState, useEffect, useMemo } from 'react';
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
  const [lang, setLang] = useState(() => localStorage.getItem('gym_lang') || 'ru');
  const t = translations[lang];

  const [exercisesList, setExercisesList] = useState(() => {
    const saved = localStorage.getItem('gym_exercises');
    return saved ? JSON.parse(saved) : initialExercises;
  });
  
  const [sets, setSets] = useState(() => {
    const saved = localStorage.getItem('gym_sets');
    return saved ? JSON.parse(saved) : [];
  });

  const [workoutName, setWorkoutName] = useState(() => localStorage.getItem('gym_workout_name') || 'FULL BODY');
  
  const [activeTab, setActiveTab] = useState('log');
  const [activeExercise, setActiveExercise] = useState(exercisesList[0]);
  const [weight, setWeight] = useState(80);
  const [reps, setReps] = useState(5);
  
  const [showExercises, setShowExercises] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  
  const [expandedWorkout, setExpandedWorkout] = useState(null);

  const currentDate = new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });

  useEffect(() => localStorage.setItem('gym_lang', lang), [lang]);
  useEffect(() => localStorage.setItem('gym_exercises', JSON.stringify(exercisesList)), [exercisesList]);
  useEffect(() => localStorage.setItem('gym_sets', JSON.stringify(sets)), [sets]);
  useEffect(() => localStorage.setItem('gym_workout_name', workoutName), [workoutName]);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.expand();
      const tgLang = window.Telegram.WebApp.initDataUnsafe?.user?.language_code;
      if (!localStorage.getItem('gym_lang') && (tgLang === 'en' || tgLang === 'ru')) {
        setLang(tgLang);
      }
    }
  }, []);

  const groupedWorkouts = useMemo(() => {
    const groups = [];
    sets.forEach(set => {
      const wKey = `${set.date}_${set.workoutName}`;
      
      let workout = groups.find(g => g.key === wKey);
      if (!workout) {
        workout = { key: wKey, date: set.date, name: set.workoutName, exercises: [] };
        groups.push(workout);
      }
      
      const exName = lang === 'en' ? set.exercise_en : set.exercise_ru;
      let exercise = workout.exercises.find(e => e.name === exName);
      if (!exercise) {
        exercise = { name: exName, sets: [] };
        workout.exercises.push(exercise);
      }
      
      exercise.sets.push(set);
    });
    return groups;
  }, [sets, lang]);

  useEffect(() => {
    if (activeTab === 'history' && !expandedWorkout && groupedWorkouts.length > 0) {
      setExpandedWorkout(groupedWorkouts[0].key);
    }
  }, [activeTab, groupedWorkouts, expandedWorkout]);

 
  const handleWeightChange = (delta) => setWeight(prev => Math.max(0, +(prev + delta).toFixed(2)));
  const handleRepsChange = (delta) => setReps(prev => Math.max(1, prev + delta));
  
  const deleteSet = (id) => setSets(sets.filter(s => s.id !== id));

  const handleLogSet = () => {
    const newSet = {
      id: Date.now(),
      exercise_en: activeExercise.name_en,
      exercise_ru: activeExercise.name_ru,
      weight,
      reps,
      workoutName: workoutName || 'WORKOUT',
      date: currentDate
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
        body: JSON.stringify({ exercise_id: activeExercise.id, weight, reps })
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

  const activeExName = lang === 'en' ? activeExercise.name_en : activeExercise.name_ru;
  const todaySets = sets.filter(s => s.date === currentDate);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#E5E0D8] relative overflow-hidden uppercase text-[#111]">
      
      {}
      <div 
        className="bg-[#111] text-[#E5E0D8] p-4 flex justify-between items-start cursor-pointer active:bg-black transition-colors"
        onClick={() => { setShowExercises(true); setIsCreatingCustom(false); setSearchQuery(''); }}
      >
        <div className={`font-bold leading-[0.85] pt-2 pr-4 break-words ${activeExName.length > 18 ? 'text-3xl' : 'text-4xl'}`}>
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
              <span className={`${getWeightFontSize(weight)} font-bold tracking-tighter transition-all duration-200`} style={{ lineHeight: '0.75' }}>
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
                <div className="flex-1 text-[#E5E0D8] text-5xl font-bold text-left px-6 py-4 pt-6 leading-none">{t.logSet}</div>
                <div className="bg-[#C4281C] w-20 flex items-center justify-center text-white">
                  <ArrowRight size={40} strokeWidth={4} />
                </div>
              </button>
              
              {todaySets.length > 0 && (
                <div className="mt-8 border-t-4 border-[#111] pt-4">
                  <h3 className="text-3xl font-bold mb-2">{t.today}</h3>
                  {todaySets.slice(0, 3).map((set, i) => (
                    <div key={set.id} className="flex justify-between items-center border-b-4 border-[#111] py-2 text-3xl font-bold">
                      <span className="opacity-50 w-8">{(todaySets.length - i).toString().padStart(2, '0')}</span>
                      <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap pr-2">
                        {lang === 'en' ? set.exercise_en : set.exercise_ru}
                      </span>
                      <span className="whitespace-nowrap">{set.weight} {t.kg} × {set.reps}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {}
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
            </div>

            {}
            <div className="space-y-4 pt-2">
              {groupedWorkouts.length === 0 ? (
                <div className="text-center text-4xl font-bold opacity-30 mt-10 pt-2">NO RECORDS</div>
              ) : (
                groupedWorkouts.map((workout) => {
                  const isExpanded = expandedWorkout === workout.key;
                  return (
                    <div key={workout.key} className="border-4 border-[#111] bg-white shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] flex flex-col transition-all">
                      {}
                      <button 
                        onClick={() => setExpandedWorkout(isExpanded ? null : workout.key)}
                        className="w-full flex justify-between items-center p-4 border-b-4 border-[#111] bg-[#E5E0D8] active:bg-[#d6cfc4]"
                      >
                        <div className="text-left overflow-hidden pr-4">
                          <div className="text-2xl font-bold text-[#111]/60 leading-none mb-1">{workout.date}</div>
                          <div className="text-4xl font-bold leading-[0.85] truncate text-[#111] pt-1">{workout.name}</div>
                        </div>
                        <div className="bg-[#111] text-[#E5E0D8] p-1 flex-shrink-0">
                          <ChevronDown size={32} className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </button>

                      {}
                      {isExpanded && (
                        <div className="p-4 space-y-6">
                          {workout.exercises.map((ex) => (
                            <div key={ex.name}>
                              <h4 className="text-3xl font-bold border-b-4 border-[#C4281C] pb-1 mb-2 leading-none pt-2 uppercase">
                                {ex.name}
                              </h4>
                              <div className="space-y-1">
                                {ex.sets.map((set, setIdx) => (
                                  <div key={set.id} className="flex justify-between items-center text-3xl py-1 font-bold border-b-2 border-[#111]/10 last:border-0">
                                    <span className="w-8 opacity-40 text-2xl pt-1">{(ex.sets.length - setIdx).toString().padStart(2, '0')}</span>
                                    <span className="flex-1">{set.weight} {t.kg}</span>
                                    <span className="mr-4">× {set.reps}</span>
                                    <button onClick={() => deleteSet(set.id)} className="text-[#C4281C] p-1 active:bg-red-100">
                                      <X size={24} strokeWidth={4} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {}
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

      {}
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
                <button onClick={handleSaveCustom} className="w-full bg-[#111] text-[#E5E0D8] text-4xl font-bold p-4 pt-6 active:scale-95 transition-transform">{t.save}</button>
                <button onClick={() => setIsCreatingCustom(false)} className="w-full bg-transparent border-4 border-[#111] text-[#111] text-4xl font-bold p-4 pt-6 active:bg-gray-200">НАЗАД</button>
              </div>
            ) : (
              <>
                <div className="p-4 border-b-4 border-[#111] bg-white flex-shrink-0">
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
                
                {}
                <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
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
                  
                  {}
                  <button 
                    onClick={() => setIsCreatingCustom(true)}
                    className="w-full p-6 text-center text-4xl font-bold bg-[#111] text-[#E5E0D8] pt-8 leading-none border-b-4 border-[#111]"
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
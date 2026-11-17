import { useMemo, useState } from 'react';

type SymptomId = 'fever' | 'cough' | 'soreThroat' | 'runnyNose' | 'headache' | 'aches' | 'fatigue' | 'sneezing';
type Assessment = {
  title: string;
  probability: number;
  description: string;
  advice: string[];
};

const symptoms: { id: SymptomId; label: string; hint: string }[] = [
  { id: 'fever', label: 'Повышенная температура', hint: 'Часто при гриппе или ОРВИ' },
  { id: 'cough', label: 'Кашель', hint: 'Сухой или влажный' },
  { id: 'soreThroat', label: 'Боль в горле', hint: 'Дискомфорт или першение' },
  { id: 'runnyNose', label: 'Насморк', hint: 'Заложенность или выделения' },
  { id: 'headache', label: 'Головная боль', hint: 'Боль в области головы' },
  { id: 'aches', label: 'Боли в теле', hint: 'Озноб или ломота' },
  { id: 'fatigue', label: 'Слабость', hint: 'Усталость и недомогание' },
  { id: 'sneezing', label: 'Чихание', hint: 'Повторяющиеся эпизоды' },
];

const commonAdvice = [
  'Пейте достаточно жидкости и регулярно проветривайте помещение.',
  'Отдыхайте и не перегружайте себя физической нагрузкой.',
  'Измеряйте температуру и наблюдайте за общим состоянием.',
];

function assess(selected: Set<SymptomId>, duration: number): Assessment {
  if (selected.has('fever') && selected.has('aches') && selected.has('fatigue') && (duration <= 3)) {
    return { title: 'Вероятно, гриппоподобное заболевание', probability: 78, description: 'Одновременное появление температуры, ломоты и выраженной слабости типично для гриппа или другой ОРВИ.', advice: ['При температурах выше 39 °C свяжитесь с врачом.', 'Важен покой и обильное питьё.', ...commonAdvice] };
  }
  if (selected.has('sneezing') && selected.has('runnyNose') && selected.size <= 4) {
    return { title: 'Вероятно, простуда или аллергия', probability: 69, description: 'Чихание и водянистый насморк характерны для лёгкого воспаления верхних дыхательных путей или аллергической реакции.', advice: ['Обратите внимание на связь симптомов с пылью, цветением и животными.', 'При продолжающейся заложенности обратитесь к врачу.', ...commonAdvice] };
  }
  if (selected.size >= 3) {
    return { title: 'Вероятно, простудное ОРВИ', probability: 72, description: 'Сочетание нескольких типичных респираторных симптомов может указывать на простудное заболевание.', advice: ['Лечите симптомы по общим рекомендациям.', 'Обратитесь к врачу, если состояние ухудшается.', ...commonAdvice] };
  }
  if (selected.size > 0) {
    return { title: 'Недостаточно данных', probability: 44, description: 'Симптомов пока недостаточно для содержательного предположения о возможной причине недомогания.', advice: ['Продолжайте наблюдение за симптомами.', 'При сохранении недомогания обратитесь к врачу.', ...commonAdvice] };
  }
  return { title: 'Симптомы не выбраны', probability: 0, description: 'Выберите хотя бы один симптом для предварительной оценки.', advice: ['Обратитесь за консультацией, если ваше состояние вызывает беспокойство.'] };
}

function App() {
  const [selected, setSelected] = useState<Set<SymptomId>>(new Set());
  const [duration, setDuration] = useState(2);
  const [urgent, setUrgent] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [history, setHistory] = useState<Assessment[]>(() => {
    try { return JSON.parse(localStorage.getItem('health-history') || '[]'); } catch { return []; }
  });

  const result = useMemo(() => assess(selected, duration), [selected, duration]);
  const selectedCount = selected.size;

  const toggle = (id: SymptomId) => {
    setSelected(previous => {
      const next = new Set(previous);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setShowResult(false);
  };

  const submit = () => {
    setShowResult(true);
    if (selectedCount > 0) {
      const next = [result, ...history].slice(0, 5);
      setHistory(next);
      localStorage.setItem('health-history', JSON.stringify(next));
    }
  };

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="На начало"><span className="brand-mark">+</span><span>Клиника</span></a>
        <nav><a href="#symptoms">Симптомы</a><a href="#history">История</a></nav>
      </header>

      <section className="hero" id="top">
        <div>
          <span className="eyebrow">Быстрая предварительная оценка</span>
          <h1>Что беспокоит вас сейчас?</h1>
          <p>Отметьте симптомы и получите рекомендации для следующего шага.</p>
        </div>
        <div className="hero-icon" aria-hidden="true"><span>＋</span></div>
      </section>

      <section className="content" id="symptoms">
        <div className="card">
          <div className="section-heading"><div><span className="step">1</span><h2>Выберите симптомы</h2></div><span className="counter">Выбрано: {selectedCount}</span></div>
          <div className="symptom-grid">
            {symptoms.map(symptom => (
              <button className={`symptom ${selected.has(symptom.id) ? 'selected' : ''}`} key={symptom.id} onClick={() => toggle(symptom.id)} aria-pressed={selected.has(symptom.id)}>
                <span className="check">{selected.has(symptom.id) ? '✓' : '+'}</span>
                <span><strong>{symptom.label}</strong><small>{symptom.hint}</small></span>
              </button>
            ))}
          </div>

          <div className="duration-row">
            <label htmlFor="duration"><strong>Как давно появились симптомы?</strong><small>Укажите примерный срок</small></label>
            <div className="range-wrap">
              <input id="duration" type="range" min="1" max="14" value={duration} onChange={event => { setDuration(Number(event.target.value)); setShowResult(false); }} />
              <b>{duration} {duration === 1 ? 'день' : duration < 5 ? 'дня' : 'дней'}</b>
            </div>
          </div>

          <label className="urgent-option">
            <input type="checkbox" checked={urgent} onChange={event => setUrgent(event.target.checked)} />
            <span>Есть затруднение дыхания, сильная слабость или необъяснимая боль в груди</span>
          </label>

          {urgent && <div className="urgent-alert"><strong>Обратитесь за срочной медицинской помощью.</strong><span>Эти признаки требуют немедленной оценки специалистом.</span></div>}

          <button className="primary" disabled={selectedCount === 0} onClick={submit}>Получить оценку →</button>
        </div>

        {showResult && selectedCount > 0 && (
          <aside className="result card">
            <span className="result-label">Предварительная оценка</span>
            <h2>{urgent ? 'Требуется срочная консультация' : result.title}</h2>
            {!urgent && <><div className="probability"><span style={{ width: `${result.probability}%` }} /><b>{result.probability}%</b></div><p>{result.description}</p></>}
            <div className="advice"><h3>Что делать</h3>{(urgent ? ['Позвоните в экстренную службу или срочно обратитесь к врачу.', 'Не оставайтесь в одиночестве, пока идёте за помощью.'] : result.advice).map((item, index) => <div key={index}><span>✓</span>{item}</div>)}</div>
          </aside>
        )}

        <div className="notice"><span>ⓘ</span><p><strong>Важно:</strong> приложение не ставит медицинский диагноз и не заменяет очную консультацию врача. При тяжёлом состоянии обращайтесь за медицинской помощью.</p></div>
      </section>

      {history.length > 0 && <section className="history card" id="history"><h2>Недавние оценки</h2>{history.map((item, index) => <div className="history-item" key={index}><span>{item.title}</span><small>{item.probability}% вероятность · сохранено на этом устройстве</small></div>)}</section>}
    </main>
  );
}

export default App;

import { Building2, CalendarDays, Car, Check, Globe2, GraduationCap, Home as HomeIcon, KeyRound, Lock, MapPin, Search, Sparkles, Timer, Users, Clock3, Flag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ADDRESSES, addrLine } from '../data'
import { fmtDate, t3 } from '../i18n'
import { LIFE_OPTIONS, addDays, iso, parseIso, today, type Answers } from '../plan'
import { useStore } from '../state'
import { Btn, Check as CheckBox, Choice, Progress, Screen, Section, Why, cx } from '../ui'

export function Intro() {
  const { tr, nav, p } = useStore()
  return (
    <Screen title={t3('Przeprowadzka', 'Moving house', 'Переїзд')} tone="white" footer={<Btn onClick={() => nav({ name: 'triage', param: '0' })}>{tr(t3('Zaczynamy', 'Let’s start', 'Почнімо'))}</Btn>}>
      <div className="px-5 pt-6 pb-4">
        <MovingArt />
        <h2 className="mt-5 text-[26px] leading-tight font-extrabold">{tr(t3('Przeprowadzka bez chaosu', 'Moving without the chaos', 'Переїзд без хаосу'))}</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          {tr(t3('Nie musisz wiedzieć, który urząd za co odpowiada. Powiedz nam, co się zmienia, a my ułożymy całą resztę.', 'You don’t need to know which office does what. Tell us what is changing and we arrange the rest.', 'Не потрібно знати, яка установа за що відповідає. Розкажіть, що змінюється, – решту ми впорядкуємо.'))}
        </p>
        <ul className="mt-5 space-y-3">
          {[
            [<Timer key="a" className="size-5" />, t3('6 krótkich pytań, ok. 1 minuta', '6 short questions, about 1 minute', '6 коротких питань, близько 1 хвилини')],
            [<CalendarDays key="b" className="size-5" />, t3('Plan wszystkich formalności z terminami', 'A plan of every formality, with deadlines', 'План усіх формальностей із термінами')],
            [<Sparkles key="c" className="size-5" />, t3('Co da się zrobić automatycznie – zrobimy za Ciebie', 'What can be automated, we do for you', 'Що можна автоматизувати – зробимо за вас')],
            [<Lock key="d" className="size-5" />, t3('Niczego nie wyślemy bez Twojego potwierdzenia', 'Nothing is sent without your confirmation', 'Нічого не надішлемо без вашого підтвердження')],
          ].map(([icon, label], i) => (
            <li key={i} className="flex items-center gap-3 text-[15px]">
              <span className="grid size-9 place-items-center rounded-xl bg-brand-soft text-brand">{icon as React.ReactNode}</span>
              {tr(label as never)}
            </li>
          ))}
        </ul>
        <div className="mt-6 rounded-2xl border border-line bg-bg p-4 text-[13px] leading-relaxed text-muted">
          <b className="text-ink">{tr(t3('Skorzystamy z danych, które państwo już ma', 'We use data the state already has', 'Ми використаємо дані, які держава вже має'))}</b>
          <br />
          {tr(t3('Rejestr PESEL (Twoje dane i dzieci), CEPiK (pojazdy), księgi wieczyste (tylko sprawdzenie zgodności). Nie musisz niczego przepisywać.', 'PESEL register (your and your children’s data), CEPiK (vehicles), land registers (match check only). No retyping needed.', 'Реєстр PESEL (ваші дані та дітей), CEPiK (авто), поземельні книги (лише перевірка). Нічого не потрібно переписувати.'))}
          <span className="mt-2 block text-[12px]">
            {tr(t3('Zalogowano jako', 'Signed in as', 'Ви увійшли як'))}: <b className="text-ink">{p.name}</b>
          </span>
        </div>
      </div>
    </Screen>
  )
}

function MovingArt() {
  return (
    <svg viewBox="0 0 320 140" className="w-full" aria-hidden>
      <rect x="0" y="0" width="320" height="140" rx="24" fill="#e9f0ff" />
      <path d="M40 104h240" stroke="#c7d6fb" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 10" />
      <g transform="translate(36 48)">
        <path d="M0 26 26 4l26 22v30H0z" fill="#fff" stroke="#9db6f5" strokeWidth="2" />
        <rect x="19" y="36" width="14" height="20" fill="#c7d6fb" />
      </g>
      <g transform="translate(118 58)">
        <rect x="0" y="10" width="56" height="34" rx="4" fill="#1d4ed8" />
        <path d="M56 18h16l10 12v14H56z" fill="#1e3a8a" />
        <circle cx="14" cy="46" r="7" fill="#0f172a" />
        <circle cx="68" cy="46" r="7" fill="#0f172a" />
        <rect x="8" y="0" width="18" height="14" rx="2" fill="#f5c26b" />
        <rect x="28" y="2" width="16" height="12" rx="2" fill="#f7d79c" />
      </g>
      <g transform="translate(222 34)">
        <path d="M0 34 32 8l32 26v36H0z" fill="#fff" stroke="#1d4ed8" strokeWidth="2.5" />
        <rect x="24" y="48" width="16" height="22" fill="#1d4ed8" />
        <circle cx="52" cy="14" r="12" fill="#15803d" />
        <path d="m46 14 4 4 8-8" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  )
}

const STEPS = 6

export function Triage({ step }: { step: number }) {
  const { tr, s, set, nav, replace, p, lang } = useStore()
  const a = s.answers
  const up = (patch: Partial<Answers>) => set((x) => ({ answers: { ...x.answers, ...patch } }))
  const [query, setQuery] = useState('')

  const next = () => {
    if (step === 2 && a.stay === 'short') return nav({ name: 'short' })
    if (step < STEPS - 1) nav({ name: 'triage', param: String(step + 1) })
    else replace({ name: 'building' })
  }

  const titles = [
    t3('Dokąd się przeprowadzasz?', 'Where are you moving to?', 'Куди ви переїжджаєте?'),
    t3('Kiedy zamieszkasz pod nowym adresem?', 'When do you move in?', 'Коли ви заселяєтеся?'),
    t3('Na jak długo?', 'For how long?', 'На який термін?'),
    t3('Jakie masz obywatelstwo?', 'What is your citizenship?', 'Яке у вас громадянство?'),
    t3('Na jakiej podstawie tam mieszkasz?', 'On what basis do you live there?', 'На якій підставі ви там живете?'),
    t3('Co jeszcze się zmienia?', 'What else changes?', 'Що ще змінюється?'),
  ]

  const results = ADDRESSES.filter((x) => x.id !== p.current.addressId && (query.length < 1 || addrLine(x).toLowerCase().includes(query.toLowerCase())))
  const move = parseIso(a.moveDate)
  const offset = Math.round((move.getTime() - today().getTime()) / 86400000)

  return (
    <Screen
      title={t3(`Pytanie ${step + 1} z ${STEPS}`, `Question ${step + 1} of ${STEPS}`, `Питання ${step + 1} з ${STEPS}`)}
      footer={<Btn onClick={next}>{step === STEPS - 1 ? tr(t3('Pokaż mój plan', 'Show my plan', 'Показати мій план')) : tr(t3('Dalej', 'Next', 'Далі'))}</Btn>}
    >
      <div className="px-5 pt-3">
        <Progress value={(step + 1) / STEPS} />
        <h2 key={step} className="anim-rise mt-5 text-[24px] leading-tight font-bold">
          {tr(titles[step])}
        </h2>
      </div>

      <div key={'b' + step} className="anim-rise space-y-3 px-5 pt-4 pb-6">
        {step === 0 && (
          <>
            <label className="flex items-center gap-2 rounded-2xl border-2 border-line bg-card px-4 focus-within:border-brand">
              <Search className="size-5 text-muted" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tr(t3('Wpisz ulicę lub miasto', 'Type a street or city', 'Введіть вулицю або місто'))} className="h-12 flex-1 bg-transparent text-[15px] outline-none" aria-label={tr(t3('Wyszukaj adres', 'Search address', 'Пошук адреси'))} />
            </label>
            <div className="space-y-2" role="radiogroup">
              {results.slice(0, 5).map((x) => (
                <Choice key={x.id} selected={a.addressId === x.id} onClick={() => up({ addressId: x.id })} icon={<MapPin className="size-5" />} title={x.street} sub={`${x.postal} ${x.city}`} />
              ))}
              {results.length === 0 && <p className="text-[14px] text-muted">{tr(t3('Brak wyników w danych demonstracyjnych.', 'No results in the demo data.', 'Немає результатів у демо-даних.'))}</p>}
            </div>
            <p className="text-[12px] text-muted">{tr(t3('W wersji docelowej: wyszukiwarka oparta na państwowym rejestrze adresów (PRG).', 'In the full version: search backed by the national address register (PRG).', 'У повній версії: пошук на основі державного реєстру адрес (PRG).'))}</p>
            <Why text={t3('Adres decyduje, który urząd gminy i które starostwo są właściwe, oraz czy zmieniasz gminę (np. przychodnia, szkoła, deklaracja śmieciowa).', 'The address decides which municipal and county office handles your case and whether you change municipality (clinic, school, waste declaration).', 'Адреса визначає, яка гміна та староство відповідають за вашу справу.')} />
          </>
        )}

        {step === 1 && (
          <>
            {[
              [0, t3('Dzisiaj', 'Today', 'Сьогодні')],
              [p.defaults.moveOffsetDays, t3('Już tam mieszkam', 'I already live there', 'Я вже там живу')],
              [7, t3('Za tydzień', 'In a week', 'Через тиждень')],
            ].map(([off, label]) => {
              const d = addDays(today(), off as number)
              return <Choice key={String(off) + tr(label as never)} selected={offset === off} onClick={() => up({ moveDate: iso(d) })} icon={<CalendarDays className="size-5" />} title={tr(label as never)} sub={fmtDate(d, lang, { weekday: 'long', day: 'numeric', month: 'long' })} />
            })}
            <label className="block rounded-2xl border-2 border-line bg-card p-4">
              <span className="text-[13px] font-semibold text-muted">{tr(t3('Inna data', 'Another date', 'Інша дата'))}</span>
              <input type="date" value={a.moveDate} onChange={(e) => e.target.value && up({ moveDate: e.target.value })} className="mt-1 block w-full bg-transparent text-[16px] font-semibold outline-none" />
            </label>
            <Why text={t3('Od tej daty liczymy terminy, np. meldunek najpóźniej w 30. dniu od zamieszkania (dla obywateli spoza UE – w 4. dniu).', 'Deadlines are counted from this date, e.g. registration no later than day 30 after moving in (day 4 for non-EU citizens).', 'Від цієї дати рахуємо терміни, напр. реєстрація не пізніше 30-го дня (для громадян поза ЄС – 4-го дня).')} />
          </>
        )}

        {step === 2 && (
          <div className="space-y-2" role="radiogroup">
            <Choice selected={a.stay === 'permanent'} onClick={() => up({ stay: 'permanent' })} icon={<HomeIcon className="size-5" />} title={tr(t3('Na stałe', 'Permanently', 'Назавжди'))} sub={tr(t3('To będzie mój główny dom', 'This will be my main home', 'Це буде мій основний дім'))} />
            <Choice selected={a.stay === 'temporary'} onClick={() => up({ stay: 'temporary' })} icon={<Clock3 className="size-5" />} title={tr(t3('Tymczasowo, dłużej niż 30 dni', 'Temporarily, more than 30 days', 'Тимчасово, понад 30 днів'))} sub={tr(t3('Np. studia, praca, wynajem na rok', 'E.g. studies, work, a one-year lease', 'Напр. навчання, робота, оренда на рік'))} />
            {a.stay === 'temporary' && (
              <label className="anim-rise ml-4 block rounded-2xl border-2 border-line bg-card p-4">
                <span className="text-[13px] font-semibold text-muted">{tr(t3('Do kiedy (w przybliżeniu)?', 'Until when (roughly)?', 'До коли (приблизно)?'))}</span>
                <input type="date" value={a.tempUntil} onChange={(e) => e.target.value && up({ tempUntil: e.target.value })} className="mt-1 block w-full bg-transparent text-[16px] font-semibold outline-none" />
              </label>
            )}
            <Choice selected={a.stay === 'short'} onClick={() => up({ stay: 'short' })} icon={<Timer className="size-5" />} title={tr(t3('Krótko, do 30 dni', 'Briefly, up to 30 days', 'Коротко, до 30 днів'))} sub={tr(t3('Np. wyjazd służbowy', 'E.g. a business trip', 'Напр. відрядження'))} />
            <Why text={t3('Pobyt stały i czasowy to różne zgłoszenia. Możesz mieć jednocześnie jeden adres stały i jeden czasowy.', 'Permanent and temporary stays are different registrations. You can have one of each at the same time.', 'Постійне і тимчасове перебування – різні заяви. Можна мати по одній адресі кожного типу.')} />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-2" role="radiogroup">
            <div className="flex items-center gap-2 rounded-xl bg-ok-soft px-3 py-2 text-[13px] text-ok">
              <Check className="size-4" />
              {tr(t3('Z rejestru PESEL:', 'From the PESEL register:', 'З реєстру PESEL:'))} <b>{tr(p.citizenshipLabel)}</b>
            </div>
            <Choice selected={a.citizenship === 'pl'} onClick={() => up({ citizenship: 'pl' })} icon={<Flag className="size-5" />} title={tr(t3('Polskie', 'Polish', 'Польське'))} />
            <Choice selected={a.citizenship === 'eu'} onClick={() => up({ citizenship: 'eu' })} icon={<Globe2 className="size-5" />} title={tr(t3('Innego kraju UE, EFTA lub Szwajcarii', 'Another EU/EFTA country or Switzerland', 'Іншої країни ЄС, ЄАВТ або Швейцарії'))} sub={tr(t3('Także członkowie rodziny tych osób', 'Also their family members', 'Також члени їхніх сімей'))} />
            <Choice selected={a.citizenship === 'other'} onClick={() => up({ citizenship: 'other' })} icon={<Globe2 className="size-5" />} title={tr(t3('Kraju spoza UE', 'A non-EU country', 'Країни поза ЄС'))} sub={tr(t3('Np. Ukraina, Indie, Egipt, USA', 'E.g. Ukraine, India, Egypt, USA', 'Напр. Україна, Індія, Єгипет, США'))} />
            <Why text={t3('Od obywatelstwa zależy, czy meldunek da się zrobić online i jaki jest termin. Obywatele państw spoza UE muszą przyjść do urzędu w ciągu 4 dni.', 'Citizenship decides whether you can register online and the deadline. Non-EU citizens must visit the office within 4 days.', 'Від громадянства залежить, чи можна зареєструватися онлайн і який термін. Громадяни поза ЄС мають прийти в установу протягом 4 днів.')} />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-2" role="radiogroup">
            <Choice selected={a.title === 'owner'} onClick={() => up({ title: 'owner' })} icon={<KeyRound className="size-5" />} title={tr(t3('Jestem właścicielem lub współwłaścicielem', 'I am the owner or co-owner', 'Я власник або співвласник'))} />
            <Choice selected={a.title === 'rent'} onClick={() => up({ title: 'rent' })} icon={<Building2 className="size-5" />} title={tr(t3('Wynajmuję', 'I rent', 'Я орендую'))} sub={tr(t3('Mam umowę najmu', 'I have a tenancy agreement', 'Маю договір оренди'))} />
            <Choice selected={a.title === 'family'} onClick={() => up({ title: 'family' })} icon={<Users className="size-5" />} title={tr(t3('Mieszkam u rodziny lub znajomych', 'I live with family or friends', 'Живу в родини або друзів'))} />
            <Choice selected={a.title === 'dorm'} onClick={() => up({ title: 'dorm' })} icon={<GraduationCap className="size-5" />} title={tr(t3('Akademik lub hotel pracowniczy', 'Dorm or workers’ hostel', 'Гуртожиток'))} />
            <Why text={t3('Do meldunku potrzebne jest potwierdzenie prawa do lokalu. Jeśli jesteś w księdze wieczystej, sprawdzimy to automatycznie. Jeśli nie – właściciel potwierdzi to w swojej aplikacji.', 'Registration needs proof of your right to the flat. If you are in the land register, we check it automatically. If not, the owner confirms in their app.', 'Для реєстрації потрібне підтвердження права на житло. Якщо ви в поземельній книзі – перевіримо автоматично.')} />
          </div>
        )}

        {step === 5 && (
          <>
            {p.kids.length > 0 && (
              <Section title={tr(t3('Kto przeprowadza się z Tobą', 'Who moves with you', 'Хто переїжджає з вами'))} className="!px-0">
                <div className="space-y-2">
                  {p.kids.map((k) => (
                    <CheckBox key={k.id} checked={a.kids.includes(k.id)} onClick={() => up({ kids: a.kids.includes(k.id) ? a.kids.filter((x) => x !== k.id) : [...a.kids, k.id] })} title={k.name} sub={tr(t3(`${k.age} lat · dziecko z rejestru PESEL`, `${k.age} years · child from the PESEL register`, `${k.age} років · дитина з реєстру PESEL`))} />
                  ))}
                </div>
              </Section>
            )}
            <Section title={tr(t3('Znaleźliśmy w rejestrach', 'Found in registers', 'Знайдено в реєстрах'))} className="!px-0 pt-2">
              <div className="space-y-2">
                {p.vehicle ? (
                  <CheckBox checked={a.vehicle} onClick={() => up({ vehicle: !a.vehicle })} title={`${p.vehicle.make} · ${p.vehicle.plate}`} sub={tr(t3('Pojazd zarejestrowany na Ciebie (CEPiK)', 'Vehicle registered to you (CEPiK)', 'Авто, зареєстроване на вас (CEPiK)'))} />
                ) : (
                  <div className="flex items-center gap-3 rounded-2xl border border-dashed border-line p-4 text-[14px] text-muted">
                    <Car className="size-5" /> {tr(t3('Brak pojazdów zarejestrowanych na Ciebie', 'No vehicles registered to you', 'Немає авто, зареєстрованих на вас'))}
                  </div>
                )}
                <CheckBox checked={a.business} onClick={() => up({ business: !a.business })} title={tr(t3('Prowadzę działalność gospodarczą', 'I run a sole-trader business', 'Я веду підприємницьку діяльність'))} sub={tr(t3('Brak wpisu w CEIDG – zaznacz, jeśli to się zmieni', 'No CEIDG entry, tick if this changes', 'Немає запису в CEIDG'))} />
              </div>
            </Section>
            <Section title={tr(t3('Przypomnij mi też o (poza urzędem)', 'Also remind me about (outside government)', 'Також нагадати про (поза установами)'))} className="!px-0 pt-2">
              <div className="flex flex-wrap gap-2">
                {LIFE_OPTIONS.map((o) => {
                  const on = a.life.includes(o.id)
                  return (
                    <button key={o.id} onClick={() => up({ life: on ? a.life.filter((x) => x !== o.id) : [...a.life, o.id] })} aria-pressed={on} className={cx('rounded-full border-2 px-3.5 py-2 text-[13px] font-semibold', on ? 'border-brand bg-brand text-white' : 'border-line bg-card')}>
                      {on && '✓ '}
                      {tr(o.title)}
                    </button>
                  )
                })}
              </div>
            </Section>
            <Why text={t3('Nie pytamy o to, co państwo już wie. Pokazujemy dane z rejestrów, a Ty tylko je potwierdzasz.', 'We don’t ask what the state already knows. We show register data and you just confirm it.', 'Ми не питаємо те, що держава вже знає. Ви лише підтверджуєте дані.')} />
          </>
        )}
      </div>
    </Screen>
  )
}

export function ShortStay() {
  const { tr, goTab } = useStore()
  return (
    <Screen title={t3('Wynik', 'Result', 'Результат')} footer={<Btn onClick={() => goTab('home')}>{tr(t3('Wróć do startu', 'Back to start', 'На головну'))}</Btn>}>
      <div className="px-6 pt-10 text-center">
        <div className="anim-pop mx-auto grid size-20 place-items-center rounded-full bg-ok-soft text-ok">
          <Check className="size-10" />
        </div>
        <h2 className="mt-5 text-2xl font-bold">{tr(t3('Nie musisz się meldować', 'You don’t need to register', 'Реєстрація не потрібна'))}</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          {tr(t3('Jeśli pobyt pod tym adresem nie przekroczy 30 dni, obowiązek meldunkowy Cię nie dotyczy. Jeśli plany się zmienią – wróć tutaj, a przygotujemy plan.', 'If your stay at this address won’t exceed 30 days, the registration duty doesn’t apply. If plans change, come back and we prepare a plan.', 'Якщо перебування за цією адресою не перевищить 30 днів, обов’язок реєстрації вас не стосується.'))}
        </p>
      </div>
    </Screen>
  )
}

export function Building() {
  const { tr, set, log } = useStore()
  const steps = [
    t3('Sprawdzamy Twoją sytuację', 'Checking your situation', 'Перевіряємо вашу ситуацію'),
    t3('Wybieramy właściwe urzędy', 'Choosing the right offices', 'Обираємо відповідні установи'),
    t3('Liczymy terminy', 'Calculating deadlines', 'Рахуємо терміни'),
    t3('Szukamy, co zrobi się samo', 'Finding what happens automatically', 'Шукаємо, що відбудеться автоматично'),
  ]
  const [i, setI] = useState(0)
  useEffect(() => {
    if (i < steps.length) {
      const id = setTimeout(() => setI(i + 1), 520)
      return () => clearTimeout(id)
    }
    set(() => ({ planReady: true, tab: 'cases', stack: [{ name: 'plan', param: 'fresh' }] }))
    log(t3('Utworzono plan przeprowadzki', 'Moving plan created', 'Створено план переїзду'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i])
  return (
    <div className="flex h-full flex-col items-center justify-center bg-card px-8">
      <div className="anim-spin size-14 rounded-full border-4 border-brand-soft border-t-brand" />
      <ul className="mt-8 w-full max-w-[260px] space-y-3">
        {steps.map((x, k) => (
          <li key={k} className={cx('flex items-center gap-3 text-[15px] transition', k < i ? 'text-ink' : k === i ? 'text-ink font-semibold' : 'text-muted/50')}>
            <span className={cx('grid size-6 place-items-center rounded-full', k < i ? 'bg-ok text-white' : 'bg-bg')}>{k < i && <Check className="size-4" />}</span>
            {tr(x)}
          </li>
        ))}
      </ul>
      <p className="sr-only" aria-live="polite">{tr(steps[Math.min(i, steps.length - 1)])}</p>
    </div>
  )
}

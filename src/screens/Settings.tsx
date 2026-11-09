import { Bot, Contrast, Database, ExternalLink, Globe, History, Info, RotateCcw, Send, ShieldCheck, Type, BookOpen, Users } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { LANGS, t3, type T } from '../i18n'
import { useStore } from '../state'
import { Card, Screen, Section, cx } from '../ui'

export function SettingsScreen() {
  const { s, set, tr, nav, reset, toast } = useStore()
  const st = s.settings
  const upd = (patch: Partial<typeof st>) => set((x) => ({ settings: { ...x.settings, ...patch } }))
  return (
    <Screen title={t3('Ustawienia i dostępność', 'Settings & accessibility', 'Налаштування і доступність')} onBack={false}>
      <div className="space-y-6 pt-4 pb-8">
        <Section title={tr(t3('Język', 'Language', 'Мова'))}>
          <Card className="grid grid-cols-3 gap-1 p-1">
            {LANGS.map((l) => (
              <button key={l.id} onClick={() => upd({ lang: l.id })} aria-pressed={st.lang === l.id} className={cx('rounded-xl py-3 text-[14px] font-semibold', st.lang === l.id ? 'bg-brand text-white' : 'hover:bg-bg')}>
                {l.label}
              </button>
            ))}
          </Card>
        </Section>

        <Section title={tr(t3('Wygoda czytania', 'Reading comfort', 'Зручність читання'))}>
          <Card className="divide-y divide-line">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
                <Type className="size-5" />
              </span>
              <span className="flex-1 text-[15px] font-medium">{tr(t3('Wielkość tekstu', 'Text size', 'Розмір тексту'))}</span>
              <div className="flex gap-1">
                {[1, 1.15, 1.3].map((v, i) => (
                  <button key={v} onClick={() => upd({ scale: v })} aria-pressed={st.scale === v} aria-label={`${Math.round(v * 100)}%`} className={cx('grid size-10 place-items-center rounded-xl border-2 font-bold', st.scale === v ? 'border-brand bg-brand text-white' : 'border-line')} style={{ fontSize: 13 + i * 3 }}>
                    A
                  </button>
                ))}
              </div>
            </div>
            <Toggle icon={<Contrast className="size-5" />} title={t3('Wysoki kontrast', 'High contrast', 'Висока контрастність')} on={st.contrast} onClick={() => upd({ contrast: !st.contrast })} />
            <Toggle icon={<BookOpen className="size-5" />} title={t3('Prosty język', 'Plain language', 'Проста мова')} sub={t3('Krótkie zdania, bez przepisów', 'Short sentences, no legal terms', 'Короткі речення, без юридичних термінів')} on={st.simple} onClick={() => upd({ simple: !st.simple })} />
          </Card>
        </Section>

        <Section title={tr(t3('Prywatność', 'Privacy', 'Приватність'))}>
          <Card className="divide-y divide-line">
            <LinkRow icon={<ShieldCheck className="size-5" />} title={t3('Twoje dane i historia dostępu', 'Your data and access history', 'Ваші дані та історія доступу')} onClick={() => nav({ name: 'privacy' })} />
            <LinkRow icon={<Users className="size-5" />} title={t3('Pełnomocnictwa i bliscy', 'Powers of attorney and family', 'Довіреності та близькі')} onClick={() => toast(t3('Poza zakresem prototypu', 'Out of scope for this prototype', 'Поза межами прототипу'))} />
          </Card>
        </Section>

        <Section title={tr(t3('O prototypie', 'About this prototype', 'Про прототип'))}>
          <Card className="divide-y divide-line">
            <LinkRow icon={<Info className="size-5" />} title={t3('Źródła i podstawy prawne', 'Sources and legal basis', 'Джерела та правові підстави')} onClick={() => nav({ name: 'sources' })} />
            <LinkRow icon={<RotateCcw className="size-5" />} title={t3('Zacznij pokaz od nowa', 'Restart the demo', 'Почати демо спочатку')} onClick={() => { reset(); toast(t3('Pokaz zresetowany', 'Demo reset', 'Демо скинуто')) }} />
          </Card>
          <p className="mt-3 px-1 text-[12px] leading-relaxed text-muted">{tr(t3('Prototyp koncepcyjny na mObywatel Challenge 2026. Nie jest oficjalną aplikacją mObywatel ani usługą administracji publicznej. Nie łączy się z żadnym rejestrem. Wszystkie osoby i dane są fikcyjne.', 'Concept prototype for mObywatel Challenge 2026. Not the official mObywatel app or a public administration service. It connects to no register. All people and data are fictional.', 'Концептуальний прототип для mObywatel Challenge 2026. Не є офіційним застосунком mObywatel. Усі особи та дані вигадані.'))}</p>
        </Section>
      </div>
    </Screen>
  )
}

function Toggle({ icon, title, sub, on, onClick }: { icon: React.ReactNode; title: T; sub?: T; on: boolean; onClick: () => void }) {
  const { tr } = useStore()
  return (
    <button onClick={onClick} role="switch" aria-checked={on} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-bg">
      <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">{icon}</span>
      <span className="flex-1">
        <span className="block text-[15px] font-medium">{tr(title)}</span>
        {sub && <span className="block text-[13px] text-muted">{tr(sub)}</span>}
      </span>
      <span className={cx('relative h-7 w-12 shrink-0 rounded-full transition', on ? 'bg-brand' : 'bg-line')}>
        <span className={cx('absolute top-1 size-5 rounded-full bg-white shadow transition-all', on ? 'left-6' : 'left-1')} />
      </span>
    </button>
  )
}

function LinkRow({ icon, title, onClick }: { icon: React.ReactNode; title: T; onClick: () => void }) {
  const { tr } = useStore()
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-bg">
      <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">{icon}</span>
      <span className="flex-1 text-[15px] font-medium">{tr(title)}</span>
    </button>
  )
}

/* ---------------- Privacy ---------------- */

export function Privacy() {
  const { s, tr, lang } = useStore()
  const used: [T, T][] = [
    [t3('Rejestr PESEL', 'PESEL register', 'Реєстр PESEL'), t3('imię, nazwisko, obywatelstwo, dzieci, obecny adres', 'name, citizenship, children, current address', 'ім’я, громадянство, діти, поточна адреса')],
    [t3('Księgi wieczyste', 'Land registers', 'Поземельні книги'), t3('tylko odpowiedź „zgodne / niezgodne”', 'only a “match / no match” answer', 'лише відповідь «збігається / не збігається»')],
    [t3('CEPiK', 'CEPiK', 'CEPiK'), t3('pojazdy zarejestrowane na Ciebie', 'vehicles registered to you', 'авто, зареєстровані на вас')],
    [t3('CEIDG', 'CEIDG', 'CEIDG'), t3('czy prowadzisz działalność', 'whether you run a business', 'чи ведете ви бізнес')],
  ]
  const fmt = (n: number) => new Intl.DateTimeFormat(lang === 'uk' ? 'uk-UA' : lang === 'en' ? 'en-GB' : 'pl-PL', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }).format(n)
  return (
    <Screen title={t3('Twoje dane w tej sprawie', 'Your data in this case', 'Ваші дані в цій справі')}>
      <div className="space-y-6 pt-4 pb-8">
        <Section>
          <div className="flex gap-3 rounded-2xl bg-ok-soft p-4 text-[14px] leading-relaxed text-ok">
            <ShieldCheck className="mt-0.5 size-5 shrink-0" />
            <span>{tr(t3('Każde wysłanie danych do urzędu wymaga Twojego potwierdzenia PIN-em. Właściciel lokalu widzi tylko Twoje imię, nazwisko i okres pobytu – nie widzi PESEL.', 'Every submission to an office needs your PIN. The flat owner only sees your name and period of stay, never your PESEL.', 'Кожне надсилання даних потребує вашого PIN-коду. Власник бачить лише ваше ім’я та період перебування.'))}</span>
          </div>
        </Section>
        <Section title={tr(t3('Z czego korzystamy', 'What we use', 'Що ми використовуємо'))}>
          <Card className="divide-y divide-line">
            {used.map(([a, b], i) => (
              <div key={i} className="flex gap-3 px-4 py-3">
                <Database className="mt-0.5 size-5 shrink-0 text-brand" />
                <div>
                  <p className="text-[14px] font-semibold">{tr(a)}</p>
                  <p className="text-[13px] text-muted">{tr(b)}</p>
                </div>
              </div>
            ))}
          </Card>
        </Section>
        <Section title={tr(t3('Historia w tej sprawie', 'History in this case', 'Історія в цій справі'))}>
          <Card className="divide-y divide-line">
            {s.log.length === 0 && <p className="px-4 py-4 text-[14px] text-muted">{tr(t3('Jeszcze nic się nie wydarzyło.', 'Nothing has happened yet.', 'Ще нічого не сталося.'))}</p>}
            {s.log.map((e, i) => (
              <div key={i} className="flex gap-3 px-4 py-3">
                <History className="mt-0.5 size-5 shrink-0 text-muted" />
                <div className="flex-1">
                  <p className="text-[14px] font-medium">{tr(e.what)}</p>
                  <p className="text-[12px] text-muted">
                    {tr(e.who)} · {fmt(e.at)}
                  </p>
                </div>
              </div>
            ))}
          </Card>
        </Section>
      </div>
    </Screen>
  )
}

/* ---------------- Sources ---------------- */

export function Sources() {
  const { tr } = useStore()
  const src: [string, string][] = [
    ['gov.pl – Zamelduj się na pobyt stały lub czasowy (dla cudzoziemców)', 'https://www.gov.pl/web/gov/zamelduj-sie-na-pobyt-staly-dla-cudzoziemcow'],
    ['gov.pl – Zamelduj się na pobyt stały', 'https://www.gov.pl/web/gov/zamelduj-sie-na-pobyt-staly'],
    ['gov.pl – Zamelduj się na pobyt czasowy', 'https://www.gov.pl/web/gov/zamelduj-sie-na-pobyt-czasowy'],
    ['Ustawa z dnia 24 września 2010 r. o ewidencji ludności', 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20100170087'],
    ['Ustawa – Prawo o ruchu drogowym (rejestracja pojazdów)', 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19970980602'],
    ['Ustawa o utrzymaniu czystości i porządku w gminach (deklaracja)', 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19961320622'],
    ['Kodeks wyborczy (rejestr wyborców)', 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20110210112'],
    ['pacjent.gov.pl – Wybór lekarza POZ', 'https://pacjent.gov.pl'],
  ]
  return (
    <Screen title={t3('Źródła', 'Sources', 'Джерела')}>
      <div className="space-y-4 px-4 pt-4 pb-8">
        <p className="px-1 text-[14px] leading-relaxed text-muted">{tr(t3('Reguły w prototypie (terminy, kto może załatwić sprawę online, co dzieje się automatycznie) oparto na poniższych źródłach. Stan na listopad 2026 r.', 'The rules in this prototype (deadlines, who can apply online, what happens automatically) are based on the sources below, as of November 2026.', 'Правила в прототипі базуються на наведених джерелах станом на листопад 2026 р.'))}</p>
        <Card className="divide-y divide-line">
          {src.map(([name, url]) => (
            <a key={url} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3.5 hover:bg-bg">
              <span className="flex-1 text-[14px] font-medium">{name}</span>
              <ExternalLink className="size-4 shrink-0 text-muted" />
            </a>
          ))}
        </Card>
      </div>
    </Screen>
  )
}

/* ---------------- Ask (prepared answers) ---------------- */

type QA = { keys: string[]; q: T; a: T; go?: string }

const QAS: QA[] = [
  {
    keys: ['przeprowadz', 'moving', 'move', 'переїзд', 'переїж', 'nowy adres', 'new address', 'zmiana adresu'],
    q: t3('Przeprowadzam się – co muszę załatwić?', 'I’m moving – what do I need to do?', 'Я переїжджаю – що потрібно зробити?'),
    a: t3('Przygotuję plan wszystkich formalności: meldunek, samochód, przychodnia i inne – z terminami. Zajmie to około minuty.', 'I’ll prepare a plan of every formality (registration, car, GP clinic and more) with deadlines. Takes about a minute.', 'Я підготую план усіх формальностей з термінами. Це займе близько хвилини.'),
    go: 'intro',
  },
  {
    keys: ['wymeld', 'deregister', 'виписат', 'зняття'],
    q: t3('Czy muszę się wymeldować ze starego adresu?', 'Do I need to deregister from my old address?', 'Чи потрібно виписуватися зі старої адреси?'),
    a: t3('Nie. Zameldowanie na nowy pobyt stały automatycznie kończy poprzedni. Tak samo z pobytem czasowym.', 'No. Registering a new permanent address automatically ends the old one. Same for temporary stays.', 'Ні. Реєстрація нового постійного місця автоматично завершує попереднє.'),
  },
  {
    keys: ['dowód osob', 'id card', 'посвідчення', 'dowod osob'],
    q: t3('Czy muszę wymienić dowód osobisty?', 'Do I need a new ID card?', 'Чи потрібно міняти посвідчення особи?'),
    a: t3('Nie. Dowód osobisty nie zawiera adresu, więc po przeprowadzce zostaje bez zmian.', 'No. The Polish ID card has no address on it, so it stays the same.', 'Ні. Посвідчення особи не містить адреси.'),
  },
  {
    keys: ['termin', 'deadline', 'ile mam czasu', 'how long', 'термін', 'скільки'],
    q: t3('Ile mam czasu na meldunek?', 'How long do I have to register?', 'Скільки часу на реєстрацію?'),
    a: t3('Obywatele Polski, UE i EFTA: najpóźniej w 30. dniu od zamieszkania. Obywatele innych państw: najpóźniej w 4. dniu i tylko w urzędzie.', 'Polish, EU and EFTA citizens: no later than day 30 after moving in. Other citizens: no later than day 4, in person only.', 'Громадяни Польщі, ЄС і ЄАВТ: не пізніше 30-го дня. Інші: не пізніше 4-го дня, лише особисто.'),
  },
  {
    keys: ['właściciel', 'wlasciciel', 'landlord', 'owner', 'власник', 'najem', 'rent'],
    q: t3('Wynajmuję – czy właściciel musi się zgodzić?', 'I rent – does the owner have to agree?', 'Я орендую – чи має власник погодитися?'),
    a: t3('Potrzebne jest potwierdzenie pobytu przez właściciela albo dokument, np. umowa najmu. W tej koncepcji właściciel potwierdza jednym kliknięciem w swojej aplikacji. Meldunek nie daje praw do lokalu.', 'You need the owner’s confirmation or a document such as the tenancy agreement. In this concept the owner confirms with one tap in their app. Registration gives no rights to the flat.', 'Потрібне підтвердження власника або документ, напр. договір оренди. Реєстрація не дає прав на житло.'),
  },
  {
    keys: ['cudzoziem', 'foreign', 'non-eu', 'spoza ue', 'іноземц', 'karta pobytu', 'residence card'],
    q: t3('Nie jestem obywatelem UE – czy mogę zameldować się online?', 'I’m not an EU citizen – can I register online?', 'Я не громадянин ЄС – чи можу зареєструватися онлайн?'),
    a: t3('Niestety nie – obywatele państw spoza UE i EFTA meldują się w urzędzie, w ciągu 4 dni. Aplikacja przygotuje formularz, listę dokumentów i pomoże umówić wizytę.', 'Unfortunately not: citizens of non-EU/EFTA countries register at the office, within 4 days. The app prepares the form, document list and helps you book a visit.', 'На жаль, ні – громадяни країн поза ЄС реєструються в установі протягом 4 днів.'),
  },
  {
    keys: ['samoch', 'auto', 'car', 'rejestracyj', 'авто', 'машин'],
    q: t3('Co z samochodem?', 'What about my car?', 'А що з автомобілем?'),
    a: t3('Zmianę adresu trzeba zgłosić w wydziale komunikacji w ciągu 30 dni. Tablice rejestracyjne zostają. Prawo jazdy nie zawiera adresu, więc go nie wymieniasz.', 'Report the address change to the vehicle office within 30 days. Plates stay. The driving licence has no address, so it stays.', 'Зміну адреси треба повідомити протягом 30 днів. Номери залишаються.'),
  },
  {
    keys: ['koszt', 'opłat', 'cost', 'fee', 'вартість', 'плат', 'ile kosztuje'],
    q: t3('Ile kosztuje meldunek?', 'How much does registration cost?', 'Скільки коштує реєстрація?'),
    a: t3('Zameldowanie jest bezpłatne. Zaświadczenie o pobycie stałym też. Zaświadczenie o pobycie czasowym kosztuje 17 zł (bezpłatne przy zameldowaniu automatycznym).', 'Registration is free, and so is the permanent-stay certificate. A temporary-stay certificate costs PLN 17 (free with automatic registration).', 'Реєстрація безкоштовна. Довідка про тимчасове перебування коштує 17 зл.'),
  },
]

export function Ask() {
  const { tr, nav } = useStore()
  const [msgs, setMsgs] = useState<{ me: boolean; text: string; go?: string }[]>([])
  const [input, setInput] = useState('')
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => end.current?.scrollIntoView({ behavior: 'smooth' }), [msgs])

  const ask = (text: string) => {
    if (!text.trim()) return
    const low = text.toLowerCase()
    const hit = QAS.find((x) => x.keys.some((k) => low.includes(k)))
    setMsgs((m) => [...m, { me: true, text }])
    setInput('')
    setTimeout(() => {
      setMsgs((m) => [...m, hit ? { me: false, text: tr(hit.a), go: hit.go } : { me: false, text: tr(t3('Tej sprawy prototyp jeszcze nie obsługuje. Spróbuj zapytać o przeprowadzkę, meldunek, samochód albo terminy.', 'This prototype doesn’t cover that yet. Try asking about moving, registration, your car or deadlines.', 'Цей прототип ще не обробляє цю справу. Запитайте про переїзд, реєстрацію, авто або терміни.')) }])
    }, 450)
  }

  return (
    <Screen
      title={t3('Zapytaj', 'Ask', 'Запитати')}
      footer={
        <form
          onSubmit={(e) => {
            e.preventDefault()
            ask(input)
          }}
          className="flex items-center gap-2"
        >
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={tr(t3('Napisz pytanie…', 'Type a question…', 'Напишіть питання…'))} className="h-12 flex-1 rounded-2xl border-2 border-line bg-card px-4 text-[15px] outline-none focus:border-brand" aria-label={tr(t3('Pytanie', 'Question', 'Питання'))} />
          <button type="submit" className="grid size-12 place-items-center rounded-2xl bg-brand text-white" aria-label={tr(t3('Wyślij', 'Send', 'Надіслати'))}>
            <Send className="size-5" />
          </button>
        </form>
      }
    >
      <div className="space-y-3 px-4 pt-4 pb-4">
        <div className="flex gap-2 rounded-2xl bg-brand-soft p-3 text-[12px] leading-relaxed text-brand-strong">
          <Bot className="mt-0.5 size-4 shrink-0" />
          <span>{tr(t3('Odpowiedzi w prototypie są przygotowane na podstawie gov.pl. W wersji docelowej: polski model językowy (np. Bielik lub PLLuM) odpowiadający wyłącznie na podstawie zweryfikowanych treści i zawsze z linkiem do źródła.', 'Answers in this prototype are prepared from gov.pl. In the full version: a Polish language model (e.g. Bielik or PLLuM) answering only from verified content, always with a source link.', 'Відповіді в прототипі підготовлені на основі gov.pl. У повній версії: польська мовна модель (напр. Bielik або PLLuM).'))}</span>
        </div>
        {msgs.length === 0 && (
          <div className="space-y-2 pt-2">
            <p className="px-1 text-[13px] font-bold tracking-wide text-muted uppercase">{tr(t3('Często pytane', 'Frequently asked', 'Часті питання'))}</p>
            {QAS.slice(0, 6).map((x, i) => (
              <button key={i} onClick={() => ask(tr(x.q))} className="shadow-card block w-full rounded-2xl bg-card px-4 py-3 text-left text-[14px] font-medium hover:ring-2 hover:ring-brand/15">
                {tr(x.q)}
              </button>
            ))}
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={cx('anim-rise flex', m.me ? 'justify-end' : 'justify-start')}>
            <div className={cx('max-w-[85%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed', m.me ? 'rounded-br-md bg-brand text-white' : 'shadow-card rounded-bl-md bg-card')}>
              {m.text}
              {m.go && (
                <button onClick={() => nav({ name: m.go! })} className="mt-2 block rounded-xl bg-brand px-3 py-2 text-[13px] font-semibold text-white">
                  {tr(t3('Przygotuj mój plan →', 'Prepare my plan →', 'Підготувати мій план →'))}
                </button>
              )}
              {!m.me && !m.go && (
                <span className="mt-1.5 flex items-center gap-1 text-[11px] text-muted">
                  <Globe className="size-3" /> gov.pl
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={end} />
      </div>
    </Screen>
  )
}


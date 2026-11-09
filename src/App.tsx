import { BellRing, Compass, Home as HomeIcon, ListChecks, RotateCcw, Settings as SettingsIcon, Sparkles, X, CheckCircle2, ArrowUpRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PERSONAS } from './data'
import { LANGS, t3 } from './i18n'
import { useStore, type Tab } from './state'
import { Home } from './screens/Home'
import { Building, Intro, ShortStay, Triage } from './screens/Triage'
import { PlanScreen, TaskDetail } from './screens/Plan'
import { Certificate, Landlord, Meldunek, MeldunekResult } from './screens/Meldunek'
import { Doctor, Done, FormPreview, QuickService, Vehicle, Visit } from './screens/Services'
import { Ask, Privacy, SettingsScreen, Sources } from './screens/Settings'
import { Avatar, cx } from './ui'

function Router() {
  const { s } = useStore()
  const r = s.stack[s.stack.length - 1]
  switch (r.name) {
    case 'home':
      return <Home />
    case 'intro':
      return <Intro />
    case 'triage':
      return <Triage step={Number(r.param ?? 0)} />
    case 'short':
      return <ShortStay />
    case 'building':
      return <Building />
    case 'plan':
      return <PlanScreen fresh={r.param === 'fresh'} />
    case 'task':
      return <TaskDetail id={r.param ?? ''} />
    case 'meldunek':
      return <Meldunek />
    case 'meldunekResult':
      return <MeldunekResult />
    case 'landlord':
      return <Landlord />
    case 'certificate':
      return <Certificate />
    case 'visit':
      return <Visit />
    case 'form':
      return <FormPreview />
    case 'vehicle':
      return <Vehicle />
    case 'doctor':
      return <Doctor />
    case 'quick':
      return <QuickService id={r.param ?? ''} />
    case 'done':
      return <Done id={r.param ?? ''} />
    case 'settings':
      return <SettingsScreen />
    case 'privacy':
      return <Privacy />
    case 'sources':
      return <Sources />
    case 'ask':
      return <Ask />
    default:
      return <Home />
  }
}

function TabBar() {
  const { s, tr, goTab } = useStore()
  const tabs: { id: Tab; icon: React.ReactNode; label: ReturnType<typeof t3> }[] = [
    { id: 'home', icon: <HomeIcon className="size-6" />, label: t3('Start', 'Home', 'Головна') },
    { id: 'cases', icon: <ListChecks className="size-6" />, label: t3('Moje sprawy', 'My cases', 'Мої справи') },
    { id: 'settings', icon: <SettingsIcon className="size-6" />, label: t3('Ustawienia', 'Settings', 'Налаштування') },
  ]
  return (
    <nav className="grid shrink-0 grid-cols-3 border-t border-line bg-card pb-2" aria-label={tr(t3('Nawigacja główna', 'Main navigation', 'Головна навігація'))}>
      {tabs.map((t) => (
        <button key={t.id} onClick={() => goTab(t.id)} aria-current={s.tab === t.id ? 'page' : undefined} className={cx('flex flex-col items-center gap-0.5 pt-2.5 text-[11px] font-semibold', s.tab === t.id ? 'text-brand' : 'text-muted')}>
          {t.icon}
          {tr(t.label)}
        </button>
      ))}
    </nav>
  )
}

function StatusBar() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 20000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="relative flex h-11 shrink-0 items-center justify-between bg-transparent px-7 text-[14px] font-semibold" aria-hidden>
      <span>{now.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</span>
      <span className="absolute top-2.5 left-1/2 h-7 w-28 -translate-x-1/2 rounded-full bg-ink" />
      <span className="flex items-center gap-1.5">
        <svg width="17" height="11" viewBox="0 0 17 11">
          <rect x="0" y="7" width="3" height="4" rx="1" fill="currentColor" />
          <rect x="4.5" y="5" width="3" height="6" rx="1" fill="currentColor" />
          <rect x="9" y="2.5" width="3" height="8.5" rx="1" fill="currentColor" />
          <rect x="13.5" y="0" width="3" height="11" rx="1" fill="currentColor" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3" fill="none" stroke="currentColor" opacity=".4" />
          <rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor" />
          <rect x="22.5" y="4" width="2" height="4" rx="1" fill="currentColor" opacity=".4" />
        </svg>
      </span>
    </div>
  )
}

function PhoneContent({ framed }: { framed: boolean }) {
  const { s, toastMsg, notice, dismissNotice } = useStore()
  const showTabs = s.stack.length === 1
  return (
    <div className={cx('relative flex h-full flex-col overflow-hidden bg-bg', s.settings.contrast && 'hc')}>
      {framed && <StatusBar />}
      <div className="relative min-h-0 flex-1">
        <Router />
      </div>
      {showTabs && <TabBar />}
      {notice && (
        <button onClick={dismissNotice} className="anim-slidein absolute inset-x-2 top-2 z-[60] flex items-start gap-3 rounded-2xl bg-card/95 p-3 text-left shadow-xl ring-1 ring-line backdrop-blur" style={{ top: framed ? 46 : 8 }}>
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand text-white">
            <BellRing className="size-5" />
          </span>
          <span className="flex-1">
            <span className="block text-[13px] font-bold">{notice.title}</span>
            <span className="block text-[13px] leading-snug text-muted">{notice.body}</span>
          </span>
        </button>
      )}
      {toastMsg && (
        <div role="status" className="anim-rise absolute inset-x-4 bottom-20 z-[60] rounded-2xl bg-ink px-4 py-3 text-center text-[14px] leading-snug font-medium text-white shadow-xl">
          {toastMsg}
        </div>
      )}
    </div>
  )
}

function Guide({ onPick }: { onPick?: () => void }) {
  const { s, tr, reset, set, plan, isDone } = useStore()
  const pickPersona = (id: string) => {
    reset(id)
    onPick?.()
  }
  const todo = plan.filter((x) => x.group === 'todo')
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-bold tracking-wide text-accent uppercase">mObywatel Challenge 2026</span>
        </div>
        <h1 className="mt-3 text-[30px] leading-[1.1] font-extrabold tracking-tight">{tr(t3('Przeprowadzka bez chaosu', 'Moving without the chaos', 'Переїзд без хаосу'))}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          {tr(t3('Jedna sytuacja życiowa zamiast dziesięciu spraw w różnych urzędach. Aplikacja zadaje kilka pytań, układa osobisty plan z terminami, załatwia meldunek w minutę i sama robi to, co państwo może zrobić automatycznie.', 'One life event instead of ten cases at different offices. The app asks a few questions, builds a personal plan with deadlines, completes registration in a minute and automates what the state can.', 'Одна життєва ситуація замість десяти справ у різних установах.'))}
        </p>
      </div>

      <div>
        <h2 className="text-[12px] font-bold tracking-wide text-muted uppercase">{tr(t3('Wybierz osobę do pokazu', 'Pick a demo person', 'Оберіть особу для демо'))}</h2>
        <div className="mt-2 space-y-2">
          {PERSONAS.map((p) => {
            const active = s.personaId === p.id
            return (
              <button key={p.id} onClick={() => pickPersona(p.id)} aria-pressed={active} className={cx('block w-full rounded-2xl border-2 bg-white p-4 text-left transition', active ? 'border-brand shadow-card' : 'border-transparent hover:border-line')}>
                <div className="flex items-center gap-3">
                  <Avatar initials={p.initials} color={p.color} size={38} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-bold">{p.name}</p>
                    <p className="text-[13px] leading-snug text-muted">{tr(p.tagline)}</p>
                  </div>
                </div>
                {active && (
                  <ul className="mt-3 space-y-1.5 border-t border-line pt-3">
                    {p.showcase.map((x, i) => (
                      <li key={i} className="flex gap-2 text-[13px] leading-snug">
                        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-brand" />
                        {tr(x)}
                      </li>
                    ))}
                  </ul>
                )}
              </button>
            )
          })}
        </div>
        <div className="mt-3 flex items-center justify-between text-[13px]">
          <span className="text-muted">
            {s.planReady ? tr(t3(`Postęp: ${todo.filter(isDone).length}/${todo.length} spraw`, `Progress: ${todo.filter(isDone).length}/${todo.length} tasks`, `Прогрес: ${todo.filter(isDone).length}/${todo.length}`)) : tr(t3('Zacznij od karty „Przeprowadzasz się?”', 'Start from the “Moving house?” card', 'Почніть з картки «Переїжджаєте?»'))}
          </span>
          <button onClick={() => pickPersona(s.personaId)} className="inline-flex items-center gap-1 font-semibold text-brand">
            <RotateCcw className="size-3.5" /> {tr(t3('Od nowa', 'Restart', 'Спочатку'))}
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-[12px] font-bold tracking-wide text-muted uppercase">{tr(t3('Co jest nowego', 'What’s new', 'Що нового'))}</h2>
        <ul className="mt-2 space-y-2.5 text-[14px] leading-snug">
          {[
            t3('Sytuacja życiowa zamiast listy usług – użytkownik nie musi znać urzędów', 'Life events instead of a service list, so you don’t need to know the offices', 'Життєві ситуації замість списку послуг'),
            t3('Osobisty plan: „do zrobienia”, „zrobi się samo”, „nie musisz” – z terminami liczonymi od daty przeprowadzki', 'A personal plan (to do, automatic, not needed) with deadlines counted from moving day', 'Особистий план з термінами'),
            t3('Właściciel potwierdza pobyt w swojej aplikacji – koniec z papierowymi oświadczeniami', 'The owner confirms the stay in their own app, no more paper declarations', 'Власник підтверджує перебування у своєму застосунку'),
            t3('Uczciwa ścieżka dla cudzoziemców spoza UE: gotowy formularz, kod QR i rezerwacja wizyty', 'An honest path for non-EU foreigners: ready form, QR code and visit booking', 'Чесний шлях для іноземців поза ЄС'),
            t3('Dostępność: PL / EN / UA, prosty język, większy tekst, wysoki kontrast', 'Accessibility: PL / EN / UA, plain language, larger text, high contrast', 'Доступність: PL / EN / UA, проста мова'),
            t3('Przejrzystość: „dlaczego pytamy”, historia dostępu do danych, źródła prawne', 'Transparency: “why we ask”, data access history, legal sources', 'Прозорість: «чому питаємо», історія доступу'),
          ].map((x, i) => (
            <li key={i} className="flex gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-ok" />
              {tr(x)}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[12px] font-bold tracking-wide text-muted uppercase">{tr(t3('Język', 'Language', 'Мова'))}</span>
        {LANGS.map((l) => (
          <button key={l.id} onClick={() => set((x) => ({ settings: { ...x.settings, lang: l.id } }))} aria-pressed={s.settings.lang === l.id} className={cx('rounded-full px-3 py-1.5 text-[13px] font-semibold', s.settings.lang === l.id ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-line')}>
            {l.short}
          </button>
        ))}
      </div>

      <p className="text-[12px] leading-relaxed text-muted">
        {tr(t3('Prototyp koncepcyjny. Nie jest oficjalną aplikacją mObywatel ani usługą administracji publicznej, nie łączy się z rejestrami i niczego nie wysyła. Osoby, adresy i numery są fikcyjne. Reguły oparto na gov.pl (stan: listopad 2026).', 'Concept prototype. Not the official mObywatel app or a public service; it connects to no registers and sends nothing. People, addresses and numbers are fictional. Rules based on gov.pl (as of November 2026).', 'Концептуальний прототип. Не є офіційним застосунком mObywatel. Особи, адреси й номери вигадані.'))}{' '}
        <a className="inline-flex items-center gap-0.5 font-semibold text-brand" href="https://mobywatel.ai" target="_blank" rel="noreferrer">
          mobywatel.ai <ArrowUpRight className="size-3" />
        </a>
      </p>
    </div>
  )
}

export default function App() {
  const { tr } = useStore()
  const [guideOpen, setGuideOpen] = useState(false)
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 1024px)').matches)
  useEffect(() => {
    const m = window.matchMedia('(min-width: 1024px)')
    const on = () => setWide(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])

  if (wide) {
    return (
      <div className="flex h-full items-center justify-center gap-14 overflow-hidden bg-[radial-gradient(ellipse_at_top_left,#dfe8ff,transparent_55%),radial-gradient(ellipse_at_bottom_right,#fde7ec,transparent_50%)] px-10">
        <aside className="no-scrollbar max-h-full w-full max-w-[420px] overflow-y-auto py-10">
          <Guide />
        </aside>
        <div className="shrink-0 rounded-[56px] bg-ink p-3 shadow-[0_30px_80px_rgb(15_23_42/0.35)]" style={{ height: 'min(868px, calc(100vh - 40px))', aspectRatio: '414 / 868' }}>
          <div className="h-full overflow-hidden rounded-[44px] bg-bg">
            <PhoneContent framed />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[100dvh] flex-col">
      <button onClick={() => setGuideOpen(true)} className="flex shrink-0 items-center gap-2 bg-ink px-4 py-2 text-left text-[12px] font-semibold text-white">
        <Compass className="size-4" />
        <span className="flex-1">{tr(t3('Prototyp konkursowy · przewodnik i wybór osoby', 'Competition prototype · guide and demo people', 'Конкурсний прототип · путівник'))}</span>
        <span className="rounded-full bg-white/15 px-2 py-0.5">?</span>
      </button>
      <div className="min-h-0 flex-1">
        <PhoneContent framed={false} />
      </div>
      {guideOpen && (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-[#eef2fb] px-5 pt-4 pb-10">
          <div className="mb-2 flex justify-end">
            <button onClick={() => setGuideOpen(false)} className="grid size-11 place-items-center rounded-full bg-white shadow-card" aria-label={tr(t3('Zamknij', 'Close', 'Закрити'))}>
              <X className="size-5" />
            </button>
          </div>
          <Guide onPick={() => setGuideOpen(false)} />
        </div>
      )}
    </div>
  )
}

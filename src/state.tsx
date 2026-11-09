import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { persona, type Persona } from './data'
import { pick, t3, type Lang, type T } from './i18n'
import { addDays, buildPlan, iso, today, type Answers, type Task } from './plan'

export type Route = { name: string; param?: string }
export type Tab = 'home' | 'cases' | 'settings'

export interface Settings {
  lang: Lang
  scale: number
  contrast: boolean
  simple: boolean
}

export interface LogEntry {
  at: number
  who: T
  what: T
}

export interface State {
  v: number
  personaId: string
  answers: Answers
  planReady: boolean
  done: Record<string, boolean>
  meldunek: 'none' | 'waitingOwner' | 'waitingOffice' | 'done'
  meldunekVia?: 'kw' | 'owner' | 'contract' | 'office'
  visit?: { office: string; day: string; time: string }
  docsChecked: string[]
  reminders: boolean
  log: LogEntry[]
  tab: Tab
  stack: Route[]
  settings: Settings
}

const KEY = 'przeprowadzka-demo-v1'
const VERSION = 1

export function answersFor(p: Persona): Answers {
  return {
    moveDate: iso(addDays(today(), p.defaults.moveOffsetDays)),
    stay: p.defaults.stay,
    citizenship: p.citizenship,
    title: p.defaults.title,
    addressId: p.defaults.addressId,
    kids: p.defaults.kids,
    vehicle: !!p.vehicle,
    business: !!p.business,
    tempUntil: p.defaults.tempUntil ?? iso(addDays(today(), 365)),
    life: ['bank', 'work'],
  }
}

export function initialState(personaId = 'anna', keep?: Partial<Settings>): State {
  const p = persona(personaId)
  return {
    v: VERSION,
    personaId,
    answers: answersFor(p),
    planReady: false,
    done: {},
    meldunek: 'none',
    docsChecked: [],
    reminders: false,
    log: [],
    tab: 'home',
    stack: [{ name: 'home' }],
    settings: { lang: p.lang, scale: 1, contrast: false, simple: false, ...keep, ...(keep ? { lang: p.lang } : {}) },
  }
}

function load(): State {
  try {
    const url = new URL(window.location.href)
    const fromUrl = url.searchParams.get('osoba')
    const raw = localStorage.getItem(KEY)
    if (raw && !fromUrl) {
      const s = JSON.parse(raw) as State
      if (s.v === VERSION) return s
    }
    return initialState(fromUrl && ['anna', 'lukas', 'rahul'].includes(fromUrl) ? fromUrl : 'anna')
  } catch {
    return initialState()
  }
}

interface Ctx {
  s: State
  p: Persona
  plan: Task[]
  lang: Lang
  tr: (x: T | string) => string
  set: (fn: (s: State) => Partial<State>) => void
  nav: (r: Route) => void
  replace: (r: Route) => void
  back: () => void
  goTab: (t: Tab) => void
  reset: (personaId?: string) => void
  log: (what: T, who?: T) => void
  toast: (msg: T | string) => void
  toastMsg: string | null
  notify: (title: T, body: T) => void
  notice: { title: string; body: string } | null
  dismissNotice: () => void
  isDone: (t: Task) => boolean
}

const C = createContext<Ctx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<State>(load)
  const [toastMsg, setToast] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ title: string; body: string } | null>(null)
  const toastTimer = useRef<number>()
  const noticeTimer = useRef<number>()

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s))
    } catch {
      /* storage unavailable: the demo still works for this visit */
    }
  }, [s])

  useEffect(() => {
    const root = document.documentElement
    root.style.fontSize = `${s.settings.scale * 100}%`
    root.lang = s.settings.lang === 'uk' ? 'uk' : s.settings.lang
  }, [s.settings.scale, s.settings.lang])

  const p = persona(s.personaId)
  const lang = s.settings.lang
  const tr = useCallback((x: T | string) => pick(x, lang), [lang])
  const plan = useMemo(() => buildPlan(p, s.answers), [p, s.answers])

  const set = useCallback((fn: (s: State) => Partial<State>) => setS((prev) => ({ ...prev, ...fn(prev) })), [])
  const nav = useCallback((r: Route) => set((x) => ({ stack: [...x.stack, r] })), [set])
  const replace = useCallback((r: Route) => set((x) => ({ stack: [...x.stack.slice(0, -1), r] })), [set])
  const back = useCallback(() => set((x) => ({ stack: x.stack.length > 1 ? x.stack.slice(0, -1) : x.stack })), [set])
  const goTab = useCallback(
    (t: Tab) => set(() => ({ tab: t, stack: [{ name: t === 'home' ? 'home' : t === 'cases' ? 'plan' : 'settings' }] })),
    [set],
  )
  const reset = useCallback(
    (personaId?: string) =>
      setS((prev) => initialState(personaId ?? prev.personaId, { scale: prev.settings.scale, contrast: prev.settings.contrast, simple: prev.settings.simple })),
    [],
  )
  const log = useCallback(
    (what: T, who: T = t3('Ty', 'You', 'Ви')) => set((x) => ({ log: [{ at: Date.now(), who, what }, ...x.log].slice(0, 30) })),
    [set],
  )
  const toast = useCallback(
    (msg: T | string) => {
      setToast(pick(msg, lang))
      window.clearTimeout(toastTimer.current)
      toastTimer.current = window.setTimeout(() => setToast(null), 2600)
    },
    [lang],
  )
  const notify = useCallback(
    (title: T, body: T) => {
      setNotice({ title: pick(title, lang), body: pick(body, lang) })
      window.clearTimeout(noticeTimer.current)
      noticeTimer.current = window.setTimeout(() => setNotice(null), 6000)
    },
    [lang],
  )
  const isDone = useCallback(
    (t: Task) => (t.dependsOnMeldunek ? s.meldunek === 'done' : t.id === 'meldunek' ? s.meldunek === 'done' : !!s.done[t.id]),
    [s.meldunek, s.done],
  )

  const value: Ctx = {
    s,
    p,
    plan,
    lang,
    tr,
    set,
    nav,
    replace,
    back,
    goTab,
    reset,
    log,
    toast,
    toastMsg,
    notify,
    notice,
    dismissNotice: () => setNotice(null),
    isDone,
  }
  return <C.Provider value={value}>{children}</C.Provider>
}

export function useStore() {
  const c = useContext(C)
  if (!c) throw new Error('StoreProvider missing')
  return c
}

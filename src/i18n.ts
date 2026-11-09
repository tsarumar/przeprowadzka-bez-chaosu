export type Lang = 'pl' | 'en' | 'uk'
export type T = { pl: string; en: string; uk: string }

export const LANGS: { id: Lang; label: string; short: string }[] = [
  { id: 'pl', label: 'Polski', short: 'PL' },
  { id: 'en', label: 'English', short: 'EN' },
  { id: 'uk', label: 'Українська', short: 'UA' },
]

export const LOCALE: Record<Lang, string> = { pl: 'pl-PL', en: 'en-GB', uk: 'uk-UA' }

/** Small helper so inline translations stay readable. */
export const t3 = (pl: string, en: string, uk: string): T => ({ pl, en, uk })

export function pick(x: T | string, lang: Lang): string {
  if (typeof x === 'string') return x
  return x[lang] || x.pl
}

export function fmtDate(d: Date, lang: Lang, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }) {
  return new Intl.DateTimeFormat(LOCALE[lang], opts).format(d)
}

export function daysLeftLabel(days: number, lang: Lang): string {
  if (days < 0) {
    const n = Math.abs(days)
    return { pl: `po terminie (${n} dni)`, en: `overdue (${n} days)`, uk: `прострочено (${n} дн.)` }[lang]
  }
  if (days === 0) return { pl: 'termin dziś', en: 'due today', uk: 'термін сьогодні' }[lang]
  if (days === 1) return { pl: 'został 1 dzień', en: '1 day left', uk: 'залишився 1 день' }[lang]
  if (lang === 'pl') {
    const last = days % 10
    const teen = days % 100 >= 12 && days % 100 <= 14
    return `${last >= 2 && last <= 4 && !teen ? 'zostały' : 'zostało'} ${days} ${last >= 2 && last <= 4 && !teen ? 'dni' : 'dni'}`
  }
  if (lang === 'uk') return `залишилось ${days} дн.`
  return `${days} days left`
}

/** Polish/Ukrainian plural forms: one (1), few (2–4, not 12–14), many. */
export function plural(n: number, one: string, few: string, many: string) {
  if (n === 1) return one
  const last = n % 10
  const teen = n % 100 >= 12 && n % 100 <= 14
  return last >= 2 && last <= 4 && !teen ? few : many
}

export function tasksNeedAction(n: number): T {
  return {
    pl: `${n} ${plural(n, 'sprawa wymaga', 'sprawy wymagają', 'spraw wymaga')} działania`,
    en: `${n} ${n === 1 ? 'task needs' : 'tasks need'} action`,
    uk: `${n} ${plural(n, 'справа потребує', 'справи потребують', 'справ потребують')} дій`,
  }
}

import type { T } from './i18n'
import type { Task } from './plan'

const pad = (n: number) => String(n).padStart(2, '0')
const ymd = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')

function stamp() {
  const d = new Date()
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`
}

function save(name: string, body: string) {
  const blob = new Blob([body], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** All-day events on each deadline, with a reminder 7 days and 1 day before. */
export function downloadIcs(tasks: Task[], tr: (x: T) => string) {
  const events = tasks
    .filter((t) => t.deadline)
    .map((t) => {
      const d = t.deadline!
      const end = new Date(d.getTime() + 86400000)
      return [
        'BEGIN:VEVENT',
        `UID:${t.id}-${ymd(d)}@przeprowadzka-demo`,
        `DTSTAMP:${stamp()}`,
        `DTSTART;VALUE=DATE:${ymd(d)}`,
        `DTEND;VALUE=DATE:${ymd(end)}`,
        `SUMMARY:${esc('Termin: ' + tr(t.title))}`,
        `DESCRIPTION:${esc(tr(t.summary) + '\n(Przeprowadzka bez chaosu – prototyp konkursowy, dane fikcyjne)')}`,
        'BEGIN:VALARM',
        'TRIGGER:-P7D',
        'ACTION:DISPLAY',
        `DESCRIPTION:${esc(tr(t.title))}`,
        'END:VALARM',
        'BEGIN:VALARM',
        'TRIGGER:-P1D',
        'ACTION:DISPLAY',
        `DESCRIPTION:${esc(tr(t.title))}`,
        'END:VALARM',
        'END:VEVENT',
      ].join('\r\n')
    })
  save('przeprowadzka-terminy.ics', ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Przeprowadzka bez chaosu//PL', 'CALSCALE:GREGORIAN', ...events, 'END:VCALENDAR'].join('\r\n'))
}

export function downloadVisitIcs(opts: { title: string; office: string; date: Date; time: string; notes: string }) {
  const [h, m] = opts.time.split(':').map(Number)
  const start = new Date(opts.date)
  start.setHours(h, m, 0, 0)
  const end = new Date(start.getTime() + 20 * 60000)
  const local = (d: Date) => `${ymd(d)}T${pad(d.getHours())}${pad(d.getMinutes())}00`
  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Przeprowadzka bez chaosu//PL',
    'BEGIN:VEVENT',
    `UID:visit-${local(start)}@przeprowadzka-demo`,
    `DTSTAMP:${stamp()}`,
    `DTSTART:${local(start)}`,
    `DTEND:${local(end)}`,
    `SUMMARY:${esc(opts.title)}`,
    `LOCATION:${esc(opts.office)}`,
    `DESCRIPTION:${esc(opts.notes)}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(opts.title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  save('wizyta-w-urzedzie.ics', body)
}

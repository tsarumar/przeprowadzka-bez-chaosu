import { ChevronLeft, ChevronRight, Info, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { t3, type T } from './i18n'
import { useStore } from './state'

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ')
}

export function Screen({ children, title, onBack, right, footer, tone = 'bg' }: { children: ReactNode; title?: T | string; onBack?: (() => void) | false; right?: ReactNode; footer?: ReactNode; tone?: 'bg' | 'white' }) {
  const { tr, back } = useStore()
  return (
    <div className={cx('flex h-full flex-col', tone === 'white' ? 'bg-card' : 'bg-bg')}>
      {title !== undefined && (
        <header className="flex min-h-14 shrink-0 items-center gap-1 border-b border-line bg-card/95 px-2 backdrop-blur">
          {onBack !== false ? (
            <button onClick={onBack || back} className="grid size-11 place-items-center rounded-full text-ink hover:bg-bg" aria-label={tr(t3('Wstecz', 'Back', 'Назад'))}>
              <ChevronLeft className="size-6" />
            </button>
          ) : (
            <span className="w-3" />
          )}
          <h1 className="flex-1 truncate text-[17px] font-semibold">{tr(title)}</h1>
          {right}
        </header>
      )}
      <main className="no-scrollbar flex-1 overflow-y-auto">{children}</main>
      {footer && <div className="shrink-0 border-t border-line bg-card px-4 pt-3 pb-4">{footer}</div>}
    </div>
  )
}

export function Btn({ children, onClick, kind = 'primary', className, disabled, icon, type = 'button' }: { children: ReactNode; onClick?: () => void; kind?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'ok'; className?: string; disabled?: boolean; icon?: ReactNode; type?: 'button' | 'submit' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 text-[15px] font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40',
        kind === 'primary' && 'bg-brand text-white hover:bg-brand-strong',
        kind === 'secondary' && 'border border-line bg-card text-ink hover:bg-bg',
        kind === 'ghost' && 'text-brand hover:bg-brand-soft',
        kind === 'danger' && 'border border-danger/30 bg-card text-danger hover:bg-danger-soft',
        kind === 'ok' && 'bg-ok text-white',
        className,
      )}
    >
      {icon}
      {children}
    </button>
  )
}

export function Card({ children, className, onClick, as }: { children: ReactNode; className?: string; onClick?: () => void; as?: 'button' | 'div' }) {
  const El = (as ?? (onClick ? 'button' : 'div')) as 'button'
  return (
    <El onClick={onClick} className={cx('shadow-card block w-full rounded-2xl bg-card text-left', onClick && 'transition hover:ring-2 hover:ring-brand/15 active:scale-[0.99]', className)}>
      {children}
    </El>
  )
}

export function Row({ icon, title, sub, right, onClick, chevron = !!onClick }: { icon?: ReactNode; title: ReactNode; sub?: ReactNode; right?: ReactNode; onClick?: () => void; chevron?: boolean }) {
  const El = (onClick ? 'button' : 'div') as 'button'
  return (
    <El onClick={onClick} className={cx('flex w-full items-center gap-3 px-4 py-3.5 text-left', onClick && 'hover:bg-bg')}>
      {icon && <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium leading-snug">{title}</span>
        {sub && <span className="mt-0.5 block text-[13px] leading-snug text-muted">{sub}</span>}
      </span>
      {right}
      {chevron && <ChevronRight className="size-5 shrink-0 text-muted" />}
    </El>
  )
}

export function Pill({ children, tone = 'brand', className }: { children: ReactNode; tone?: 'brand' | 'ok' | 'warn' | 'danger' | 'muted'; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold leading-none whitespace-nowrap',
        tone === 'brand' && 'bg-brand-soft text-brand',
        tone === 'ok' && 'bg-ok-soft text-ok',
        tone === 'warn' && 'bg-warn-soft text-warn',
        tone === 'danger' && 'bg-danger-soft text-danger',
        tone === 'muted' && 'bg-bg text-muted',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cx('h-2 overflow-hidden rounded-full bg-line/70', className)} role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${Math.max(4, value * 100)}%` }} />
    </div>
  )
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: T | string; children: ReactNode }) {
  const { tr } = useStore()
  if (!open) return null
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end bg-ink/40" onClick={onClose} role="dialog" aria-modal="true">
      <div className="anim-sheet no-scrollbar max-h-[88%] overflow-y-auto rounded-t-3xl bg-card pb-6" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center gap-2 bg-card px-5 pt-3 pb-2">
          <div className="absolute top-2 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-line" />
          <h2 className="mt-3 flex-1 text-lg font-bold">{title && tr(title)}</h2>
          <button onClick={onClose} className="mt-3 grid size-10 place-items-center rounded-full hover:bg-bg" aria-label={tr(t3('Zamknij', 'Close', 'Закрити'))}>
            <X className="size-5" />
          </button>
        </div>
        <div className="px-5">{children}</div>
      </div>
    </div>
  )
}

export function Why({ text }: { text: T }) {
  const { tr } = useStore()
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-3">
      <button onClick={() => setOpen(!open)} className="inline-flex items-center gap-1.5 rounded-lg py-1 text-[13px] font-semibold text-brand" aria-expanded={open}>
        <Info className="size-4" />
        {tr(t3('Dlaczego o to pytamy?', 'Why do we ask?', 'Чому ми питаємо?'))}
      </button>
      {open && <p className="anim-rise mt-1 rounded-xl bg-brand-soft p-3 text-[13px] leading-relaxed text-brand-strong">{tr(text)}</p>}
    </div>
  )
}

export function Choice({ selected, onClick, title, sub, icon }: { selected: boolean; onClick: () => void; title: string; sub?: string; icon?: ReactNode }) {
  return (
    <button
      onClick={onClick}
      role="radio"
      aria-checked={selected}
      className={cx('flex w-full items-center gap-3 rounded-2xl border-2 bg-card p-4 text-left transition', selected ? 'border-brand bg-brand-soft/60' : 'border-line hover:border-brand/40')}
    >
      {icon && <span className={cx('grid size-10 shrink-0 place-items-center rounded-xl', selected ? 'bg-brand text-white' : 'bg-bg text-muted')}>{icon}</span>}
      <span className="flex-1">
        <span className="block text-[15px] font-semibold">{title}</span>
        {sub && <span className="mt-0.5 block text-[13px] leading-snug text-muted">{sub}</span>}
      </span>
      <span className={cx('grid size-6 shrink-0 place-items-center rounded-full border-2', selected ? 'border-brand bg-brand' : 'border-line')}>{selected && <span className="size-2 rounded-full bg-white" />}</span>
    </button>
  )
}

export function Check({ checked, onClick, title, sub }: { checked: boolean; onClick: () => void; title: string; sub?: string }) {
  return (
    <button onClick={onClick} role="checkbox" aria-checked={checked} className={cx('flex w-full items-center gap-3 rounded-2xl border-2 bg-card p-4 text-left transition', checked ? 'border-brand bg-brand-soft/60' : 'border-line hover:border-brand/40')}>
      <span className={cx('grid size-6 shrink-0 place-items-center rounded-md border-2 text-white', checked ? 'border-brand bg-brand' : 'border-line')}>
        {checked && (
          <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
            <path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="flex-1">
        <span className="block text-[15px] font-semibold">{title}</span>
        {sub && <span className="mt-0.5 block text-[13px] leading-snug text-muted">{sub}</span>}
      </span>
    </button>
  )
}

export function Section({ title, children, className, action }: { title?: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <section className={cx('px-4', className)}>
      {title && (
        <div className="mb-2 flex items-end justify-between px-1">
          <h2 className="text-[13px] font-bold tracking-wide text-muted uppercase">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function Simulated({ text }: { text?: T }) {
  const { tr } = useStore()
  return (
    <p className="mt-3 flex items-start gap-1.5 text-[12px] leading-snug text-muted">
      <span className="mt-0.5 rounded bg-warn-soft px-1 text-[10px] font-bold text-warn uppercase">demo</span>
      {tr(text ?? t3('Symulacja: nic nie jest wysyłane do żadnego urzędu.', 'Simulation: nothing is sent to any office.', 'Симуляція: нічого не надсилається до жодної установи.'))}
    </p>
  )
}

export function Avatar({ initials, color, size = 40 }: { initials: string; color: string; size?: number }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-full font-bold text-white" style={{ width: size, height: size, background: color, fontSize: size * 0.36 }} aria-hidden>
      {initials}
    </span>
  )
}

/** Decorative QR-like pattern (not a real QR code). */
export function FakeQR({ seed = 'x', size = 132 }: { seed?: string; size?: number }) {
  const n = 21
  let h = 0
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const cells: boolean[] = []
  for (let i = 0; i < n * n; i++) {
    h = (h * 1103515245 + 12345) >>> 0
    cells.push(((h >> 16) & 1) === 1)
  }
  const finder = (x: number, y: number) => {
    const inF = (fx: number, fy: number) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7
    for (const [fx, fy] of [
      [0, 0],
      [n - 7, 0],
      [0, n - 7],
    ]) {
      if (inF(fx, fy)) {
        const dx = x - fx
        const dy = y - fy
        return dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4) ? 1 : 0
      }
    }
    return -1
  }
  return (
    <svg viewBox={`0 0 ${n} ${n}`} width={size} height={size} className="rounded-lg bg-white p-1" aria-label="QR">
      {Array.from({ length: n * n }, (_, i) => {
        const x = i % n
        const y = Math.floor(i / n)
        const f = finder(x, y)
        const on = f === -1 ? cells[i] : f === 1
        return on ? <rect key={i} x={x} y={y} width={1} height={1} fill="#0f172a" /> : null
      })}
    </svg>
  )
}

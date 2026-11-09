import { ArrowRight, BellRing, Building2, CalendarPlus, CheckCircle2, Circle, Copy, Hourglass, Pencil, ShieldCheck, Smartphone, Sparkles, Truck, Ban, ListChecks, Scale, FileText } from 'lucide-react'
import { addr } from '../data'
import { daysLeftLabel, fmtDate, t3, tasksNeedAction } from '../i18n'
import { daysBetween, parseIso, today, type Task } from '../plan'
import { useStore } from '../state'
import { Btn, Card, Pill, Progress, Screen, Section, cx } from '../ui'
import { downloadIcs } from '../ics'

export function deadlinePill(t: Task, tr: (x: never) => string, lang: Parameters<typeof daysLeftLabel>[1], done: boolean) {
  if (done) return <Pill tone="ok">✓ {tr(t3('załatwione', 'done', 'виконано') as never)}</Pill>
  if (!t.deadline) return t.optional ? <Pill tone="muted">{tr(t3('zalecane', 'recommended', 'рекомендовано') as never)}</Pill> : null
  const d = daysBetween(today(), t.deadline)
  return (
    <Pill tone={d < 0 ? 'danger' : d <= 5 ? 'warn' : 'brand'}>
      {fmtDate(t.deadline, lang, { day: 'numeric', month: 'short' })} · {daysLeftLabel(d, lang)}
    </Pill>
  )
}

export function channelIcon(t: Task) {
  if (t.channel === 'office') return <Building2 className="size-5" />
  if (t.channel === 'auto') return <Sparkles className="size-5" />
  if (t.channel === 'none') return <Ban className="size-5" />
  if (t.channel === 'outside') return <ListChecks className="size-5" />
  return <Smartphone className="size-5" />
}

export function PlanScreen({ fresh }: { fresh?: boolean }) {
  const { s, p, plan, tr, nav, lang, isDone, set, notify, toast, log, goTab } = useStore()
  const a = s.answers
  const root = s.stack.length === 1

  if (!s.planReady) {
    return (
      <Screen title={t3('Moje sprawy', 'My cases', 'Мої справи')} onBack={false}>
        <div className="px-6 pt-16 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-soft text-brand">
            <ListChecks className="size-8" />
          </div>
          <h2 className="mt-4 text-xl font-bold">{tr(t3('Nie masz aktywnych spraw', 'No active cases', 'Немає активних справ'))}</h2>
          <p className="mt-2 text-[15px] text-muted">{tr(t3('Zacznij od sytuacji życiowej – np. przeprowadzki.', 'Start from a life event, e.g. moving house.', 'Почніть із життєвої ситуації – напр. переїзду.'))}</p>
          <Btn className="mt-6" onClick={() => nav({ name: 'intro' })}>
            {tr(t3('Przeprowadzam się', 'I’m moving', 'Я переїжджаю'))}
          </Btn>
        </div>
      </Screen>
    )
  }

  const to = addr(a.addressId)
  const from = addr(p.current.addressId)
  const todo = plan.filter((x) => x.group === 'todo').sort((x, y) => Number(isDone(x)) - Number(isDone(y)) || Number(y.id === 'meldunek') - Number(x.id === 'meldunek') || (x.optional ? 1 : 0) - (y.optional ? 1 : 0) || (x.deadline?.getTime() ?? 9e15) - (y.deadline?.getTime() ?? 9e15))
  const auto = plan.filter((x) => x.group === 'auto')
  const nn = plan.filter((x) => x.group === 'notNeeded')
  const life = plan.filter((x) => x.group === 'life')
  const doneCount = todo.filter(isDone).length
  const required = todo.filter((x) => !x.optional)
  const allRequiredDone = required.every(isDone)
  const simple = s.settings.simple

  const toggleReminders = () => {
    const on = !s.reminders
    set(() => ({ reminders: on }))
    if (on) {
      const next = todo.find((x) => !isDone(x) && x.deadline)
      toast(t3('Przypomnienia włączone', 'Reminders on', 'Нагадування увімкнено'))
      if (next) {
        setTimeout(
          () =>
            notify(
              t3('Przypomnienie · Przeprowadzka', 'Reminder · Moving house', 'Нагадування · Переїзд'),
              t3(`${next.title.pl}: ${daysLeftLabel(daysBetween(today(), next.deadline!), 'pl')}.`, `${next.title.en}: ${daysLeftLabel(daysBetween(today(), next.deadline!), 'en')}.`, `${next.title.uk}: ${daysLeftLabel(daysBetween(today(), next.deadline!), 'uk')}.`),
            ),
          1400,
        )
      }
    }
  }

  const copyPlan = async () => {
    const lines = [
      tr(t3('Mój plan przeprowadzki', 'My moving plan', 'Мій план переїзду')) + ` – ${to.street}, ${to.city}`,
      ...todo.map((x) => `${isDone(x) ? '☑' : '☐'} ${tr(x.title)}${x.deadline ? ' – ' + fmtDate(x.deadline, lang) : ''}`),
      '',
      tr(t3('Zrobi się samo:', 'Happens automatically:', 'Відбудеться автоматично:')),
      ...auto.map((x) => `• ${tr(x.title)}`),
    ]
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      toast(t3('Plan skopiowany – możesz go wkleić np. domownikom', 'Plan copied, paste it to your household', 'План скопійовано'))
    } catch {
      toast(t3('Nie udało się skopiować', 'Could not copy', 'Не вдалося скопіювати'))
    }
  }

  return (
    <Screen
      title={t3('Plan przeprowadzki', 'Moving plan', 'План переїзду')}
      onBack={root ? false : undefined}
      right={
        <button onClick={() => nav({ name: 'triage', param: '0' })} className="grid size-11 place-items-center rounded-full hover:bg-bg" aria-label={tr(t3('Zmień odpowiedzi', 'Edit answers', 'Змінити відповіді'))}>
          <Pencil className="size-5" />
        </button>
      }
    >
      <div className="px-4 pt-4">
        <Card className={cx('relative overflow-hidden bg-gradient-to-br from-brand to-brand-strong p-5 text-white', fresh && 'anim-rise')}>
          <Truck className="absolute -right-4 -bottom-5 size-28 text-white/10" aria-hidden />
          <div className="flex items-center gap-2 text-[13px] text-white/80">
            <span className="truncate">{from.city}</span>
            <ArrowRight className="size-4 shrink-0" />
            <span className="truncate font-semibold text-white">{to.street}, {to.city}</span>
          </div>
          <p className="mt-3 text-[24px] leading-tight font-bold">
            {allRequiredDone ? tr(t3('Najważniejsze za Tobą', 'The essentials are done', 'Найважливіше позаду')) : tr(tasksNeedAction(required.filter((x) => !isDone(x)).length))}
          </p>
          <p className="mt-1 text-[13px] text-white/80">
            {tr(t3('Zamieszkanie', 'Moving in', 'Заселення'))}: {fmtDate(parseIso(a.moveDate), lang, { day: 'numeric', month: 'long', year: 'numeric' })} · {auto.length} {tr(t3('zrobi się samo', 'automatic', 'автоматично'))} · {nn.length} {tr(t3('niepotrzebne', 'not needed', 'не потрібно'))}
          </p>
          <Progress value={todo.length ? doneCount / todo.length : 0} className="mt-4 bg-white/20 [&>div]:bg-white" />
        </Card>
      </div>

      <Section title={tr(t3('Do zrobienia', 'To do', 'Зробити'))} className="mt-6">
        <div className="space-y-2.5">
          {todo.map((t, i) => {
            const done = isDone(t)
            const waiting = t.id === 'meldunek' && (s.meldunek === 'waitingOwner' || s.meldunek === 'waitingOffice')
            return (
              <Card key={t.id} onClick={() => nav({ name: 'task', param: t.id })} className={cx('p-4', fresh && 'anim-rise')}>
                <div className="flex gap-3" style={fresh ? { animationDelay: `${i * 60}ms` } : undefined}>
                  <span className={cx('grid size-10 shrink-0 place-items-center rounded-xl', done ? 'bg-ok-soft text-ok' : t.channel === 'office' ? 'bg-warn-soft text-warn' : 'bg-brand-soft text-brand')}>{done ? <CheckCircle2 className="size-5" /> : channelIcon(t)}</span>
                  <div className="min-w-0 flex-1">
                    <p className={cx('text-[15px] leading-snug font-semibold', done && 'text-muted line-through decoration-1')}>{tr(t.title)}</p>
                    {!done && <p className="mt-1 text-[13px] leading-snug text-muted">{tr(simple ? t.plain : t.summary)}</p>}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {waiting ? (
                        <Pill tone="warn">
                          <Hourglass className="size-3" /> {tr(s.meldunek === 'waitingOwner' ? t3('czeka na właściciela', 'waiting for owner', 'очікує власника') : t3('w urzędzie', 'at the office', 'в установі'))}
                        </Pill>
                      ) : (
                        deadlinePill(t, tr as never, lang, done)
                      )}
                      {!done && t.channel === 'office' && <Pill tone="warn">{tr(t3('wizyta w urzędzie', 'office visit', 'візит до установи'))}</Pill>}
                      {!done && t.channel === 'app' && t.time && <Pill tone="muted">{tr(t3('online', 'online', 'онлайн'))} · {tr(t.time)}</Pill>}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </Section>

      <Section title={tr(t3('Zrobi się samo', 'Happens automatically', 'Відбудеться автоматично'))} className="mt-6">
        <Card className="divide-y divide-line">
          {auto.map((t) => {
            const done = isDone(t)
            return (
              <div key={t.id} className="flex gap-3 px-4 py-3.5">
                <span className={cx('mt-0.5 grid size-7 shrink-0 place-items-center rounded-full', done ? 'bg-ok text-white' : 'bg-bg text-muted')}>{done ? <CheckCircle2 className="size-4" /> : <Sparkles className="size-4" />}</span>
                <div className="flex-1">
                  <p className="text-[14px] leading-snug font-semibold">{tr(t.title)}</p>
                  <p className="mt-0.5 text-[13px] leading-snug text-muted">{tr(simple ? t.plain : t.summary)}</p>
                  {!done && <p className="mt-1 text-[12px] font-semibold text-brand">{tr(t3('po zameldowaniu', 'after registration', 'після реєстрації'))}</p>}
                </div>
              </div>
            )
          })}
        </Card>
      </Section>

      <Section title={tr(t3('Nie musisz', 'You don’t need to', 'Не потрібно'))} className="mt-6">
        <Card className="divide-y divide-line">
          {nn.map((t) => (
            <div key={t.id} className="flex gap-3 px-4 py-3.5">
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-bg text-muted">
                <Ban className="size-4" />
              </span>
              <div className="flex-1">
                <p className="text-[14px] font-semibold">{tr(t.title)}</p>
                <p className="mt-0.5 text-[13px] leading-snug text-muted">{tr(simple ? t.plain : t.summary)}</p>
              </div>
            </div>
          ))}
        </Card>
      </Section>

      {life.length > 0 && (
        <Section title={tr(t3('Poza urzędem', 'Outside government', 'Поза установами'))} className="mt-6">
          <Card className="divide-y divide-line">
            {life.map((t) => {
              const done = !!s.done[t.id]
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    set((x) => ({ done: { ...x.done, [t.id]: !done } }))
                    if (!done) log(t3(`Odhaczono: ${t.title.pl}`, `Ticked: ${t.title.en}`, `Відмічено: ${t.title.uk}`))
                  }}
                  role="checkbox"
                  aria-checked={done}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-bg"
                >
                  {done ? <CheckCircle2 className="size-6 text-ok" /> : <Circle className="size-6 text-line" />}
                  <span className={cx('flex-1 text-[14px] font-medium', done && 'text-muted line-through')}>{tr(t.title)}</span>
                </button>
              )
            })}
          </Card>
        </Section>
      )}

      <Section title={tr(t3('Narzędzia', 'Tools', 'Інструменти'))} className="mt-6 pb-8">
        <Card className="divide-y divide-line">
          <button onClick={toggleReminders} role="switch" aria-checked={s.reminders} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-bg">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
              <BellRing className="size-5" />
            </span>
            <span className="flex-1">
              <span className="block text-[15px] font-medium">{tr(t3('Przypomnienia o terminach', 'Deadline reminders', 'Нагадування про терміни'))}</span>
              <span className="block text-[13px] text-muted">{tr(t3('7 dni i 1 dzień przed terminem', '7 days and 1 day before', 'За 7 днів і за 1 день'))}</span>
            </span>
            <span className={cx('relative h-7 w-12 rounded-full transition', s.reminders ? 'bg-brand' : 'bg-line')}>
              <span className={cx('absolute top-1 size-5 rounded-full bg-white shadow transition-all', s.reminders ? 'left-6' : 'left-1')} />
            </span>
          </button>
          <ToolRow icon={<CalendarPlus className="size-5" />} title={t3('Dodaj terminy do kalendarza', 'Add deadlines to calendar', 'Додати терміни в календар')} sub={t3('Plik .ics – Google, Apple, Outlook', '.ics file: Google, Apple, Outlook', 'Файл .ics – Google, Apple, Outlook')} onClick={() => { downloadIcs(todo.filter((x) => x.deadline && !isDone(x)), tr); toast(t3('Pobrano plik kalendarza', 'Calendar file downloaded', 'Файл календаря завантажено')) }} />
          <ToolRow icon={<Copy className="size-5" />} title={t3('Skopiuj plan', 'Copy plan', 'Скопіювати план')} sub={t3('Np. dla domowników', 'E.g. for your household', 'Напр. для родини')} onClick={copyPlan} />
          <ToolRow icon={<ShieldCheck className="size-5" />} title={t3('Twoje dane w tej sprawie', 'Your data in this case', 'Ваші дані в цій справі')} sub={t3('Co wykorzystujemy i kto to widzi', 'What we use and who sees it', 'Що використовуємо і хто бачить')} onClick={() => nav({ name: 'privacy' })} />
          {s.meldunek === 'done' && <ToolRow icon={<FileText className="size-5" />} title={t3('Zaświadczenie o zameldowaniu', 'Registration certificate', 'Довідка про реєстрацію')} onClick={() => nav({ name: 'certificate' })} />}
          <ToolRow icon={<Scale className="size-5" />} title={t3('Źródła i podstawy prawne', 'Sources and legal basis', 'Джерела та правові підстави')} onClick={() => nav({ name: 'sources' })} />
        </Card>
        {root && (
          <button onClick={() => goTab('home')} className="mt-4 w-full text-center text-[13px] font-semibold text-brand">
            {tr(t3('Wróć do startu', 'Back to start', 'На головну'))}
          </button>
        )}
      </Section>
    </Screen>
  )
}

function ToolRow({ icon, title, sub, onClick }: { icon: React.ReactNode; title: Parameters<ReturnType<typeof useStore>['tr']>[0]; sub?: Parameters<ReturnType<typeof useStore>['tr']>[0]; onClick: () => void }) {
  const { tr } = useStore()
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-bg">
      <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">{icon}</span>
      <span className="flex-1">
        <span className="block text-[15px] font-medium">{tr(title)}</span>
        {sub && <span className="block text-[13px] text-muted">{tr(sub)}</span>}
      </span>
    </button>
  )
}

export function TaskDetail({ id }: { id: string }) {
  const { plan, tr, nav, lang, isDone, s, set, toast, log } = useStore()
  const t = plan.find((x) => x.id === id)
  if (!t) return <Screen title="—">{null}</Screen>
  const done = isDone(t)
  const isMeldunek = t.id === 'meldunek'
  const waiting = isMeldunek && (s.meldunek === 'waitingOwner' || s.meldunek === 'waitingOffice')

  const start = () => {
    if (!t.screen) return
    if (isMeldunek && waiting) return nav({ name: 'meldunekResult' })
    if (t.screen.startsWith('quick:')) return nav({ name: 'quick', param: t.screen.slice(6) })
    nav({ name: t.screen })
  }

  return (
    <Screen
      title={t3('Sprawa', 'Task', 'Справа')}
      footer={
        done ? (
          isMeldunek ? (
            <Btn kind="secondary" onClick={() => nav({ name: 'certificate' })} icon={<FileText className="size-5" />}>
              {tr(t3('Zobacz zaświadczenie', 'View certificate', 'Переглянути довідку'))}
            </Btn>
          ) : (
            <Btn kind="secondary" onClick={() => { set((x) => ({ done: { ...x.done, [t.id]: false } })); toast(t3('Przywrócono do listy', 'Moved back to the list', 'Повернено до списку')) }}>
              {tr(t3('Cofnij oznaczenie', 'Undo', 'Скасувати позначку'))}
            </Btn>
          )
        ) : (
          <div className="space-y-2">
            {t.screen && (
              <Btn onClick={start}>
                {waiting ? tr(t3('Zobacz status', 'View status', 'Переглянути статус')) : t.channel === 'office' ? tr(t3('Przygotuj wizytę', 'Prepare the visit', 'Підготувати візит')) : tr(t3('Załatw teraz', 'Do it now', 'Зробити зараз'))}
              </Btn>
            )}
            {!isMeldunek && (
              <Btn kind="ghost" onClick={() => { set((x) => ({ done: { ...x.done, [t.id]: true } })); log(t3(`Oznaczono jako załatwione: ${t.title.pl}`, `Marked done: ${t.title.en}`, `Позначено виконаним: ${t.title.uk}`)); toast(t3('Oznaczono jako załatwione', 'Marked as done', 'Позначено як виконане')) }}>
                {tr(t3('Załatwione w inny sposób', 'Done another way', 'Виконано іншим способом'))}
              </Btn>
            )}
          </div>
        )
      }
    >
      <div className="px-5 pt-5 pb-6">
        <div className="flex flex-wrap gap-1.5">{deadlinePill(t, tr as never, lang, done)}</div>
        <h2 className="mt-3 text-[24px] leading-tight font-bold">{tr(t.title)}</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{tr(s.settings.simple ? t.plain : t.summary)}</p>

        <Card className="mt-5 divide-y divide-line">
          {t.deadlineRule && <Fact label={t3('Termin', 'Deadline', 'Термін')} value={`${t.deadline ? fmtDate(t.deadline, lang, { day: 'numeric', month: 'long', year: 'numeric' }) + ' · ' : ''}${tr(t.deadlineRule)}`} />}
          <Fact label={t3('Gdzie', 'Where', 'Де')} value={tr(t.channel === 'office' ? t3('w urzędzie gminy (osobiście)', 'at the municipal office (in person)', 'в установі гміни (особисто)') : t.channel === 'outside' ? t3('poza aplikacją', 'outside the app', 'поза застосунком') : t3('w aplikacji', 'in the app', 'у застосунку'))} />
          {t.time && <Fact label={t3('Ile to trwa', 'How long', 'Скільки триває')} value={tr(t.time)} />}
          {t.cost && <Fact label={t3('Koszt', 'Cost', 'Вартість')} value={tr(t.cost)} />}
        </Card>

        {t.docs && !s.settings.simple && (
          <>
            <h3 className="mt-6 text-[13px] font-bold tracking-wide text-muted uppercase">{tr(t3('Co będzie potrzebne', 'What you need', 'Що знадобиться'))}</h3>
            <ul className="mt-2 space-y-2">
              {t.docs.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-[15px]">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" />
                  {tr(d)}
                </li>
              ))}
            </ul>
          </>
        )}
        {t.legal && !s.settings.simple && (
          <p className="mt-6 flex items-center gap-2 text-[13px] text-muted">
            <Scale className="size-4" /> {tr(t3('Podstawa', 'Legal basis', 'Підстава'))}: {tr(t.legal)}
          </p>
        )}
      </div>
    </Screen>
  )
}

function Fact({ label, value }: { label: Parameters<ReturnType<typeof useStore>['tr']>[0]; value: string }) {
  const { tr } = useStore()
  return (
    <div className="flex gap-3 px-4 py-3">
      <span className="w-28 shrink-0 text-[13px] text-muted">{tr(label)}</span>
      <span className="flex-1 text-[14px] font-medium">{value}</span>
    </div>
  )
}

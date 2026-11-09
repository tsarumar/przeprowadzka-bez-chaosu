import { Baby, Bell, Car, ChevronRight, FileWarning, Heart, IdCard, MessageCircleQuestion, Search, Sparkles, Truck, Briefcase, CarFront } from 'lucide-react'
import { t3, fmtDate } from '../i18n'
import { daysBetween, today } from '../plan'
import { useStore } from '../state'
import { Avatar, Card, Pill, Progress, Section } from '../ui'

export function Home() {
  const { p, tr, nav, toast, s, plan, isDone, lang } = useStore()
  const greet = new Date().getHours() < 18 ? t3('Dzień dobry', 'Hello', 'Вітаємо') : t3('Dobry wieczór', 'Good evening', 'Добрий вечір')
  const actionable = plan.filter((x) => x.group === 'todo')
  const doneCount = actionable.filter(isDone).length
  const next = actionable.filter((x) => !isDone(x) && x.deadline).sort((a, b) => a.deadline!.getTime() - b.deadline!.getTime())[0]
  const outOfScope = () => toast(t3('Poza zakresem prototypu – ten pokaz skupia się na przeprowadzce.', 'Out of scope, this demo focuses on moving house.', 'Поза межами прототипу – демо присвячене переїзду.'))

  return (
    <div className="h-full overflow-y-auto no-scrollbar bg-bg pb-6">
      <div className="bg-gradient-to-b from-brand-soft to-bg px-4 pt-4 pb-5">
        <div className="flex items-center gap-3">
          <Avatar initials={p.initials} color={p.color} size={44} />
          <div className="flex-1">
            <p className="text-[13px] text-muted">{tr(greet)},</p>
            <p className="text-xl font-bold">{p.firstName}</p>
          </div>
          <button onClick={() => toast(t3('Brak nowych powiadomień', 'No new notifications', 'Немає нових сповіщень'))} className="grid size-11 place-items-center rounded-full bg-card shadow-card" aria-label={tr(t3('Powiadomienia', 'Notifications', 'Сповіщення'))}>
            <Bell className="size-5" />
          </button>
        </div>
        <button onClick={() => nav({ name: 'ask' })} className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-card px-4 py-3.5 text-left text-muted shadow-card">
          <Search className="size-5" />
          <span className="flex-1 text-[15px]">{tr(t3('Czego potrzebujesz? Np. „przeprowadzka”', 'What do you need? E.g. “moving”', 'Що вам потрібно? Напр. «переїзд»'))}</span>
          <MessageCircleQuestion className="size-5 text-brand" />
        </button>
      </div>

      <Section>
        {!s.planReady ? (
          <Card onClick={() => nav({ name: 'intro' })} className="anim-rise relative overflow-hidden bg-gradient-to-br from-brand to-brand-strong p-5 text-white">
            <Truck className="absolute -right-3 -bottom-4 size-28 text-white/10" aria-hidden />
            <Pill className="bg-white/15 text-white">
              <Sparkles className="size-3.5" /> {tr(t3('Nowość', 'New', 'Новинка'))}
            </Pill>
            <h2 className="mt-3 text-[22px] leading-tight font-bold">{tr(t3('Przeprowadzasz się?', 'Moving house?', 'Переїжджаєте?'))}</h2>
            <p className="mt-1.5 max-w-[260px] text-[14px] leading-snug text-white/85">
              {tr(t3('Jedna sprawa zamiast dziesięciu. Odpowiedz na kilka pytań, a przygotujemy plan wszystkich formalności.', 'One case instead of ten. Answer a few questions and we prepare a plan for every formality.', 'Одна справа замість десяти. Дайте відповідь на кілька питань – і ми підготуємо план усіх формальностей.'))}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 rounded-xl bg-white px-4 py-2.5 text-[14px] font-semibold text-brand">
              {tr(t3('Zacznij', 'Start', 'Почати'))} <ChevronRight className="size-4" />
            </span>
          </Card>
        ) : (
          <Card onClick={() => nav({ name: 'plan' })} className="anim-rise p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-brand text-white">
                <Truck className="size-6" />
              </span>
              <div className="flex-1">
                <p className="text-[13px] text-muted">{tr(t3('Twoja sprawa', 'Your case', 'Ваша справа'))}</p>
                <p className="text-[17px] font-bold">{tr(t3('Przeprowadzka', 'Moving house', 'Переїзд'))}</p>
              </div>
              <ChevronRight className="size-5 text-muted" />
            </div>
            <Progress value={actionable.length ? doneCount / actionable.length : 0} className="mt-4" />
            <div className="mt-2 flex items-center justify-between text-[13px]">
              <span className="font-semibold">{tr(t3(`${doneCount} z ${actionable.length} spraw`, `${doneCount} of ${actionable.length} tasks`, `${doneCount} з ${actionable.length} справ`))}</span>
              {next && (
                <span className="text-muted">
                  {tr(t3('Najbliższy termin:', 'Next deadline:', 'Найближчий термін:'))} <b className="text-ink">{fmtDate(next.deadline!, lang)}</b> ({daysBetween(today(), next.deadline!)} {tr(t3('dni', 'days', 'дн.'))})
                </span>
              )}
            </div>
          </Card>
        )}
      </Section>

      <Section title={tr(t3('Dokumenty', 'Documents', 'Документи'))} className="mt-6">
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
          {[
            { icon: <IdCard className="size-5" />, label: t3('Dowód cyfrowy', 'Digital ID', 'Цифрове посвідчення'), bg: 'from-sky-600 to-blue-700' },
            ...(p.vehicle ? [{ icon: <Car className="size-5" />, label: t3('Moje pojazdy', 'My vehicles', 'Мої авто'), bg: 'from-amber-500 to-orange-600' }] : []),
            { icon: <CarFront className="size-5" />, label: t3('Prawo jazdy', 'Driving licence', 'Посвідчення водія'), bg: 'from-violet-600 to-fuchsia-700' },
          ].map((d, i) => (
            <button key={i} onClick={outOfScope} className={`flex h-24 w-36 shrink-0 flex-col justify-between rounded-2xl bg-gradient-to-br ${d.bg} p-3 text-left text-white shadow-card`}>
              {d.icon}
              <span className="text-[13px] leading-tight font-semibold">{tr(d.label)}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title={tr(t3('Sytuacje życiowe', 'Life events', 'Життєві ситуації'))} className="mt-6">
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'move', icon: <Truck className="size-5" />, label: t3('Przeprowadzka', 'Moving house', 'Переїзд'), active: true },
            { id: 'baby', icon: <Baby className="size-5" />, label: t3('Narodziny dziecka', 'Having a baby', 'Народження дитини') },
            { id: 'car', icon: <Car className="size-5" />, label: t3('Kupuję auto', 'Buying a car', 'Купую авто') },
            { id: 'lost', icon: <FileWarning className="size-5" />, label: t3('Zgubione dokumenty', 'Lost documents', 'Втрачені документи') },
            { id: 'wed', icon: <Heart className="size-5" />, label: t3('Ślub', 'Getting married', 'Шлюб') },
            { id: 'job', icon: <Briefcase className="size-5" />, label: t3('Pierwsza praca', 'First job', 'Перша робота') },
          ].map((e) => (
            <button
              key={e.id}
              onClick={e.active ? () => nav({ name: s.planReady ? 'plan' : 'intro' }) : outOfScope}
              className={`shadow-card flex min-h-[88px] flex-col justify-between rounded-2xl p-3.5 text-left ${e.active ? 'bg-card ring-2 ring-brand' : 'bg-card'}`}
            >
              <span className={`grid size-9 place-items-center rounded-xl ${e.active ? 'bg-brand text-white' : 'bg-bg text-muted'}`}>{e.icon}</span>
              <span className="mt-2 flex items-center justify-between gap-1">
                <span className="text-[14px] leading-tight font-semibold">{tr(e.label)}</span>
                {!e.active && <span className="text-[10px] font-semibold text-muted uppercase">{tr(t3('wkrótce', 'soon', 'скоро'))}</span>}
              </span>
            </button>
          ))}
        </div>
      </Section>

      <p className="mx-6 mt-6 text-center text-[11px] leading-snug text-muted">
        {tr(t3('Prototyp koncepcyjny na mObywatel Challenge 2026. Nie jest oficjalną aplikacją mObywatel. Wszystkie dane są fikcyjne.', 'Concept prototype for mObywatel Challenge 2026. Not the official mObywatel app. All data is fictional.', 'Концептуальний прототип для mObywatel Challenge 2026. Не є офіційним застосунком mObywatel. Усі дані вигадані.'))}
      </p>
    </div>
  )
}

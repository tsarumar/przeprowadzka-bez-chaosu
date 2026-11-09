import { AlertTriangle, Building2, CalendarPlus, Car, Check, CheckCircle2, Clock3, FileText, Hospital, MapPin, QrCode, School, Trash2, Vote, Landmark, Briefcase } from 'lucide-react'
import { useState } from 'react'
import { CLINICS, OFFICES, addr, addrLine } from '../data'
import { daysLeftLabel, fmtDate, t3, type T } from '../i18n'
import { addDays, daysBetween, meldunekDeadline, parseIso, today } from '../plan'
import { useStore } from '../state'
import { Btn, Card, Check as CheckBox, Choice, FakeQR, Pill, Screen, Simulated, cx } from '../ui'
import { downloadVisitIcs } from '../ics'
import { PinSheet } from './Meldunek'

/* ---------------- Non-EU: prepare the office visit ---------------- */

const HOLIDAYS = ['01-01', '01-06', '05-01', '05-03', '08-15', '11-01', '11-11', '12-24', '12-25', '12-26']
const isHoliday = (d: Date) => HOLIDAYS.includes(`${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)

/** Next 4 weekdays starting today; holidays and days after the deadline are shown but blocked. */
const visitDays = (deadline: Date) => {
  const out: { d: Date; reason?: 'holiday' | 'late' }[] = []
  let d = today()
  while (out.length < 4) {
    if (d.getDay() !== 0 && d.getDay() !== 6) out.push({ d, reason: isHoliday(d) ? 'holiday' : d.getTime() > deadline.getTime() ? 'late' : undefined })
    d = addDays(d, 1)
  }
  return out
}

export function Visit() {
  const { s, p, tr, set, lang, nav, toast, log, goTab } = useStore()
  const a = s.answers
  const to = addr(a.addressId)
  const deadline = meldunekDeadline(a)
  const left = daysBetween(today(), deadline)
  const offices = OFFICES[to.city] ?? [{ name: tr(t3(`Urząd gminy ${to.city} (przykład)`, `${to.city} municipal office (example)`, `Установа гміни ${to.city} (приклад)`)), street: 'ul. Przykładowa 1' }]
  const days = visitDays(deadline)
  const firstOpen = days.find((x) => !x.reason)?.d ?? days[0].d
  const [office, setOffice] = useState(s.visit?.office ?? offices[0].name)
  const [day, setDay] = useState(s.visit?.day ?? firstOpen.toISOString())
  const [time, setTime] = useState(s.visit?.time ?? '')
  const docs: { id: string; title: T }[] = [
    { id: 'passport', title: t3('Ważny paszport', 'Valid passport', 'Дійсний паспорт') },
    { id: 'card', title: t3('Karta pobytu', 'Residence card', 'Карта побиту') },
    { id: 'lease', title: t3('Umowa najmu (oryginał)', 'Tenancy agreement (original)', 'Договір оренди (оригінал)') },
    { id: 'form', title: t3('Formularz zgłoszenia – gotowy w aplikacji', 'Registration form, ready in the app', 'Форма заяви – готова в застосунку') },
  ]
  const toggleDoc = (id: string) => set((x) => ({ docsChecked: x.docsChecked.includes(id) ? x.docsChecked.filter((d) => d !== id) : [...x.docsChecked, id] }))
  const booked = !!s.visit

  const book = () => {
    set(() => ({ visit: { office, day, time } }))
    log(t3(`Zarezerwowano wizytę: ${office}, ${time}`, `Visit booked: ${office}, ${time}`, `Заброньовано візит: ${office}, ${time}`))
    toast(t3('Wizyta zarezerwowana', 'Visit booked', 'Візит заброньовано'))
  }

  return (
    <Screen
      title={t3('Wizyta w urzędzie', 'Office visit', 'Візит до установи')}
      footer={
        booked ? (
          <Btn
            kind="ok"
            icon={<CheckCircle2 className="size-5" />}
            onClick={() => {
              set(() => ({ meldunek: 'done', meldunekVia: 'office' }))
              log(t3('Zameldowanie w urzędzie zakończone', 'Registration at the office completed', 'Реєстрацію в установі завершено'), t3('Urząd gminy', 'Municipal office', 'Установа гміни'))
              nav({ name: 'meldunekResult' })
            }}
          >
            {tr(t3('Wizyta odbyta – meldunek załatwiony', 'Visit done, registration complete', 'Візит відбувся – реєстрацію виконано'))}
          </Btn>
        ) : (
          <Btn disabled={!time} onClick={book}>
            {time ? tr(t3(`Zarezerwuj: ${fmtDate(new Date(day), lang, { weekday: 'short', day: 'numeric', month: 'short' })}, ${time}`, `Book: ${fmtDate(new Date(day), lang, { weekday: 'short', day: 'numeric', month: 'short' })}, ${time}`, `Забронювати: ${fmtDate(new Date(day), lang, { weekday: 'short', day: 'numeric', month: 'short' })}, ${time}`)) : tr(t3('Wybierz godzinę wizyty', 'Choose a time', 'Оберіть час'))}
          </Btn>
        )
      }
    >
      <div className="space-y-5 px-4 pt-4 pb-6">
        <div className={cx('flex gap-3 rounded-2xl p-4', left <= 1 ? 'bg-danger-soft text-danger' : 'bg-warn-soft text-warn')}>
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <div className="text-[14px] leading-relaxed">
            <b>
              {daysLeftLabel(left, lang)} · {tr(t3('do', 'until', 'до'))} {fmtDate(deadline, lang, { weekday: 'long', day: 'numeric', month: 'long' })}
            </b>
            <p className="mt-1 text-[13px]">{tr(t3('Jako obywatel państwa spoza UE musisz zameldować się osobiście, najpóźniej w 4. dniu od zamieszkania. Online nie jest to możliwe – dlatego przygotujemy wszystko wcześniej.', 'As a non-EU citizen you must register in person, no later than day 4 after moving in. It can’t be done online, so we prepare everything in advance.', 'Як громадянин країни поза ЄС ви маєте зареєструватися особисто, не пізніше 4-го дня після заселення.'))}</p>
          </div>
        </div>

        <section>
          <h3 className="mb-2 px-1 text-[13px] font-bold tracking-wide text-muted uppercase">1 · {tr(t3('Formularz wypełniony za Ciebie', 'Form filled in for you', 'Форма заповнена за вас'))}</h3>
          <Card onClick={() => nav({ name: 'form' })} className="flex items-center gap-3 p-4">
            <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand">
              <FileText className="size-5" />
            </span>
            <div className="flex-1">
              <p className="font-semibold">{tr(t3('Zgłoszenie pobytu czasowego', 'Temporary stay registration form', 'Заява про тимчасове перебування'))}</p>
              <p className="text-[13px] text-muted">{tr(t3('Dane z karty pobytu i umowy · kod QR dla urzędnika', 'Data from your residence card and lease · QR code for the clerk', 'Дані з карти побиту і договору · QR-код'))}</p>
            </div>
            <QrCode className="size-5 text-muted" />
          </Card>
        </section>

        <section>
          <h3 className="mb-2 px-1 text-[13px] font-bold tracking-wide text-muted uppercase">
            2 · {tr(t3('Zabierz ze sobą', 'Bring with you', 'Візьміть із собою'))} ({s.docsChecked.length}/{docs.length})
          </h3>
          <div className="space-y-2">
            {docs.map((d) => (
              <CheckBox key={d.id} checked={s.docsChecked.includes(d.id)} onClick={() => toggleDoc(d.id)} title={tr(d.title)} />
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-2 px-1 text-[13px] font-bold tracking-wide text-muted uppercase">3 · {tr(t3('Umów wizytę', 'Book a visit', 'Запишіться на візит'))}</h3>
          {booked ? (
            <Card className="anim-rise p-4">
              <div className="flex gap-4">
                <FakeQR seed={p.pesel + s.visit!.time} size={96} />
                <div className="flex-1 text-[14px]">
                  <Pill tone="ok">✓ {tr(t3('zarezerwowano', 'booked', 'заброньовано'))}</Pill>
                  <p className="mt-2 font-semibold">{fmtDate(new Date(s.visit!.day), lang, { weekday: 'long', day: 'numeric', month: 'long' })}, {s.visit!.time}</p>
                  <p className="mt-1 text-[13px] text-muted">{s.visit!.office}</p>
                </div>
              </div>
              <p className="mt-3 rounded-xl bg-bg p-3 text-[13px] text-muted">{tr(t3('Pokaż kod QR w urzędzie: urzędnik od razu pobierze wypełniony formularz – bez przepisywania.', 'Show the QR code at the office: the clerk loads the filled-in form directly, no retyping.', 'Покажіть QR-код в установі: службовець одразу завантажить заповнену форму.'))}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Btn
                  kind="secondary"
                  icon={<CalendarPlus className="size-4" />}
                  onClick={() => {
                    const off = offices.find((o) => o.name === s.visit!.office)
                    downloadVisitIcs({ title: tr(t3('Meldunek – wizyta w urzędzie', 'Registration – office visit', 'Реєстрація – візит')), office: `${s.visit!.office}, ${off?.street ?? ''}, ${to.city}`, date: new Date(s.visit!.day), time: s.visit!.time, notes: docs.map((d) => '• ' + tr(d.title)).join('\n') })
                    toast(t3('Pobrano plik kalendarza', 'Calendar file downloaded', 'Файл календаря завантажено'))
                  }}
                  className="!min-h-11 !px-3 !text-[13px]"
                >
                  {tr(t3('Do kalendarza', 'Add to calendar', 'У календар'))}
                </Btn>
                <Btn kind="secondary" onClick={() => set(() => ({ visit: undefined }))} className="!min-h-11 !px-3 !text-[13px]">
                  {tr(t3('Zmień termin', 'Reschedule', 'Змінити час'))}
                </Btn>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2" role="radiogroup">
                {offices.map((o) => (
                  <Choice key={o.name} selected={office === o.name} onClick={() => setOffice(o.name)} icon={<Building2 className="size-5" />} title={o.name} sub={`${o.street}, ${to.city}`} />
                ))}
              </div>
              <div className="flex gap-2">
                {days.map(({ d, reason }) => (
                  <button
                    key={d.toISOString()}
                    disabled={!!reason}
                    onClick={() => {
                      setDay(d.toISOString())
                      setTime('')
                    }}
                    aria-pressed={day === d.toISOString()}
                    className={cx('flex-1 rounded-2xl border-2 py-2 text-center', reason ? 'border-transparent bg-bg text-muted/60' : day === d.toISOString() ? 'border-brand bg-brand text-white' : 'border-line bg-card')}
                  >
                    <span className="block text-[11px] font-semibold uppercase opacity-80">{daysBetween(today(), d) === 0 ? tr(t3('dziś', 'today', 'сьогодні')) : fmtDate(d, lang, { weekday: 'short' })}</span>
                    <span className="block text-[17px] font-bold">{d.getDate()}</span>
                    <span className="block text-[10px] leading-tight font-semibold">{reason === 'holiday' ? tr(t3('święto', 'holiday', 'свято')) : reason === 'late' ? tr(t3('po terminie', 'too late', 'запізно')) : ' '}</span>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {['08:15', '09:30', '10:45', '12:00', '13:15', '14:30', '15:00', '16:45'].map((h, i) => {
                  const sel = new Date(day)
                  const [hh, mm] = h.split(':').map(Number)
                  const past = daysBetween(today(), sel) === 0 && hh * 60 + mm <= new Date().getHours() * 60 + new Date().getMinutes() + 30
                  const taken = past || (i + sel.getDate()) % 3 === 0
                  return (
                    <button key={h} disabled={taken} onClick={() => setTime(h)} aria-pressed={time === h} className={cx('rounded-xl border-2 py-2.5 text-[14px] font-semibold', taken ? 'border-transparent bg-bg text-muted/40 line-through' : time === h ? 'border-brand bg-brand text-white' : 'border-line bg-card')}>
                      {h}
                    </button>
                  )
                })}
              </div>
              <p className="flex items-center gap-1.5 text-[12px] text-muted">
                <Clock3 className="size-3.5" /> {tr(t3('Wizyta trwa ok. 10 minut. Godziny w demo są przykładowe.', 'The visit takes about 10 minutes. Demo times are examples.', 'Візит триває близько 10 хвилин. Час у демо – приклад.'))}
              </p>
            </div>
          )}
        </section>
        <Simulated />
        <button onClick={() => goTab('cases')} className="w-full text-center text-[13px] font-semibold text-brand">
          {tr(t3('Wróć do planu', 'Back to plan', 'До плану'))}
        </button>
      </div>
    </Screen>
  )
}

export function FormPreview() {
  const { s, p, tr, lang } = useStore()
  const a = s.answers
  const to = addr(a.addressId)
  const fields: [string, string][] = [
    ['Nazwisko / Surname', p.name.split(' ').slice(-1)[0].toUpperCase()],
    ['Imię / First name', p.firstName.toUpperCase()],
    ['PESEL', p.pesel],
    ['Obywatelstwo / Citizenship', tr(p.citizenshipLabel)],
    ['Dokument podróży / Travel document', 'Z1234567 (paszport)'],
    ['Adres pobytu / Address', addrLine(to)],
    ['Data przybycia / Arrival date', fmtDate(parseIso(a.moveDate), 'pl', { day: '2-digit', month: '2-digit', year: 'numeric' })],
    ['Pobyt do / Stay until', fmtDate(parseIso(a.tempUntil), 'pl', { day: '2-digit', month: '2-digit', year: 'numeric' })],
    ['Podstawa / Basis', 'umowa najmu / tenancy agreement'],
  ]
  return (
    <Screen title={t3('Formularz', 'Form', 'Форма')}>
      <div className="p-4">
        <div className="rounded-xl border border-line bg-white p-4 shadow-card">
          <p className="text-center text-[13px] font-bold uppercase">Zgłoszenie pobytu czasowego</p>
          <p className="text-center text-[11px] text-muted">Temporary stay registration · {tr(t3('wypełniono automatycznie', 'filled in automatically', 'заповнено автоматично'))}</p>
          <dl className="mt-4 divide-y divide-line text-[13px]">
            {fields.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[1fr_1.2fr] gap-2 py-2">
                <dt className="text-muted">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex flex-col items-center gap-2 rounded-xl bg-bg p-4">
            <FakeQR seed={p.pesel + 'form'} size={140} />
            <p className="text-center text-[12px] text-muted">{tr(t3('Urzędnik skanuje kod i od razu widzi dane w systemie', 'The clerk scans the code and sees the data in the system', 'Службовець сканує код і одразу бачить дані'))}</p>
          </div>
        </div>
        <p className="mt-3 text-[12px] text-muted">{tr(t3('Formularz dwujęzyczny, żeby było jasne, co podpisujesz.', 'A bilingual form, so it is clear what you sign.', 'Двомовна форма, щоб було зрозуміло, що ви підписуєте.'))} {fmtDate(today(), lang)}</p>
        <Simulated text={t3('Dane i numer paszportu są fikcyjne.', 'Data and passport number are fictional.', 'Дані та номер паспорта вигадані.')} />
      </div>
    </Screen>
  )
}

/* ---------------- Vehicle ---------------- */

export function Vehicle() {
  const { s, p, tr, set, replace, log } = useStore()
  const a = s.answers
  const to = addr(a.addressId)
  const [pickup, setPickup] = useState<'office' | 'mail'>('office')
  const [pin, setPin] = useState(false)
  if (!p.vehicle) return null
  const done = () => {
    setPin(false)
    set((x) => ({ done: { ...x.done, vehicle: true } }))
    log(t3('Wysłano wniosek o zmianę adresu w dowodzie rejestracyjnym', 'Sent request to update vehicle registration address', 'Надіслано заяву про зміну адреси в техпаспорті'))
    replace({ name: 'done', param: 'vehicle' })
  }
  return (
    <Screen title={t3('Dowód rejestracyjny', 'Vehicle registration', 'Техпаспорт')} footer={<Btn onClick={() => setPin(true)}>{tr(t3('Podpisz i wyślij', 'Sign and send', 'Підписати і надіслати'))}</Btn>}>
      <div className="space-y-4 px-4 pt-4 pb-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-5 text-white shadow-card">
          <Car className="absolute -right-3 -bottom-3 size-24 text-white/15" />
          <p className="text-[13px] opacity-85">{tr(t3('Twój pojazd', 'Your vehicle', 'Ваше авто'))}</p>
          <p className="mt-1 text-xl font-bold">{p.vehicle.make}</p>
          <span className="mt-3 inline-block rounded-md bg-white px-2.5 py-1 font-mono text-[15px] font-bold tracking-wider text-ink">{p.vehicle.plate}</span>
        </div>
        <Card className="divide-y divide-line">
          <div className="px-4 py-3">
            <p className="text-[12px] text-muted uppercase">{tr(t3('Stary adres', 'Old address', 'Стара адреса'))}</p>
            <p className="text-[14px] text-muted line-through">{addrLine(addr(p.current.addressId))}</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-[12px] text-muted uppercase">{tr(t3('Nowy adres', 'New address', 'Нова адреса'))}</p>
            <p className="text-[14px] font-semibold">{addrLine(to)}</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-[12px] text-muted uppercase">{tr(t3('Urząd', 'Office', 'Установа'))}</p>
            <p className="text-[14px] font-semibold">{tr(t3(`Wydział komunikacji – ${to.powiat}`, `Vehicle registration office – ${to.powiat}`, `Відділ транспорту – ${to.powiat}`))}</p>
          </div>
        </Card>
        <p className="px-1 text-[13px] font-bold tracking-wide text-muted uppercase">{tr(t3('Odbiór nowego dowodu', 'Collect the new certificate', 'Отримання нового техпаспорта'))}</p>
        <div className="space-y-2" role="radiogroup">
          <Choice selected={pickup === 'office'} onClick={() => setPickup('office')} icon={<Building2 className="size-5" />} title={tr(t3('W urzędzie', 'At the office', 'В установі'))} sub={tr(t3('Powiadomimy, gdy dowód będzie gotowy', 'We notify you when it’s ready', 'Повідомимо, коли буде готово'))} />
          <Choice selected={pickup === 'mail'} onClick={() => setPickup('mail')} icon={<MapPin className="size-5" />} title={tr(t3('Pocztą na nowy adres', 'By post to the new address', 'Поштою на нову адресу'))} sub={tr(t3('Propozycja w ramach koncepcji', 'Proposed as part of this concept', 'Пропозиція в межах концепції'))} />
        </div>
        <div className="rounded-2xl bg-brand-soft p-4 text-[13px] leading-relaxed text-brand-strong">
          <b>{tr(t3('Tablice zostają.', 'Your plates stay.', 'Номери залишаються.'))}</b> {tr(t3('Do czasu wydania nowego dowodu urząd wyda pozwolenie czasowe. Opłatę zapłacisz w aplikacji – jej wysokość zależy od urzędu.', 'Until the new certificate is issued, the office provides a temporary permit. You pay the fee in the app; the amount depends on the office.', 'До видачі нового техпаспорта установа видасть тимчасовий дозвіл.'))}
        </div>
        <Simulated />
      </div>
      <PinSheet open={pin} onClose={() => setPin(false)} onDone={done} steps={[t3('Podpisujemy wniosek', 'Signing', 'Підписуємо'), t3('Opłata (symulacja)', 'Payment (simulated)', 'Оплата (симуляція)'), t3('Wysyłamy do starostwa', 'Sending to the county office', 'Надсилаємо до староства')]} />
    </Screen>
  )
}

/* ---------------- Doctor ---------------- */

export function Doctor() {
  const { s, p, tr, set, replace, log } = useStore()
  const [clinic, setClinic] = useState(CLINICS[1].id)
  const [kids, setKids] = useState<string[]>(s.answers.kids)
  const [pin, setPin] = useState(false)
  const done = () => {
    setPin(false)
    set((x) => ({ done: { ...x.done, doctor: true } }))
    log(t3('Złożono deklarację wyboru POZ', 'Primary care declaration submitted', 'Подано декларацію вибору POZ'))
    replace({ name: 'done', param: 'doctor' })
  }
  return (
    <Screen title={t3('Przychodnia (POZ)', 'GP clinic (POZ)', 'Поліклініка (POZ)')} footer={<Btn onClick={() => setPin(true)}>{tr(t3('Złóż deklarację', 'Submit declaration', 'Подати декларацію'))}</Btn>}>
      <div className="space-y-3 px-4 pt-4 pb-6">
        <p className="px-1 text-[14px] text-muted">{tr(t3('Przychodnie z umową NFZ najbliżej nowego adresu (dane przykładowe):', 'NFZ-contracted clinics nearest your new address (sample data):', 'Поліклініки з договором NFZ поруч із новою адресою (приклад):'))}</p>
        <div className="space-y-2" role="radiogroup">
          {CLINICS.map((c) => (
            <Choice key={c.id} selected={clinic === c.id} onClick={() => setClinic(c.id)} icon={<Hospital className="size-5" />} title={c.name} sub={`${c.street} · ${c.dist}`} />
          ))}
        </div>
        {p.kids.length > 0 && (
          <>
            <p className="px-1 pt-2 text-[13px] font-bold tracking-wide text-muted uppercase">{tr(t3('Również dla', 'Also for', 'Також для'))}</p>
            {p.kids.map((k) => (
              <CheckBox key={k.id} checked={kids.includes(k.id)} onClick={() => setKids(kids.includes(k.id) ? kids.filter((x) => x !== k.id) : [...kids, k.id])} title={k.name} sub={tr(t3('Lekarz, pielęgniarka i położna POZ', 'Doctor, nurse and midwife', 'Лікар, медсестра й акушерка'))} />
            ))}
          </>
        )}
        <p className="px-1 text-[12px] text-muted">{tr(t3('Zmiana jest bezpłatna do 2 razy w roku kalendarzowym.', 'Changing is free up to twice per calendar year.', 'Зміна безкоштовна до 2 разів на календарний рік.'))}</p>
        <Simulated />
      </div>
      <PinSheet open={pin} onClose={() => setPin(false)} onDone={done} steps={[t3('Podpisujemy deklarację', 'Signing the declaration', 'Підписуємо декларацію'), t3('Wysyłamy do przychodni', 'Sending to the clinic', 'Надсилаємо до поліклініки')]} />
    </Screen>
  )
}

/* ---------------- Quick services ---------------- */

type Quick = { title: T; icon: React.ReactNode; intro: T; fields: [T, string][]; cta: T; note?: T; doneMsg: T }

export function useQuick(id: string): Quick | null {
  const { s, p } = useStore()
  const a = s.answers
  const to = addr(a.addressId)
  const people = 1 + a.kids.length
  const map: Record<string, Quick> = {
    tax: {
      title: t3('Adres w urzędzie skarbowym', 'Address at the tax office', 'Адреса в податковій'),
      icon: <Landmark className="size-6" />,
      intro: t3('Zgłoszenie aktualizacyjne ZAP-3. Wszystkie pola uzupełniliśmy za Ciebie.', 'Update form ZAP-3. We filled in every field for you.', 'Форма оновлення ZAP-3. Усі поля заповнено.'),
      fields: [
        [t3('Formularz', 'Form', 'Форма'), 'ZAP-3'],
        [t3('PESEL', 'PESEL', 'PESEL'), p.pesel],
        [t3('Adres zamieszkania', 'Residential address', 'Адреса проживання'), addrLine(to)],
        [t3('Właściwy urząd', 'Competent office', 'Відповідна установа'), `Urząd Skarbowy – ${to.city}`],
      ],
      cta: t3('Podpisz i wyślij', 'Sign and send', 'Підписати і надіслати'),
      doneMsg: t3('Urząd skarbowy zna już nowy adres. Zeznanie PIT trafi do właściwego urzędu.', 'The tax office now has your new address. Your PIT return will go to the right office.', 'Податкова вже знає нову адресу.'),
    },
    ceidg: {
      title: t3('Adres firmy w CEIDG', 'Business address in CEIDG', 'Адреса підприємства в CEIDG'),
      icon: <Briefcase className="size-6" />,
      intro: t3('Wniosek CEIDG-1 o zmianę wpisu. Dane trafią też do US i ZUS.', 'CEIDG-1 change application. Data also goes to the tax office and ZUS.', 'Заява CEIDG-1 про зміну запису.'),
      fields: [
        [t3('Wniosek', 'Application', 'Заява'), 'CEIDG-1 (zmiana)'],
        [t3('Nowy adres zamieszkania', 'New residential address', 'Нова адреса проживання'), addrLine(to)],
        [t3('Adres do doręczeń', 'Correspondence address', 'Адреса для листування'), addrLine(to)],
      ],
      cta: t3('Podpisz i wyślij', 'Sign and send', 'Підписати і надіслати'),
      doneMsg: t3('Wpis w CEIDG zaktualizowany. US i ZUS dostaną zmianę automatycznie.', 'CEIDG entry updated. The tax office and ZUS receive it automatically.', 'Запис у CEIDG оновлено.'),
    },
    waste: {
      title: t3('Deklaracja o opłacie za odpady', 'Waste fee declaration', 'Декларація про відходи'),
      icon: <Trash2 className="size-6" />,
      intro: t3(`Deklaracja dla gminy ${to.city}. Liczbę mieszkańców pobraliśmy z wniosku meldunkowego.`, `Declaration for ${to.city}. The number of residents comes from your registration.`, `Декларація для гміни ${to.city}.`),
      fields: [
        [t3('Gmina', 'Municipality', 'Гміна'), to.gmina],
        [t3('Nieruchomość', 'Property', 'Нерухомість'), addrLine(to)],
        [t3('Liczba mieszkańców', 'Number of residents', 'Кількість мешканців'), String(people)],
        [t3('Od kiedy', 'From', 'З якого часу'), fmtDate(parseIso(a.moveDate), 'pl', { day: '2-digit', month: '2-digit', year: 'numeric' })],
      ],
      cta: t3('Podpisz i wyślij', 'Sign and send', 'Підписати і надіслати'),
      note: t3('Stawka i numer konta do opłat pojawią się po przyjęciu deklaracji.', 'The rate and payment account appear once the declaration is accepted.', 'Ставка та рахунок з’являться після прийняття декларації.'),
      doneMsg: t3('Deklaracja złożona. Gmina wyśle informację o wysokości opłaty.', 'Declaration submitted. The municipality will send the fee details.', 'Декларацію подано.'),
    },
    euvoter: {
      title: t3('Rejestr wyborców', 'Voter register', 'Реєстр виборців'),
      icon: <Vote className="size-6" />,
      intro: t3('Wniosek o wpisanie do rejestru wyborców dla obywatela UE.', 'Application to join the voter register as an EU citizen.', 'Заява про внесення до реєстру виборців для громадянина ЄС.'),
      fields: [
        [t3('Gmina', 'Municipality', 'Гміна'), to.gmina],
        [t3('Obywatelstwo', 'Citizenship', 'Громадянство'), p.citizenshipLabel.pl],
      ],
      cta: t3('Podpisz i wyślij', 'Sign and send', 'Підписати і надіслати'),
      doneMsg: t3('Wniosek wysłany. Gmina rozpatrzy go w ciągu 3 dni.', 'Application sent. The municipality decides within 3 days.', 'Заяву надіслано.'),
    },
    school: {
      title: t3('Szkoła obwodowa', 'Catchment school', 'Районна школа'),
      icon: <School className="size-6" />,
      intro: t3('Szkoła obwodowa dla nowego adresu (dane przykładowe). Dziecko z obwodu jest przyjmowane z urzędu.', 'The catchment school for your new address (sample data). Children from the catchment area are admitted automatically.', 'Районна школа для нової адреси (приклад).'),
      fields: [
        [t3('Szkoła', 'School', 'Школа'), 'Szkoła Podstawowa nr 12 (przykład)'],
        [t3('Odległość', 'Distance', 'Відстань'), '650 m'],
        [t3('Dziecko', 'Child', 'Дитина'), p.kids.find((k) => a.kids.includes(k.id))?.name ?? '—'],
      ],
      cta: t3('Oznacz jako sprawdzone', 'Mark as checked', 'Позначити як перевірене'),
      doneMsg: t3('Zapisane. Zgłoszenie złożysz bezpośrednio w szkole.', 'Saved. You apply directly at the school.', 'Збережено. Заяву подасте безпосередньо до школи.'),
    },
  }
  return map[id] ?? null
}

export function QuickService({ id }: { id: string }) {
  const { tr, set, replace, log } = useStore()
  const q = useQuick(id)
  const [pin, setPin] = useState(false)
  if (!q) return null
  const finish = () => {
    setPin(false)
    set((x) => ({ done: { ...x.done, [id]: true } }))
    log(t3(`Załatwiono: ${q.title.pl}`, `Completed: ${q.title.en}`, `Виконано: ${q.title.uk}`))
    replace({ name: 'done', param: id })
  }
  return (
    <Screen title={q.title} footer={<Btn onClick={() => (id === 'school' ? finish() : setPin(true))}>{tr(q.cta)}</Btn>}>
      <div className="space-y-4 px-4 pt-5 pb-6">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand">{q.icon}</span>
          <p className="flex-1 text-[15px] leading-snug">{tr(q.intro)}</p>
        </div>
        <Card className="divide-y divide-line">
          {q.fields.map(([k, v], i) => (
            <div key={i} className="flex gap-3 px-4 py-3">
              <span className="w-32 shrink-0 text-[13px] text-muted">{tr(k)}</span>
              <span className="flex-1 text-[14px] font-semibold">{v}</span>
              <Check className="size-4 text-ok" />
            </div>
          ))}
        </Card>
        {q.note && <p className="px-1 text-[13px] text-muted">{tr(q.note)}</p>}
        <Simulated />
      </div>
      <PinSheet open={pin} onClose={() => setPin(false)} onDone={finish} steps={[t3('Podpisujemy', 'Signing', 'Підписуємо'), t3('Wysyłamy', 'Sending', 'Надсилаємо')]} />
    </Screen>
  )
}

/* ---------------- Done ---------------- */

export function Done({ id }: { id: string }) {
  const { tr, goTab, plan, isDone } = useStore()
  const q = useQuick(id)
  const msgs: Record<string, T> = {
    vehicle: t3('Wniosek trafił do wydziału komunikacji. Powiadomimy Cię, gdy nowy dowód będzie gotowy.', 'Your request reached the vehicle office. We notify you when the new certificate is ready.', 'Заяву надіслано. Повідомимо, коли новий техпаспорт буде готовий.'),
    doctor: t3('Deklaracja złożona. Nowa przychodnia zobaczy Cię w systemie od razu.', 'Declaration submitted. The new clinic sees you in the system right away.', 'Декларацію подано. Нова поліклініка одразу бачить вас у системі.'),
  }
  const remaining = plan.filter((x) => x.group === 'todo' && !isDone(x)).length
  return (
    <Screen title={t3('Gotowe', 'Done', 'Готово')} onBack={() => goTab('cases')} footer={<Btn onClick={() => goTab('cases')}>{remaining ? tr(t3(`Wróć do planu (zostało: ${remaining})`, `Back to plan (${remaining} left)`, `До плану (залишилось: ${remaining})`)) : tr(t3('Wróć do planu', 'Back to plan', 'До плану'))}</Btn>}>
      <div className="px-6 pt-14 text-center">
        <div className="anim-pop mx-auto grid size-20 place-items-center rounded-full bg-ok text-white">
          <Check className="size-10" strokeWidth={3} />
        </div>
        <h2 className="mt-5 text-[24px] font-bold">{tr(t3('Załatwione', 'Done', 'Виконано'))}</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{tr(msgs[id] ?? q?.doneMsg ?? t3('Sprawa załatwiona.', 'Task completed.', 'Справу виконано.'))}</p>
      </div>
    </Screen>
  )
}

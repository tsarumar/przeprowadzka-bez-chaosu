import { BadgeCheck, Check, CheckCircle2, Clock3, Eye, FileCheck2, FileText, Hourglass, KeyRound, Loader2, Paperclip, Send, ShieldCheck, Smartphone, UserCheck, Users, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { addr, addrLine, kwFor } from '../data'
import { fmtDate, t3, type T } from '../i18n'
import { parseIso, today } from '../plan'
import { useStore } from '../state'
import { Avatar, Btn, Card, Check as CheckBox, Choice, FakeQR, Pill, Progress, Screen, Simulated, cx } from '../ui'

/* ---------------- PIN / signature sheet ---------------- */

export function PinSheet({ open, onClose, onDone, steps, who }: { open: boolean; onClose: () => void; onDone: () => void; steps: T[]; who?: string }) {
  const { tr } = useStore()
  const [pin, setPin] = useState('')
  const [phase, setPhase] = useState<'pin' | 'work'>('pin')
  const [i, setI] = useState(0)

  useEffect(() => {
    if (!open) {
      setPin('')
      setPhase('pin')
      setI(0)
    }
  }, [open])
  useEffect(() => {
    if (pin.length === 4) {
      const id = setTimeout(() => setPhase('work'), 250)
      return () => clearTimeout(id)
    }
  }, [pin])
  useEffect(() => {
    if (phase !== 'work') return
    if (i < steps.length) {
      const id = setTimeout(() => setI(i + 1), 650)
      return () => clearTimeout(id)
    }
    const id = setTimeout(onDone, 300)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, i])

  if (!open) return null
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-ink/50" role="dialog" aria-modal="true">
      <div className="anim-sheet rounded-t-3xl bg-card px-6 pt-5 pb-7">
        {phase === 'pin' ? (
          <>
            <div className="flex items-start">
              <div className="flex-1">
                <h2 className="text-lg font-bold">{tr(t3('Potwierdź PIN-em', 'Confirm with your PIN', 'Підтвердіть PIN-кодом'))}</h2>
                <p className="mt-1 text-[13px] text-muted">{who ?? tr(t3('Podpiszesz wniosek podpisem w aplikacji.', 'You sign the application with the in-app signature.', 'Ви підпишете заяву підписом у застосунку.'))}</p>
              </div>
              <button onClick={onClose} className="grid size-10 place-items-center rounded-full hover:bg-bg" aria-label={tr(t3('Anuluj', 'Cancel', 'Скасувати'))}>
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-5 flex justify-center gap-3" aria-label={tr(t3('Wpisane cyfry', 'Digits entered', 'Введені цифри'))}>
              {[0, 1, 2, 3].map((k) => (
                <span key={k} className={cx('size-4 rounded-full border-2 transition', k < pin.length ? 'scale-110 border-brand bg-brand' : 'border-line')} />
              ))}
            </div>
            <p className="mt-3 text-center text-[12px] text-muted">{tr(t3('Demo: wpisz dowolne 4 cyfry', 'Demo: enter any 4 digits', 'Демо: введіть будь-які 4 цифри'))}</p>
            <div className="mx-auto mt-4 grid max-w-[260px] grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, idx) =>
                k === '' ? (
                  <span key={idx} />
                ) : (
                  <button key={idx} onClick={() => setPin((x) => (k === '⌫' ? x.slice(0, -1) : x.length < 4 ? x + k : x))} className="h-14 rounded-2xl bg-bg text-xl font-semibold active:bg-brand-soft" aria-label={k === '⌫' ? tr(t3('Usuń', 'Delete', 'Видалити')) : k}>
                    {k}
                  </button>
                ),
              )}
            </div>
          </>
        ) : (
          <div className="py-4">
            <ul className="space-y-3.5">
              {steps.map((x, k) => (
                <li key={k} className={cx('flex items-center gap-3 text-[15px]', k > i && 'text-muted/50')}>
                  <span className={cx('grid size-7 place-items-center rounded-full', k < i ? 'bg-ok text-white' : 'bg-bg')}>{k < i ? <Check className="size-4" /> : k === i ? <Loader2 className="anim-spin size-4 text-brand" /> : null}</span>
                  <span className={k === i ? 'font-semibold' : ''}>{tr(x)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------------- Registration flow ---------------- */

const mask = (pesel: string) => pesel.slice(0, 6) + '•••••'

export function Meldunek() {
  const { s, p, tr, set, replace, lang, log } = useStore()
  const a = s.answers
  const to = addr(a.addressId)
  const permanent = a.stay === 'permanent'
  const owner = a.title === 'owner'
  const [step, setStep] = useState(0)
  const [via, setVia] = useState<'owner' | 'contract'>('owner')
  const [file, setFile] = useState<string | null>(null)
  const [kw, setKw] = useState<'idle' | 'checking' | 'ok'>('idle')
  const [consent, setConsent] = useState(false)
  const [pinOpen, setPinOpen] = useState(false)
  const kids = p.kids.filter((k) => a.kids.includes(k.id))
  const ownerName = a.title === 'dorm' ? tr(t3('Administracja akademika', 'Dorm administration', 'Адміністрація гуртожитку')) : p.owner?.name ?? 'Ewa Zielińska'

  useEffect(() => {
    if (step === 2 && owner && kw === 'idle') setKw('checking')
  }, [step, owner, kw])
  useEffect(() => {
    if (kw !== 'checking') return
    const id = setTimeout(() => setKw('ok'), 1300)
    return () => clearTimeout(id)
  }, [kw])

  const STEPS = 4
  const titles = [
    t3('Kogo zgłaszasz', 'Who you are registering', 'Кого ви реєструєте'),
    t3('Adres i rodzaj pobytu', 'Address and type of stay', 'Адреса і тип перебування'),
    t3('Prawo do lokalu', 'Right to the flat', 'Право на житло'),
    t3('Sprawdź i podpisz', 'Review and sign', 'Перевірте і підпишіть'),
  ]
  const canNext = step === 2 ? (owner ? kw === 'ok' : via === 'owner' || !!file) : step === 3 ? consent : true

  const submit = () => {
    setPinOpen(false)
    if (owner) {
      set(() => ({ meldunek: 'done', meldunekVia: 'kw' }))
      log(t3('Zameldowanie automatyczne (zgodność z księgą wieczystą)', 'Automatic registration (land register match)', 'Автоматична реєстрація'))
    } else if (via === 'owner') {
      set(() => ({ meldunek: 'waitingOwner', meldunekVia: 'owner' }))
      log(t3(`Wysłano prośbę o potwierdzenie do: ${ownerName}`, `Confirmation request sent to: ${ownerName}`, `Надіслано запит на підтвердження: ${ownerName}`))
    } else {
      set(() => ({ meldunek: 'waitingOffice', meldunekVia: 'contract' }))
      log(t3('Wniosek z umową najmu wysłany do urzędu gminy', 'Application with tenancy agreement sent to the office', 'Заяву з договором оренди надіслано'))
    }
    replace({ name: 'meldunekResult', param: 'new' })
  }

  const signSteps = owner
    ? [t3('Podpisujemy wniosek', 'Signing the application', 'Підписуємо заяву'), t3('Porównujemy z księgą wieczystą', 'Matching the land register', 'Звіряємо з поземельною книгою'), t3('Rejestrujemy w PESEL', 'Recording in PESEL', 'Вносимо в PESEL')]
    : via === 'owner'
      ? [t3('Podpisujemy wniosek', 'Signing the application', 'Підписуємо заяву'), t3(`Wysyłamy prośbę do: ${ownerName}`, `Sending request to: ${ownerName}`, `Надсилаємо запит: ${ownerName}`)]
      : [t3('Podpisujemy wniosek', 'Signing the application', 'Підписуємо заяву'), t3('Dołączamy umowę', 'Attaching the agreement', 'Додаємо договір'), t3('Wysyłamy do urzędu gminy', 'Sending to the municipal office', 'Надсилаємо до гміни')]

  return (
    <Screen
      title={t3('Zameldowanie', 'Registration', 'Реєстрація')}
      footer={
        <Btn disabled={!canNext} onClick={() => (step < STEPS - 1 ? setStep(step + 1) : setPinOpen(true))}>
          {step < STEPS - 1 ? tr(t3('Dalej', 'Next', 'Далі')) : tr(t3('Podpisz i wyślij', 'Sign and send', 'Підписати і надіслати'))}
        </Btn>
      }
    >
      <div className="px-5 pt-3">
        <div className="flex items-center justify-between text-[12px] font-semibold text-muted">
          <span>
            {tr(t3('Krok', 'Step', 'Крок'))} {step + 1}/{STEPS}
          </span>
          {step > 0 && (
            <button className="text-brand" onClick={() => setStep(step - 1)}>
              {tr(t3('Poprzedni krok', 'Previous step', 'Попередній крок'))}
            </button>
          )}
        </div>
        <Progress value={(step + 1) / STEPS} className="mt-2" />
        <h2 key={step} className="anim-rise mt-5 text-[22px] font-bold">
          {tr(titles[step])}
        </h2>
      </div>

      <div key={'s' + step} className="anim-rise space-y-3 px-5 pt-4 pb-6">
        {step === 0 && (
          <>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Avatar initials={p.initials} color={p.color} />
                <div className="flex-1">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-[13px] text-muted">PESEL {mask(p.pesel)} · {tr(p.citizenshipLabel)}</p>
                </div>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[12px] font-semibold text-ok">
                <BadgeCheck className="size-4" /> {tr(t3('Dane pobrane z rejestru PESEL – nie musisz ich wpisywać', 'Data from the PESEL register, no typing needed', 'Дані з реєстру PESEL – вводити не потрібно'))}
              </p>
            </Card>
            {kids.length > 0 && (
              <>
                <p className="pt-2 text-[13px] font-bold tracking-wide text-muted uppercase">{tr(t3('Razem z Tobą', 'Together with you', 'Разом з вами'))}</p>
                {kids.map((k) => (
                  <Card key={k.id} className="flex items-center gap-3 p-4">
                    <span className="grid size-10 place-items-center rounded-full bg-amber-100 text-amber-700">
                      <Users className="size-5" />
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold">{k.name}</p>
                      <p className="text-[13px] text-muted">
                        {tr(t3(`${k.age} lat · jesteś rodzicem w rejestrze PESEL`, `${k.age} years · you are the parent in PESEL`, `${k.age} років · ви батьки в реєстрі PESEL`))}
                      </p>
                    </div>
                    <CheckCircle2 className="size-6 text-ok" />
                  </Card>
                ))}
              </>
            )}
            {!kids.length && <p className="text-[13px] text-muted">{tr(t3('Osoby dorosłe, które przeprowadzają się z Tobą, zgłaszają się same – wyślemy im link do tego samego planu.', 'Adults moving with you register themselves; we send them a link to the same plan.', 'Дорослі, які переїжджають з вами, реєструються самі – ми надішлемо їм посилання.'))}</p>}
          </>
        )}

        {step === 1 && (
          <>
            <Card className="p-4">
              <p className="text-[12px] font-semibold text-muted uppercase">{tr(t3('Nowy adres', 'New address', 'Нова адреса'))}</p>
              <p className="mt-1 text-[17px] font-semibold">{to.street}</p>
              <p className="text-[14px] text-muted">
                {to.postal} {to.city} · {tr(t3('gmina', 'municipality', 'гміна'))} {to.gmina}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-[12px] font-semibold text-muted uppercase">{tr(t3('Rodzaj pobytu', 'Type of stay', 'Тип перебування'))}</p>
              <p className="mt-1 text-[17px] font-semibold">{permanent ? tr(t3('Pobyt stały', 'Permanent stay', 'Постійне перебування')) : tr(t3('Pobyt czasowy', 'Temporary stay', 'Тимчасове перебування'))}</p>
              <p className="text-[14px] text-muted">
                {tr(t3('od', 'from', 'з'))} {fmtDate(parseIso(a.moveDate), lang, { day: 'numeric', month: 'long', year: 'numeric' })}
                {!permanent && ` ${tr(t3('do', 'until', 'до'))} ${fmtDate(parseIso(a.tempUntil), lang, { day: 'numeric', month: 'long', year: 'numeric' })}`}
              </p>
            </Card>
            <div className="rounded-2xl bg-brand-soft p-4 text-[13px] leading-relaxed text-brand-strong">
              <b>{tr(t3('Bez osobnego wymeldowania', 'No separate deregistration', 'Без окремого зняття з реєстрації'))}</b>
              <br />
              {tr(t3(`Poprzedni ${permanent ? 'pobyt stały' : 'pobyt czasowy'} (${addrLine(addr(p.current.addressId))}) zakończy się automatycznie.`, `Your previous ${permanent ? 'permanent' : 'temporary'} address (${addrLine(addr(p.current.addressId))}) ends automatically.`, `Попереднє ${permanent ? 'постійне' : 'тимчасове'} перебування (${addrLine(addr(p.current.addressId))}) завершиться автоматично.`))}
            </div>
          </>
        )}

        {step === 2 && owner && (
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <span className={cx('grid size-12 place-items-center rounded-2xl', kw === 'ok' ? 'bg-ok-soft text-ok' : 'bg-brand-soft text-brand')}>{kw === 'ok' ? <ShieldCheck className="size-6" /> : <Loader2 className="anim-spin size-6" />}</span>
              <div className="flex-1">
                <p className="font-semibold">{kw === 'ok' ? tr(t3('Prawo do lokalu potwierdzone', 'Right to the flat confirmed', 'Право на житло підтверджено')) : tr(t3('Sprawdzamy księgę wieczystą…', 'Checking the land register…', 'Перевіряємо поземельну книгу…'))}</p>
                <p className="text-[13px] text-muted">
                  {tr(t3('Księga wieczysta', 'Land register', 'Поземельна книга'))} {kwFor(to)}
                </p>
              </div>
            </div>
            {kw === 'ok' && (
              <div className="anim-rise mt-4 space-y-2 border-t border-line pt-4 text-[14px]">
                <p className="flex items-center gap-2">
                  <Check className="size-4 text-ok" /> {tr(t3('Widniejesz w dziale II jako właściciel', 'You are listed as owner in section II', 'Вас вказано як власника в розділі II'))}
                </p>
                <p className="flex items-center gap-2">
                  <Check className="size-4 text-ok" /> {tr(t3('Adres zgodny z wnioskiem', 'Address matches the application', 'Адреса збігається із заявою'))}
                </p>
                <p className="mt-2 rounded-xl bg-ok-soft p-3 text-[13px] font-semibold text-ok">{tr(t3('Zameldowanie będzie natychmiastowe – bez czekania na urzędnika.', 'Registration will be instant, no waiting for a clerk.', 'Реєстрація буде миттєвою – без очікування службовця.'))}</p>
              </div>
            )}
          </Card>
        )}

        {step === 2 && !owner && (
          <>
            <div role="radiogroup" className="space-y-2">
              <Choice selected={via === 'owner'} onClick={() => setVia('owner')} icon={<Smartphone className="size-5" />} title={tr(t3('Właściciel potwierdzi w aplikacji', 'The owner confirms in the app', 'Власник підтвердить у застосунку'))} sub={tr(t3('Zalecane · zwykle w kilka minut · bez papierów', 'Recommended · usually minutes · no paperwork', 'Рекомендовано · зазвичай кілька хвилин'))} />
              <Choice selected={via === 'contract'} onClick={() => setVia('contract')} icon={<Paperclip className="size-5" />} title={tr(t3('Dołączę umowę najmu', 'I’ll attach my tenancy agreement', 'Додам договір оренди'))} sub={tr(t3('Urzędnik sprawdzi dokument', 'A clerk checks the document', 'Службовець перевірить документ'))} />
            </div>
            {via === 'owner' ? (
              <Card className="anim-rise p-4">
                <p className="text-[12px] font-semibold text-muted uppercase">{tr(t3('Prośba trafi do', 'Request goes to', 'Запит надійде'))}</p>
                <div className="mt-2 flex items-center gap-3">
                  <Avatar initials={ownerName.split(' ').map((x) => x[0]).join('').slice(0, 2)} color="#0f766e" />
                  <div className="flex-1">
                    <p className="font-semibold">{ownerName}</p>
                    <p className="text-[13px] text-muted">{p.owner ? tr(p.owner.role) : tr(t3('właściciel lokalu', 'flat owner', 'власник житла'))} · +48 600 ••• 214</p>
                  </div>
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-muted">{tr(t3('Właściciel jest w księdze wieczystej lokalu, więc system wie, kogo zapytać. Dostanie powiadomienie w swojej aplikacji i potwierdzi PIN-em.', 'The owner is in the land register for this flat, so the system knows whom to ask. They get a notification in their app and confirm with a PIN.', 'Власник є в поземельній книзі, тому система знає, кого запитати. Він отримає сповіщення і підтвердить PIN-кодом.'))}</p>
              </Card>
            ) : (
              <Card className="anim-rise p-4">
                {file ? (
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-ok-soft text-ok">
                      <FileCheck2 className="size-5" />
                    </span>
                    <span className="flex-1 truncate font-semibold">{file}</span>
                    <button onClick={() => setFile(null)} className="text-[13px] font-semibold text-danger">
                      {tr(t3('Usuń', 'Remove', 'Видалити'))}
                    </button>
                  </div>
                ) : (
                  <>
                    <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-line p-6 text-center hover:border-brand">
                      <Paperclip className="size-6 text-brand" />
                      <span className="text-[14px] font-semibold">{tr(t3('Wybierz plik (PDF lub zdjęcie)', 'Choose a file (PDF or photo)', 'Оберіть файл (PDF або фото)'))}</span>
                      <span className="text-[12px] text-muted">{tr(t3('Plik zostaje w Twojej przeglądarce – demo niczego nie wysyła', 'The file stays in your browser; the demo sends nothing', 'Файл залишається у браузері – демо нічого не надсилає'))}</span>
                      <input type="file" accept=".pdf,image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0].name)} />
                    </label>
                    <button onClick={() => setFile('umowa_najmu_przyklad.pdf')} className="mt-3 w-full text-center text-[13px] font-semibold text-brand">
                      {tr(t3('Użyj przykładowego pliku', 'Use a sample file', 'Використати зразок файлу'))}
                    </button>
                  </>
                )}
              </Card>
            )}
            <div className="flex gap-3 rounded-2xl bg-warn-soft p-4 text-[13px] leading-relaxed text-warn">
              <KeyRound className="mt-0.5 size-5 shrink-0" />
              <span>
                <b>{tr(t3('Meldunek nie daje praw do lokalu.', 'Registration gives no rights to the flat.', 'Реєстрація не дає прав на житло.'))}</b> {tr(t3('To tylko informacja, gdzie mieszkasz. Mówimy to wprost także właścicielowi – to częsty powód odmowy.', 'It only records where you live. We tell the owner this too, as it is a common reason owners refuse.', 'Це лише інформація, де ви живете. Ми кажемо це і власнику – це часта причина відмови.'))}
              </span>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <Card className="divide-y divide-line">
              <Line label={t3('Osoba', 'Person', 'Особа')} value={`${p.name}${kids.length ? ' + ' + kids.map((k) => k.name.split(' ')[0]).join(', ') : ''}`} />
              <Line label={t3('Adres', 'Address', 'Адреса')} value={addrLine(to)} />
              <Line label={t3('Pobyt', 'Stay', 'Перебування')} value={permanent ? tr(t3('stały', 'permanent', 'постійне')) : `${tr(t3('czasowy do', 'temporary until', 'тимчасове до'))} ${fmtDate(parseIso(a.tempUntil), lang, { day: 'numeric', month: 'numeric', year: 'numeric' })}`} />
              <Line label={t3('Prawo do lokalu', 'Right to flat', 'Право на житло')} value={owner ? tr(t3('księga wieczysta – zgodna', 'land register – match', 'поземельна книга – збіг')) : via === 'owner' ? tr(t3(`potwierdzi: ${ownerName}`, `confirmed by: ${ownerName}`, `підтвердить: ${ownerName}`)) : file ?? ''} />
              <Line label={t3('Wymeldowanie', 'Deregistration', 'Зняття з реєстрації')} value={tr(t3('automatyczne', 'automatic', 'автоматичне'))} />
              <Line label={t3('Opłata', 'Fee', 'Плата')} value={tr(t3('bezpłatnie', 'free', 'безкоштовно'))} />
            </Card>
            <CheckBox checked={consent} onClick={() => setConsent(!consent)} title={tr(t3('Oświadczam, że dane są zgodne z prawdą', 'I declare that the data is true', 'Заявляю, що дані правдиві'))} sub={tr(t3('Wiem, że za podanie nieprawdy grozi odpowiedzialność karna.', 'I understand that giving false information is a criminal offence.', 'Я розумію, що за неправдиві дані загрожує кримінальна відповідальність.'))} />
            <Simulated />
          </>
        )}
      </div>
      <PinSheet open={pinOpen} onClose={() => setPinOpen(false)} onDone={submit} steps={signSteps} />
    </Screen>
  )
}

function Line({ label, value }: { label: T; value: string }) {
  const { tr } = useStore()
  return (
    <div className="flex gap-3 px-4 py-3">
      <span className="w-28 shrink-0 text-[13px] text-muted">{tr(label)}</span>
      <span className="flex-1 text-[14px] font-medium">{value}</span>
    </div>
  )
}

/* ---------------- Result ---------------- */

export function MeldunekResult() {
  const { s, p, plan, tr, nav, goTab, set, log, isDone } = useStore()
  const a = s.answers
  const to = addr(a.addressId)
  const autos = plan.filter((x) => x.group === 'auto')
  const remaining = plan.filter((x) => x.group === 'todo' && !isDone(x) && x.id !== 'meldunek').length
  const ownerName = a.title === 'dorm' ? tr(t3('Administracja akademika', 'Dorm administration', 'Адміністрація гуртожитку')) : p.owner?.name ?? 'Ewa Zielińska'
  const [shown, setShown] = useState(0)

  useEffect(() => {
    if (s.meldunek === 'done' && shown < autos.length) {
      const id = setTimeout(() => setShown(shown + 1), 450)
      return () => clearTimeout(id)
    }
  }, [s.meldunek, shown, autos.length])

  if (s.meldunek === 'done') {
    return (
      <Screen
        title={t3('Zameldowanie', 'Registration', 'Реєстрація')}
        onBack={() => goTab('cases')}
        footer={
          <div className="space-y-2">
            <Btn onClick={() => goTab('cases')}>{remaining ? tr(t3(`Wróć do planu (zostało: ${remaining})`, `Back to plan (${remaining} left)`, `До плану (залишилось: ${remaining})`)) : tr(t3('Wróć do planu', 'Back to plan', 'До плану'))}</Btn>
            <Btn kind="secondary" icon={<FileText className="size-5" />} onClick={() => nav({ name: 'certificate' })}>
              {tr(t3('Zaświadczenie o zameldowaniu', 'Registration certificate', 'Довідка про реєстрацію'))}
            </Btn>
          </div>
        }
      >
        <div className="px-5 pt-8 text-center">
          <div className="anim-pop mx-auto grid size-20 place-items-center rounded-full bg-ok text-white">
            <Check className="size-10" strokeWidth={3} />
          </div>
          <h2 className="mt-5 text-[26px] font-bold">{tr(t3('Meldunek aktywny', 'You’re registered', 'Реєстрація активна'))}</h2>
          <p className="mt-2 text-[15px] text-muted">
            {to.street}, {to.city}
            <br />
            {s.meldunekVia === 'owner' && tr(t3(`Potwierdzone przez: ${ownerName}`, `Confirmed by: ${ownerName}`, `Підтверджено: ${ownerName}`))}
            {s.meldunekVia === 'kw' && tr(t3('Zameldowanie automatyczne · 0 wizyt w urzędzie', 'Automatic registration · 0 office visits', 'Автоматична реєстрація · 0 візитів'))}
            {s.meldunekVia === 'office' && tr(t3('Zameldowanie w urzędzie', 'Registered at the office', 'Реєстрація в установі'))}
            {s.meldunekVia === 'contract' && tr(t3('Wniosek zatwierdzony przez urzędnika', 'Approved by a clerk', 'Затверджено службовцем'))}
          </p>
        </div>
        <div className="px-5 pt-6 pb-6">
          <p className="mb-2 text-[13px] font-bold tracking-wide text-muted uppercase">{tr(t3('W tym samym momencie', 'At the same moment', 'Одночасно'))}</p>
          <Card className="divide-y divide-line">
            {autos.map((t, i) => (
              <div key={t.id} className={cx('flex items-center gap-3 px-4 py-3 transition-opacity duration-300', i < shown ? 'opacity-100' : 'opacity-30')}>
                <span className={cx('grid size-7 place-items-center rounded-full', i < shown ? 'bg-ok text-white' : 'bg-bg')}>{i < shown ? <Check className="size-4" /> : <Loader2 className="anim-spin size-4 text-muted" />}</span>
                <span className="flex-1 text-[14px] font-medium">{tr(t.title)}</span>
              </div>
            ))}
          </Card>
        </div>
      </Screen>
    )
  }

  const owner = s.meldunek === 'waitingOwner'
  return (
    <Screen title={t3('Status sprawy', 'Case status', 'Статус справи')} onBack={() => goTab('cases')} footer={<Btn kind="secondary" onClick={() => goTab('cases')}>{tr(t3('Wróć do planu', 'Back to plan', 'До плану'))}</Btn>}>
      <div className="px-5 pt-8 text-center">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-warn-soft text-warn">
          <Hourglass className="size-9" />
        </div>
        <h2 className="mt-5 text-[24px] font-bold">{owner ? tr(t3('Czekamy na potwierdzenie', 'Waiting for confirmation', 'Очікуємо підтвердження')) : tr(t3('Wniosek w urzędzie', 'Application at the office', 'Заява в установі'))}</h2>
        <p className="mt-2 text-[15px] text-muted">{owner ? ownerName : tr(t3(`Urząd gminy ${to.city}`, `${to.city} municipal office`, `Установа гміни ${to.city}`))}</p>
      </div>
      <div className="px-5 pt-6 pb-6">
        <Card className="p-4">
          <Timeline
            items={[
              { done: true, title: t3('Wniosek podpisany i wysłany', 'Application signed and sent', 'Заяву підписано і надіслано'), sub: t3('przed chwilą', 'just now', 'щойно') },
              {
                done: false,
                active: true,
                title: owner ? t3(`${ownerName} potwierdza pobyt`, `${ownerName} confirms your stay`, `${ownerName} підтверджує перебування`) : t3('Urzędnik sprawdza umowę', 'A clerk checks the agreement', 'Службовець перевіряє договір'),
                sub: owner ? t3('Przypomnimy właścicielowi po 24 h', 'We remind the owner after 24 h', 'Нагадаємо власнику через 24 год') : t3('zwykle tego samego dnia roboczego', 'usually the same working day', 'зазвичай того ж робочого дня'),
              },
              { done: false, title: t3('Meldunek aktywny + automatyczne zmiany', 'Registered + automatic updates', 'Реєстрація + автоматичні зміни') },
            ]}
          />
        </Card>
        {owner ? (
          <div className="mt-4 rounded-2xl border-2 border-dashed border-brand/40 bg-brand-soft/50 p-4">
            <p className="text-[14px] font-semibold text-brand-strong">{tr(t3('Pokaz dla jury', 'Demo for the jury', 'Демо для журі'))}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-brand-strong/80">{tr(t3('Zobacz, jak wygląda ta prośba w aplikacji właściciela, i potwierdź ją.', 'See how this request looks in the owner’s app, and confirm it.', 'Подивіться, як цей запит виглядає у застосунку власника, і підтвердіть його.'))}</p>
            <Btn className="mt-3" icon={<Eye className="size-5" />} onClick={() => nav({ name: 'landlord' })}>
              {tr(t3('Otwórz widok właściciela', 'Open the owner’s view', 'Відкрити вигляд власника'))}
            </Btn>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border-2 border-dashed border-brand/40 bg-brand-soft/50 p-4">
            <p className="text-[14px] font-semibold text-brand-strong">{tr(t3('Pokaz dla jury', 'Demo for the jury', 'Демо для журі'))}</p>
            <Btn
              className="mt-3"
              onClick={() => {
                set(() => ({ meldunek: 'done' }))
                log(t3('Urzędnik zatwierdził wniosek', 'A clerk approved the application', 'Службовець затвердив заяву'), t3('Urząd gminy', 'Municipal office', 'Установа гміни'))
              }}
            >
              {tr(t3('Symuluj decyzję urzędnika', 'Simulate the clerk’s decision', 'Симулювати рішення службовця'))}
            </Btn>
          </div>
        )}
      </div>
    </Screen>
  )
}

export function Timeline({ items }: { items: { done: boolean; active?: boolean; title: T; sub?: T }[] }) {
  const { tr } = useStore()
  return (
    <ol className="relative space-y-5">
      {items.map((x, i) => (
        <li key={i} className="relative flex gap-3">
          {i < items.length - 1 && <span className={cx('absolute top-7 left-[13px] h-[calc(100%+4px)] w-0.5', x.done ? 'bg-ok' : 'bg-line')} />}
          <span className={cx('z-10 grid size-7 shrink-0 place-items-center rounded-full', x.done ? 'bg-ok text-white' : x.active ? 'bg-warn text-white' : 'bg-bg text-muted ring-1 ring-line')}>{x.done ? <Check className="size-4" /> : x.active ? <Clock3 className="size-4" /> : null}</span>
          <div className="pt-0.5">
            <p className={cx('text-[14px] font-semibold', !x.done && !x.active && 'text-muted')}>{tr(x.title)}</p>
            {x.sub && <p className="text-[12px] text-muted">{tr(x.sub)}</p>}
          </div>
        </li>
      ))}
    </ol>
  )
}

/* ---------------- Owner's view ---------------- */

export function Landlord() {
  const { s, p, tr, set, replace, lang, log, back, toast } = useStore()
  const a = s.answers
  const to = addr(a.addressId)
  const ownerName = a.title === 'dorm' ? tr(t3('Administracja akademika', 'Dorm administration', 'Адміністрація гуртожитку')) : p.owner?.name ?? 'Ewa Zielińska'
  const [pinOpen, setPinOpen] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const done = () => {
    setPinOpen(false)
    setConfirmed(true)
    set(() => ({ meldunek: 'done' }))
    log(t3('Właściciel potwierdził pobyt', 'The owner confirmed the stay', 'Власник підтвердив перебування'), t3(ownerName, ownerName, ownerName))
  }

  return (
    <div className="flex h-full flex-col bg-[#f2f7f6]">
      <div className="flex items-center gap-2 bg-[#0f766e] px-4 py-2.5 text-[12px] font-semibold text-white">
        <Eye className="size-4" />
        <span className="flex-1">{tr(t3(`Widok w aplikacji: ${ownerName}`, `View in the app of: ${ownerName}`, `Вигляд у застосунку: ${ownerName}`))}</span>
        <button onClick={back} className="rounded-full bg-white/15 px-3 py-1">
          {tr(t3('Wyjdź', 'Exit', 'Вийти'))}
        </button>
      </div>
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pt-5 pb-6">
        {!confirmed ? (
          <>
            <div className="flex items-center gap-3">
              <Avatar initials={ownerName.split(' ').map((x) => x[0]).join('').slice(0, 2)} color="#0f766e" />
              <div>
                <p className="text-[13px] text-muted">{tr(t3('Nowa prośba', 'New request', 'Новий запит'))}</p>
                <p className="font-bold">{tr(t3('Potwierdzenie pobytu w Twoim lokalu', 'Confirm a stay in your flat', 'Підтвердження перебування у вашому житлі'))}</p>
              </div>
            </div>
            <Card className="mt-5 p-4">
              <div className="flex items-center gap-3">
                <Avatar initials={p.initials} color={p.color} />
                <div className="flex-1">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-[13px] text-muted">{tr(t3('chce się zameldować', 'wants to register', 'хоче зареєструватися'))}</p>
                </div>
                <UserCheck className="size-5 text-[#0f766e]" />
              </div>
              <div className="mt-4 space-y-1.5 border-t border-line pt-3 text-[14px]">
                <p>
                  <span className="text-muted">{tr(t3('Lokal:', 'Flat:', 'Житло:'))}</span> <b>{addrLine(to)}</b>
                </p>
                <p>
                  <span className="text-muted">{tr(t3('Pobyt:', 'Stay:', 'Перебування:'))}</span>{' '}
                  <b>
                    {a.stay === 'permanent' ? tr(t3('stały', 'permanent', 'постійне')) : tr(t3('czasowy', 'temporary', 'тимчасове'))}, {tr(t3('od', 'from', 'з'))} {fmtDate(parseIso(a.moveDate), lang)}
                    {a.stay !== 'permanent' && ` ${tr(t3('do', 'to', 'до'))} ${fmtDate(parseIso(a.tempUntil), lang, { day: 'numeric', month: 'long', year: 'numeric' })}`}
                  </b>
                </p>
              </div>
            </Card>
            <div className="mt-4 rounded-2xl bg-card p-4 text-[13px] leading-relaxed">
              <p className="font-bold">{tr(t3('Co oznacza potwierdzenie?', 'What does confirming mean?', 'Що означає підтвердження?'))}</p>
              <ul className="mt-2 space-y-1.5 text-muted">
                <li className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-ok" />
                  {tr(t3('Potwierdzasz tylko, że ta osoba mieszka w Twoim lokalu.', 'You only confirm that this person lives in your flat.', 'Ви лише підтверджуєте, що ця особа живе у вашому житлі.'))}
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-ok" />
                  {tr(t3('Meldunek nie daje żadnych praw do lokalu i nie jest umową najmu.', 'Registration gives no rights to the flat and is not a lease.', 'Реєстрація не дає прав на житло і не є договором оренди.'))}
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-ok" />
                  {tr(t3('Gdy najemca się wyprowadzi, możesz zgłosić to w aplikacji.', 'When the tenant moves out, you can report it in the app.', 'Коли орендар виїде, ви можете повідомити про це в застосунку.'))}
                </li>
              </ul>
            </div>
            <p className="mt-3 text-center text-[12px] text-muted">{tr(t3('Prośba wygaśnie za 7 dni. Twoje dane nie są pokazywane najemcy.', 'The request expires in 7 days. Your data is not shown to the tenant.', 'Запит спливе через 7 днів. Ваші дані не показуються орендарю.'))}</p>
          </>
        ) : (
          <div className="pt-10 text-center">
            <div className="anim-pop mx-auto grid size-20 place-items-center rounded-full bg-[#0f766e] text-white">
              <Check className="size-10" strokeWidth={3} />
            </div>
            <h2 className="mt-5 text-2xl font-bold">{tr(t3('Dziękujemy', 'Thank you', 'Дякуємо'))}</h2>
            <p className="mt-2 text-[15px] text-muted">{tr(t3(`Meldunek: ${p.name} – aktywny. Nic więcej nie musisz robić.`, `${p.name} is now registered. Nothing else to do.`, `Реєстрацію ${p.name} активовано. Більше нічого робити не потрібно.`))}</p>
          </div>
        )}
      </div>
      <div className="border-t border-line bg-card px-4 pt-3 pb-4">
        {!confirmed ? (
          <div className="space-y-2">
            <Btn className="!bg-[#0f766e]" icon={<Send className="size-5" />} onClick={() => setPinOpen(true)}>
              {tr(t3('Potwierdzam pobyt', 'I confirm the stay', 'Підтверджую перебування'))}
            </Btn>
            <Btn kind="secondary" onClick={() => toast(t3('W pokazie zostawiamy prośbę aktywną. W wersji docelowej najemca dostanie informację i opcję dołączenia umowy.', 'In the demo the request stays active. In production the tenant is told and offered to attach the agreement.', 'У демо запит залишається активним.'))}>
              {tr(t3('To nie mój najemca', 'Not my tenant', 'Це не мій орендар'))}
            </Btn>
          </div>
        ) : (
          <Btn onClick={() => replace({ name: 'meldunekResult' })}>{tr(t3(`Wróć do widoku: ${p.firstName}`, `Back to ${p.firstName}’s view`, `Повернутися до: ${p.firstName}`))}</Btn>
        )}
      </div>
      <PinSheet open={pinOpen} onClose={() => setPinOpen(false)} onDone={done} who={tr(t3(`Podpisujesz jako ${ownerName}`, `You sign as ${ownerName}`, `Ви підписуєте як ${ownerName}`))} steps={[t3('Podpisujemy potwierdzenie', 'Signing the confirmation', 'Підписуємо підтвердження'), t3('Rejestrujemy pobyt', 'Recording the stay', 'Реєструємо перебування')]} />
    </div>
  )
}

/* ---------------- Certificate ---------------- */

export function Certificate() {
  const { s, p, tr, lang, toast } = useStore()
  const a = s.answers
  const to = addr(a.addressId)
  const permanent = a.stay === 'permanent'
  const no = `ZM/${new Date().getFullYear()}/${p.pesel.slice(-5)}`
  return (
    <Screen title={t3('Zaświadczenie', 'Certificate', 'Довідка')} footer={<Btn kind="secondary" onClick={() => toast(t3('W wersji docelowej: PDF z pieczęcią elektroniczną, do pobrania i udostępnienia.', 'In production: a PDF with an electronic seal, to download and share.', 'У повній версії: PDF з електронною печаткою.'))}>{tr(t3('Pobierz PDF', 'Download PDF', 'Завантажити PDF'))}</Btn>}>
      <div className="p-4">
        <div className="relative overflow-hidden rounded-xl border border-line bg-white p-5 font-[ui-serif,Georgia,serif] text-[13px] leading-relaxed shadow-card">
          <span className="pointer-events-none absolute inset-0 grid place-items-center text-[44px] font-black tracking-widest text-ink/5 -rotate-[28deg] select-none">WZÓR · DEMO</span>
          <p className="text-[11px] text-muted">{tr(t3(`Urząd gminy ${to.city}`, `${to.city} municipal office`, `Установа гміни ${to.city}`))} · {fmtDate(today(), lang, { day: 'numeric', month: 'numeric', year: 'numeric' })}</p>
          <p className="mt-1 text-[11px] text-muted">Nr {no}</p>
          <h3 className="mt-4 text-center text-[16px] font-bold uppercase">{permanent ? 'Zaświadczenie o zameldowaniu na pobyt stały' : 'Zaświadczenie o zameldowaniu na pobyt czasowy'}</h3>
          <p className="mt-4">Zaświadcza się, że:</p>
          <p className="mt-1 text-[15px] font-bold">{p.name.toUpperCase()}</p>
          <p>PESEL: {p.pesel}</p>
          <p className="mt-3">jest zameldowany/a na pobyt {permanent ? 'stały' : 'czasowy'} pod adresem:</p>
          <p className="mt-1 font-bold">{addrLine(to)}</p>
          <p className="mt-3">
            od dnia {fmtDate(parseIso(a.moveDate), 'pl', { day: 'numeric', month: 'long', year: 'numeric' })}
            {!permanent && ` do dnia ${fmtDate(parseIso(a.tempUntil), 'pl', { day: 'numeric', month: 'long', year: 'numeric' })}`}.
          </p>
          <div className="mt-5 flex items-end justify-between gap-3">
            <div className="text-[11px] text-muted">
              <p>Dokument elektroniczny</p>
              <p>Zweryfikuj kodem QR</p>
            </div>
            <FakeQR seed={no} size={84} />
          </div>
        </div>
        <Simulated text={t3('Wzór poglądowy. Dane fikcyjne. Nie jest to dokument urzędowy.', 'Illustrative template. Fictional data. Not an official document.', 'Ілюстративний зразок. Дані вигадані.')} />
        <Pill tone="ok" className="mt-3">
          <ShieldCheck className="size-3.5" /> {tr(t3('Instytucje sprawdzą meldunek w rejestrze – papier zwykle nie jest potrzebny', 'Institutions can check the register, so paper is rarely needed', 'Установи перевірять реєстрацію в реєстрі'))}
        </Pill>
      </div>
    </Screen>
  )
}

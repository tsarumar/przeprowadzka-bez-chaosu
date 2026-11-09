import { addr, type Citizenship, type Persona, type Stay, type Title } from './data'
import { t3, type T } from './i18n'

export interface Answers {
  moveDate: string // yyyy-mm-dd
  stay: Stay
  citizenship: Citizenship
  title: Title
  addressId: string
  kids: string[]
  vehicle: boolean
  business: boolean
  tempUntil: string
  life: string[]
}

export type Channel = 'app' | 'office' | 'auto' | 'none' | 'outside'
export type Group = 'todo' | 'auto' | 'notNeeded' | 'life'

export interface Task {
  id: string
  group: Group
  channel: Channel
  title: T
  summary: T
  plain: T
  deadline?: Date
  deadlineRule?: T
  cost?: T
  time?: T
  docs?: T[]
  legal?: T
  screen?: string
  optional?: boolean
  /** auto tasks: becomes true once registration is completed */
  dependsOnMeldunek?: boolean
}

export const DAY = 86400000
export const today = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}
export const iso = (d: Date) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return z.toISOString().slice(0, 10)
}
export const parseIso = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export const addDays = (d: Date, n: number) => new Date(d.getTime() + n * DAY)
export const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / DAY)

/** “Najpóźniej w 30. dniu od zamieszkania” → move date + 29 days is the last day; we keep it simple and visible. */
export function meldunekDeadline(a: Answers) {
  const move = parseIso(a.moveDate)
  return addDays(move, a.citizenship === 'other' ? 3 : 29)
}

export const LIFE_OPTIONS: { id: string; title: T }[] = [
  { id: 'bank', title: t3('Bank i karty', 'Bank and cards', 'Банк і картки') },
  { id: 'work', title: t3('Pracodawca lub uczelnia', 'Employer or university', 'Роботодавець або університет') },
  { id: 'phone', title: t3('Operator telefonu i internet', 'Phone and internet provider', 'Оператор зв’язку та інтернет') },
  { id: 'insurance', title: t3('Ubezpieczenia (OC, mieszkanie)', 'Insurance (car, home)', 'Страхування (авто, житло)') },
  { id: 'mail', title: t3('Przekierowanie korespondencji', 'Mail forwarding', 'Переадресація пошти') },
]

export function buildPlan(p: Persona, a: Answers): Task[] {
  const tasks: Task[] = []
  const move = parseIso(a.moveDate)
  const to = addr(a.addressId)
  const from = addr(p.current.addressId)
  const changesGmina = to.gmina.split(' ')[0] !== from.gmina.split(' ')[0]
  const permanent = a.stay === 'permanent'
  const online = a.citizenship !== 'other'

  if (a.stay === 'short') return []

  // 1. Registration
  if (online) {
    tasks.push({
      id: 'meldunek',
      group: 'todo',
      channel: 'app',
      title: permanent ? t3('Zamelduj się na pobyt stały', 'Register your permanent address', 'Зареєструйте постійне місце проживання') : t3('Zamelduj się na pobyt czasowy', 'Register your temporary address', 'Зареєструйте тимчасове місце проживання'),
      summary:
        a.title === 'owner'
          ? t3('Jesteś w księdze wieczystej lokalu, więc system może zameldować Cię od razu, bez wizyty i bez czekania na urzędnika.', 'You are in the land register for this flat, so the system can register you instantly, with no visit and no waiting.', 'Ви є в поземельній книзі цієї квартири, тому система може зареєструвати вас одразу.')
          : t3('Pobyt potwierdzi właściciel lokalu jednym kliknięciem w swojej aplikacji. Możesz też dołączyć umowę najmu.', 'The owner confirms your stay with one tap in their app. You can also attach your tenancy agreement.', 'Власник підтвердить перебування одним натисканням у своєму застосунку. Також можна додати договір оренди.'),
      plain: t3('Zgłoś, gdzie teraz mieszkasz. Zajmie to około 2 minut.', 'Tell the state where you live now. Takes about 2 minutes.', 'Повідомте, де ви тепер живете. Це займе близько 2 хвилин.'),
      deadline: meldunekDeadline(a),
      deadlineRule: t3('najpóźniej w 30. dniu od zamieszkania', 'no later than day 30 after moving in', 'не пізніше 30-го дня після заселення'),
      cost: t3('bezpłatnie', 'free', 'безкоштовно'),
      time: t3('ok. 2 minuty', 'about 2 minutes', 'близько 2 хвилин'),
      docs:
        a.title === 'owner'
          ? [t3('nic – dane pobierzemy z rejestrów', 'nothing, we fetch data from registers', 'нічого, дані візьмемо з реєстрів')]
          : [t3('potwierdzenie właściciela w aplikacji albo skan umowy najmu', 'owner’s confirmation in the app or a scan of your tenancy agreement', 'підтвердження власника у застосунку або скан договору оренди')],
      legal: t3('Ustawa o ewidencji ludności', 'Population Records Act (Ustawa o ewidencji ludności)', 'Закон про облік населення (Ustawa o ewidencji ludności)'),
      screen: 'meldunek',
    })
  } else {
    tasks.push({
      id: 'meldunek',
      group: 'todo',
      channel: 'office',
      title: t3('Zamelduj się w urzędzie', 'Register at the municipal office', 'Зареєструйтеся в установі'),
      summary: t3('Obywatele państw spoza UE i EFTA nie mogą zameldować się przez internet. Przygotujemy wszystko, żeby wizyta trwała kilka minut.', 'Citizens of non-EU/EFTA countries cannot register online. We prepare everything so the visit takes minutes.', 'Громадяни країн поза ЄС та ЄАВТ не можуть зареєструватися онлайн. Ми підготуємо все, щоб візит тривав кілька хвилин.'),
      plain: t3('Musisz pójść do urzędu. Pomożemy Ci się przygotować.', 'You need to visit the office. We will help you prepare.', 'Потрібно піти в установу. Ми допоможемо підготуватися.'),
      deadline: meldunekDeadline(a),
      deadlineRule: t3('najpóźniej w 4. dniu od zamieszkania', 'no later than day 4 after moving in', 'не пізніше 4-го дня після заселення'),
      cost: t3('bezpłatnie (zaświadczenie o pobycie czasowym: 17 zł)', 'free (temporary-stay certificate: PLN 17)', 'безкоштовно (довідка про тимчасове перебування: 17 зл)'),
      time: t3('wizyta ok. 10 minut', 'visit about 10 minutes', 'візит близько 10 хвилин'),
      docs: [
        t3('ważny paszport', 'valid passport', 'дійсний паспорт'),
        t3('karta pobytu lub wiza', 'residence card or visa', 'карта побиту або віза'),
        t3('umowa najmu (oryginał)', 'tenancy agreement (original)', 'договір оренди (оригінал)'),
        t3('formularz zgłoszenia – wypełnimy go za Ciebie', 'registration form, we fill it in for you', 'форма заяви, ми заповнимо її за вас'),
      ],
      legal: t3('Ustawa o ewidencji ludności', 'Population Records Act', 'Закон про облік населення'),
      screen: 'visit',
    })
  }

  // 2. Vehicle
  if (a.vehicle && p.vehicle) {
    tasks.push({
      id: 'vehicle',
      group: 'todo',
      channel: 'app',
      title: t3('Zmień adres w dowodzie rejestracyjnym', 'Update the address on your vehicle registration', 'Змініть адресу в техпаспорті авто'),
      summary: t3(`${p.vehicle.make} (${p.vehicle.plate}) jest zarejestrowana na stary adres. Zgłoszenie wyślemy do starostwa właściwego dla nowego adresu.`, `${p.vehicle.make} (${p.vehicle.plate}) is registered to your old address. We send the request to the office for your new address.`, `${p.vehicle.make} (${p.vehicle.plate}) зареєстровано за старою адресою. Заяву надішлемо до відповідного староства.`),
      plain: t3('Samochód musi mieć nowy adres w dokumentach.', 'Your car documents need the new address.', 'Документи на авто мають містити нову адресу.'),
      deadline: addDays(move, 30),
      deadlineRule: t3('30 dni od zmiany adresu', '30 days from changing address', '30 днів від зміни адреси'),
      cost: t3('opłata wg urzędu (nowy dowód + pozwolenie czasowe)', 'fee set by the office (new certificate + temporary permit)', 'плата згідно з установою'),
      time: t3('ok. 3 minuty', 'about 3 minutes', 'близько 3 хвилин'),
      legal: t3('Prawo o ruchu drogowym', 'Road Traffic Act', 'Закон про дорожній рух'),
      screen: 'vehicle',
    })
  }

  // 3. Business
  if (a.business) {
    tasks.push({
      id: 'ceidg',
      group: 'todo',
      channel: 'app',
      title: t3('Zaktualizuj adres firmy w CEIDG', 'Update your business address in CEIDG', 'Оновіть адресу підприємства в CEIDG'),
      summary: t3('Jeden wniosek aktualizuje dane także w urzędzie skarbowym i ZUS.', 'One application also updates the tax office and ZUS.', 'Одна заява оновлює дані також у податковій та ZUS.'),
      plain: t3('Masz firmę – podaj jej nowy adres.', 'You run a business, give its new address.', 'У вас є бізнес – вкажіть нову адресу.'),
      deadline: addDays(move, 7),
      deadlineRule: t3('7 dni od zmiany', '7 days from the change', '7 днів від зміни'),
      cost: t3('bezpłatnie', 'free', 'безкоштовно'),
      screen: 'quick:ceidg',
    })
  } else if (a.citizenship !== 'other') {
    tasks.push({
      id: 'tax',
      group: 'todo',
      channel: 'app',
      optional: true,
      title: t3('Podaj nowy adres urzędowi skarbowemu', 'Give your new address to the tax office', 'Повідомте нову адресу податковій'),
      summary: t3('Formularz ZAP-3 wypełniony automatycznie. Możesz też zrobić to w najbliższym zeznaniu PIT.', 'Form ZAP-3, pre-filled. You can also do it in your next PIT return.', 'Форма ZAP-3, заповнена автоматично. Також можна в наступній декларації PIT.'),
      plain: t3('Urząd skarbowy powinien znać Twój adres.', 'The tax office should know your address.', 'Податкова має знати вашу адресу.'),
      cost: t3('bezpłatnie', 'free', 'безкоштовно'),
      time: t3('1 minuta', '1 minute', '1 хвилина'),
      screen: 'quick:tax',
    })
  }

  // 4. Waste declaration (owners)
  if (a.title === 'owner') {
    tasks.push({
      id: 'waste',
      group: 'todo',
      channel: 'app',
      title: t3('Złóż deklarację o opłacie za odpady', 'Submit the waste fee declaration', 'Подайте декларацію про плату за відходи'),
      summary: t3(`Właściciel składa ją w gminie ${to.city} w ciągu 14 dni od zamieszkania. Liczbę mieszkańców uzupełnimy z wniosku meldunkowego.`, `Owners submit it to the ${to.city} municipality within 14 days of moving in. We fill in the number of residents from your registration.`, `Власник подає її до гміни ${to.city} протягом 14 днів після заселення.`),
      plain: t3('Gmina musi wiedzieć, ile osób mieszka w mieszkaniu.', 'The municipality needs to know how many people live in the flat.', 'Гміна має знати, скільки людей живе в квартирі.'),
      deadline: addDays(move, 14),
      deadlineRule: t3('14 dni od zamieszkania', '14 days from moving in', '14 днів від заселення'),
      cost: t3('bezpłatnie', 'free', 'безкоштовно'),
      time: t3('1 minuta', '1 minute', '1 хвилина'),
      screen: 'quick:waste',
    })
  }

  // 5. Doctor
  if (changesGmina) {
    tasks.push({
      id: 'doctor',
      group: 'todo',
      channel: 'app',
      optional: true,
      title: t3('Wybierz przychodnię blisko nowego domu', 'Choose a GP clinic near your new home', 'Оберіть поліклініку біля нового дому'),
      summary: t3('Deklaracja wyboru lekarza POZ. Bezpłatnie do 2 razy w roku.', 'Primary care (POZ) declaration. Free up to twice a year.', 'Декларація вибору лікаря POZ. Безкоштовно до 2 разів на рік.'),
      plain: t3('Zmień przychodnię na bliższą.', 'Switch to a clinic closer to you.', 'Змініть поліклініку на ближчу.'),
      cost: t3('bezpłatnie', 'free', 'безкоштовно'),
      time: t3('1 minuta', '1 minute', '1 хвилина'),
      screen: 'doctor',
    })
  }

  // 6. School (kids + new gmina)
  const movingKids = p.kids.filter((k) => a.kids.includes(k.id))
  const schoolKid = movingKids.find((k) => k.age >= 6)
  if (schoolKid && changesGmina) {
    const n = schoolKid.name.split(' ')[0]
    tasks.push({
      id: 'school',
      group: 'todo',
      channel: 'outside',
      optional: true,
      title: t3(`Szkoła w nowej gminie: ${n}`, `A school in the new municipality: ${n}`, `Школа в новій гміні: ${n}`),
      summary: t3('Pokażemy szkołę obwodową dla nowego adresu. Zapisy prowadzi szkoła.', 'We show the catchment-area school for the new address. Enrolment is handled by the school.', 'Покажемо районну школу для нової адреси. Запис веде школа.'),
      plain: t3('Sprawdź, do której szkoły może chodzić dziecko.', 'Check which school your child can attend.', 'Перевірте, до якої школи може ходити дитина.'),
      screen: 'quick:school',
    })
  }

  // 7. EU voters (permanent only)
  if (a.citizenship === 'eu' && permanent) {
    tasks.push({
      id: 'euvoter',
      group: 'todo',
      channel: 'app',
      optional: true,
      title: t3('Wpisz się do rejestru wyborców', 'Join the voter register', 'Внесіть себе до реєстру виборців'),
      summary: t3('Jako obywatel UE możesz głosować w wyborach samorządowych i do Parlamentu Europejskiego. Wymaga wniosku.', 'As an EU citizen you can vote in local and European Parliament elections. Requires an application.', 'Як громадянин ЄС ви можете голосувати на місцевих виборах та виборах до Європарламенту.'),
      plain: t3('Chcesz głosować? Złóż wniosek.', 'Want to vote? Apply.', 'Хочете голосувати? Подайте заяву.'),
      screen: 'quick:euvoter',
    })
  }

  // ---- Automatic ----
  if (permanent && p.current.type === 'permanent') {
    tasks.push({
      id: 'auto-dereg',
      group: 'auto',
      channel: 'auto',
      dependsOnMeldunek: true,
      title: t3(`Wymeldowanie z: ${from.street}, ${from.city}`, `Deregistration from: ${from.street}, ${from.city}`, `Зняття з реєстрації: ${from.street}, ${from.city}`),
      summary: t3('Zameldowanie na pobyt stały kończy poprzedni pobyt stały. Nie musisz wymeldowywać się osobno.', 'Registering a permanent address ends the previous one. No separate deregistration needed.', 'Реєстрація постійного місця завершує попередню. Окремо виписуватися не потрібно.'),
      plain: t3('Stary adres usuniemy sami.', 'We remove the old address ourselves.', 'Стару адресу видалимо самі.'),
    })
  }
  if (!permanent && p.current.type === 'temporary') {
    tasks.push({
      id: 'auto-dereg',
      group: 'auto',
      channel: 'auto',
      dependsOnMeldunek: true,
      title: t3(`Koniec pobytu czasowego: ${from.street}`, `Temporary stay ends at: ${from.street}`, `Завершення тимчасового перебування: ${from.street}`),
      summary: t3('Można mieć tylko jeden pobyt czasowy. Nowe zameldowanie zastępuje poprzednie.', 'You can only have one temporary address. The new registration replaces the old one.', 'Можна мати лише одне тимчасове місце перебування. Нова реєстрація замінює попередню.'),
      plain: t3('Stary adres tymczasowy zniknie sam.', 'The old temporary address disappears automatically.', 'Стара тимчасова адреса зникне сама.'),
    })
  }
  if (movingKids.length && a.title === 'owner') {
    tasks.push({
      id: 'auto-kids',
      group: 'auto',
      channel: 'auto',
      dependsOnMeldunek: true,
      title: t3(`Zameldowanie dziecka: ${movingKids.map((k) => k.name.split(' ')[0]).join(', ')}`, `Child registration: ${movingKids.map((k) => k.name.split(' ')[0]).join(', ')}`, `Реєстрація дитини: ${movingKids.map((k) => k.name.split(' ')[0]).join(', ')}`),
      summary: t3('Rejestr PESEL wskazuje Cię jako rodzica, a księga wieczysta potwierdza adres. Dziecko zostanie zameldowane razem z Tobą.', 'The PESEL register lists you as the parent and the land register confirms the address, so your child is registered with you.', 'Реєстр PESEL вказує вас як батьків, тому дитину буде зареєстровано разом з вами.'),
      plain: t3('Dziecko zameldujemy razem z Tobą.', 'We register your child with you.', 'Дитину зареєструємо разом з вами.'),
    })
  }
  if (permanent && a.citizenship === 'pl') {
    tasks.push({
      id: 'auto-voters',
      group: 'auto',
      channel: 'auto',
      dependsOnMeldunek: true,
      title: t3(`Rejestr wyborców w gminie ${to.city}`, `Voter register in ${to.city}`, `Реєстр виборців у гміні ${to.city}`),
      summary: t3('Gmina wpisze Cię z urzędu i zawiadomi poprzednią gminę.', 'The municipality adds you automatically and notifies the previous one.', 'Гміна внесе вас автоматично і повідомить попередню.'),
      plain: t3('Będziesz głosować w nowym miejscu.', 'You will vote in your new place.', 'Ви голосуватимете за новим місцем.'),
    })
  }
  tasks.push({
    id: 'auto-pesel',
    group: 'auto',
    channel: 'auto',
    dependsOnMeldunek: true,
    title: t3('Nowy adres w rejestrze PESEL', 'New address in the PESEL register', 'Нова адреса в реєстрі PESEL'),
    summary: t3('Urzędy i instytucje korzystające z rejestru PESEL zobaczą aktualny adres zameldowania.', 'Offices and institutions using the PESEL register will see your current address.', 'Установи, що користуються реєстром PESEL, побачать актуальну адресу.'),
    plain: t3('Inne urzędy zobaczą nowy adres.', 'Other offices will see the new address.', 'Інші установи побачать нову адресу.'),
  })

  // ---- Not needed ----
  if (a.citizenship === 'pl') {
    tasks.push({
      id: 'nn-id',
      group: 'notNeeded',
      channel: 'none',
      title: t3('Wymiana dowodu osobistego', 'Replacing your ID card', 'Заміна посвідчення особи'),
      summary: t3('Dowód osobisty nie zawiera adresu, więc zostaje bez zmian.', 'The ID card has no address on it, so nothing changes.', 'Посвідчення особи не містить адреси.'),
      plain: t3('Dowód zostaje ten sam.', 'Your ID stays the same.', 'Посвідчення залишається тим самим.'),
    })
  }
  if (a.vehicle || a.citizenship === 'pl') {
    tasks.push({
      id: 'nn-license',
      group: 'notNeeded',
      channel: 'none',
      title: t3('Wymiana prawa jazdy', 'Replacing your driving licence', 'Заміна посвідчення водія'),
      summary: t3('Polskie prawo jazdy nie zawiera adresu.', 'Polish driving licences have no address on them.', 'Польське посвідчення водія не містить адреси.'),
      plain: t3('Prawo jazdy zostaje to samo.', 'Your licence stays the same.', 'Посвідчення водія залишається тим самим.'),
    })
  }
  if (a.vehicle) {
    tasks.push({
      id: 'nn-plates',
      group: 'notNeeded',
      channel: 'none',
      title: t3('Zmiana tablic rejestracyjnych', 'Changing number plates', 'Зміна номерних знаків'),
      summary: t3('Tablice zostają, nawet jeśli przeprowadzasz się do innego powiatu.', 'Plates stay the same, even when you move to another county.', 'Номери залишаються, навіть якщо ви переїжджаєте до іншого повіту.'),
      plain: t3('Tablice zostają.', 'Plates stay.', 'Номери залишаються.'),
    })
  }
  tasks.push({
    id: 'nn-dereg',
    group: 'notNeeded',
    channel: 'none',
    title: t3('Osobne wymeldowanie', 'Separate deregistration', 'Окреме зняття з реєстрації'),
    summary: t3('Nowe zameldowanie automatycznie kończy poprzednie tego samego rodzaju.', 'A new registration automatically ends the previous one of the same type.', 'Нова реєстрація автоматично завершує попередню того ж типу.'),
    plain: t3('Nie musisz się wymeldowywać.', 'No need to deregister.', 'Не потрібно виписуватися.'),
  })

  // ---- Life (outside administration) ----
  for (const id of a.life) {
    const o = LIFE_OPTIONS.find((x) => x.id === id)
    if (!o) continue
    tasks.push({
      id: 'life-' + id,
      group: 'life',
      channel: 'outside',
      title: o.title,
      summary: t3('Przypomnienie poza administracją – tylko na Twojej liście.', 'A reminder outside the administration, only on your list.', 'Нагадування поза адміністрацією – лише у вашому списку.'),
      plain: t3('Przypomnienie dla Ciebie.', 'A reminder for you.', 'Нагадування для вас.'),
    })
  }

  return tasks
}

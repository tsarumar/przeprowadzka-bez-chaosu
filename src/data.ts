import { t3, type Lang, type T } from './i18n'

export type Citizenship = 'pl' | 'eu' | 'other'
export type Stay = 'permanent' | 'temporary' | 'short'
export type Title = 'owner' | 'rent' | 'family' | 'dorm'

export interface Address {
  id: string
  street: string
  postal: string
  city: string
  gmina: string
  powiat: string
  /** fictional land-register number, only for addresses where the demo person is the owner */
  kw?: string
}

export interface Kid {
  id: string
  name: string
  age: number
  pesel: string
}

export interface Persona {
  id: string
  name: string
  firstName: string
  initials: string
  color: string
  pesel: string
  citizenship: Citizenship
  citizenshipLabel: T
  lang: Lang
  current: { addressId: string; type: 'permanent' | 'temporary' }
  kids: Kid[]
  vehicle?: { make: string; plate: string; vin: string }
  business?: { name: string; nip: string }
  owner?: { name: string; role: T }
  defaults: {
    moveOffsetDays: number
    stay: Stay
    title: Title
    addressId: string
    kids: string[]
    tempUntil?: string
  }
  tagline: T
  story: T
  showcase: T[]
}

export const ADDRESSES: Address[] = [
  { id: 'waw-sloneczna', street: 'ul. Słoneczna 8/12', postal: '02-495', city: 'Warszawa', gmina: 'Warszawa (Ursus)', powiat: 'm.st. Warszawa', kw: 'WA1M/00123456/7' },
  { id: 'bia-lipowa', street: 'ul. Lipowa 14/3', postal: '15-427', city: 'Białystok', gmina: 'Białystok', powiat: 'Białystok' },
  { id: 'bia-mickiewicza', street: 'ul. Mickiewicza 30/4', postal: '15-213', city: 'Białystok', gmina: 'Białystok', powiat: 'Białystok' },
  { id: 'bia-akademik', street: 'ul. Kołłątaja 26 (DS nr 2)', postal: '15-087', city: 'Białystok', gmina: 'Białystok', powiat: 'Białystok' },
  { id: 'wro-legnicka', street: 'ul. Legnicka 52/18', postal: '53-674', city: 'Wrocław', gmina: 'Wrocław', powiat: 'Wrocław' },
  { id: 'wro-grabiszynska', street: 'ul. Grabiszyńska 101/5', postal: '53-439', city: 'Wrocław', gmina: 'Wrocław', powiat: 'Wrocław' },
  { id: 'krk-dluga', street: 'ul. Długa 5/2', postal: '31-147', city: 'Kraków', gmina: 'Kraków', powiat: 'Kraków' },
  { id: 'gdy-morska', street: 'ul. Morska 11/9', postal: '81-323', city: 'Gdynia', gmina: 'Gdynia', powiat: 'Gdynia' },
  { id: 'poz-glogowska', street: 'ul. Głogowska 40/7', postal: '60-736', city: 'Poznań', gmina: 'Poznań', powiat: 'Poznań' },
]

export const addr = (id: string) => ADDRESSES.find((a) => a.id === id) ?? ADDRESSES[0]
export const kwFor = (a: Address) => a.kw ?? `${a.city.slice(0, 2).toUpperCase()}1M/00${(a.id.length * 7919).toString().padStart(6, '0').slice(-6)}/3`
export const addrLine = (a: Address) => `${a.street}, ${a.postal} ${a.city}`

export const PERSONAS: Persona[] = [
  {
    id: 'anna',
    name: 'Anna Kowalczyk',
    firstName: 'Anna',
    initials: 'AK',
    color: '#7c3aed',
    pesel: '85020312345',
    citizenship: 'pl',
    citizenshipLabel: t3('polskie', 'Polish', 'польське'),
    lang: 'pl',
    current: { addressId: 'bia-lipowa', type: 'permanent' },
    kids: [{ id: 'zosia', name: 'Zosia Kowalczyk', age: 7, pesel: '19260512345' }],
    vehicle: { make: 'Škoda Fabia', plate: 'BI 4K271', vin: 'TMBEG6NJ1MZ000000' },
    defaults: { moveOffsetDays: -5, stay: 'permanent', title: 'owner', addressId: 'waw-sloneczna', kids: ['zosia'] },
    tagline: t3('Kupiła mieszkanie i przeprowadza się z córką z Białegostoku do Warszawy', 'Bought a flat and moves with her daughter from Białystok to Warsaw', 'Купила квартиру і переїжджає з донькою з Білостока до Варшави'),
    story: t3(
      'Właścicielka mieszkania, z dzieckiem i samochodem. Pokazuje ścieżkę, w której większość spraw dzieje się automatycznie.',
      'Owner, with a child and a car. Shows the path where most things happen automatically.',
      'Власниця квартири, з дитиною та автомобілем. Показує шлях, де більшість справ відбувається автоматично.',
    ),
    showcase: [
      t3('Meldunek w 1 minutę: dane z księgi wieczystej się zgadzają, więc rejestracja jest natychmiastowa', 'Registration in 1 minute: land register data match, so registration is instant', 'Реєстрація за 1 хвилину: дані з поземельної книги збігаються'),
      t3('Dziecko zameldowane razem z mamą', 'Child registered together with mum', 'Дитину зареєстровано разом з мамою'),
      t3('Samochód, lekarz, deklaracja śmieciowa w jednym planie', 'Car, GP and waste declaration in one plan', 'Авто, лікар і декларація про відходи в одному плані'),
    ],
  },
  {
    id: 'lukas',
    name: 'Lukas Weber',
    firstName: 'Lukas',
    initials: 'LW',
    color: '#0891b2',
    pesel: '04110109876',
    citizenship: 'eu',
    citizenshipLabel: t3('niemieckie (UE)', 'German (EU)', 'німецьке (ЄС)'),
    lang: 'en',
    current: { addressId: 'bia-akademik', type: 'temporary' },
    kids: [],
    owner: { name: 'Ewa Zielińska', role: t3('właścicielka mieszkania', 'flat owner', 'власниця квартири') },
    defaults: { moveOffsetDays: -2, stay: 'temporary', title: 'rent', addressId: 'bia-mickiewicza', kids: [], tempUntil: '2027-06-30' },
    tagline: t3('Student Erasmusa, przenosi się z akademika do wynajętego pokoju w Białymstoku', 'Erasmus student moving from a dorm to a rented room in Białystok', 'Студент Erasmus, переїжджає з гуртожитку в орендовану кімнату в Білостоці'),
    story: t3(
      'Obywatel UE, najemca, pobyt czasowy. Pokazuje nowe potwierdzenie przez właściciela jednym kliknięciem w jego aplikacji.',
      'EU citizen, tenant, temporary stay. Shows the new one-tap confirmation by the owner in their own app.',
      'Громадянин ЄС, орендар, тимчасове перебування. Показує підтвердження власником одним натисканням у застосунку.',
    ),
    showcase: [
      t3('Interfejs po angielsku, przełączany w każdej chwili', 'Interface in English, switchable anytime', 'Інтерфейс англійською, перемикається будь-коли'),
      t3('Właścicielka potwierdza pobyt w swojej aplikacji: bez papierowego oświadczenia', 'Owner confirms the stay in her app, no paper declaration', 'Власниця підтверджує перебування у своєму застосунку'),
      t3('Wyjaśnienie, że meldunek nie daje praw do lokalu, co zmniejsza obawy właścicieli', 'Explains that registration gives no rights to the flat, which reduces owners’ worries', 'Пояснення, що реєстрація не дає прав на житло'),
    ],
  },
  {
    id: 'rahul',
    name: 'Rahul Mehta',
    firstName: 'Rahul',
    initials: 'RM',
    color: '#ea580c',
    pesel: '93072804321',
    citizenship: 'other',
    citizenshipLabel: t3('indyjskie (spoza UE)', 'Indian (non-EU)', 'індійське (поза ЄС)'),
    lang: 'en',
    current: { addressId: 'wro-grabiszynska', type: 'temporary' },
    kids: [],
    defaults: { moveOffsetDays: -1, stay: 'temporary', title: 'rent', addressId: 'wro-legnicka', kids: [], tempUntil: '2027-09-30' },
    tagline: t3('Programista z kartą pobytu, zmienia mieszkanie we Wrocławiu', 'Software developer with a residence card, changing flats in Wrocław', 'Програміст з картою побиту, змінює квартиру у Вроцлаві'),
    story: t3(
      'Obywatel spoza UE nie może zameldować się online. Aplikacja mówi to uczciwie i przygotowuje wizytę w urzędzie: dokumenty, formularz, termin.',
      'Non-EU citizens cannot register online. The app says so honestly and prepares the office visit: documents, form, appointment.',
      'Громадяни поза ЄС не можуть зареєструватися онлайн. Застосунок чесно про це каже і готує візит до установи.',
    ),
    showcase: [
      t3('Termin 4 dni z odliczaniem', '4-day deadline with countdown', 'Термін 4 дні з відліком'),
      t3('Formularz wypełniony z wyprzedzeniem i kod QR dla urzędnika', 'Pre-filled form and a QR code for the clerk', 'Заздалегідь заповнена форма і QR-код для службовця'),
      t3('Rezerwacja wizyty i dodanie do kalendarza (działający plik .ics)', 'Book a visit and add it to your calendar (working .ics file)', 'Запис на візит і додавання в календар (.ics)'),
    ],
  },
]

export const persona = (id: string) => PERSONAS.find((p) => p.id === id) ?? PERSONAS[0]

export const CLINICS = [
  { id: 'c1', name: 'Przychodnia Rodzinna „Zielony Ursus”', street: 'ul. Dzieci Warszawy 21', dist: '450 m' },
  { id: 'c2', name: 'Centrum Medyczne Słoneczna', street: 'ul. Słoneczna 2', dist: '200 m' },
  { id: 'c3', name: 'Poradnia POZ Ursus Centrum', street: 'ul. Przykładowa 9', dist: '1,2 km' },
]

export const OFFICES: Record<string, { name: string; street: string }[]> = {
  'Wrocław': [
    { name: 'Biuro Obsługi Mieszkańców – Centrum (przykład)', street: 'ul. Przykładowa 1' },
    { name: 'Biuro Obsługi Mieszkańców – Fabryczna (przykład)', street: 'ul. Przykładowa 65' },
  ],
}

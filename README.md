# Przeprowadzka bez chaosu

Klikalny prototyp konkursowy na **mObywatel Challenge 2026** ([mobywatel.ai](https://mobywatel.ai)).
Jedna sytuacja życiowa – przeprowadzka – zamiast dziesięciu osobnych spraw w różnych urzędach.

**▶ Prototyp: https://tsarumar.github.io/przeprowadzka-bez-chaosu/**

> Prototyp koncepcyjny. Nie jest oficjalną aplikacją mObywatel ani usługą administracji publicznej. Nie łączy się z żadnym rejestrem i niczego nie wysyła. Wszystkie osoby, adresy i numery są fikcyjne.

## Co pokazuje

- **6 pytań → osobisty plan**: „do zrobienia” (z terminami od dnia przeprowadzki), „zrobi się samo”, „nie musisz”.
- **Meldunek w minutę**: zgodność z księgą wieczystą = zameldowanie natychmiastowe, razem z dzieckiem; wymeldowanie, rejestr wyborców i PESEL aktualizują się same.
- **Potwierdzenie przez właściciela w jego aplikacji** zamiast papierowego oświadczenia.
- **Uczciwa ścieżka dla cudzoziemców spoza UE**: termin 4 dni, dwujęzyczny formularz z kodem QR, rezerwacja wizyty (z pominięciem świąt), plik `.ics`.
- Dowód rejestracyjny, przychodnia POZ, deklaracja śmieciowa, ZAP-3 / CEIDG.
- PL / EN / UA, prosty język, większy tekst, wysoki kontrast, przypomnienia, eksport do kalendarza, historia dostępu do danych.

## Osoby demonstracyjne

| Osoba | Ścieżka | Link bezpośredni |
|---|---|---|
| Anna Kowalczyk | obywatelka PL, właścicielka, dziecko, auto | `?osoba=anna` |
| Lukas Weber | obywatel UE, najemca, pobyt czasowy | `?osoba=lukas` |
| Rahul Mehta | obywatel spoza UE, wizyta w urzędzie | `?osoba=rahul` |

## Uruchomienie

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # statyczne pliki w dist/
```

Stack: React 18, TypeScript, Vite, Tailwind CSS 4, lucide-react. Statyczna strona – działa na GitHub Pages, Vercel i Cloudflare Pages bez backendu.

## Źródła reguł

- gov.pl – [Zamelduj się na pobyt stały lub czasowy (dla cudzoziemców)](https://www.gov.pl/web/gov/zamelduj-sie-na-pobyt-staly-dla-cudzoziemcow)
- Ustawa z dnia 24 września 2010 r. o ewidencji ludności
- Prawo o ruchu drogowym (zmiana danych w dowodzie rejestracyjnym – 30 dni)
- Ustawa o utrzymaniu czystości i porządku w gminach (deklaracja – 14 dni)
- Kodeks wyborczy (rejestr wyborców)

Stan na listopad 2026 r.

## Prawa

© 2026 autor zgłoszenia. Prawa do koncepcji pozostają przy autorze (zgodnie z zasadami konkursu). Kod udostępniony do wglądu jury.

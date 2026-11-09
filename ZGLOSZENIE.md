# Zgłoszenie – mObywatel Challenge 2026

Gotowe teksty do formularza na https://mobywatel.ai (sekcja „Zgłoś”). Termin: **30 listopada 2026 r., do końca dnia czasu polskiego**.

---

## Pola formularza

| Pole | Co wpisać |
|---|---|
| Imię i nazwisko lub nazwa zespołu * | *Twoje imię i nazwisko* |
| E-mail * | *Twój adres e-mail* |
| Miejscowość | Białystok |
| Kto zgłasza | Uczniowie lub studenci |
| Tytuł koncepcji * | Przeprowadzka bez chaosu – jedna sytuacja życiowa zamiast dziesięciu spraw |
| Opis * (maks. 4000 znaków) | tekst poniżej |
| Link do klikalnego prototypu * | *adres strony z prototypem (https://…)* |
| Dodatkowy link | *link do repozytorium na GitHubie lub do filmu* |
| Polskie modele i technologie | tekst poniżej (pole opcjonalne) |
| Strona www | puste |
| Zgody | zaznacz obie, po przeczytaniu zasad |

Przed wysłaniem otwórz link do prototypu w oknie prywatnym przeglądarki i sprawdź, czy działa bez logowania.

---

## Opis (do wklejenia)

<!-- OPIS-START -->
Problem
Przeprowadzka to jedno wydarzenie, ale dla państwa – kilka osobnych spraw w różnych urzędach: meldunek, dowód rejestracyjny, deklaracja śmieciowa, przychodnia, urząd skarbowy. Trzeba samemu wiedzieć, co nas dotyczy, w jakim terminie i gdzie to załatwić. Część rzeczy dzieje się automatycznie (wymeldowanie, rejestr wyborców), ale nikt o tym nie mówi – więc robimy rzeczy niepotrzebne, a o ważnych zapominamy. Najtrudniej mają cudzoziemcy spoza UE: nie mogą zameldować się online i mają na to tylko 4 dni.

Rozwiązanie
„Przeprowadzka bez chaosu” to ścieżka w mObywatelu oparta na sytuacji życiowej, a nie na liście usług. Użytkownik odpowiada na 6 krótkich pytań. Aplikacja korzysta z danych, które państwo już ma (PESEL, CEPiK, księgi wieczyste), więc pyta tylko o to, czego nie wie – i przy każdym pytaniu wyjaśnia, dlaczego pyta.

Wynikiem jest osobisty plan w trzech częściach:
• Do zrobienia – sprawy z terminami liczonymi od dnia przeprowadzki,
• Zrobi się samo – co państwo zrobi automatycznie po zameldowaniu,
• Nie musisz – np. wymiana dowodu osobistego czy prawa jazdy (nie zawierają adresu).

Co jest w prototypie
1. Meldunek w minutę. Gdy dane z księgi wieczystej się zgadzają, zameldowanie jest natychmiastowe, razem z dzieckiem, a wymeldowanie ze starego adresu, rejestr wyborców i PESEL aktualizują się same.
2. Potwierdzenie przez właściciela w jego aplikacji. Najemca nie musi zdobywać papierowego oświadczenia – właściciel dostaje prośbę i potwierdza PIN-em. Aplikacja wprost mówi, że meldunek nie daje praw do lokalu, bo to częsty powód odmowy.
3. Uczciwa ścieżka dla cudzoziemców spoza UE. Zamiast udawać, że wszystko da się zrobić online, aplikacja odlicza 4-dniowy termin, przygotowuje dwujęzyczny formularz z kodem QR dla urzędnika, listę dokumentów i rezerwację wizyty z pominięciem świąt i weekendów (działający plik kalendarza .ics).
4. Powiązane sprawy w jednym miejscu: dowód rejestracyjny, przychodnia POZ, deklaracja śmieciowa, ZAP-3 lub CEIDG – z danymi uzupełnionymi automatycznie.
5. Przypomnienia o terminach i eksport wszystkich terminów do kalendarza.
6. Dostępność: język polski, angielski i ukraiński, tryb prostego języka, większy tekst, wysoki kontrast.
7. Kontrola nad danymi: ekran „Twoje dane w tej sprawie” z historią dostępu, źródła prawne przy sprawach, nic nie jest wysyłane bez potwierdzenia PIN-em.

Dla kogo
Dla każdego, kto zmienia adres – szczególnie dla rodzin z dziećmi, najemców i studentów, osób starszych oraz cudzoziemców.

Co działa lepiej niż w prototypie organizatorów
Prototyp referencyjny nie obsługuje przeprowadzki. Zamiast rozmowy z czatem proponujemy widoczny plan: użytkownik zawsze wie, co zostało, ile ma czasu i co zrobi się samo. Asystent jest dodatkiem – w wersji docelowej polski model językowy (Bielik lub PLLuM) odpowiadałby wyłącznie na podstawie zweryfikowanych treści gov.pl, zawsze z linkiem do źródła.

Jak obejrzeć
Na komputerze po lewej stronie jest przewodnik i trzy osoby: Anna (właścicielka mieszkania, z dzieckiem i autem), Lukas (student z UE, najemca, interfejs po angielsku) i Rahul (cudzoziemiec spoza UE). Na telefonie przewodnik otwiera się z górnego paska.

Reguły (terminy, kto może załatwić sprawę online) oparto na gov.pl i ustawie o ewidencji ludności, stan na listopad 2026 r. Prototyp nie łączy się z rejestrami, a wszystkie dane są fikcyjne.
<!-- OPIS-END -->

---

## Polskie modele i technologie (pole opcjonalne)

Prototyp nie korzysta jeszcze z modelu językowego – odpowiedzi w zakładce „Zapytaj” są przygotowane na podstawie gov.pl. Koncepcja zakłada asystenta opartego na polskim modelu językowym (Bielik lub PLLuM), ograniczonego do zweryfikowanych treści i podającego źródło każdej odpowiedzi.

---

## Lista kontrolna przed wysłaniem

- [ ] Link do prototypu działa w oknie prywatnym (bez logowania) na komputerze i telefonie
- [ ] Przejście ścieżek Anny, Lukasa i Rahula od początku do końca
- [ ] Opis wklejony w całości (licznik ≤ 4000)
- [ ] Prototyp zostaje online do ogłoszenia wyników

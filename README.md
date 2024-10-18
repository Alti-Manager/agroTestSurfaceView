<p align="center"><h3>Documentație Tehnică pentru agroTestSurfaceView</h3></p>

---

## **1. Introducere**

### **1.1 Scopul Documentației**

Această documentație are ca scop detalierea construcției și a modului de funcționare a uneltei **agroTestSurfaceView**. Documentul este destinat dezvoltatorilor care doresc să utilizeze această aplicație împreună cu serviciul **agroBackEnd**.

### **1.2 Prezentarea Uneltei**

**agroTestSurfaceView** afișează pe o hartă Google Maps datele provenite de la back-end în urma solicitărilor de tip `getPath`. Aceste date pot fi:

- **Linii**: trasee sau segmente.
- **Poligoane**: lucrări agricole determinate.
- **Puncte**: diverse puncte necesare procesului de îmbunătățire.

Autentificarea în cont se realizează automat, pe baza datelor salvate în fișierul `.env`. În funcție de contul conectat, lista de dispozitive afișată este personalizată.

---

## **2. Descriere Generală**

### **2.1 Funcționalități Cheie**

#### **2.1.1 Preluarea Datelor despre Traseu pe Intervale de Timp**

- Selectarea dispozitivului, a datei și orei de început, precum și a datei și orei de sfârșit pentru afișarea datelor relevante.
- Funcționalitate de navigare rapidă pentru a muta intervalul de selecție cu o zi înainte sau înapoi.

#### **2.1.2 Afișarea Datelor pe Hartă**

- Vizualizarea pe hartă a poligoanelor, liniilor și punctelor în funcție de intervalul și dispozitivul selectat.

#### **2.1.3 Interacțiunea cu Poligoanele**

- Făcând clic pe un poligon, se afișează o fereastră cu informații detaliate despre:

  - Intervalul de timp al lucrării.
  - Suprafața lucrată (hectare).
  - Consum de carburant (litri).
  - Lățimea de lucru (metri).

![infoLucrare](readmeImages/image2.png)

---

## **3. Beneficii**

### **3.1 Vizualizare Rapidă și Eficientă**

- **Trasee și Lucrări**: Vizualizarea imediată a traseelor parcurse și a poligoanelor lucrărilor determinate.
- **Elemente Ajutătoare**: Afișarea segmentelor și a punctelor suplimentare pentru o analiză detaliată.
- **Contextualizare**: Integrarea parcelelor APIA pe harta Google Maps pentru o mai bună înțelegere a datelor.

---

## **4. Instalare**

### **4.1 Cerințe de Sistem**

#### **4.1.1 Specificații Hardware**

- **Sistem de Operare**: Linux / Windows / macOS.
- **Memorie RAM**: Minim 1 GB.
- **Spațiu de Stocare**: Minim 10 MB disponibil.

#### **4.1.2 Dependențe Necesare**

- **Node.js** și **npm**: Pentru gestionarea pachetelor și rularea aplicației.
- **Git**: Pentru clonarea repository-ului.

### **4.2 Descărcare și Instalare**

#### **4.2.1 Clonarea Repository-ului**

Pentru a descărca aplicația local, utilizați următoarea comandă în terminal:

```bash
git clone [adresa_repo]
```

#### **4.2.2 Instalarea Dependențelor**

Accesați directorul proiectului și instalați dependențele cu:

```bash
npm ci
```

#### **4.2.3 Configurarea Variabilelor de Mediu**

Creați un fișier `.env` în rădăcina proiectului și adăugați următoarele variabile:

```env
username=[utilizator]
password=[parola]
server=[adresaServerului]
```

Înlocuiți `[utilizator]`, `[parola]` și `[adresaServerului]` cu informațiile corespunzătoare.

#### **4.2.4 Rularea Aplicației**

Pentru a porni aplicația, executați comanda:

```bash
npm run start
```

_(Notă: Asigurați-vă că scriptul de rulare este definit ca `"start"` în fișierul `package.json`. Dacă este diferit, înlocuiți `start` cu numele corespunzător.)_

---

## **5. Utilizare**

După rularea aplicației, aceasta va fi accesibilă prin intermediul browserului web la adresa specificată în configurare (implicit `http://localhost:3000`). Puteți începe să selectați dispozitivul și intervalul de timp pentru a vizualiza datele pe hartă.

---

Dacă aveți nevoie de informații suplimentare sau întâmpinați probleme în timpul instalării, vă rugăm să consultați secțiunea de asistență sau să contactați echipa de dezvoltare.

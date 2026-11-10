# Gulliver's Travels — Academic Book Report & Satirical Analysis
### Great Books Project | BSIT 4A

> **Live Deployment / Project Repository:**  
> [https://github.com/Loloyd16/Group3-GBProject-BSIT4A](https://github.com/Loloyd16/Group3-GBProject-BSIT4A)  
> *(If hosted via GitHub Pages: `https://loloyd16.github.io/Group3-GBProject-BSIT4A/`)*

---

## 🏛️ Executive Summary

This academic web application serves as an in-depth literary analysis and digital presentation of **Jonathan Swift’s 1726 satirical masterpiece, *Gulliver’s Travels*** (*Travels into Several Remote Nations of the World*).

Created for the **Great Books** course in **BSIT 4A**, this project marries classical 18th-century editorial aesthetics with modern frontend engineering principles. Beyond a conventional book review, the platform deconstructs Swift's socio-political allegories, theological disputes, and psychological themes through interactive academic modules, procedural canvas graphics, and primary historical references.

---

## 👥 Research & Engineering Contributors

| Contributor | Course & Section | Primary Responsibilities |
|:---|:---:|:---|
| **John Lloyd Cuario** | BSIT 4A | **Project Lead & Systems Architecture**<br>Coordinated application architecture, nautical canvas engine integration, component lifecycle, and code reviews. |
| **Eljohn Paulo Loterte** | BSIT 4A | **Frontend Interaction & 3D Dynamics**<br>Engineered 3D card perspective transforms, dynamic specular glare tracking, smooth scroll dynamics, and responsive drawer navigation. |
| **Victor Noel Napay** | BSIT 4A | **Creative Art Director & UI/UX**<br>Curated 18th-century antique typography (Fraunces & Instrument Sans), brass palette design systems, historical engraving optics, and CSS token architecture. |
| **Sean Jerve Rebancos** | BSIT 4A | **Literary Analyst & Satire Researcher**<br>Authored historical allegorical decodings (Whigs, Tories, Robert Walpole, Royal Society), narrative breakdowns, and comparative voyage matrix. |
| **Kiel Hedrix Relos** | BSIT 4A | **QA, Accessibility & Documentation**<br>Conducted WCAG accessibility & ARIA audit, keyboard navigation testing, print stylesheet optimization (`@media print`), and project documentation. |

---

## 🧭 Key Academic Features & Interactive Modules

### 1. 1726 Nautical Cartography & Interactive Voyage Chart (`#cartography`)
- Interactive maritime route visualizer tracking Gulliver's four distinct voyages (1699–1715).
- Displays authentic coordinates, voyage durations, ship names (*Antelope*, *Adventure*, *Hopewell*, *Adventure*), historical quotes, and the catastrophic catalysts precipitating each arrival.

### 2. Gulliver’s 16-Year Psychological Descent Tracker (`#psychology`)
- An interactive Misanthropy Index (0% to 100%) tracking Lemuel Gulliver's moral and cognitive devolution across 5 critical milestones:
  - **1699:** *Naive Imperial Patriot* (0%)
  - **1703:** *Humiliated Pet & Relativistic Observer* (30%)
  - **1707:** *Intellectual Skeptic* (65%)
  - **1711:** *Devastated Yahoo Convert* (90%)
  - **1715+:** *Total Misanthropic Recluse* (100% — Stable recluse talking to horses)

### 3. The Scale of Man: Optical Inversion Simulator (`#scale-simulator`)
- An optical simulation illustrating Swift's geometric inversion:
  - **1:12 (Lilliput):** Gulliver as Colossus; exposing the petty absurdity of royal grandeur.
  - **1:1 (Normal Human):** Standard baseline.
  - **12:1 (Brobdingnag):** Gulliver as vermin; exposing the grotesque physicality and moral frailty of man.
- Real-time dimensional metrics recalculating height, volumetric mass ratio (1,728:1), and philosophical commentary.

### 4. Interactive 3D Character Portrait Cards (`#characters`)
- Perspective 3D hover tilt physics with dynamic light glare based on cursor coordinates.
- Voyage category filtering (Lilliput, Brobdingnag, Laputa, Houyhnhnmland).
- High-resolution modal Lightbox for archival engraving inspection.

### 5. Comparative Four-Voyage Analytical Matrix (`#matrix`)
- Comprehensive tabular synthesis comparing all four voyages across:
  - Physical Scale & Optics
  - Political & Governance Models
  - Key Satirical Targets (Whigs/Tories, Court Favoritism, Blind Scientism, Human Pride)
  - Gulliver's Evolving Psychological State

### 6. Interactive Satire Lab & 5-Question Comprehension Quiz (`#satire-lab`)
- **Swiftian Satire Engine:** Dynamic quote/aphorism generator drawing from *A Tale of a Tub*, *A Modest Proposal*, and *Gulliver's Travels*.
- **Comprehension Assessment:** 5 randomized multiple-choice questions evaluating allegorical comprehension, scoring, and awarding academic ranks (e.g., *Grand Master Houyhnhnm*, *Brobdingnagian Philosopher*).

### 7. Swiftian Lexicon & Coined Terms Glossary (`#glossary`)
- Searchable and filterable etymological glossary of Swift's invented terms, including *Yahoo*, *Houyhnhnm*, *Lilliputian*, *Brobdingnagian*, *Laputa*, *Big-Endian / Little-Endian*, *Flapper*, *Struldbrug*, and *Glumdalclitch*.

### 8. Academic Citations & Multi-Format Generator (`#bibliography`)
- One-click copy modal for standard academic citation formats:
  - **MLA 9**
  - **APA 7**
  - **Chicago 17**

---

## 🛠️ Technology Stack & Engineering Design

- **Markup & Semantics:** HTML5 with semantic hierarchy (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`), custom `data-*` attributes, and full ARIA accessibility tags.
- **Design & Styling:** Pure CSS3 without bloated external frameworks:
  - CSS Custom Properties (Theme tokens for *Parchment Standard*, *Midnight Deck*, and *Academic Print* modes).
  - High-performance 3D transforms (`rotateX`, `rotateY`, `perspective`).
  - `@media print` optimized layout for clean academic PDF generation.
- **Client-Side Scripting:** Vanilla JavaScript (ES6+):
  - Canvas 2D procedurally drawn dual-layer animated ocean waves, sailing vessel, horizon haze, and day/night transitions.
  - Pure Web Audio API procedural synthesis of ocean tide ambiance (no external MP3/audio files needed).
  - Zero heavy third-party dependencies (lightweight Lenis smooth-scroll integration).

---

## 🚀 How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Loloyd16/Group3-GBProject-BSIT4A.git
   cd Group3-GBProject-BSIT4A
   ```

2. **Run a local server (recommended for canvas & audio contexts):**
   - **Using Python:**
     ```bash
     python -m http.server 8000
     ```
   - **Using Node (npx):**
     ```bash
     npx serve .
     ```
   - Or open `index.html` directly in any modern web browser (Chrome, Edge, Firefox, Safari).

3. Access the application in your browser at `http://localhost:8000`.

---

## 📖 Recommended Academic Citation

```text
Cuario, John Lloyd, Eljohn Paulo Loterte, Victor Noel Napay, Sean Jerve Rebancos, and Kiel Hedrix Relos. 
"Gulliver’s Travels: An Academic Book Report & Satirical Analysis." 
BSIT 4A Great Books Presentation, 2026.
```

---

*Submitted in partial fulfillment of the requirements for Great Books (BSIT 4A).*


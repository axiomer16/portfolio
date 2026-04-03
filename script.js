// Parametre:
const userGithub = 'axiomer16'

// ===== PROJECTS DATA =====
const projects = [];

const WORKER_URL = 'https://portfolio-worker.raphael-very.workers.dev';

async function fetchGitHubProjects() {
  try {
    const response = await fetch(`${WORKER_URL}/repos`);

    
    if (!response.ok) throw new Error(`Erreur API : ${response.status}`);
    
    const repos = await response.json();

    // Vider le tableau projects et le remplir avec les repos GitHub
    projects.length = 0;

    const filteredRepos = repos.filter(repo => !repo.fork);

    // Récupérer les langages de chaque repo
    const reposWithLangs = await Promise.all(
      filteredRepos.map(async (repo) => {
        try {
          const langResponse = await fetch(repo.languages_url);
          const langData = await langResponse.json();
          repo.allLanguages = Object.keys(langData); // ex: ["Python", "CSS", "HTML"]
        } catch {
          repo.allLanguages = repo.language ? [repo.language] : [];
        }
        return repo;
      })
    );
    reposWithLangs.forEach(repo => {
        // Détecter la catégorie selon le langage
        const langToCategory = {
          'Python'     : 'python',
          'Jupyter Notebook' : 'data',
          'JavaScript' : 'web',
          'TypeScript' : 'web',
          'HTML'       : 'web',
          'CSS'        : 'web',
          'PHP'        : 'web',
          'Vue'        : 'web',
          'R'          : 'data',
          'SQL'        : 'data',
          'C++'        : 'C++',
        };
        const category = langToCategory[repo.language] || 'web';

        // Icône selon le langage
        const langToIcon = {
          'Python'          : '🐍',
          'JavaScript'      : '⚡',
          'TypeScript'      : '💙',
          'HTML'            : '🌐',
          'CSS'             : '🎨',
          'Jupyter Notebook': '📊',
          'PHP'             : '🐘',
          'Vue'             : '💚',
          'R'               : '📈',
          'Java'            : '☕',
          'C++'             : '⚙️',
          'Shell'           : '🖥️',
        };
        const icon = langToIcon[repo.language] || '💻';

        // Construire les badges de langages
        const langs = [...repo.allLanguages];
        if (repo.stargazers_count > 0) langs.push(`⭐ ${repo.stargazers_count}`);

        projects.push({
          title      : repo.name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          description: repo.description || 'Aucune description disponible.',
          icon       : icon,
          tag        : repo.language || 'Code',
          category   : category,
          langs      : langs,
          url        : repo.html_url,
        });
      });

    // Re-render avec les projets GitHub
    renderProjects();

  } catch (error) {
    console.error('Impossible de charger les projets GitHub :', error);

    // Afficher un message d'erreur dans la grille
    const grid = document.getElementById('projects-grid');
    grid.innerHTML = `
      <p style="color:var(--bleu-clair);text-align:center;grid-column:1/-1;padding:40px 0;">
        <i class="fas fa-exclamation-triangle"></i> 
        Impossible de charger les projets. 
        <br><br>
        <button onclick="fetchGitHubProjects()" class="btn-primary" style="font-size:0.85rem;padding:10px 24px;">
          Réessayer
        </button>
      </p>
    `;
  }
}



// ===== RENDER PROJECTS =====
function renderProjects(filter = "all") {
  const grid = document.getElementById("projects-grid");
  grid.innerHTML = "";
  const filtered = filter === "all" ? projects : projects.filter(p => p.category === filter);

  filtered.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "project-card reveal";
    card.style.transitionDelay = `${i * 0.08}s`;
    card.innerHTML = `
      <a href="${p.url}" target="_blank" class="project-link">
      <div class="project-card-header">
        <span class="project-icon">${p.icon}</span>
        <span class="project-tag">${p.tag}</span>
      </div>
      <h3>${p.title}</h3>
      <p>${p.description}</p>
      <div class="project-footer">
        <div class="project-langs">
          ${p.langs.map(l => `<span class="lang-badge">${l}</span>`).join("")}
        </div>
        
      </div>
      </a>
    `;
    grid.appendChild(card);
  });

  // Re-trigger reveal for new cards
  setTimeout(() => {
    document.querySelectorAll(".project-card.reveal").forEach(el => {
      el.classList.add("visible");
    });
  }, 50);
}

// ===== FILTER BUTTONS =====
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderProjects(btn.dataset.filter);
  });
});

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      // Animate skill bars
      const fills = entry.target.querySelectorAll(".fill[data-width]");
      fills.forEach(fill => {
        fill.style.width = fill.dataset.width;
      });
    }
  });
}, { threshold: 0.15 });

function observeAll() {
  document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));
}

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 50);
});

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById("hamburger");
const navLinks = document.querySelector(".nav-links");
hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});
document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});

// ===== CONTACT FORM =====
document.getElementById("contact-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = document.getElementById("form-msg");
  const btn = e.target.querySelector("button[type='submit']");
  
  // Récupérer les champs
  const name = e.target.querySelector('[name="name"]').value.trim();
  const email = e.target.querySelector('[name="email"]').value.trim();
  const subject = e.target.querySelector('[name="subject"]').value.trim();
  const message = e.target.querySelector('[name="message"]').value.trim();

  // Validation basique côté client
  if (!name || !email || !subject || !message) {
    msg.style.color = "#ff4444";
    msg.textContent = "⚠ Veuillez remplir tous les champs.";
    return;
  }

  // Désactiver le bouton pendant l'envoi
  btn.disabled = true;
  btn.textContent = "Envoi en cours...";
  msg.style.color = "var(--bleu-clair)";
  msg.textContent = "";

  try {
    const response = await fetch(`${WORKER_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, subject, message }),
    });

    const data = await response.json();

    if (response.ok) {
      msg.style.color = "#00ff88";
      msg.textContent = "✓ Message envoyé ! Je vous répondrai rapidement.";
      e.target.reset();
    } else {
      msg.style.color = "#ff4444";
      msg.textContent = `⚠ ${data.error || "Erreur lors de l'envoi."}`;
    }
  } catch (error) {
    msg.style.color = "#ff4444";
    msg.textContent = "⚠ Erreur réseau. Réessayez plus tard.";
  } finally {
    btn.disabled = false;
    btn.textContent = "Envoyer";
    setTimeout(() => (msg.textContent = ""), 7000);
  }
});


// ===== ADD REVEAL CLASS TO ELEMENTS =====
function addRevealClasses() {
  document.querySelectorAll(".about-text, .about-skills, .contact-info, .contact-form, .value-item").forEach(el => {
    el.classList.add("reveal");
  });
}


// ===== TRADUCTIONS =====
const translations = {
  // Nav
  'nav-home': { fr: 'Accueil', en: 'Home' },
  'nav-about': { fr: 'À propos', en: 'About' },
  'nav-projects': { fr: 'Projets', en: 'Projects' },
  'nav-contact': { fr: 'Contact', en: 'Contact' },
  'nav-cv': { fr: 'Mon CV', en: 'My CV' },

  // Hero
  'hero-tagline': { fr: 'Respect · Travail · Famille', en: 'Respect · Work · Family' },
  'hero-btn': { fr: 'Voir mes projets', en: 'See my projects' },

  // About
  'about-title': { fr: 'À propos', en: 'About' },
  'about-text-1': {
    fr: "Bonjour je suis développeur passionné par la technologie, les voitures et les motos. Je construis des solutions robustes et élégantes, avec un soin extrême que j'applique dans tout ce que j'entreprends.",
    en: "Hi, I'm a developer passionate about technology, cars and motorcycles. I build robust and elegant solutions, with extreme care that I apply in everything I do."
  },
  'about-quote': {
    fr: '« Appliquer à autrui ce qu\'on applique à soi-même. »',
    en: '« Apply to others what you apply to yourself. »'
  },
  'value-respect': { fr: 'Respect', en: 'Respect' },
  'value-work': { fr: 'Travail', en: 'Work' },
  'value-family': { fr: 'Famille', en: 'Family' },
  'skills-title': { fr: 'Compétences', en: 'Skills' },

  // Projects
  'projects-title': { fr: 'Mes Projets GitHub', en: 'My GitHub Projects' },
  'filter-all': { fr: 'Tous', en: 'All' },
  'github-cta': { fr: 'Voir tout sur GitHub', en: 'See all on GitHub' },
  'no-desc': { fr: 'Aucune description disponible.', en: 'No description available.' },

  // Contact
  'contact-title': { fr: 'Contact', en: 'Contact' },
  'contact-text': {
    fr: "Vous avez un projet de développement ? Je suis l'homme de la situation.",
    en: "Have a development project? I'm the right person for it."
  },
  'form-name': { fr: 'Votre nom', en: 'Your name' },
  'form-email': { fr: 'Votre email', en: 'Your email' },
  'form-subject': { fr: 'Sujet', en: 'Subject' },
  'form-message': { fr: 'Votre message', en: 'Your message' },
  'form-send': { fr: 'Envoyer', en: 'Send' },
  'form-success': {
    fr: '✓ Message envoyé ! Je vous répondrai rapidement.',
    en: '✓ Message sent! I will reply shortly.'
  },
  'form-error': {
    fr: "⚠ Erreur lors de l'envoi.",
    en: '⚠ Error while sending.'
  },
  'form-network-error': {
    fr: '⚠ Erreur réseau. Réessayez plus tard.',
    en: '⚠ Network error. Try again later.'
  },

  // Footer
  'footer-text': { fr: 'Fait avec passion', en: 'Made with passion' },

  // Scroll top
  'scroll-top': { fr: 'Haut de page', en: 'Back to top' },
};

// ===== FONCTION TRADUCTION =====
let currentLang = 'fr';

function t(key) {
  return translations[key]?.[currentLang] || key;
}

function applyTranslations() {
  // Tous les éléments avec data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });

  // Placeholders avec data-i18n-ph
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPh);
  });

  // Titre de la page
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });

  // Lien CV
  const cvLink = document.getElementById('cv-download');
  if (cvLink) {
    cvLink.href = currentLang === 'fr' ? 'Cv.pdf' : 'CvAnglais.pdf';
  }
}

// ===== BOUTON LANGUE =====
const langBtn = document.getElementById('langToggle');

langBtn.addEventListener('click', () => {
  currentLang = currentLang === 'fr' ? 'en' : 'fr';
  langBtn.textContent = currentLang === 'fr' ? 'EN' : 'FR';
  applyTranslations();
  renderProjects(); // re-render les cartes avec la bonne langue
});


// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  addRevealClasses();
  fetchGitHubProjects();
  observeAll();
});
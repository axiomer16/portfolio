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
document.getElementById("contact-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = document.getElementById("form-msg");
  msg.textContent = "✓ Message envoyé ! Je vous répondrai rapidement.";
  e.target.reset();
  setTimeout(() => msg.textContent = "", 5000);
});

// ===== ADD REVEAL CLASS TO ELEMENTS =====
function addRevealClasses() {
  document.querySelectorAll(".about-text, .about-skills, .contact-info, .contact-form, .value-item").forEach(el => {
    el.classList.add("reveal");
  });
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  addRevealClasses();
  fetchGitHubProjects();
  observeAll();
});
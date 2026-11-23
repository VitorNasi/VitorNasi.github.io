const header = document.querySelector('.header');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const backToTop = document.querySelector('.back-to-top');
const resumeLink = document.querySelector('#resume-link');
const toast = document.querySelector('.toast');

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove('visible'), 3200);
}

navToggle.addEventListener('click', () => {
  const open = navToggle.classList.toggle('open');
  navMenu.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navMenu.classList.contains('open')) {
    navToggle.classList.remove('open');
    navMenu.classList.remove('open');
    document.body.classList.remove('menu-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menu');
    navToggle.focus();
  }
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navMenu.classList.remove('open');
    document.body.classList.remove('menu-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('visible'));
}

const sections = document.querySelectorAll('main section[id]');

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'page');
          else link.removeAttribute('aria-current');
        });
      }
    });
  }, { rootMargin: '-35% 0px -55%', threshold: 0 });
  sections.forEach((section) => sectionObserver.observe(section));
}

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 24);
  backToTop.classList.toggle('visible', window.scrollY > 500);
}, { passive: true });

backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

document.querySelectorAll('.placeholder-link').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    showToast(`O perfil do ${link.dataset.platform} ainda não foi informado.`);
  });
});

resumeLink.addEventListener('click', async (event) => {
  event.preventDefault();
  try {
    const response = await fetch(resumeLink.href, { method: 'HEAD' });
    if (!response.ok) throw new Error('Currículo não encontrado');
    window.location.href = resumeLink.href;
  } catch (_) {
    showToast('Adicione o arquivo assets/curriculo.pdf para habilitar o download.');
  }
});

document.querySelector('#current-year').textContent = new Date().getFullYear();

// Partículas leves e adaptadas à preferência de movimento do usuário.
const canvas = document.querySelector('#particle-canvas');
const context = canvas?.getContext('2d');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let particles = [];

if (context) {
  function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function createParticles() {
    const amount = window.innerWidth < 700 ? 18 : 38;
    particles = Array.from({ length: amount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - .5) * .12,
      vy: (Math.random() - .5) * .12,
      radius: Math.random() * 1.2 + .3,
    }));
  }

  function drawParticles() {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      if (particle.x < 0 || particle.x > window.innerWidth) particle.vx *= -1;
      if (particle.y < 0 || particle.y > window.innerHeight) particle.vy *= -1;

      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = 'rgba(139, 92, 246, .35)';
      context.fill();

      for (let next = index + 1; next < particles.length; next++) {
        const other = particles[next];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 110) {
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(other.x, other.y);
          context.strokeStyle = `rgba(59, 130, 246, ${.08 * (1 - distance / 110)})`;
          context.lineWidth = .5;
          context.stroke();
        }
      }
    });
    if (!reduceMotion) requestAnimationFrame(drawParticles);
  }

  resizeCanvas();
  createParticles();
  drawParticles();
  window.addEventListener('resize', () => {
    resizeCanvas();
    createParticles();
    if (reduceMotion) drawParticles();
  });
}

const profilePhoto = document.querySelector('#profile-photo');
const profilePlaceholder = document.querySelector('.profile-placeholder');

if (profilePhoto && profilePlaceholder) {
  const candidates = [
    'assets/foto-perfil.webp',
    'assets/foto-perfil.png',
    'assets/foto-perfil.jpg',
    'assets/foto-perfil.jpeg'
  ];

  const showProfilePhoto = (source) => {
    profilePhoto.src = source;
  };

  const loadNextCandidate = (index = 0) => {
    if (index >= candidates.length) {
      profilePhoto.style.display = 'none';
      profilePlaceholder.style.display = 'flex';
      return;
    }

    const candidate = candidates[index];
    const tester = new Image();

    tester.onload = () => {
      showProfilePhoto(candidate);
      profilePhoto.style.display = 'block';
      profilePlaceholder.style.display = 'none';
    };

    tester.onerror = () => loadNextCandidate(index + 1);
    tester.src = candidate;
  };

  loadNextCandidate();
}

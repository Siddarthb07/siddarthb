/* ===========================
   PORTFOLIO — INTERACTIVITY
   =========================== */

document.addEventListener('DOMContentLoaded', () => {

  // =============================
  // BACKGROUND PARTICLE ANIMATION
  // =============================
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: null, y: null };
  let animationId;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Track mouse for interaction
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 1; // Slightly larger particles
      this.speedX = (Math.random() - 0.5) * 0.8; // Faster base movement
      this.speedY = (Math.random() - 0.5) * 0.8;
      this.opacity = Math.random() * 0.6 + 0.2; // Higher base opacity
      this.color = Math.random() > 0.6 ? '0, 212, 255' : '123, 97, 255';
      
      // Give each particle a unique "wobble" parameter
      this.angle = Math.random() * Math.PI * 2;
      this.velocity = Math.random() * 0.05 + 0.01;
    }

    update() {
      // Add slight orbital/wobble movement
      this.angle += this.velocity;
      this.x += this.speedX + Math.cos(this.angle) * 0.3;
      this.y += this.speedY + Math.sin(this.angle) * 0.3;

      // Mouse interaction (stronger and larger radius)
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Repel from mouse strongly
        if (dist < 200) {
          const force = (200 - dist) / 200;
          this.x += (dx / dist) * force * 3; // Increased force multiplier
          this.y += (dy / dist) * force * 3;
          
          // Particles brighten near mouse
          this.drawOpacity = Math.min(this.opacity + (force * 1.5), 1);
        } else {
          this.drawOpacity = this.opacity;
        }
      } else {
         this.drawOpacity = this.opacity;
      }

      // Wrap around edges smoothly
      if (this.x < -20) this.x = canvas.width + 20;
      if (this.x > canvas.width + 20) this.x = -20;
      if (this.y < -20) this.y = canvas.height + 20;
      if (this.y > canvas.height + 20) this.y = -20;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.drawOpacity || this.opacity})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = `rgba(${this.color}, 0.8)`;
      ctx.fill();
    }
  }

  // Create particles (more dense)
  function initParticles() {
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 9000), 200); // More particles
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Increased connection distance and visibility
        if (dist < 180) {
          const opacity = (1 - dist / 180) * 0.25; // More visible lines
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    connectParticles();
    animationId = requestAnimationFrame(animateParticles);
  }

  initParticles();
  animateParticles();

  // Re-init on resize
  window.addEventListener('resize', () => {
    initParticles();
  });

  // =============================
  // SCROLL REVEAL
  // =============================
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  // =============================
  // NAVBAR
  // =============================
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Mobile hamburger
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  // Active section highlight
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = navLinks.querySelectorAll('a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 100;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });
    navAnchors.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  });

  // =============================
  // PIPELINE ANIMATION
  // =============================
  const pipelines = document.querySelectorAll('[data-pipeline]');
  const pipelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const nodes = entry.target.querySelectorAll('.pipeline-node');
        const arrows = entry.target.querySelectorAll('.pipeline-arrow');
        nodes.forEach((node, i) => {
          setTimeout(() => {
            node.classList.add('lit');
            if (arrows[i]) arrows[i].classList.add('lit');
          }, i * 300);
        });
        pipelineObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  pipelines.forEach(p => pipelineObserver.observe(p));

  // =============================
  // SVG CHART DRAW
  // =============================
  const charts = document.querySelectorAll('[data-chart]');
  const chartObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('drawn');
        chartObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  charts.forEach(c => chartObserver.observe(c));

  // =============================
  // AUDIT PANEL LINE REVEAL
  // =============================
  const auditPanels = document.querySelectorAll('[data-audit]');
  const auditObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const lines = entry.target.querySelectorAll('.audit-line');
        lines.forEach((line, i) => {
          setTimeout(() => line.classList.add('show'), i * 400);
        });
        auditObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  auditPanels.forEach(p => auditObserver.observe(p));

  // =============================
  // RISK GAUGE ANIMATION
  // =============================
  const gauges = document.querySelectorAll('[data-gauge]');
  const gaugeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const circle = entry.target.querySelector('.gauge-circle');
        if (circle) circle.classList.add('animated');
        gaugeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  gauges.forEach(g => gaugeObserver.observe(g));

  // =============================
  // FEATURE BAR ANIMATION
  // =============================
  const barContainers = document.querySelectorAll('[data-bars]');
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fills = entry.target.querySelectorAll('.feature-bar-fill');
        fills.forEach((fill, i) => {
          setTimeout(() => {
            fill.style.width = fill.getAttribute('data-width') + '%';
            fill.classList.add('animated');
          }, i * 200);
        });
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  barContainers.forEach(b => barObserver.observe(b));

  // =============================
  // CARD HOVER GLOW EFFECT
  // =============================
  const cards = document.querySelectorAll('.glass-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

});

// ==========================================================================
// WEBNEST - KINETIC ANIMATION ORCHESTRATION (SMOOTH & JUMP ENGINE)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lenis (Butter-Smooth, Snappy & Lightweight Physics)
  let lenis;
  try {
    lenis = new Lenis({
      lerp: 0.12,              // Snappy, responsive, zero sluggish dragging
      wheelMultiplier: 1.0,    // Natural 1:1 scroll velocity
      touchMultiplier: 1.0,    // 1:1 mobile touch physics
      smoothWheel: true,
      syncTouch: false,        // Let touch devices use hardware-accelerated 120Hz native scrolling
      infinite: false
    });

    window.lenisInstance = lenis;

    // Sync Lenis scroll updates with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Keep Lenis ticking on GSAP's high-precision ticker
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    // Gracefully interpolate dropped frames instead of stuttering
    gsap.ticker.lagSmoothing(500, 33);
  } catch (err) {
    console.warn('Lenis initialization warning:', err);
  }

  // Register GSAP plugins
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Smooth anchor link click handling via Lenis
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId && targetId !== '#') {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          if (lenis) {
            lenis.scrollTo(target, { offset: -90, duration: 0.9 });
          } else {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  });

  // Dynamic Navbar Scroll & Theme Controller (Throttled with requestAnimationFrame)
  const nav = document.querySelector('.top-nav');
  const theater = document.getElementById('theater-wrapper');
  let tickingNav = false;
  function updateNavTheme() {
    if (!nav) return;
    const scrollY = window.scrollY;
    if (scrollY > 30) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }

    if (theater) {
      const theaterRect = theater.getBoundingClientRect();
      if (theaterRect.top <= 75 && theaterRect.bottom >= 75) {
        nav.classList.add('nav-dark');
      } else {
        nav.classList.remove('nav-dark');
      }
    }
    tickingNav = false;
  }
  window.addEventListener('scroll', () => {
    if (!tickingNav) {
      tickingNav = true;
      requestAnimationFrame(updateNavTheme);
    }
  }, { passive: true });
  updateNavTheme();

  // Re-calculate triggers on complete page asset load
  window.addEventListener('load', () => {
    updateNavTheme();
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  });

  // Initialize Modules
  initJumpingHero();
  initServicesAnimations();
  initSmoothHorizontalTrack();
  initElasticContextInterlude();
  initJumpingStatsAndQuotes();
  initNewSectionsAnimations();
  initKineticContact();
  initPremiumMotion();
  initSlidingMarquee();
  initAndroidPwa();
});

// Helper: Android & Mobile Haptic Vibration
function triggerHaptic(duration = 8) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch (e) {}
  }
}

/* -------------------------------------------------------------
 * 2. Hero Section: Word Jumping & Rubberband Pill
 * ----------------------------------------------------------- */
function initJumpingHero() {
  const pill = document.getElementById('hero-pill');

  // Top Status Pill - immediate crisp entrance
  gsap.fromTo('.hero-status-pill',
    { y: -15, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.7)', delay: 0.1 }
  );

  // Staggered Rubberband Jump on Page Load for headline words
  gsap.from('.jump-word', {
    y: 40,
    scale: 0.95,
    opacity: 0,
    duration: 1.0,
    stagger: 0.08,
    ease: 'back.out(2)',
    delay: 0.15
  });

  // Hero Subtext, CTAs and Meta items
  gsap.fromTo('.hero-stage .jump-item:not(.hero-status-pill)',
    { y: 25, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power2.out', delay: 0.25 }
  );

  // Dynamic Pill Interactive Spring & Jump
  if (pill) {
    pill.addEventListener('mouseenter', () => {
      gsap.to(pill, {
        y: -6,
        scale: 1.05,
        duration: 0.3,
        ease: 'back.out(3)'
      });
    });

    pill.addEventListener('mouseleave', () => {
      gsap.to(pill, {
        y: 0,
        scale: 1,
        duration: 0.35,
        ease: 'power2.out'
      });
    });

    pill.addEventListener('click', () => {
      // Playful rubberband jump before scrolling down
      gsap.timeline()
        .to(pill, { scaleX: 1.15, scaleY: 0.85, duration: 0.1 })
        .to(pill, { scaleX: 0.9, scaleY: 1.15, y: -12, duration: 0.22, ease: 'back.out(3)' })
        .to(pill, { scale: 1, y: 0, duration: 0.28, ease: 'elastic.out(1.2, 0.4)' });

      setTimeout(() => {
        const targetSection = document.getElementById('projects') || document.getElementById('services');
        if (targetSection) {
          if (window.lenisInstance) {
            window.lenisInstance.scrollTo(targetSection, { offset: -60, duration: 1.2 });
          } else {
            targetSection.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }, 250);
    });
  }
}

/* -------------------------------------------------------------
 * 2.5 Services Grid Entrance Animation
 * ----------------------------------------------------------- */
function initServicesAnimations() {
  gsap.fromTo('.service-box-card',
    { opacity: 0, y: 35 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#services',
        start: 'top 85%',
        once: true
      }
    }
  );
}

/* -------------------------------------------------------------
 * 3. Smooth Anti-Jitter Horizontal Track & Parallax
 * ----------------------------------------------------------- */
function initSmoothHorizontalTrack() {
  const track = document.getElementById('horizontal-track');
  const stage = document.getElementById('projects') || document.getElementById('horizontal-stage');
  const hudFill = document.getElementById('hud-fill');
  const slideNum = document.getElementById('slide-num');
  const prevBtn = document.getElementById('btn-project-prev');
  const nextBtn = document.getElementById('btn-project-next');

  if (!track || !stage) return;

  const slides = track.querySelectorAll('.project-slide');
  const totalSlides = slides.length || 4;

  // Function to update HUD indicators on scroll
  function updateHudOnScroll() {
    const scrollLeft = track.scrollLeft;
    const maxScroll = track.scrollWidth - track.clientWidth;
    const progress = maxScroll > 0 ? scrollLeft / maxScroll : 0;

    if (hudFill) {
      hudFill.style.width = `${Math.max(15, progress * 100)}%`;
    }
    if (slideNum && slides.length > 0) {
      const slideWidth = slides[0].offsetWidth + 32;
      const currentIndex = Math.min(totalSlides, Math.max(1, Math.round(scrollLeft / slideWidth) + 1));
      slideNum.textContent = `0${currentIndex} / 0${totalSlides}`;
    }
  }

  // Arrow navigation for mobile and tablet
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      triggerHaptic(10);
      const slideWidth = slides[0] ? (slides[0].offsetWidth + 24) : 340;
      track.scrollBy({ left: -slideWidth, behavior: 'smooth' });
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      triggerHaptic(10);
      const slideWidth = slides[0] ? (slides[0].offsetWidth + 24) : 340;
      track.scrollBy({ left: slideWidth, behavior: 'smooth' });
    });
  }

  // Mobile / tablet: allow natural horizontal scroll with real-time HUD synchronization
  const isTouchOrTablet = window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 1024;
  if (isTouchOrTablet) {
    track.style.width = '100%';
    track.style.maxWidth = '100vw';
    track.style.display = 'flex';
    track.style.flexWrap = 'nowrap';
    track.style.overflowX = 'auto';
    track.style.scrollSnapType = 'x mandatory';
    track.addEventListener('scroll', updateHudOnScroll, { passive: true });
    updateHudOnScroll();
    return;
  }

  function getScrollDistance() {
    return -(track.scrollWidth - window.innerWidth + 80);
  }

  // Desktop Pinning with GSAP
  gsap.to(track, {
    x: getScrollDistance,
    ease: 'none',
    scrollTrigger: {
      trigger: stage,
      start: 'top top',
      end: () => `+=${track.scrollWidth - window.innerWidth}`,
      pin: true,
      anticipatePin: 1,
      scrub: 0.25,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const progress = Math.min(1, Math.max(0, self.progress));
        if (hudFill) {
          hudFill.style.width = `${Math.max(15, progress * 100)}%`;
        }
        if (slideNum) {
          const current = Math.min(totalSlides, Math.floor(progress * totalSlides) + 1);
          slideNum.textContent = `0${current} / 0${totalSlides}`;
        }
      }
    }
  });

  // Guard 3D tilt: ONLY execute on fine mouse pointers (prevent touch scroll lag)
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const projectCards = document.querySelectorAll('.project-image-frame');
    projectCards.forEach((card) => {
      let ticking = false;
      card.addEventListener('mousemove', (e) => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          gsap.to(card, {
            rotateY: x * 0.03,
            rotateX: -y * 0.03,
            y: -8,
            scale: 1.02,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: 'auto',
            transformPerspective: 900
          });
          ticking = false;
        });
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateY: 0,
          rotateX: 0,
          y: 0,
          scale: 1,
          duration: 0.35,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });
    });
  }
}

/* -------------------------------------------------------------
 * 4. "Real Context." Elastic Jump Reveal (Frame 10)
 * ----------------------------------------------------------- */
function initElasticContextInterlude() {
  const section = document.getElementById('context');
  if (!section) return;

  const realWord = document.querySelector('.context-real');
  const boldWord = document.querySelector('.context-bold');

  gsap.fromTo([realWord, boldWord],
    { scale: 0.75, y: 80, opacity: 0 },
    {
      scale: 1,
      y: 0,
      opacity: 1,
      duration: 1.2,
      stagger: 0.18,
      ease: 'back.out(2)',
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        once: true
      }
    }
  );
}

/* -------------------------------------------------------------
 * 5. Jumping Stats & Quote Animators
 * ----------------------------------------------------------- */
function initJumpingStatsAndQuotes() {
  // Dark metrics row entrance jump
  gsap.fromTo('.dark-metric-row',
    { y: 60, scale: 0.9, opacity: 0 },
    {
      y: 0,
      scale: 1,
      opacity: 1,
      duration: 0.9,
      stagger: 0.12,
      ease: 'back.out(1.8)',
      scrollTrigger: {
        trigger: '#dark-metrics',
        start: 'top 80%',
        once: true
      }
    }
  );

  // Mission quote statement entrance
  gsap.fromTo('.quote-statement',
    { scale: 0.94, y: 40, opacity: 0 },
    {
      scale: 1,
      y: 0,
      opacity: 1,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.mission-quote-section',
        start: 'top 80%',
        once: true
      }
    }
  );
}

/* -------------------------------------------------------------
 * 6. Kinetic Grand CONTACT Jump & Ghost Spring
 * ----------------------------------------------------------- */
function initKineticContact() {
  const contactSection = document.getElementById('contact');
  if (!contactSection) return;

  const mainText = document.querySelector('.contact-main-text');
  const ghost1 = document.querySelector('.ghost-layer-1');
  const ghost2 = document.querySelector('.ghost-layer-2');

  // Jumping entrance without pushing text down into bento grid
  if (mainText) {
    gsap.fromTo(mainText,
      { y: 35, scale: 0.92, opacity: 0 },
      {
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: contactSection,
          start: 'top 80%',
          once: true
        }
      }
    );
  }

  // Interactive 3D mouse parallax on CONTACT ghost layers
  contactSection.addEventListener('mousemove', (e) => {
    const rect = contactSection.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width - 0.5;
    const yRatio = (e.clientY - rect.top) / rect.height - 0.5;

    if (ghost1) {
      gsap.to(ghost1, {
        x: 16 + xRatio * 25,
        y: -10 + yRatio * 15,
        duration: 0.35,
        ease: 'power2.out'
      });
    }
    if (ghost2) {
      gsap.to(ghost2, {
        x: 32 + xRatio * 45,
        y: -20 + yRatio * 30,
        duration: 0.45,
        ease: 'power2.out'
      });
    }
  });

  // Clickable social link magnetic hover jump
  const contactLinks = document.querySelectorAll('.contact-big-link');
  contactLinks.forEach((link) => {
    link.addEventListener('mouseenter', () => {
      gsap.to(link, { x: 14, scale: 1.03, duration: 0.25, ease: 'back.out(3)' });
    });
    link.addEventListener('mouseleave', () => {
      gsap.to(link, { x: 0, scale: 1, duration: 0.3, ease: 'power2.out' });
    });
  });
}

/* -------------------------------------------------------------
 * 7. Animations for Why Choose Us, Process, Team, & Consultation
 * ----------------------------------------------------------- */
function initNewSectionsAnimations() {
  // Why Choose WEBNEST (Pillar Cards)
  gsap.fromTo('.pillar-card',
    { opacity: 0, y: 35 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#why-us',
        start: 'top 85%',
        once: true
      }
    }
  );

  // Our 5-Step Process
  gsap.fromTo('.process-card',
    { opacity: 0, y: 35 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#process',
        start: 'top 85%',
        once: true
      }
    }
  );

  // Meet the Team
  gsap.fromTo('.team-card',
    { opacity: 0, y: 35 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#team',
        start: 'top 85%',
        once: true
      }
    }
  );

}

/* -------------------------------------------------------------
 * 8. Premium motion: magnetic buttons, stack, mobile nav, spotlight
 * ----------------------------------------------------------- */
function initPremiumMotion() {
  initMagnetic();
  initStackReveal();
  initMobileNav();
  initAuroraFollow();
  initSpotlightTracking();
  initStackFilters();
  initTerminalInteraction();
  initViewModeToggle();
  initDecisionMatrixAnimation();
  initJumpingPillsInteraction();
}

function initMagnetic() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const magnets = document.querySelectorAll('[data-magnetic]');
  magnets.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, { x: x * 0.28, y: y * 0.28, duration: 0.35, ease: 'power3.out', overwrite: 'auto' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.55, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
    });
  });
}

function initSpotlightTracking() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const cards = document.querySelectorAll('.spotlight-card');
  cards.forEach((card) => {
    let ticking = false;
    card.addEventListener('mousemove', (e) => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
        ticking = false;
      });
    }, { passive: true });
  });
}

function initStackFilters() {
  const filterBtns = document.querySelectorAll('.stack-filter-btn');
  const stackCards = document.querySelectorAll('.stack-card');
  const specRows = document.querySelectorAll('.tech-spec-table tbody tr');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      triggerHaptic(8);
      const filter = btn.getAttribute('data-filter');

      // Update active state
      filterBtns.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      // Filter cards
      const matchingCards = [];
      stackCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          matchingCards.push(card);
        } else {
          card.style.display = 'none';
        }
      });

      // Filter table rows
      const matchingRows = [];
      specRows.forEach((row) => {
        const category = row.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          row.style.display = '';
          matchingRows.push(row);
        } else {
          row.style.display = 'none';
        }
      });

      if (typeof gsap !== 'undefined') {
        if (matchingCards.length > 0) {
          gsap.fromTo(matchingCards,
            { scale: 0.88, opacity: 0, y: 22 },
            { scale: 1, opacity: 1, y: 0, duration: 0.45, stagger: 0.04, ease: 'back.out(2)' }
          );
        }
        if (matchingRows.length > 0) {
          gsap.fromTo(matchingRows,
            { opacity: 0, x: -10 },
            { opacity: 1, x: 0, duration: 0.35, stagger: 0.03, ease: 'power2.out' }
          );
        }
      }
    });
  });
}

function initViewModeToggle() {
  const btnGrid = document.getElementById('btn-view-grid');
  const btnTable = document.getElementById('btn-view-table');
  const gridView = document.getElementById('stack-grid');
  const tableView = document.getElementById('stack-table-view');

  if (!btnGrid || !btnTable || !gridView || !tableView) return;

  btnGrid.addEventListener('click', () => {
    triggerHaptic(8);
    btnGrid.classList.add('is-active');
    btnTable.classList.remove('is-active');
    tableView.classList.remove('is-visible');
    gridView.style.display = 'grid';
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(gridView, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
    }
  });

  btnTable.addEventListener('click', () => {
    triggerHaptic(8);
    btnTable.classList.add('is-active');
    btnGrid.classList.remove('is-active');
    gridView.style.display = 'none';
    tableView.classList.add('is-visible');
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(tableView, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
    }
  });
}

function initDecisionMatrixAnimation() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  const rows = document.querySelectorAll('.enterprise-spec-table tbody tr');
  if (!rows.length) return;

  gsap.fromTo(rows,
    { opacity: 0, y: 25 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#matrix',
        start: 'top 80%',
        once: true
      }
    }
  );
}

function initJumpingPillsInteraction() {
  const pills = document.querySelectorAll('.floating-tech-pill');
  if (typeof gsap === 'undefined') return;

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      triggerHaptic(10);
      gsap.timeline()
        .to(pill, { scale: 0.85, duration: 0.1 })
        .to(pill, { scale: 1.25, y: -18, duration: 0.22, ease: 'back.out(3)' })
        .to(pill, { scale: 1, y: 0, duration: 0.35, ease: 'elastic.out(1.2, 0.4)' });
    });
  });
}

function initTerminalInteraction() {
  const tabs = document.querySelectorAll('.t-tab');
  const panes = document.querySelectorAll('.code-pane');
  const copyBtn = document.getElementById('terminal-copy-btn');
  const copyText = document.getElementById('copy-text');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      triggerHaptic(8);
      const file = tab.getAttribute('data-file');

      tabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');

      panes.forEach((pane) => {
        pane.classList.remove('is-active');
        if (pane.id === `pane-${file}`) {
          pane.classList.add('is-active');
        }
      });
    });
  });

  if (copyBtn && copyText) {
    copyBtn.addEventListener('click', async () => {
      triggerHaptic(12);
      const activePane = document.querySelector('.code-pane.is-active code');
      if (activePane) {
        try {
          await navigator.clipboard.writeText(activePane.innerText);
          const originalText = copyText.textContent;
          copyText.textContent = 'Copied! ✓';
          gsap.fromTo(copyBtn, { scale: 0.9 }, { scale: 1.05, duration: 0.2, yoyo: true, repeat: 1 });
          setTimeout(() => {
            copyText.textContent = originalText;
          }, 2200);
        } catch (err) {
          console.warn('Clipboard write error:', err);
        }
      }
    });
  }
}

function initStackReveal() {
  gsap.fromTo('.stack-lane',
    { opacity: 0, y: 40, rotateX: 8 },
    {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: 0.85,
      stagger: 0.12,
      ease: 'back.out(1.6)',
      scrollTrigger: { trigger: '#stack', start: 'top 80%', once: true }
    }
  );

  gsap.fromTo('.stack-card',
    { opacity: 0, y: 28, scale: 0.96 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.7,
      stagger: 0.05,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.stack-grid', start: 'top 85%', once: true }
    }
  );

  gsap.fromTo('.telemetry-block',
    { opacity: 0, y: 35, scale: 0.95 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      stagger: 0.1,
      ease: 'back.out(1.8)',
      scrollTrigger: { trigger: '.telemetry-hud-strip', start: 'top 85%', once: true }
    }
  );
}

function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const closeBtn = document.getElementById('drawer-close');
  if (!toggle || !drawer) return;

  const openDrawer = () => {
    triggerHaptic(10);
    drawer.hidden = false;
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    triggerHaptic(6);
    drawer.hidden = true;
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    if (drawer.hidden) {
      openDrawer();
    } else {
      closeDrawer();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeDrawer);
  }

  // Close when tapping drawer background directly
  drawer.addEventListener('click', (e) => {
    if (e.target === drawer) {
      closeDrawer();
    }
  });

  drawer.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeDrawer);
  });

  // ESC key dismiss
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !drawer.hidden) {
      closeDrawer();
    }
  });
}

function initAuroraFollow() {
  const field = document.querySelector('.aurora-field');
  if (!field) return;
  let ticking = false;
  window.addEventListener('pointermove', (e) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      gsap.to(field, { x, y, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
      ticking = false;
    });
  }, { passive: true });
}

function initSlidingMarquee() {
  const marquee = document.getElementById('sliding-marquee');
  const track = marquee?.querySelector('.sliding-text-track');
  if (!marquee || !track) return;

  // Add cursor interaction attributes
  marquee.querySelectorAll('.sliding-text-item').forEach((item) => {
    item.setAttribute('data-cursor', 'link');
  });

  // Dynamic velocity response with Lenis scroll engine
  if (window.lenisInstance) {
    let resetTimer = null;
    window.lenisInstance.on('scroll', (e) => {
      const v = Math.abs(e.velocity || 0);
      if (v > 0.4) {
        const boost = Math.min(3.2, 1 + v * 0.22);
        track.style.animationDuration = `${(32 / boost).toFixed(2)}s`;
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          track.style.animationDuration = '32s';
        }, 300);
      }
    });
  }
}

/* -------------------------------------------------------------
 * 9. Android PWA Engine & Install Prompt System
 * ----------------------------------------------------------- */
function initAndroidPwa() {
  // 1. Register Service Worker for offline shell and speed
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        console.log('WEBNest ServiceWorker active on scope:', reg.scope);
      }).catch((err) => {
        console.warn('WEBNest ServiceWorker registration notice:', err);
      });
    });
  }

  // 2. Offline / Online notification toast
  const offlineToast = document.getElementById('offline-toast');
  function updateOnlineStatus() {
    if (!offlineToast) return;
    if (!navigator.onLine) {
      offlineToast.hidden = false;
    } else {
      offlineToast.hidden = true;
    }
  }
  window.addEventListener('offline', updateOnlineStatus);
  window.addEventListener('online', updateOnlineStatus);
  updateOnlineStatus();

  // 3. Android PWA Install Event Handler
  let deferredPrompt = null;
  const navInstallBtn = document.getElementById('nav-pwa-install-btn');
  const drawerInstallBtn = document.getElementById('drawer-pwa-install');
  const installBanner = document.getElementById('android-install-banner');
  const confirmBtn = document.getElementById('btn-install-confirm');
  const dismissBtn = document.getElementById('btn-install-dismiss');

  // Check if running in standalone Android mode
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                       window.navigator.standalone ||
                       document.referrer.includes('android-app://');

  if (isStandalone) {
    const statusChip = document.querySelector('.drawer-status-chip');
    if (statusChip) statusChip.textContent = 'STANDALONE ANDROID APP ACTIVE';
    if (drawerInstallBtn) drawerInstallBtn.style.display = 'none';
    if (navInstallBtn) navInstallBtn.hidden = true;
    return;
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // Reveal install buttons in navigation and drawer
    if (navInstallBtn) navInstallBtn.hidden = false;
    if (drawerInstallBtn) drawerInstallBtn.style.display = 'flex';

    // Show Android floating install banner after brief reading delay
    setTimeout(() => {
      const dismissed = sessionStorage.getItem('webnest_pwa_dismissed');
      if (!dismissed && installBanner) {
        installBanner.hidden = false;
      }
    }, 4000);
  });

  async function triggerInstallFlow() {
    triggerHaptic(15);
    if (!deferredPrompt) {
      alert('To install WEBNest on your Android device:\n1. Open your browser options menu (⋮)\n2. Tap "Install App" or "Add to Home screen".');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User installed WEBNest Android App!');
      if (installBanner) installBanner.hidden = true;
      if (navInstallBtn) navInstallBtn.hidden = true;
      if (drawerInstallBtn) drawerInstallBtn.style.display = 'none';
    }
    deferredPrompt = null;
  }

  if (navInstallBtn) {
    navInstallBtn.addEventListener('click', triggerInstallFlow);
  }
  if (drawerInstallBtn) {
    drawerInstallBtn.addEventListener('click', triggerInstallFlow);
  }
  if (confirmBtn) {
    confirmBtn.addEventListener('click', triggerInstallFlow);
  }
  if (dismissBtn && installBanner) {
    dismissBtn.addEventListener('click', () => {
      triggerHaptic(6);
      installBanner.hidden = true;
      sessionStorage.setItem('webnest_pwa_dismissed', 'true');
    });
  }

  window.addEventListener('appinstalled', () => {
    console.log('WEBNest PWA was installed successfully.');
    if (installBanner) installBanner.hidden = true;
    if (navInstallBtn) navInstallBtn.hidden = true;
    if (drawerInstallBtn) drawerInstallBtn.style.display = 'none';
  });
}



/**
 * ==============================================================================
 * CLOÉ CARON - GSAP 3 ANIMATION & SCROLLSMOOTHER ENGINE
 * Smooth momentum scroll (like prolibu.com & gsap.com) + scroll-driven reveals
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. Mobile Menu Toggle
  // --------------------------------------------------------------------------
  const menuToggle = document.getElementById('menu-toggle');
  const siteNav = document.getElementById('site-nav');
  const navBackdrop = document.getElementById('site-nav-backdrop');

  const closeMenu = () => {
    if (!menuToggle || !siteNav) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.classList.remove('is-active');
    siteNav.classList.remove('is-open');
    if (navBackdrop) navBackdrop.classList.remove('is-active');
    document.body.classList.remove('nav-locked');
  };

  if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      const willOpen = !isExpanded;
      menuToggle.setAttribute('aria-expanded', willOpen);
      menuToggle.classList.toggle('is-active', willOpen);
      siteNav.classList.toggle('is-open', willOpen);
      if (navBackdrop) navBackdrop.classList.toggle('is-active', willOpen);
      document.body.classList.toggle('nav-locked', willOpen);
    });

    if (navBackdrop) {
      navBackdrop.addEventListener('click', closeMenu);
    }

    siteNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  // --------------------------------------------------------------------------
  // 2. GSAP Plugins Registration & Setup
  // --------------------------------------------------------------------------
  if (typeof gsap !== 'undefined') {
    const plugins = [];
    if (typeof ScrollTrigger !== 'undefined') plugins.push(ScrollTrigger);
    if (typeof ScrollSmoother !== 'undefined') plugins.push(ScrollSmoother);
    if (typeof ScrollToPlugin !== 'undefined') plugins.push(ScrollToPlugin);

    gsap.registerPlugin(...plugins);

    const ctx = gsap.context(() => {
      // ----------------------------------------------------------------------
      // 3. Ultra-Smooth Momentum Inertial Scroll (ScrollSmoother)
      // Reference: prolibu.com & gsap.com
      // ----------------------------------------------------------------------
      let smoother = null;
      const isTouchDevice = (typeof ScrollTrigger !== 'undefined' && ScrollTrigger.isTouch) || window.innerWidth < 992;
      if (typeof ScrollSmoother !== 'undefined' && document.getElementById('smooth-wrapper') && document.getElementById('smooth-content')) {
        smoother = ScrollSmoother.create({
          wrapper: '#smooth-wrapper',
          content: '#smooth-content',
          smooth: isTouchDevice ? 0 : 1.3, // Ultra-smooth on desktop, native 120Hz momentum on touch
          effects: !isTouchDevice, // Disable data-speed parallax on touch screens to prevent jitter
          normalizeScroll: false, // Never lock or hijack native touch gestures on mobile
          smoothTouch: 0
        });
      }

      // ----------------------------------------------------------------------
      // 4. Hero Section Entrance Animation
      // ----------------------------------------------------------------------
      const heroTl = gsap.timeline({
        defaults: { ease: 'power3.out', duration: 0.95 }
      });

      heroTl
        .from('.hero-eyebrow', { y: 20, opacity: 0, duration: 0.7, delay: 0.15 })
        .from('.hero-title', { y: 40, opacity: 0, duration: 0.95 }, '-=0.5')
        .from('.hero-lead', { y: 25, opacity: 0, duration: 0.8 }, '-=0.6')
        .from('.hero-cta-group .btn', { y: 20, opacity: 0, stagger: 0.15, duration: 0.75 }, '-=0.5')
        .from('.hero-trust', { y: 15, opacity: 0, duration: 0.65 }, '-=0.4')
        .from('.hero-callout', { x: -25, opacity: 0, duration: 0.85 }, '-=0.45');

      // ----------------------------------------------------------------------
      // 5. Scroll-Driven Element Reveals across Homepage
      // Elements glide into view smoothly as user scrolls down the page
      // ----------------------------------------------------------------------

      // A. Founder Strip Reveal
      if (document.getElementById('founder-intro')) {
        gsap.from('#founder-intro .founder-profile', {
          y: 35,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#founder-intro',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        });

        gsap.from('#founder-intro .founder-action-link', {
          x: 30,
          opacity: 0,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#founder-intro',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        });
      }

      // B. Partnership Section Reveal
      if (document.getElementById('partenariat')) {
        gsap.from(['.partnership-eyebrow', '.partnership-title', '.partnership-lead'], {
          y: 40,
          opacity: 0,
          duration: 0.9,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.partnership-header',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        });

        gsap.from('.partnership-marquee-wrap', {
          y: 35,
          opacity: 0,
          duration: 0.95,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.partnership-marquee-wrap',
            start: 'top 88%',
            toggleActions: 'play none none reverse'
          }
        });

        gsap.from(['.partnership-bottom-text', '.partnership-bottom-cta'], {
          y: 30,
          opacity: 0,
          duration: 0.85,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.partnership-bottom',
            start: 'top 90%',
            toggleActions: 'play none none reverse'
          }
        });
      }

      // C. Problem Section Reveal
      const problemSection = document.getElementById('probleme');
      if (problemSection) {
        gsap.from('.problem-eyebrow', {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.problem-header',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        });

        // Split problem-title text letter-by-letter for scrubbed scroll reveal
        const problemTitle = problemSection.querySelector('.problem-title');
        if (problemTitle && typeof ScrollTrigger !== 'undefined') {
          const rawText = problemTitle.textContent.trim();
          problemTitle.setAttribute('aria-label', rawText);
          const words = rawText.split(/\s+/);

          problemTitle.innerHTML = words.map(word => {
            const chars = Array.from(word).map(char => `<span class="problem-char">${char}</span>`).join('');
            return `<span class="problem-word">${chars}</span>`;
          }).join(' ');

          const chars = problemTitle.querySelectorAll('.problem-char');

          gsap.fromTo(chars,
            {
              opacity: 0.15
            },
            {
              opacity: 1,
              stagger: 0.03,
              duration: 0.1,
              ease: 'power1.inOut',
              scrollTrigger: {
                trigger: '.problem-header',
                start: 'top 78%',
                end: 'bottom 38%',
                scrub: 0.8
              }
            }
          );
        }

        gsap.from('.problem-card', {
          y: 55,
          opacity: 0,
          duration: 0.95,
          stagger: 0.18,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.problem-grid',
            start: 'top 82%',
            toggleActions: 'play none none reverse'
          }
        });
      }

      // ----------------------------------------------------------------------
      // 6. Modele 5P - Header Entrance & Pinned Scrubbed Process Timeline
      // ----------------------------------------------------------------------
      const model5pSection = document.getElementById('modele-5p');

      if (model5pSection && typeof ScrollTrigger !== 'undefined') {
        // Modele 5P Header Reveal
        gsap.from(['.model-5p-eyebrow', '.model-5p-title', '.model-5p-header-action'], {
          y: 35,
          opacity: 0,
          duration: 0.9,
          stagger: 0.14,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.model-5p-header',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        });

        const mm = gsap.matchMedia();

        // Desktop (>= 992px): Viewport-Locked Master Timeline Scrub
        mm.add('(min-width: 992px)', () => {
          const processTl = gsap.timeline({
            scrollTrigger: {
              trigger: model5pSection,
              start: 'top top',
              end: '+=450',
              pin: true,
              pinSpacing: true,
              scrub: 0.2,
              anticipatePin: 1
            }
          });

          // 1. Gold Progress Bar continuous fill
          processTl.to('#process-progress-bar', {
            width: '100%',
            ease: 'none',
            duration: 4
          }, 0);

          // 2. Step 2 (Personnes) activates at 25% (time = 1.0)
          processTl
            .to('[data-step="2"] .process-step-dot', {
              backgroundColor: '#C8A24B',
              boxShadow: '0 0 18px rgba(200, 162, 75, 0.9), 0 0 0 5px #14213D',
              scale: 1.25,
              duration: 0.25,
              ease: 'power2.out'
            }, 0.9)
            .to('[data-step="2"] .process-step-num', {
              color: '#FFFFFF',
              y: -3,
              duration: 0.25,
              ease: 'power2.out'
            }, 0.9)
            .to(['[data-step="2"] .process-step-title', '[data-step="2"] .process-step-desc'], {
              opacity: 1,
              duration: 0.25,
              ease: 'power2.out'
            }, 0.9);

          // 3. Step 3 (Processus) activates at 50% (time = 2.0)
          processTl
            .to('[data-step="3"] .process-step-dot', {
              backgroundColor: '#C8A24B',
              boxShadow: '0 0 18px rgba(200, 162, 75, 0.9), 0 0 0 5px #14213D',
              scale: 1.25,
              duration: 0.25,
              ease: 'power2.out'
            }, 1.9)
            .to('[data-step="3"] .process-step-num', {
              color: '#FFFFFF',
              y: -3,
              duration: 0.25,
              ease: 'power2.out'
            }, 1.9)
            .to(['[data-step="3"] .process-step-title', '[data-step="3"] .process-step-desc'], {
              opacity: 1,
              duration: 0.25,
              ease: 'power2.out'
            }, 1.9);

          // 4. Step 4 (Profitabilité) activates at 75% (time = 3.0)
          processTl
            .to('[data-step="4"] .process-step-dot', {
              backgroundColor: '#C8A24B',
              boxShadow: '0 0 18px rgba(200, 162, 75, 0.9), 0 0 0 5px #14213D',
              scale: 1.25,
              duration: 0.25,
              ease: 'power2.out'
            }, 2.9)
            .to('[data-step="4"] .process-step-num', {
              color: '#FFFFFF',
              y: -3,
              duration: 0.25,
              ease: 'power2.out'
            }, 2.9)
            .to(['[data-step="4"] .process-step-title', '[data-step="4"] .process-step-desc'], {
              opacity: 1,
              duration: 0.25,
              ease: 'power2.out'
            }, 2.9);

          // 5. Step 5 (Propulsion) activates at 100% (time = 4.0)
          processTl
            .to('[data-step="5"] .process-step-dot', {
              backgroundColor: '#C8A24B',
              boxShadow: '0 0 18px rgba(200, 162, 75, 0.9), 0 0 0 5px #14213D',
              scale: 1.25,
              duration: 0.25,
              ease: 'power2.out'
            }, 3.8)
            .to('[data-step="5"] .process-step-num', {
              color: '#FFFFFF',
              y: -3,
              duration: 0.25,
              ease: 'power2.out'
            }, 3.8)
            .to(['[data-step="5"] .process-step-title', '[data-step="5"] .process-step-desc'], {
              opacity: 1,
              duration: 0.25,
              ease: 'power2.out'
            }, 3.8);

          // Step Click Smooth Scroll using ScrollSmoother / ScrollToPlugin
          document.querySelectorAll('.process-step').forEach((step, idx) => {
            step.addEventListener('click', () => {
              const st = processTl.scrollTrigger;
              if (!st) return;
              const targetY = st.start + ((idx / 4) * (st.end - st.start));
              if (smoother) {
                smoother.scrollTo(targetY, true);
              } else {
                gsap.to(window, { scrollTo: targetY, duration: 0.35, ease: 'power2.out' });
              }
            });
          });
        });

        // Mobile (< 992px): Step by step viewport trigger
        mm.add('(max-width: 991px)', () => {
          gsap.utils.toArray('.process-step').forEach((step) => {
            ScrollTrigger.create({
              trigger: step,
              start: 'top 75%',
              end: 'bottom 25%',
              toggleClass: { targets: step, className: 'is-active' }
            });
          });
        });

        // --------------------------------------------------------------------
        // 7. "Les deux autres méthodes" Reveal
        // --------------------------------------------------------------------
        if (document.getElementById('autres-methodes')) {
          gsap.from('.other-methods-eyebrow', {
            y: 25,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '#autres-methodes',
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          });

          gsap.from('.method-card', {
            y: 50,
            opacity: 0,
            duration: 0.95,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '.methods-grid',
              start: 'top 82%',
              toggleActions: 'play none none reverse'
            }
          });

          gsap.from('.methods-bottom-action', {
            y: 20,
            opacity: 0,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '.methods-bottom-action',
              start: 'top 92%',
              toggleActions: 'play none none reverse'
            }
          });
        }
      }

      // ----------------------------------------------------------------------
      // 8. Founder Section (About Cloé Caron) Reveal
      // ----------------------------------------------------------------------
      if (document.getElementById('cloe-caron')) {
        gsap.from([
          '#cloe-caron .founder-section-eyebrow',
          '#cloe-caron .founder-section-name',
          '#cloe-caron .founder-quote',
          '#cloe-caron .founder-bio-text',
          '#cloe-caron .credential-row'
        ], {
          y: 40,
          opacity: 0,
          duration: 0.9,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#cloe-caron .founder-content-col',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        });

        // Option 3: Cinematic Soft Focus & Scale-In (Timeless, Warm & Executive Presence)
        const founderPhotoWrap = document.querySelector('#cloe-caron .founder-photo-wrap');
        const founderPhotoImg = document.querySelector('#cloe-caron .founder-photo-img');

        if (founderPhotoWrap && typeof ScrollTrigger !== 'undefined') {
          // Clear any previous clipPath or transform offsets
          gsap.set(founderPhotoWrap, { clearProps: 'clipPath,x,rotation' });
          if (founderPhotoImg) gsap.set(founderPhotoImg, { clearProps: 'yPercent' });

          const photoTl = gsap.timeline({
            scrollTrigger: {
              trigger: founderPhotoWrap,
              start: 'top 78%',
              toggleActions: 'play none none reverse'
            }
          });

          // 1. Frame glides up into place with rich smooth elevation
          photoTl.fromTo(
            founderPhotoWrap,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1.1,
              ease: 'power3.out'
            },
            0
          );

          // 2. Cinematic Lens Pull: photo starts in soft artistic focus + slight zoom, then pulls into crystal sharp focus
          if (founderPhotoImg) {
            photoTl.fromTo(
              founderPhotoImg,
              {
                scale: 1.08,
                filter: 'blur(10px)'
              },
              {
                scale: 1,
                filter: 'blur(0px)',
                duration: 1.4,
                ease: 'power2.out'
              },
              0
            );
          }
        }
      }

      // ----------------------------------------------------------------------
      // 9. Team Testimonials (Comité de direction — One Team) Reveal
      // ----------------------------------------------------------------------
      if (document.getElementById('temoignages')) {
        gsap.from(['.team-testimonials-eyebrow', '.team-testimonials-title'], {
          y: 40,
          opacity: 0,
          duration: 0.9,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.team-testimonials-header',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        });

        const testimonialCards = gsap.utils.toArray('.testimonial-item');
        if (testimonialCards.length > 0) {
          const isMobile = window.innerWidth < 768;
          const slideDistance = isMobile ? 80 : 180;

          // Scrubbed over-the-scroll timeline: cards glide smoothly from sides into actual places
          const testimonialsTl = gsap.timeline({
            scrollTrigger: {
              trigger: '.testimonials-grid',
              start: 'top 88%',
              end: 'center 50%',
              scrub: 1.2
            }
          });

          // Row 1, Left Card (Patricia Gauthier): moves Left -> Right into position
          if (testimonialCards[0]) {
            testimonialsTl.fromTo(
              testimonialCards[0],
              { x: -slideDistance, opacity: 0 },
              { x: 0, opacity: 1, ease: 'power2.out', duration: 1 },
              0
            );
          }

          // Row 1, Right Card (Sylvain Corbeil): moves Right -> Left into position
          if (testimonialCards[1]) {
            testimonialsTl.fromTo(
              testimonialCards[1],
              { x: slideDistance, opacity: 0 },
              { x: 0, opacity: 1, ease: 'power2.out', duration: 1 },
              0
            );
          }

          // Row 2, Left Card (Samba Sow): moves Left -> Right into position
          if (testimonialCards[2]) {
            testimonialsTl.fromTo(
              testimonialCards[2],
              { x: -slideDistance, opacity: 0 },
              { x: 0, opacity: 1, ease: 'power2.out', duration: 1 },
              0.15
            );
          }
        }

        gsap.from('.testimonials-bottom-action', {
          y: 15,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.testimonials-bottom-action',
            start: 'top 92%',
            toggleActions: 'play none none reverse'
          }
        });
      }

      // ----------------------------------------------------------------------
      // 10. La Différence Section - Dancing Words Reveal Animation
      // ----------------------------------------------------------------------
      const diffSection = document.getElementById('difference');
      if (diffSection) {
        const titleAccent = diffSection.querySelector('.title-accent');
        const titleMain = diffSection.querySelector('.title-main');

        // Helper to split text into distinct words for playful dancing animation
        const prepareDanceWords = (el) => {
          if (!el) return [];
          const text = el.textContent.trim();
          el.setAttribute('aria-label', text);
          const words = text.split(/\s+/);
          el.innerHTML = words.map(word => `<span class="dance-word">${word}</span>`).join(' ');
          return el.querySelectorAll('.dance-word');
        };

        const accentWords = prepareDanceWords(titleAccent);
        const mainWords = prepareDanceWords(titleMain);

        // Pre-set playful tilted dance posture so elements never flash or jump
        gsap.set([...accentWords, ...mainWords], {
          y: 45,
          opacity: 0,
          scale: 0.65,
          rotation: (i) => (i % 2 === 0 ? -11 : 11),
          transformOrigin: '50% 100%'
        });

        const danceTl = gsap.timeline({
          scrollTrigger: {
            trigger: diffSection,
            start: 'top 75%',
            toggleActions: 'play none none reverse'
          }
        });

        // 1. Eyebrow reveals smoothly
        danceTl.from('#difference .difference-eyebrow', {
          y: 20,
          opacity: 0,
          duration: 0.45,
          ease: 'power3.out'
        });

        // 2. Line 1 (Gold Accent): Words groove and dance in fast & snappy
        if (accentWords.length > 0) {
          danceTl.to(
            accentWords,
            {
              y: 0,
              opacity: 1,
              scale: 1,
              rotation: 0,
              duration: 0.52,
              ease: 'back.out(2.5)',
              stagger: 0.048
            },
            '-=0.1'
          );
        }

        // 3. Line 2 (Primary Navy Statement): Words groove and dance in fast & snappy
        if (mainWords.length > 0) {
          danceTl.to(
            mainWords,
            {
              y: 0,
              opacity: 1,
              scale: 1,
              rotation: 0,
              duration: 0.52,
              ease: 'back.out(2.5)',
              stagger: 0.038
            },
            '-=0.25'
          );
        }

        // 4. Action button emerges smoothly
        danceTl.from('#difference .difference-action', {
          y: 20,
          opacity: 0,
          duration: 0.55,
          ease: 'power3.out'
        }, '-=0.15');
      }

      // ----------------------------------------------------------------------
      // 11. Final Home CTA (Commencer) Reveal
      // ----------------------------------------------------------------------
      if (document.getElementById('commencer')) {
        gsap.from([
          '#commencer .home-cta-eyebrow',
          '#commencer .home-cta-title',
          '#commencer .home-cta-lead',
          '#commencer .home-cta-actions'
        ], {
          y: 40,
          opacity: 0,
          duration: 0.95,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#commencer',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        });
      }

      // ----------------------------------------------------------------------
      // 12. Site Footer Reveal
      // ----------------------------------------------------------------------
      if (document.getElementById('site-footer')) {
        gsap.from([
          '#site-footer .footer-brand-col',
          '#site-footer .footer-nav-col',
          '#site-footer .footer-content-col'
        ], {
          y: 35,
          opacity: 0,
          duration: 0.9,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#site-footer',
            start: 'top 90%',
            toggleActions: 'play none none reverse'
          }
        });
      }

      // ----------------------------------------------------------------------
      // 13. Royal Executive Button Hover Interactions (Rolex / Cartier Style)
      // Stationary Precision: Dual-Layer Rolling Text Flip + Specular Sheen (No Magnetic / No Shadow)
      // ----------------------------------------------------------------------
      const initRoyalButtons = () => {
        const allButtons = document.querySelectorAll('.btn');

        allButtons.forEach(btn => {
          if (btn.dataset.royalInit === 'true') return;
          btn.dataset.royalInit = 'true';

          // Extract text content cleanly
          const text = btn.textContent.trim();
          if (!text) return;

          // Wrap into luxury rolling text structure & specular light sheen
          btn.innerHTML = `
            <span class="btn-royal-content">
              <span class="btn-rolling-mask">
                <span class="btn-rolling-inner">
                  <span class="btn-text-line btn-text-original">${text}</span>
                  <span class="btn-text-line btn-text-clone" aria-hidden="true">${text}</span>
                </span>
              </span>
            </span>
            <span class="btn-royal-sheen" aria-hidden="true"></span>
          `;

          const rollingInner = btn.querySelector('.btn-rolling-inner');
          const sheen = btn.querySelector('.btn-royal-sheen');

          // Smooth dual-layer rolling flip animation
          const rollTween = gsap.to(rollingInner, {
            yPercent: -100,
            duration: 0.38,
            ease: 'power3.inOut',
            paused: true
          });

          // Desktop & Pointer Hover Triggers (Stationary, Clean & Sharp)
          btn.addEventListener('mouseenter', () => {
            rollTween.play();

            // Diagonal specular sheen beam sweeps across like light hitting polished metal
            if (sheen) {
              gsap.fromTo(sheen,
                { x: '-150%', opacity: 1 },
                { x: '450%', opacity: 1, duration: 0.65, ease: 'power2.out' }
              );
            }
          });

          btn.addEventListener('mouseleave', () => {
            rollTween.reverse();
          });
        });
      };

      initRoyalButtons();
    });

    window.addEventListener('beforeunload', () => {
      ctx.revert();
    });
  }
});

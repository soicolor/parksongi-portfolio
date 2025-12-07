import { items } from './../api/projectData.js';

// --------------------------- Utilities --------------------------------------
const qs = (sel, el = document) => el.querySelector(sel);
const qsa = (sel, el = document) => Array.from(el.querySelectorAll(sel));
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const lerp = (start, end, t) => start + (end - start) * t;

// requestAnimationFrame ticker helper
const raf = (fn) => {
    let id;
    const loop = (t) => {
        id = requestAnimationFrame(loop);
        fn(t);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
};

// ----------------------- GSAP / ScrollTrigger / Lenis -----------------------
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Single Lenis instance (모든 섹션이 공유)
const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ------------------------------ Top Button ----------------------------------
(function topButtonInit() {
    const topButton = qs('#topButton');
    if (!topButton) return;
    topButton.addEventListener(
        'click',
        () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        { passive: true }
    );
})();

// ------------------------------- con1 ---------------------------------------
function con1Page() {
    // pin: .pinned, .header-info
    ScrollTrigger.create({
        trigger: '.pinned',
        start: 'top top',
        endTrigger: '.whitespace',
        end: 'bottom top',
        pin: true,
        pinSpacing: false,
    });

    ScrollTrigger.create({
        trigger: '.header-info',
        start: 'top top',
        endTrigger: '.whitespace',
        end: 'bottom top',
        pin: true,
        pinSpacing: false,
    });

    // rotate .revealer
    ScrollTrigger.create({
        trigger: '.pinned',
        start: 'top top',
        endTrigger: '.header-info',
        end: 'bottom bottom',
        onUpdate: (self) => {
            gsap.to('.revealer', { rotation: self.progress * 360, duration: 0, ease: 'none' });
        },
    });

    // clip-path animation
    ScrollTrigger.create({
        trigger: '.pinned',
        start: 'top top',
        endTrigger: '.header-info',
        end: 'bottom bottom',
        onUpdate: (self) => {
            const p = self.progress;
            const clipPath = `polygon(
        ${45 - 45 * p}% ${0}%, ${55 + 45 * p}% ${0}%,
        ${55 + 45 * p}% ${100}%, ${45 - 45 * p}% ${100}%
      )`;
            gsap.to('.revealer-1, .revealer-2', { clipPath, duration: 0, ease: 'none' });
        },
    });

    // move .revealer left %
    ScrollTrigger.create({
        trigger: '.header-info',
        start: 'top top',
        end: 'bottom 50%',
        scrub: 1,
        onUpdate: (self) => {
            const left = 35 + (50 - 35) * self.progress;
            gsap.to('.revealer', { left: `${left}%`, duration: 0, ease: 'none' });
        },
    });

    // scale .revealer
    ScrollTrigger.create({
        trigger: '.whitespace',
        start: 'top 50%',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: (self) => {
            gsap.to('.revealer', { scale: 1 + 12 * self.progress, duration: 0, ease: 'none' });
        },
    });
}

// ------------------------------- con3 ---------------------------------------
function con3Page() {
    const containers = qsa('.con3 .marquee-container');
    if (!containers.length) return;

    // SplitType: 문자로 분해
    if (typeof SplitType !== 'undefined') {
        new SplitType('.con3 .item h1', { types: 'chars' });
    }

    const animateChars = (chars, reverse = false) => {
        const staggerOptions = { each: 0.35, from: reverse ? 'start' : 'end', ease: 'linear' };
        gsap.fromTo(
            chars,
            { fontWeight: 100 },
            {
                fontWeight: 900,
                duration: 1,
                ease: 'none',
                stagger: staggerOptions,
                scrollTrigger: {
                    trigger: chars[0]?.closest('.con3 .marquee-container'),
                    start: '50% bottom',
                    end: 'top top',
                    scrub: true,
                },
            }
        );
    };

    containers.forEach((container, idx) => {
        const marquee = qs('.con3 .marquee', container);
        if (!marquee) return;

        const start = '0%';
        const end = idx % 2 === 0 ? '10%' : '-15%';

        gsap.fromTo(
            marquee,
            { x: start },
            {
                x: end,
                scrollTrigger: {
                    trigger: container,
                    start: 'top bottom',
                    end: '150% top',
                    scrub: true,
                },
            }
        );

        qsa('.con3 .item h1', marquee).forEach((word) => {
            const chars = qsa('.con3 .char', word);
            if (chars.length) animateChars(chars, idx % 2 !== 0);
        });
    });
}

// ------------------------------- con4 ---------------------------------------
function con4Page() {
    const cards = qsa('.con4 .card');
    if (!cards.length) return;

    const totalScrollHeight = window.innerHeight * 3;

    // 균등 분포 유틸
    const distribute = (count, min = 10, max = 90) =>
        Array.from({ length: count }, (_, i) => min + ((max - min) * i) / (count - 1 || 1));
    const rotMirror = (count, spread = 15) =>
        Array.from({ length: count }, (_, i) => {
            const mid = (count - 1) / 2;
            return (i - mid) * (spread / (mid || 1));
        });

    const positions = distribute(cards.length);
    const rotations = rotMirror(cards.length, 30);

    // pin section
    ScrollTrigger.create({
        trigger: '.con4 .cards',
        start: 'top top',
        end: () => `+=${totalScrollHeight}`,
        pin: true,
        pinSpacing: true,
    });

    // 앞/뒷면 초기 회전
    cards.forEach((card) => {
        const frontEl = qs('.flip-card-front', card);
        const backEl = qs('.flip-card-back', card);
        if (frontEl && backEl) {
            gsap.set(frontEl, { rotateY: 0 });
            gsap.set(backEl, { rotateY: 180 });
        }
    });

    // spread
    cards.forEach((card, i) => {
        gsap.to(card, {
            left: `${positions[i]}%`,
            rotation: `${rotations[i] ?? 0}`,
            ease: 'none',
            scrollTrigger: {
                trigger: '.con4 .cards',
                start: 'top top',
                end: () => `+=${window.innerHeight}`,
                scrub: 0.5,
                id: `spread-${i}`,
            },
        });
    });

    // rotate + flip (staggered)
    cards.forEach((card, i) => {
        const frontEl = qs('.flip-card-front', card);
        const backEl = qs('.flip-card-back', card);
        if (!frontEl || !backEl) return;

        const staggerOffset = i * 0.05;
        const startOffset = 1 / 6 + staggerOffset;
        const endOffset = 2 / 6 + staggerOffset;

        ScrollTrigger.create({
            trigger: '.con4 .cards',
            start: 'top top',
            end: () => `+=${totalScrollHeight}`,
            scrub: 1,
            id: `rotate-flip-${i}`,
            onUpdate: (self) => {
                const p = self.progress;
                const baseRot = rotations[i] ?? 0;

                if (p >= startOffset && p <= endOffset) {
                    const animP = (p - startOffset) / (1 / 6);
                    const frontRotation = -180 * animP;
                    const backRotation = 180 - 180 * animP;
                    const cardRotation = baseRot * (1 - animP);

                    frontEl.style.transform = `rotateY(${frontRotation}deg)`;
                    backEl.style.transform = `rotateY(${backRotation}deg)`;
                    card.style.transform = `translate(-50%, -50%) rotate(${cardRotation}deg)`;
                } else if (p < startOffset) {
                    frontEl.style.transform = `rotateY(0deg)`;
                    backEl.style.transform = `rotateY(180deg)`;
                    card.style.transform = `translate(-50%, -50%) rotate(${baseRot}deg)`;
                } else {
                    frontEl.style.transform = `rotateY(-180deg)`;
                    backEl.style.transform = `rotateY(0deg)`;
                    card.style.transform = `translate(-50%, -50%) rotate(0deg)`;
                }
            },
        });
    });
}

// ------------------------------- con5 ---------------------------------------
function con5Page() {
    const marqueeInner = qs('.con5 .marquee__inner');
    const parts = qsa('.con5 .marquee__part');
    if (!marqueeInner || !parts.length) return;

    let currentScroll = window.pageYOffset;
    let isScrollingDown = true;
    const arrows = qsa('.con5 .arrow');

    const tween = gsap
        .to(parts, { xPercent: -100, repeat: -1, duration: 5, ease: 'linear' })
        .totalProgress(0.5);

    gsap.set(marqueeInner, { xPercent: -50 });

    const onScroll = () => {
        const y = window.pageYOffset;
        isScrollingDown = y > currentScroll;
        gsap.to(tween, { timeScale: isScrollingDown ? 1 : -1, overwrite: true });

        arrows.forEach((arrow) => arrow.classList.toggle('active', !isScrollingDown));
        currentScroll = y;
    };

    // passive + throttled by rAF
    let cancel = null;
    window.addEventListener(
        'scroll',
        () => {
            if (cancel) return;
            cancel = raf(() => {
                onScroll();
                cancel && cancel();
                cancel = null;
            });
        },
        { passive: true }
    );
}

// ------------------------------- con6 ---------------------------------------
function con6Page() {
    const root = qs('.con6');
    if (!root) return;

    const sliderWrapper = qs('.con6 .slider-wrapper', root);
    const markerWrapper = qs('.con6 .marker-wrapper', root);
    const activeSlideEl = qs('.con6 .active-slide', root);
    const slides = qsa('.con6 .slide', root);

    if (!sliderWrapper || !markerWrapper || !activeSlideEl || !slides.length) return;

    let target = 0,
        current = 0,
        maxScroll = 0;
    const ease = 0.075;
    let st; // ScrollTrigger instance

    const getMaxScroll = () => sliderWrapper.scrollWidth - window.innerWidth;
    const updateActiveSlideNumber = (progress) => {
        const idx = clamp(Math.round(progress * (slides.length - 1)) + 1, 1, slides.length);
        activeSlideEl.textContent = `${idx}/${slides.length}`;
    };
    const updateMarker = (progress) => {
        const start = 70;
        const end = window.innerWidth - markerWrapper.offsetWidth - 100;
        const x = lerp(start, Math.max(start, end), progress);
        gsap.set(markerWrapper, { x });
    };

    const render = () => {
        current = lerp(current, target, ease);
        gsap.set(sliderWrapper, { x: -current });
        const p = maxScroll > 0 ? current / maxScroll : 0;
        updateMarker(p);
        updateActiveSlideNumber(p);
        requestAnimationFrame(render);
    };

    const setupScrollTrigger = () => {
        st?.kill();
        maxScroll = Math.max(0, getMaxScroll());
        st = ScrollTrigger.create({
            trigger: root,
            start: 'top top',
            end: () => `+=${maxScroll}`,
            pin: true,
            scrub: true,
            anticipatePin: 1,
            onUpdate: (self) => {
                target = clamp(maxScroll * self.progress, 0, maxScroll);
                // marker-wrapper opacity
                gsap.to(markerWrapper, {
                    opacity: self.progress >= 0.95 ? 0 : 1,
                    duration: 0.5,
                    ease: 'power2.out',
                    overwrite: true,
                });
            },
        });
    };

    activeSlideEl.textContent = `1/${slides.length}`;
    setupScrollTrigger();
    render();

    window.addEventListener('resize', () => {
        setupScrollTrigger();
        ScrollTrigger.refresh();
    });
}

// ------------------------------- con9 ---------------------------------------
function con9Page() {
    const root = qs('.con9');
    if (!root) return;

    const itemsContainer = qs('.con9 .items', root);
    const itemsCols = qsa('.con9 .items-col', root);
    const filters = qsa('.con9 .filter', root);

    if (!itemsContainer || !itemsCols.length || !filters.length) return;

    const defaultFontSize = '75px';
    const activeFontSize = '250px';

    // h1 -> span per char
    const splitTextIntoSpans = (selector) => {
        qsa(selector).forEach((el) => {
            const text = el.innerText;
            el.innerHTML = text
                .split('')
                .map((c) => `<span>${c}</span>`)
                .join('');
        });
    };

    const animateFontSize = (target, fontSize) => {
        if (!target) return;
        const spans = qsa('.con9 span', target);
        gsap.to(spans, { fontSize, stagger: 0.025, duration: 0.5, ease: 'power2.out' });
    };

    const clearItems = () => itemsCols.forEach((col) => (col.innerHTML = ''));

    const addItemsToCols = (filter = 'all') => {
        let colIndex = 0;
        const filtered = items.filter((it) => filter === 'all' || it.tag?.includes(filter));

        filtered.forEach((it) => {
            const el = document.createElement('div');
            el.className = 'item';
            el.innerHTML = `
      <div class="item-img">
        <a href="${it.url}" target="_blank">
          <img src="${it.img}" alt="${it.title}">
        </a>
      </div>
      <div class="item-copy">
        <a href="${it.url}" target="_blank">
          <p>${it.title}</p>
        </a>
      </div>
    `;
            itemsCols[colIndex % itemsCols.length].appendChild(el);
            colIndex++;
        });
    };

    const setConHeight = () => {
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const contentH = itemsContainer.scrollHeight || 0;
        root.style.height = Math.max(vh, contentH) + 'px';
    };

    const animateItems = (filter) => {
        gsap.to(itemsContainer, {
            opacity: 0,
            duration: 0.25,
            onComplete: () => {
                clearItems();
                addItemsToCols(filter);
                gsap.to(itemsContainer, {
                    opacity: 1,
                    duration: 0.25,
                    onComplete: () => {
                        setConHeight();
                        ScrollTrigger.refresh();
                    },
                });
            },
        });
    };

    // init
    splitTextIntoSpans('.con9 .filter h1');
    const activeH1 = qs('.con9 .filter.active h1', root);
    if (activeH1) animateFontSize(activeH1, activeFontSize);
    addItemsToCols();
    setConHeight();

    // click filters
    filters.forEach((btn) => {
        btn.addEventListener(
            'click',
            function () {
                if (this.classList.contains('active')) return;

                gsap.to(window, {
                    scrollTo: { y: root, offsetY: 0 },
                    duration: 0.6,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        const prevActiveH1 = qs('.filter.active h1', root);
                        if (prevActiveH1) animateFontSize(prevActiveH1, defaultFontSize);

                        filters.forEach((f) => f.classList.remove('active'));
                        this.classList.add('active');

                        const newActiveH1 = qs('h1', this);
                        animateFontSize(newActiveH1, activeFontSize);

                        const filterValue = this.getAttribute('data-filter') || 'all';
                        animateItems(filterValue);
                    },
                });
            },
            { passive: true }
        );
    });

    // pin only filters
    ScrollTrigger.create({
        id: 'pin-filters',
        trigger: root,
        start: 'top top',
        end: () => {
            const vh = window.innerHeight || document.documentElement.clientHeight;
            const contentH = itemsContainer.scrollHeight || 0;
            return `+=${Math.max(0, contentH - vh)}`;
        },
        pin: '.con9 .filters',
        pinSpacing: false,
        anticipatePin: 1,
    });

    window.addEventListener('resize', () => {
        setConHeight();
        ScrollTrigger.refresh();
    });
}

// ------------------------------- con10 --------------------------------------
function con10Page() {
    const containers = qsa('.con10 .anime-text-container');
    if (!containers.length) return;

    let keywordBg = {
        interfaces: '0, 200, 160', // teal
        직관적으로: '97, 218, 251', // React blue
        편안하게: '97, 218, 251', // React blue
    };
    const defaultBg = '60, 60, 60';
    const keywords = Object.keys(keywordBg);

    // Build word spans & mark keywords
    qsa('.con10 .anime-text p').forEach((p) => {
        const words = p.textContent.split(/\s+/);
        p.innerHTML = '';
        words.forEach((w) => {
            if (!w.trim()) return;
            const wordEl = document.createElement('div');
            wordEl.className = 'word';
            const span = document.createElement('span');
            span.textContent = w;

            const normalized = w.toLowerCase().replace(/[.,!?;:"()]/g, '');
            const isKey = keywords.includes(normalized);
            const rgb = isKey ? keywordBg[normalized] || defaultBg : defaultBg;

            wordEl.dataset.key = isKey ? normalized : '';
            wordEl.style.setProperty('--kw-bg', rgb);
            wordEl.style.setProperty('--kw-alpha', '0');
            wordEl.style.backgroundColor = 'rgba(var(--kw-bg), var(--kw-alpha))';

            if (isKey) {
                wordEl.classList.add('keyword-wrapper');
                span.classList.add('keyword', normalized);
            }
            wordEl.appendChild(span);
            p.appendChild(wordEl);
        });
    });

    // Scroll-driven reveal
    containers.forEach((container) => {
        ScrollTrigger.create({
            trigger: container,
            pin: container,
            start: 'top top',
            end: `+=${window.innerHeight * 4}`,
            pinSpacing: true,
            onUpdate: (self) => {
                const progress = self.progress;
                const words = qsa('.con10 .anime-text .word', container);
                const total = words.length || 1;

                words.forEach((word, i) => {
                    const span = qs('span', word);
                    if (progress <= 0.7) {
                        const progressTarget = 0.7;
                        const rp = Math.min(1, progress / progressTarget);
                        const overlapWords = 15;
                        const totalAnimationLength = 1 + overlapWords / total;

                        const ws = i / total;
                        const we = ws + overlapWords / total;
                        const tlScale =
                            1 /
                            Math.min(
                                totalAnimationLength,
                                1 + (total - 1) / total + overlapWords / total
                            );

                        const as = ws * tlScale;
                        const ae = we * tlScale;
                        const dur = ae - as;

                        const wProg = rp <= as ? 0 : rp >= ae ? 1 : (rp - as) / dur;
                        word.style.opacity = wProg;

                        const bgFadeStart = wProg >= 0.9 ? (wProg - 0.9) / 0.1 : 0;
                        const alpha = Math.max(0, 1 - bgFadeStart);
                        word.style.setProperty('--kw-alpha', String(alpha));

                        const thr = 0.9;
                        const textProg = wProg >= thr ? (wProg - thr) / (1 - thr) : 0;
                        span.style.opacity = Math.pow(textProg, 0.5);
                    } else {
                        const r = (progress - 0.7) / 0.3;
                        word.style.opacity = 1;
                        const ro = 5;
                        const rs = i / total;
                        const re = rs + ro / total;
                        const rScale = 1 / Math.max(1, (total - 1) / total + ro / total);

                        const ras = rs * rScale;
                        const rae = re * rScale;
                        const rdur = rae - ras;

                        const rProg = r <= ras ? 0 : r >= rae ? 1 : (r - ras) / rdur;

                        if (rProg > 0) {
                            span.style.opacity = 1 * (1 - rProg);
                            word.style.setProperty('--kw-alpha', String(rProg));
                        } else {
                            span.style.opacity = 1;
                            word.style.setProperty('--kw-alpha', '0');
                        }
                    }
                });
            },
        });
    });

    window.addEventListener('resize', () => ScrollTrigger.refresh());

    // Runtime color update API
    window.setKeywordColors = function setKeywordColors(map = {}) {
        Object.keys(map).forEach((k) => {
            keywordBg[k.toLowerCase()] = map[k];
        });
        qsa('.con10 .anime-text .word').forEach((word) => {
            const key = (word.dataset.key || '').toLowerCase();
            const rgb = key ? keywordBg[key] || defaultBg : defaultBg;
            word.style.setProperty('--kw-bg', rgb);
        });
    };
}

// ------------------------------- Footer -------------------------------------
function footerPage() {
    const footer = qs('.footer');
    const explosionContainer = qs('.footer .explosion-container');
    if (!footer || !explosionContainer) return;

    let explosionTriggered = false;
    const config = {
        gravity: 0.25,
        friction: 0.99,
        imageSize: 150,
        horizontalForce: 20,
        verticalForce: 15,
        rotationSpeed: 10,
        resetDelay: 500,
        particleCount: 15,
        imagePath: (i) => `images/f.jpg`,
    };

    // preload
    Array.from({ length: config.particleCount }, (_, i) => {
        const img = new Image();
        img.src = config.imagePath(i);
        return img;
    });

    const createParticles = () => {
        explosionContainer.innerHTML = '';
        Array.from({ length: config.particleCount }, (_, i) => {
            const particle = document.createElement('img');
            particle.src = config.imagePath(i);
            particle.classList.add('explosion-particle-img');
            particle.style.width = `${config.imageSize}px`;
            explosionContainer.appendChild(particle);
        });
    };

    class Particle {
        constructor(element) {
            this.element = element;
            this.x = 0;
            this.y = 0;
            this.vx = (Math.random() - 0.5) * config.horizontalForce;
            this.vy = -config.verticalForce - Math.random() * 10;
            this.rotation = 0;
            this.rotationSpeed = (Math.random() - 0.5) * config.rotationSpeed;
        }
        update() {
            this.vy += config.gravity;
            this.vx *= config.friction;
            this.vy *= config.friction;
            this.rotationSpeed *= config.friction;

            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotationSpeed;

            this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rotation}deg)`;
        }
    }

    const explode = () => {
        if (explosionTriggered) return;
        explosionTriggered = true;

        createParticles();

        const particleEls = qsa('.explosion-particle-img', explosionContainer);
        const particles = particleEls.map((el) => new Particle(el));

        let rafId;
        const animate = () => {
            particles.forEach((p) => p.update());
            rafId = requestAnimationFrame(animate);

            if (particles.every((p) => p.y > explosionContainer.offsetHeight / 2)) {
                cancelAnimationFrame(rafId);
                setTimeout(() => {
                    explosionTriggered = false;
                }, config.resetDelay);
            }
        };
        animate();
    };

    const checkFooterPosition = () => {
        const rect = footer.getBoundingClientRect();
        const vh = window.innerHeight;
        if (!explosionTriggered && rect.top <= vh - rect.height * 0.5) explode();
    };

    let debounce;
    window.addEventListener(
        'scroll',
        () => {
            clearTimeout(debounce);
            debounce = setTimeout(checkFooterPosition, 10);
        },
        { passive: true }
    );

    window.addEventListener('resize', () => {
        explosionTriggered = false;
    });

    createParticles();
    setTimeout(checkFooterPosition, 500);
}

// ------------------------- Header / Page Transition -------------------------
(function headerInit() {
    const header = qs('.header');
    if (!header) return;

    qsa('.header a[href^="#"]', header).forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (!targetId) return;

            document.body.classList.add('page-transitioning');
            setTimeout(() => {
                const target = qs(targetId);
                target?.scrollIntoView({ behavior: 'auto' });
                document.body.classList.remove('page-transitioning');
            }, 250);
        });
    });

    // #main → p 애니메이션 재실행
    const mainLink = qs('a[href="#main"]');
    mainLink?.addEventListener('click', () => {
        const p = qs('#main p');
        if (!p) return;
        p.style.animation = 'none';
        // Reflow
        // eslint-disable-next-line no-unused-expressions
        p.offsetHeight;
        p.style.animation = 'pSlideIn 1s ease-out forwards';
    });
})();

// -------------------------- con8: project story -----------------------------
(function con8Init() {
    const spans = qsa('.con8 .img span');
    if (!spans.length) return;

    const animateCon8 = () => {
        const vh = window.innerHeight;
        const triggerPoint = vh * 0.75;
        spans.forEach((span) => {
            const top = span.getBoundingClientRect().top;
            span.classList.toggle('active', top < triggerPoint);
        });
    };

    window.addEventListener('scroll', animateCon8, { passive: true });
    window.addEventListener('load', animateCon8);
    animateCon8();
})();

// ------------------------------- Boot ---------------------------------------
(function boot() {
    // DOMContentLoaded 후 섹션 초기화
    const init = () => {
        con1Page();
        con3Page();
        con4Page();
        con5Page();
        con6Page();
        con9Page();
        con10Page();
        footerPage();
        ScrollTrigger.refresh();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();

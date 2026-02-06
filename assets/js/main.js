/**
 * Main JavaScript - Home Made RD
 * Optimizado para rendimiento y UX fluido.
 */

const CONFIG = {
    SCROLL_THRESHOLD: 50,
    ANIMATION_DELAY: 150, // ms entre tarjetas
    PATHS: {
        header: 'assets/components/header.html',
        footer: 'assets/components/footer.html'
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

/**
 * Inicializador principal
 */
const initApp = async () => {
    // 1. Cargar componentes estructurales
    await loadComponent('#header-container', CONFIG.PATHS.header);
    await loadComponent('#footer-container', CONFIG.PATHS.footer);

    // 2. Inicializar lógica una vez el DOM está listo
    initNavbar();
    initAnimations();
    initSmoothScroll();
};

/**
 * Carga asíncrona de componentes HTML
 */
const loadComponent = async (selector, url) => {
    const container = document.querySelector(selector);
    if (!container) return;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();
        container.innerHTML = html;
        
        // Disparar evento personalizado por si necesitamos saber cuándo cargó
        document.dispatchEvent(new Event(`componentLoaded:${selector}`));
    } catch (error) {
        console.warn(`[System] Error cargando ${url}:`, error);
    }
};

/**
 * Lógica del Navbar (Glassmorphism & Mobile)
 */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    // --- Scroll Effect ---
    let scrollPending = false;
    
    const updateNavbarStyle = () => {
        const isScrolled = window.scrollY > CONFIG.SCROLL_THRESHOLD;
        navbar.classList.toggle('scrolled', isScrolled);
        scrollPending = false;
    };

    window.addEventListener('scroll', () => {
        if (!scrollPending) {
            window.requestAnimationFrame(updateNavbarStyle);
            scrollPending = true;
        }
    }, { passive: true });

    // --- Mobile Menu Close on Click ---
    // Delegación de eventos para capturar clicks en enlaces dinámicos
    document.addEventListener('click', (e) => {
        if (e.target.matches('.nav-link') || e.target.closest('.nav-link')) {
            const navbarCollapse = document.querySelector('.navbar-collapse.show');
            if (navbarCollapse && typeof bootstrap !== 'undefined') {
                const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                bsCollapse?.hide();
            }
        }
    });
}

/**
 * Gestor de Animaciones (Scroll Reveal & Stagger)
 */
function initAnimations() {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                
                // Si es una tarjeta de características, aplicamos delay (Cascada)
                if (target.dataset.delay) {
                    setTimeout(() => {
                        target.classList.add('active');
                    }, target.dataset.delay);
                } else {
                    // Animación normal inmediata
                    target.classList.add('active');
                }
                
                obs.unobserve(target);
            }
        });
    }, observerOptions);

    // 1. Elementos generales (.reveal)
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // 2. Feature Cards (Cascada manual)
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach((card, index) => {
        card.classList.add('reveal-card'); // Clase base CSS
        card.dataset.delay = index * CONFIG.ANIMATION_DELAY; // Guardamos el delay en data-attribute
        observer.observe(card);
    });
}

/**
 * Smooth Scroll Nativo + Ajuste de Offset
 */
function initSmoothScroll() {
    document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a[href^="#"]');
        if (!anchor) return;

        const targetId = anchor.getAttribute('href');
        if (targetId === '#' || targetId === '') return;

        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;

        e.preventDefault();

        const navbar = document.querySelector('.navbar');
        const headerOffset = navbar ? navbar.offsetHeight : 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    });
}
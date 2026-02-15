/**
 * Main JavaScript - Home Made RD
 * Optimizado: Sincronización de carga, Rendimiento y UX.
 */

const CONFIG = {
    SCROLL_THRESHOLD: 50,
    ANIMATION_DELAY: 150, // ms entre tarjetas
    PATHS: {
        header: 'assets/components/header.html',
        footer: 'assets/components/footer.html',
        menuData: 'assets/data/menu.json' // Asegúrate de que esta ruta sea real
    }
};

// Iniciamos la aplicación cuando el DOM base esté listo
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

/**
 * Orquestador Principal
 * Controla el orden exacto de carga para evitar errores.
 */
const initApp = async () => {
    try {
        // 1. CARGA CRÍTICA: Esperamos a que Header y Footer existan antes de seguir
        await Promise.all([
            loadComponent('#header-container', CONFIG.PATHS.header),
            loadComponent('#footer-container', CONFIG.PATHS.footer)
        ]);

        // 2. UI LÓGICA: Ahora que el HTML existe, inicializamos la interactividad
        initNavbar();       // Menú móvil y efectos de scroll
        initSmoothScroll(); // Scroll suave en enlaces
        initAnimations();   // Efectos visuales (Reveal)

        // 3. DATOS: Cargamos el menú dinámico (JSON) en paralelo
        loadMenuSystem();

    } catch (error) {
        console.error("Error crítico inicializando la app:", error);
    }
};

/* =========================================
   SISTEMA DE COMPONENTES (Header/Footer)
   ========================================= */
const loadComponent = async (selector, url) => {
    const container = document.querySelector(selector);
    if (!container) return;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();
        container.innerHTML = html;
    } catch (error) {
        console.warn(`[System] No se pudo cargar ${url}:`, error);
    }
};

/* =========================================
   SISTEMA DE MENÚ (JSON LOADER)
   ========================================= */
const loadMenuSystem = () => {
    fetch(CONFIG.PATHS.menuData)
        .then(response => response.json())
        .then(data => {
            // A. Lógica para INDEX.HTML (Solo destacados)
            const featuredContainer = document.getElementById("featured-menu-container");
            if (featuredContainer) {
                renderMenu(data.filter(item => item.featured), featuredContainer);
            }

            // B. Lógica para MENU.HTML (Por pestañas/categorías)
            // 1. Todos
            const allContainer = document.getElementById("menu-container-all");
            if (allContainer) renderMenu(data, allContainer);

            // 2. Hamburguesas
            const burgersContainer = document.getElementById("menu-container-burgers");
            if (burgersContainer) renderMenu(data.filter(i => i.category === "burgers"), burgersContainer);

            // 3. Especialidades (Hotdogs, etc.)
            const sidesContainer = document.getElementById("menu-container-sides");
            if (sidesContainer) renderMenu(data.filter(i => i.category === "hotdogs" || i.category === "sides"), sidesContainer);

            // 4. Yaroas
            const yaroaContainer = document.getElementById("menu-container-yaroa");
            if (yaroaContainer) renderMenu(data.filter(i => i.category === "yaroas"), yaroaContainer);
        })
        .catch(error => console.error("Error cargando el menú JSON:", error));
};

function renderMenu(items, container) {
    container.innerHTML = ""; // Limpiar spinner de carga

    if (items.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-white"><p>No hay productos en esta categoría.</p></div>';
        return;
    }

    items.forEach((item) => {
        // Mensaje de WhatsApp Pre-configurado
        const waMessage = `Hola Home Made RD, quisiera ordenar: ${item.name}`;
        const waLink = `https://wa.me/18090000000?text=${encodeURIComponent(waMessage)}`;

        // Determinar columnas según la página (Index usa col-lg-6, Menu usa col-lg-4)
        const colClass = container.id === "featured-menu-container" ? "col-lg-6" : "col-lg-4 col-md-6";
        
        // Badge condicional
        const badgeHTML = item.popular ? `<div class="tag-badge premium">Popular</div>` : "";

        const cardHTML = `
            <div class="${colClass} mb-4 fade-in-entry">
                <article class="menu-card h-100">
                    ${badgeHTML}
                    <div class="menu-img-container">
                        <img src="${item.image}" class="menu-img" alt="${item.name}" loading="lazy" decoding="async">
                    </div>
                    <div class="menu-body">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h3 class="h5 fw-bold text-white mb-0">${item.name}</h3>
                            <span class="price-text text-yellow fw-bold">RD$${item.price}</span>
                        </div>
                        <p class="text-grey small mb-4">${item.description}</p>
                        <a href="${waLink}" target="_blank" class="btn btn-warning btn-sm-order w-100 text-center fw-bold text-dark" aria-label="Ordenar ${item.name} por WhatsApp">
                            <i class="fab fa-whatsapp me-2"></i>Ordenar ahora
                        </a>
                    </div>
                </article>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

/* =========================================
   UI & UX (Navbar, Scroll, Animaciones)
   ========================================= */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    // IMPORTANTE: Si el header no cargó, esto evita errores
    if (!navbar) return; 

    // Efecto de fondo al hacer scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > CONFIG.SCROLL_THRESHOLD) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });

    // Cerrar menú móvil al hacer click en un enlace
    const navLinks = document.querySelectorAll('.nav-link');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    // Verificamos si bootstrap está disponible para colapsar el menú
    if (navbarCollapse && typeof bootstrap !== 'undefined') {
        const bsCollapse = new bootstrap.Collapse(navbarCollapse, { toggle: false });
        
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navbarCollapse.classList.contains('show')) {
                    bsCollapse.hide();
                }
            });
        });
    }
}

function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Dejar de observar una vez animado
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function initSmoothScroll() {
    // Delegación de eventos para rendimiento
    document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a[href^="#"]');
        if (!anchor) return;

        const targetId = anchor.getAttribute('href');
        if (targetId === '#' || targetId === '') return;
        
        // Evitamos error si el enlace apunta a otra página (ej: index.html#menu)
        if (targetId.includes('.html')) return; 

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 80;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
}

/* =========================================
   6. SEGURIDAD Y PREVENCIÓN
   ========================================= */

// Deshabilitar menú contextual
document.addEventListener('contextmenu', event => event.preventDefault());

// Bloquear atajos de teclado de herramientas de desarrollador
document.onkeydown = function(e) {
    if(e.keyCode == 123 || 
      (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74)) || 
      (e.ctrlKey && e.keyCode == 85)) {
        return false;
    }
}
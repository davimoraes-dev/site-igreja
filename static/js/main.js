// =============================================
// COMUNIDADE CRISTÃ UM NOVO TEMPO
// main.js - Interatividade do Site
// =============================================

// ===== TOAST NOTIFICATION (global) =====
function showToast(message, type) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 32px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: ${type === 'success' ? '#1a1a1a' : '#ef4444'};
        color: white;
        padding: 14px 28px;
        border-radius: 50px;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        z-index: 9999;
        opacity: 0;
        transition: all 0.3s ease;
        border-left: 4px solid #C9A84C;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function () {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);
    setTimeout(function () {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(function () { toast.remove(); }, 300);
    }, 3500);
}

document.addEventListener('DOMContentLoaded', function () {

    // ===== NAVBAR SCROLL =====
    const navbar = document.getElementById('navbar');

    function handleScroll() {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // ===== MENU MOBILE =====
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    // Cria overlay
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);

    function openMenu() {
        navMenu.classList.add('active');
        navToggle.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    navToggle.addEventListener('click', function () {
        if (navMenu.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    overlay.addEventListener('click', closeMenu);

    // Fecha ao clicar em link do menu
    document.querySelectorAll('.nav-link, .btn-visitar, .btn-contribuir').forEach(function (link) {
        link.addEventListener('click', closeMenu);
    });

    // ===== SCROLL SUAVE PARA ÂNCORAS =====
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
        });
    });

    // ===== ANIMAÇÕES AO ROLAR (Intersection Observer) =====

    // Elementos individuais que aparecem com fade + slide
    const animSingle = document.querySelectorAll(
        '.section-tag, .section-titulo, .section-desc, ' +
        '.sobre-texto p, .sobre-texto .btn-sobre, ' +
        '.pastor-card, .sobre-stat-card, .imagem-placeholder, ' +
        '.form-card, .banner-texto, .banner-acoes, .banner-icon, ' +
        '.cultos-aviso, .endereco-card, .pix-card'
    );

    // Grupos de cards que aparecem com delay escalonado
    const animGroups = [
        '.cultos-grid',
        '.enderecos-grid',
        '.sobre-valores',
        '.lideranca-content'
    ];

    const observerOptions = {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('anim-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Aplica classe inicial e observa elementos simples
    animSingle.forEach(function (el) {
        el.classList.add('anim-hidden');
        observer.observe(el);
    });

    // Aplica delay escalonado nos filhos dos grupos
    animGroups.forEach(function (selector) {
        const group = document.querySelector(selector);
        if (!group) return;
        Array.from(group.children).forEach(function (child, i) {
            child.classList.add('anim-hidden');
            child.style.transitionDelay = (i * 0.12) + 's';
            observer.observe(child);
        });
    });

    // Valores (ícones da seção sobre)
    document.querySelectorAll('.valor-item').forEach(function (el, i) {
        el.classList.add('anim-hidden');
        el.style.transitionDelay = (i * 0.1) + 's';
        observer.observe(el);
    });

    // ===== LINK ATIVO NO SCROLL =====
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function highlightActiveLink() {
        let current = '';
        sections.forEach(function (section) {
            const sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', highlightActiveLink);

    // ===== MÁSCARA DE TELEFONE =====
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function (e) {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length > 11) val = val.slice(0, 11);
            if (val.length > 6) {
                val = '(' + val.slice(0, 2) + ') ' + val.slice(2, 7) + '-' + val.slice(7);
            } else if (val.length > 2) {
                val = '(' + val.slice(0, 2) + ') ' + val.slice(2);
            } else if (val.length > 0) {
                val = '(' + val;
            }
            e.target.value = val;
        });
    }

    // ===== CONTADOR PRÓXIMO CULTO =====
    const cultos = [
        { dia: 0, hora: 10, min: 0, nome: 'Culto da Família', local: 'Biritiba Mirim e Mogi das Cruzes' },
        { dia: 0, hora: 18, min: 0, nome: 'Culto da Família', local: 'Biritiba Mirim' },
        { dia: 1, hora: 19, min: 30, nome: 'Culto de Oração', local: 'Biritiba Mirim' },
        { dia: 3, hora: 19, min: 30, nome: 'Culto de Fé e Milagres', local: 'Biritiba Mirim' },
        { dia: 5, hora: 7,  min: 0,  nome: 'Culto Manhã com Deus', local: 'Biritiba Mirim' },
        { dia: 5, hora: 19, min: 30, nome: 'Culto de Fé e Milagres', local: 'Mogi das Cruzes' },
    ];

    function proximoCulto() {
        const agora = new Date();
        let menor = null;
        let diff = Infinity;

        cultos.forEach(function (c) {
            var alvo = new Date(agora);
            alvo.setHours(c.hora, c.min, 0, 0);
            var diasAte = (c.dia - agora.getDay() + 7) % 7;
            if (diasAte === 0 && alvo <= agora) diasAte = 7;
            alvo.setDate(alvo.getDate() + diasAte);
            var d = alvo - agora;
            if (d < diff) { diff = d; menor = { ...c, alvo }; }
        });

        return menor;
    }

    function atualizarContador() {
        var c = proximoCulto();
        if (!c) return;
        var agora = new Date();
        var diff = c.alvo - agora;
        var dias  = Math.floor(diff / 86400000);
        var horas = Math.floor((diff % 86400000) / 3600000);
        var mins  = Math.floor((diff % 3600000) / 60000);
        var segs  = Math.floor((diff % 60000) / 1000);

        document.getElementById('cnt-dias').textContent  = String(dias).padStart(2, '0');
        document.getElementById('cnt-horas').textContent = String(horas).padStart(2, '0');
        document.getElementById('cnt-min').textContent   = String(mins).padStart(2, '0');
        document.getElementById('cnt-seg').textContent   = String(segs).padStart(2, '0');
        document.getElementById('proximo-nome').textContent  = c.nome;
        document.getElementById('proximo-local').textContent = '📍 ' + c.local;
    }

    const intervals = [];

    if (document.getElementById('cnt-seg')) {
        atualizarContador();
        intervals.push(setInterval(atualizarContador, 1000));
    }

    // ===== SLIDESHOW FOTOS DA IGREJA =====
    const slides = document.querySelectorAll('.slideshow .slide');
    if (slides.length > 0) {
        let current = 0;
        intervals.push(setInterval(function () {
            slides[current].classList.remove('active');
            current = (current + 1) % slides.length;
            slides[current].classList.add('active');
        }, 4000));
    }

    window.addEventListener('beforeunload', function () {
        intervals.forEach(clearInterval);
    });

    // ===== AUTO-FECHAR FLASH MESSAGES =====
    document.querySelectorAll('.flash').forEach(function (flash) {
        setTimeout(function () {
            flash.style.opacity = '0';
            flash.style.transform = 'translateX(100px)';
            flash.style.transition = 'all 0.3s ease';
            setTimeout(function () { flash.remove(); }, 300);
        }, 5000);
    });

    // ===== ACTIVE NAV STYLE =====
    const style = document.createElement('style');
    style.textContent = '.nav-link.active { color: #C9A84C !important; }';
    document.head.appendChild(style);
});

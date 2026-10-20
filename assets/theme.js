// ========== THEME TOGGLE ==========
function syncThemeControls(isLight) {
    var icon = document.getElementById('themeIcon');
    if (icon) icon.textContent = isLight ? '☀️' : '🌙';
    // the menu button's icon/label swap via CSS; this keeps the state readable by screen readers
    var menuToggle = document.getElementById('mobileThemeToggle');
    if (menuToggle) menuToggle.setAttribute('aria-pressed', isLight ? 'true' : 'false');
}

function toggleTheme() {
    var body = document.body;
    body.classList.toggle('light-mode');
    var isLight = body.classList.contains('light-mode');
    syncThemeControls(isLight);
    localStorage.setItem('zarshah-theme', isLight ? 'light' : 'dark');
}

// Load saved theme
(function() {
    var saved = localStorage.getItem('zarshah-theme');
    if (saved === 'light') {
        document.body.classList.add('light-mode');
        syncThemeControls(true);
    }
})();

// Remove splash screen after animation
setTimeout(function() {
    var splash = document.getElementById('splashScreen');
    if (splash) splash.remove();
}, 1400);

(function() {
    // ========== 1. ANNOUNCEMENT BAR: SALE END ==========
    // Counts down to the real end date set in the theme editor (Announcement Bar → "Sale ends",
    // Pakistan time). It never restarts: more than a day out the bar shows the date, in the last
    // 24 hours it counts down, and afterwards only the shipping message stays.
    var DAY_MS = 24 * 60 * 60 * 1000;
    var annBar = document.querySelector('.announcement-bar');
    var annHs = document.querySelectorAll('.ann-h');
    var annMs = document.querySelectorAll('.ann-m');
    var annSs = document.querySelectorAll('.ann-s');

    function parseSaleEnd(value) {
        // "YYYY-MM-DD HH:MM" in Pakistan time (UTC+5). Without a time, the sale runs to the end of that day.
        var m = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?$/.exec(String(value || '').trim());
        if (!m) return 0;
        var hour = m[4] ? +m[4] : 23, minute = m[4] ? +m[5] : 59, second = m[4] ? 0 : 59;
        return Date.UTC(+m[1], +m[2] - 1, +m[3], hour - 5, minute, second);
    }
    var saleEnd = annBar ? parseSaleEnd(annBar.getAttribute('data-sale-end')) : 0;

    function setAll(nodes, value) {
        for (var i = 0; i < nodes.length; i++) nodes[i].textContent = value;
    }

    function setSaleState(state) {
        annBar.classList.toggle('is-no-sale', state === 'none');
        annBar.classList.toggle('is-sale-date', state === 'date');
    }

    function updateAnnCountdown() {
        var remaining = saleEnd - Date.now();
        if (!saleEnd || remaining <= 0) { setSaleState('none'); return false; }
        if (remaining > DAY_MS) { setSaleState('date'); return true; }
        setSaleState('countdown');
        var h = Math.floor(remaining / 3600000);
        var m = Math.floor((remaining % 3600000) / 60000);
        var s = Math.floor((remaining % 60000) / 1000);
        setAll(annHs, String(h).padStart(2, '0'));
        setAll(annMs, String(m).padStart(2, '0'));
        setAll(annSs, String(s).padStart(2, '0'));
        return true;
    }

    if (annBar && updateAnnCountdown()) {
        var annTimer = setInterval(function() {
            if (!updateAnnCountdown()) clearInterval(annTimer);
        }, 1000);
    }

    // ========== Hide announcement bar on scroll-down (all pages except homepage) ==========
    var bar = document.querySelector('.announcement-bar');
    var path = window.location.pathname;
    var isHome = path === '/' || path === '' || /^\/?(\?|$)/.test(path);
    if (bar && !isHome) {
        var lastY = 0;
        var ticking = false;
        window.addEventListener('scroll', function(){
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(function(){
                var y = window.pageYOffset || document.documentElement.scrollTop;
                if (y > 80 && y > lastY) {
                    bar.classList.add('is-hidden');
                } else if (y < lastY || y < 60) {
                    bar.classList.remove('is-hidden');
                }
                lastY = y;
                ticking = false;
            });
        }, { passive: true });
    }

    // ========== 2. NEXT DROP COUNTDOWN (next Thursday 8PM) ==========
    function getNextThursday8PM() {
        var now = new Date();
        var target = new Date(now);
        var dayOfWeek = now.getDay();
        var daysUntilThursday = (4 - dayOfWeek + 7) % 7;
        if (daysUntilThursday === 0 && now.getHours() >= 20) daysUntilThursday = 7;
        target.setDate(now.getDate() + daysUntilThursday);
        target.setHours(20, 0, 0, 0);
        return target.getTime();
    }

    var nextDropEnd = getNextThursday8PM();
    var ndD = document.getElementById('ndDays');
    var ndH = document.getElementById('ndHours');
    var ndM = document.getElementById('ndMinutes');
    var ndS = document.getElementById('ndSeconds');

    if (ndD && ndH && ndM && ndS) {
        var updateNextDrop = function() {
            var remaining = Math.max(0, nextDropEnd - Date.now());
            var d = Math.floor(remaining / 86400000);
            var h = Math.floor((remaining % 86400000) / 3600000);
            var m = Math.floor((remaining % 3600000) / 60000);
            var s = Math.floor((remaining % 60000) / 1000);
            ndD.textContent = String(d).padStart(2, '0');
            ndH.textContent = String(h).padStart(2, '0');
            ndM.textContent = String(m).padStart(2, '0');
            ndS.textContent = String(s).padStart(2, '0');
        };
        updateNextDrop();
        setInterval(updateNextDrop, 1000);
    }

    // ========== 3. SCROLL PROGRESS BAR ==========
    var scrollBar = document.getElementById('scrollProgress');
    if (scrollBar) {
        window.addEventListener('scroll', function() {
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            var progress = (scrollTop / docHeight) * 100;
            scrollBar.style.width = progress + '%';
        }, { passive: true });
    }

    // ========== 4. CURSOR TRAIL ==========
    var dots = [];
    for (var i = 1; i <= 5; i++) {
        dots.push(document.getElementById('cursorDot' + i));
    }
    var mouseX = 0, mouseY = 0;
    var dotPositions = dots.map(function() { return { x: 0, y: 0 }; });

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        document.addEventListener('mousemove', function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dots.forEach(function(d) { d.style.opacity = '0.6'; });
        });

        document.addEventListener('mouseleave', function() {
            dots.forEach(function(d) { d.style.opacity = '0'; });
        });

        function animateDots() {
            var prevX = mouseX, prevY = mouseY;
            for (var i = 0; i < dots.length; i++) {
                var speed = 0.15 - (i * 0.02);
                dotPositions[i].x += (prevX - dotPositions[i].x) * speed;
                dotPositions[i].y += (prevY - dotPositions[i].y) * speed;
                dots[i].style.left = dotPositions[i].x - 4 + 'px';
                dots[i].style.top = dotPositions[i].y - 4 + 'px';
                dots[i].style.opacity = (0.6 - i * 0.1);
                dots[i].style.transform = 'scale(' + (1 - i * 0.15) + ')';
                prevX = dotPositions[i].x;
                prevY = dotPositions[i].y;
            }
            requestAnimationFrame(animateDots);
        }
        animateDots();
    }

    // ========== 5. STICKY ADD TO CART BAR ==========
    var buildSection = document.getElementById('buildTotal');
    var stickyBar = document.getElementById('stickyCartBar');

    if (buildSection && stickyBar) {
        window.addEventListener('scroll', function() {
            var rect = buildSection.getBoundingClientRect();
            if (rect.bottom < 0) {
                stickyBar.classList.add('visible');
            } else {
                stickyBar.classList.remove('visible');
            }
        }, { passive: true });
    }

    // ========== 6. SUIT PREVIEW ==========
    var fabricColors = {
        'Cotton': { main: '#D4A76A', pants: 'rgba(212,167,106,0.7)', border: '#b8935a' },
        'Wash & Wear': { main: '#8899AA', pants: 'rgba(136,153,170,0.7)', border: '#6a7d8f' },
        'Karandi': { main: '#6B4226', pants: 'rgba(107,66,38,0.7)', border: '#8a5a38' },
        'Khaddar': { main: '#5C5C5C', pants: 'rgba(92,92,92,0.7)', border: '#777' }
    };
    var currentFabric = 'Cotton';
    var currentMeters = '3m';

    var swatches = document.querySelectorAll('.swatch');
    var jacket = document.getElementById('suitJacket');
    var pants = document.getElementById('suitPants');
    var collar = document.getElementById('suitCollar');
    var suitLabel = document.getElementById('suitLabel');
    var stickyFabric = document.getElementById('stickyFabric');
    var stickyMeters = document.getElementById('stickyMeters');

    swatches.forEach(function(sw) {
        sw.addEventListener('click', function() {
            swatches.forEach(function(s) {
                s.querySelector('.swatch-circle').classList.remove('swatch-circle--active');
                s.querySelector('.swatch-label').classList.remove('swatch-label--active');
            });
            sw.querySelector('.swatch-circle').classList.add('swatch-circle--active');
            sw.querySelector('.swatch-label').classList.add('swatch-label--active');

            var name = sw.querySelector('.swatch-label').textContent.trim();
            currentFabric = name;
            var colors = fabricColors[name] || fabricColors['Cotton'];
            if (jacket) jacket.style.background = colors.main;
            if (pants) pants.style.background = colors.pants;
            if (collar) collar.style.borderColor = colors.border;
            updateSuitLabel();
        });
    });

    var meterBtns = document.querySelectorAll('.meter-btn');
    meterBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            meterBtns.forEach(function(b) { b.classList.remove('meter-btn--active'); });
            btn.classList.add('meter-btn--active');
            currentMeters = btn.textContent.split(' ')[0].trim();
            updateSuitLabel();
        });
    });

    function updateSuitLabel() {
        if (suitLabel) suitLabel.textContent = currentFabric.toUpperCase() + ' \u2022 ' + currentMeters;
        if (stickyFabric) stickyFabric.textContent = currentFabric;
        if (stickyMeters) stickyMeters.textContent = currentMeters;
    }

    // Tagline showcase scroll animation
    const taglineShowcase = document.querySelector('.tagline-showcase');
    if (taglineShowcase) {
        const tObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.querySelectorAll('.tagline-showcase-urdu, .tagline-showcase-english, .tagline-showcase-thread, .tagline-showcase-logo').forEach(el => {
                        el.classList.add('visible');
                        if (el.classList.contains('tagline-showcase-logo')) {
                            el.style.opacity = '1';
                            el.style.transform = 'translateY(0)';
                        }
                    });
                }
            });
        }, { threshold: 0.4 });
        tObs.observe(taglineShowcase);
    }

})();

// ========== CART COUNT REFRESH ==========
function refreshCartCount() {
    fetch(window.routes ? window.routes.cart_url + '.js' : '/cart.js', { credentials: 'same-origin' })
        .then(function(r){ return r.json(); })
        .then(function(data){
            var el = document.getElementById('navCartCount');
            if (el) {
                el.textContent = data.item_count;
                el.classList.toggle('is-empty', data.item_count === 0);
            }
            var mEl = document.getElementById('mobileMenuCartCount');
            if (mEl) {
                mEl.textContent = data.item_count;
                mEl.classList.toggle('is-empty', data.item_count === 0);
            }
        }).catch(function(){});
}

// Refresh cart on page load and after any form submit
document.addEventListener('DOMContentLoaded', function(){
    refreshCartCount();
    document.querySelectorAll('form[action*="/cart/add"]').forEach(function(form){
        form.addEventListener('submit', function(){
            setTimeout(refreshCartCount, 500);
        });
    });
});

// ========== MOBILE MENU (HAMBURGER DRAWER) ==========
(function(){
    var burger   = document.getElementById('navBurger');
    var menu     = document.getElementById('mobileMenu');
    var backdrop = document.getElementById('mobileMenuBackdrop');
    var closeBtn = document.getElementById('mobileMenuClose');
    if (!burger || !menu || !backdrop) return;

    function openMenu() {
        menu.classList.add('is-open');
        backdrop.classList.add('is-open');
        burger.classList.add('is-open');
        burger.setAttribute('aria-expanded', 'true');
        menu.setAttribute('aria-hidden', 'false');
        document.body.classList.add('mobile-menu-open');
    }

    function closeMenu() {
        menu.classList.remove('is-open');
        backdrop.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('mobile-menu-open');
    }

    burger.addEventListener('click', function(){
        if (menu.classList.contains('is-open')) closeMenu(); else openMenu();
    });
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    backdrop.addEventListener('click', closeMenu);

    document.addEventListener('keydown', function(e){
        if (e.key === 'Escape' && menu.classList.contains('is-open')) closeMenu();
    });

    // Close on link tap (so navigation feels snappy)
    menu.querySelectorAll('.mobile-menu-link').forEach(function(link){
        link.addEventListener('click', function(){ setTimeout(closeMenu, 50); });
    });
})();

// ========== DISCOUNT POPUP (10% OFF) ==========
(function(){
    var popup    = document.getElementById('discountPopup');
    var pill     = document.getElementById('discountPill');
    if (!popup || !pill) return;

    var closeBtn = document.getElementById('discountPopupClose');
    var pillOpen = document.getElementById('discountPillOpen');
    var pillX    = document.getElementById('discountPillClose');
    var form     = document.getElementById('discountPopupForm');

    // Open only once the visitor shows interest: after scrolling a little over half a screen, or after 20 s.
    var AUTO_OPEN_AFTER_MS = 20000;
    var AUTO_OPEN_SCROLL = 0.6;   // share of one screen height
    // After the visitor closes the popup (or the pill), don't auto-open it again for a week.
    var SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;
    var KEY_SNOOZE = 'zarshahPopupSnoozedUntil';
    var KEY_PILL_SNOOZE = 'zarshahPillSnoozedUntil';
    var KEY_DONE = 'zarshahPopupSubmitted';

    function getNum(key) { try { return parseInt(localStorage.getItem(key) || '0', 10) || 0; } catch (e) { return 0; } }
    function setVal(key, val) { try { localStorage.setItem(key, String(val)); } catch (e) {} }

    function openPopup() {
        popup.classList.add('is-open');
        popup.setAttribute('aria-hidden', 'false');
        document.body.classList.add('discount-popup-open');
        pill.classList.remove('is-visible');
        // Only move focus on mouse/trackpad devices — on phones it pops the keyboard over the offer.
        var first = popup.querySelector('input:not([type=hidden])');
        if (first && window.matchMedia('(pointer: fine)').matches) setTimeout(function(){ first.focus(); }, 350);
    }

    function closePopup() {
        popup.classList.remove('is-open');
        popup.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('discount-popup-open');
        setVal(KEY_SNOOZE, Date.now() + SNOOZE_MS);
        if (getNum(KEY_PILL_SNOOZE) < Date.now()) showPill();
    }

    function showPill() {
        pill.hidden = false;
        requestAnimationFrame(function(){ pill.classList.add('is-visible'); });
    }

    function hidePill() {
        pill.classList.remove('is-visible');
        setTimeout(function(){ pill.hidden = true; }, 300);
    }

    // The form posts and reloads the page; show the result (success or error) straight away.
    var hasResult = popup.querySelector('.discount-popup-success, .discount-popup-error');
    if (popup.querySelector('.discount-popup-success')) {
        setVal(KEY_DONE, '1');
        // Report the sign-up once (the success message also shows on a refresh).
        if (getNum('zarshahLeadTracked') !== 1) {
            setVal('zarshahLeadTracked', '1');
            // Both sign-up forms are Shopify "customer" forms, so the popup also shows a footer sign-up's success.
            var signupForm = window.location.hash === '#footerNewsletterForm' ? 'footer_newsletter' : 'discount_popup';
            zarshahTrack('zarshah_popup_signup', { form: signupForm, page_path: window.location.pathname });
        }
    }

    // "Copy" next to the code shown after sign-up (Theme settings → Discount Popup → discount code)
    var copyBtn = popup.querySelector('.discount-popup-copy');
    if (copyBtn) copyBtn.addEventListener('click', function(){
        var code = copyBtn.getAttribute('data-code') || '';
        var done = function(){ copyBtn.textContent = 'Copied'; copyBtn.classList.add('is-copied'); };
        try {
            navigator.clipboard.writeText(code).then(done, function(){});
        } catch (e) {}
    });

    if (hasResult) {
        openPopup();
    } else if (getNum(KEY_DONE) !== 1 && getNum(KEY_SNOOZE) < Date.now()) {
        var autoTimer = setTimeout(autoOpen, AUTO_OPEN_AFTER_MS);
        var onAutoScroll = function() {
            if (window.scrollY > window.innerHeight * AUTO_OPEN_SCROLL) autoOpen();
        };
        function autoOpen() {
            clearTimeout(autoTimer);
            window.removeEventListener('scroll', onAutoScroll);
            if (!popup.classList.contains('is-open')) openPopup();
        }
        window.addEventListener('scroll', onAutoScroll, { passive: true });
    } else if (getNum(KEY_DONE) !== 1 && getNum(KEY_PILL_SNOOZE) < Date.now()) {
        showPill();
    }

    // Keep the corner pill off the first screen: it shows once the visitor has scrolled a little.
    function syncAtTop() { document.body.classList.toggle('zs-at-top', window.scrollY < 120); }
    syncAtTop();
    window.addEventListener('scroll', syncAtTop, { passive: true });

    if (form) form.addEventListener('submit', function(){ setVal(KEY_DONE, '1'); });

    // Wire up events
    closeBtn.addEventListener('click', closePopup);
    if (pillOpen) pillOpen.addEventListener('click', openPopup);
    pillX.addEventListener('click', function(){
        setVal(KEY_PILL_SNOOZE, Date.now() + SNOOZE_MS);
        hidePill();
    });

    // Close on backdrop click (not card)
    popup.addEventListener('click', function(e){
        if (e.target === popup) closePopup();
    });

    // Close on Escape
    document.addEventListener('keydown', function(e){
        if (e.key === 'Escape' && popup.classList.contains('is-open')) closePopup();
    });

})();

// ========== ANALYTICS EVENTS (for Shopify Customer Events) ==========
// Shopify's own pixels already report page views, product views, add-to-cart, checkout and purchases.
// These are the store-specific actions they can't see. A custom pixel (Settings → Customer events)
// subscribes to them and forwards them to GA4, Google Ads and Meta — see growth-plan/.
function zarshahTrack(name, data) {
    try {
        if (window.Shopify && Shopify.analytics && typeof Shopify.analytics.publish === 'function') {
            Shopify.analytics.publish(name, data || {});
        }
    } catch (e) {}
}

(function(){
    function placeOf(el) {
        if (el.closest('.whatsapp-float, .instagram-float, .facebook-float')) return 'floating_button';
        if (el.closest('.mobile-menu')) return 'menu';
        if (el.closest('.site-footer')) return 'footer';
        if (el.closest('.contact-wrap')) return 'contact_page';
        if (el.closest('.product-wrap')) return 'product_page';
        return 'page';
    }

    // Capture phase, so the event is sent before the browser leaves for WhatsApp/Instagram.
    document.addEventListener('click', function(e){
        var link = e.target.closest ? e.target.closest('a[href]') : null;
        if (!link) return;
        var href = link.getAttribute('href') || '';
        var data = { location: placeOf(link), page_path: window.location.pathname };
        if (/(wa\.me|whatsapp\.com)\//i.test(href)) {
            zarshahTrack('zarshah_whatsapp_click', data);
        } else if (/instagram\.com/i.test(href)) {
            data.network = 'instagram';
            zarshahTrack('zarshah_social_click', data);
        } else if (/facebook\.com|fb\.me/i.test(href)) {
            data.network = 'facebook';
            zarshahTrack('zarshah_social_click', data);
        } else if (/^tel:/i.test(href)) {
            zarshahTrack('zarshah_phone_click', data);
        } else if (/^mailto:/i.test(href)) {
            zarshahTrack('zarshah_email_click', data);
        }
    }, true);
})();

// Footer newsletter sign-up on pages without the popup (on the homepage the popup reports it)
(function(){
    if (!document.querySelector('.footer-newsletter-msg--success') || document.getElementById('discountPopup')) return;
    try {
        if (localStorage.getItem('zarshahLeadTracked') === '1') return;
        localStorage.setItem('zarshahLeadTracked', '1');
    } catch (e) {}
    zarshahTrack('zarshah_popup_signup', { form: 'footer_newsletter', page_path: window.location.pathname });
})();

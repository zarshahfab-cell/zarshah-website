// ========== THEME TOGGLE ==========
function toggleTheme() {
    var body = document.body;
    var icon = document.getElementById('themeIcon');
    var label = document.getElementById('themeLabel');
    body.classList.toggle('light-mode');
    var isLight = body.classList.contains('light-mode');
    icon.textContent = isLight ? '☀️' : '🌙';
    label.textContent = isLight ? 'DARK' : 'LIGHT';
    localStorage.setItem('zarshah-theme', isLight ? 'light' : 'dark');
}

// Load saved theme
(function() {
    var saved = localStorage.getItem('zarshah-theme');
    if (saved === 'light') {
        document.body.classList.add('light-mode');
        var icon = document.getElementById('themeIcon');
        var label = document.getElementById('themeLabel');
        if (icon) icon.textContent = '☀️';
        if (label) label.textContent = 'DARK';
    }
})();

// Remove splash screen after animation
setTimeout(function() {
    var splash = document.getElementById('splashScreen');
    if (splash) splash.remove();
}, 3800);

(function() {
    // ========== 1. ANNOUNCEMENT BAR COUNTDOWN (24 hours from page load) ==========
    var endTime = Date.now() + 24 * 60 * 60 * 1000;
    var annH = document.getElementById('annHours');
    var annM = document.getElementById('annMinutes');
    var annS = document.getElementById('annSeconds');

    function updateAnnCountdown() {
        var remaining = Math.max(0, endTime - Date.now());
        var h = Math.floor(remaining / 3600000);
        var m = Math.floor((remaining % 3600000) / 60000);
        var s = Math.floor((remaining % 60000) / 1000);

        if (annH) annH.textContent = String(h).padStart(2, '0');
        if (annM) annM.textContent = String(m).padStart(2, '0');
        if (annS) annS.textContent = String(s).padStart(2, '0');
    }

    updateAnnCountdown();
    setInterval(updateAnnCountdown, 1000);

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

    function updateNextDrop() {
        var remaining = Math.max(0, nextDropEnd - Date.now());
        var d = Math.floor(remaining / 86400000);
        var h = Math.floor((remaining % 86400000) / 3600000);
        var m = Math.floor((remaining % 3600000) / 60000);
        var s = Math.floor((remaining % 60000) / 1000);
        ndD.textContent = String(d).padStart(2, '0');
        ndH.textContent = String(h).padStart(2, '0');
        ndM.textContent = String(m).padStart(2, '0');
        ndS.textContent = String(s).padStart(2, '0');
    }

    updateNextDrop();
    setInterval(updateNextDrop, 1000);

    // ========== 3. SCROLL PROGRESS BAR ==========
    var scrollBar = document.getElementById('scrollProgress');
    window.addEventListener('scroll', function() {
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        var progress = (scrollTop / docHeight) * 100;
        scrollBar.style.width = progress + '%';
    }, { passive: true });

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
            if (el) el.textContent = data.item_count;
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

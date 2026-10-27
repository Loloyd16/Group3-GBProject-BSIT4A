(() => {
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const range = (v, a, b) => clamp((v - a) / (b - a));
    const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = document.documentElement;

    // ====================================================
    // 1. SMOOTH SCROLL & ANCHORS
    // ====================================================
    let lenis = null;
    if (!reduce && typeof window.Lenis === 'function') {
        lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    }
    const navH = () => $('#main-nav').offsetHeight;
    function goTo(target) {
        if (target === 0) {
            lenis ? lenis.scrollTo(0, { duration: 2 }) : scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
            return;
        }
        const y = target.getBoundingClientRect().top + scrollY - navH() + 1;
        lenis ? lenis.scrollTo(y, { duration: 1.6 }) : scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    }
    document.addEventListener('click', e => {
        const a = e.target.closest('a[href^="#"]');
        if (!a) return;
        const id = a.getAttribute('href');
        if (id.length < 2) return;
        const el = id === '#home' ? 0 : document.getElementById(id.slice(1));
        if (el === null) return;
        e.preventDefault();
        closeMenu();
        closeDropdowns();
        // the hero is tall: "home" goes to the first screen of it
        goTo(el);
        history.replaceState(null, '', id);
    });

    // ====================================================
    // 2. THE SEA SCENE
    // ====================================================
    const back = $('#sea-back'), fore = $('#sea-fore');
    const bx = back.getContext('2d'), fx = fore.getContext('2d');
    const ship = $('#ship'), scope = $('#scope'), head = $('#gulliver-head'), lantern = $('#lantern-glow');
    let W = 0, H = 0, DPR = 1, U = 1, AMP = 1;

    function resize() {
        DPR = Math.min(window.devicePixelRatio || 1, 1.75);
        W = window.innerWidth; H = window.innerHeight;
        U = Math.max(.62, Math.min(W, H * 1.6) / 1440 * 1.6);
        AMP = W < 700 ? .55 : 1;
        for (const c of [back, fore]) { c.width = Math.round(W * DPR); c.height = Math.round(H * DPR); }
        bx.setTransform(DPR, 0, 0, DPR, 0, 0);
        fx.setTransform(DPR, 0, 0, DPR, 0, 0);
        measure();
    }

    const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
    const mixc = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
    const COLORS = ['skyT', 'skyH', 'seaH', 'seaD', 'sun', 'cloud', 'cloudS', 'haze', 'foam'];
    const PRESETS = {
        dawn:   { skyT: '#a3bfcd', skyH: '#f3dcc1', seaH: '#a8bab6', seaD: '#2b5466', sun: '#fff1d6', cloud: '#fbf4ea', cloudS: '#ddd0c5', haze: '#c4c9c3', foam: '#f6f1e6', sunX: .84, sunAlt: .1, sunA: 1, moonA: 0, stars: 0, night: 0, shipX: .56, shipS: 1, isl: [0, 0, 0, 0] },
        day:    { skyT: '#7aaac7', skyH: '#e1e9ea', seaH: '#8aabb3', seaD: '#23536a', sun: '#fffaf0', cloud: '#ffffff', cloudS: '#d4dde2', haze: '#b6c6ca', foam: '#f8f6f0', sunX: .72, sunAlt: .62, sunA: 1, moonA: 0, stars: 0, night: 0, shipX: .6, shipS: .9, isl: [0, 0, 0, 0] },
        course: { skyT: '#7aa8c4', skyH: '#e6e8e2', seaH: '#8eaab0', seaD: '#225167', sun: '#fffaf0', cloud: '#ffffff', cloudS: '#d2dbe0', haze: '#b6c6ca', foam: '#f8f6f0', sunX: .52, sunAlt: .78, sunA: 1, moonA: 0, stars: 0, night: 0, shipX: .64, shipS: .95, isl: [0, 0, 0, 0] },
        landho: { skyT: '#86acc2', skyH: '#ebe3d5', seaH: '#98aaa9', seaD: '#24495b', sun: '#fff3dc', cloud: '#fdf8f0', cloudS: '#d9d3cb', haze: '#aab7b6', foam: '#f6f1e6', sunX: .62, sunAlt: .45, sunA: 1, moonA: 0, stars: 0, night: 0, shipX: .3, shipS: .8, isl: [1, 1, 1, 1] },
        night:  { skyT: '#0a141a', skyH: '#21384a', seaH: '#2a4253', seaD: '#07121a', sun: '#f3ecd9', cloud: '#2c404e', cloudS: '#16242d', haze: '#273d4e', foam: '#9db1bb', sunX: .76, sunAlt: .52, sunA: 0, moonA: 1, stars: 1, night: 1, shipX: .42, shipS: .9, isl: [0, 0, 0, 0] }
    };
    for (const p of Object.values(PRESETS)) for (const k of COLORS) p[k] = hex(p[k]);
    const S = JSON.parse(JSON.stringify(PRESETS.dawn));

    // clouds, stars, gulls, spray
    const rand = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    const clouds = Array.from({ length: 8 }, (_, i) => {
        const n = 5 + Math.floor(rand() * 4);
        return {
            x: i / 8 * 1.5 + rand() * .08, y: .14 + rand() * .5, s: .45 + rand() * .7, v: .006 + rand() * .01,
            puffs: Array.from({ length: n }, (_, j) => ({ dx: (j / (n - 1) - .5) * 1.7 + (rand() - .5) * .2, dy: -rand() * .45, r: .32 + rand() * .32 }))
        };
    });
    const stars = Array.from({ length: 140 }, () => ({ x: rand(), y: rand() * .95, r: .4 + rand() * 1.2, p: rand() * 6 }));
    const gulls = Array.from({ length: 4 }, (_, i) => ({ x: rand(), y: .18 + rand() * .3, s: .7 + rand() * .6, p: rand() * 6, v: .012 + rand() * .01 }));
    const spray = [];

    // geometry of the scene
    const hz = () => (W < 700 ? .6 : .6) * H;          // horizon
    const shipLine = () => (W < 700 ? .83 : .84) * H;  // where the ship floats
    const BACK_LAYERS = [
        { d: .1, a: .0025, f: 9, s: .5, par: .15 },
        { d: .34, a: .004, f: 6.5, s: .7, par: .35 },
        { d: .68, a: .007, f: 4.6, s: .9, par: .6 }
    ];
    const FORE_LAYERS = [
        { off: .006, a: .009, f: 3.4, s: 1.1, par: .9 },
        { off: .09, a: .012, f: 2.6, s: 1.25, par: 1.25 }
    ];
    let T = 0, travel = 0, smoothY = 0;

    function wave(x, L) {
        const X = (x + travel * L.par) / W * Math.PI * 2;
        return H * L.a * AMP * (Math.sin(X * L.f + T * L.s) + .5 * Math.sin(X * L.f * 2.3 - T * L.s * 1.3 + 1.7) + .22 * Math.sin(X * L.f * 5.1 + T * L.s * 2.1));
    }

    function islandPositions() {
        const y = hz();
        return {
            lil: { x: W * .1, y },
            brob: { x: W * (W < 700 ? .3 : .34), y },
            lap: { x: W * (W < 700 ? .76 : .79), y: y * (W < 700 ? .36 : .42) + Math.sin(T * .6) * 6 * U },
            houy: { x: W * .62, y }
        };
    }

    function drawCloud(ctx, c, cx, cy, R) {
        // flat-bottomed cumulus: shaded puffs, lit puffs nudged up, cut level underneath
        ctx.save();
        ctx.beginPath(); ctx.rect(cx - R * 3, cy - R * 3, R * 6, R * 3.3); ctx.clip();
        ctx.fillStyle = rgb(S.cloudS);
        for (const p of c.puffs) { ctx.beginPath(); ctx.arc(cx + p.dx * R, cy + p.dy * R, p.r * R, 0, 7); ctx.fill(); }
        ctx.fillStyle = rgb(S.cloud);
        for (const p of c.puffs) { ctx.beginPath(); ctx.arc(cx + p.dx * R - R * .05, cy + p.dy * R - R * .12, p.r * R * .95, 0, 7); ctx.fill(); }
        ctx.restore();
    }

    function drawIslands(ctx) {
        const P = islandPositions(), haze = S.haze, u = U;
        ctx.save();
        // Lilliput — a low island with a toy-sized town
        if (S.isl[0] > .01) {
            const { x, y } = P.lil, r = 1 - S.isl[0];
            ctx.globalAlpha = S.isl[0];
            ctx.fillStyle = rgb(haze);
            ctx.beginPath(); ctx.moveTo(x - 110 * u, y + r * 20 * u);
            ctx.quadraticCurveTo(x, y - 18 * u + r * 20 * u, x + 110 * u, y + r * 20 * u); ctx.fill();
            for (let i = 0; i < 9; i++) ctx.fillRect(x - 46 * u + i * 11 * u, y - 14 * u - (i % 3) * 4 * u + r * 20 * u, 3 * u, 10 * u + (i % 3) * 4 * u);
        }
        // Brobdingnag — mountains of giants
        if (S.isl[1] > .01) {
            const { x, y } = P.brob, r = (1 - S.isl[1]) * 60 * u;
            ctx.globalAlpha = S.isl[1];
            ctx.fillStyle = rgb(mixc(haze, S.seaD, .12));
            ctx.beginPath(); ctx.moveTo(x - 240 * u, y);
            const pk = [[-170, -70], [-110, -150], [-60, -100], [0, -210], [60, -120], [120, -170], [190, -60], [250, 0]];
            for (const [dx, dy] of pk) ctx.lineTo(x + dx * u, y + dy * u + r);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = rgb(mixc(haze, [255, 255, 255], .45));
            ctx.beginPath(); ctx.moveTo(x - 20 * u, y - 180 * u + r); ctx.lineTo(x, y - 210 * u + r); ctx.lineTo(x + 22 * u, y - 178 * u + r); ctx.lineTo(x + 6 * u, y - 186 * u + r); ctx.closePath(); ctx.fill();
        }
        // Houyhnhnmland — soft meadow hills
        if (S.isl[3] > .01) {
            const { x, y } = P.houy, r = (1 - S.isl[3]) * 30 * u;
            ctx.globalAlpha = S.isl[3];
            ctx.fillStyle = rgb(mixc(haze, [120, 150, 110], .25));
            ctx.beginPath(); ctx.moveTo(x - 150 * u, y);
            ctx.bezierCurveTo(x - 90 * u, y - 50 * u + r, x - 40 * u, y - 46 * u + r, x, y - 30 * u + r);
            ctx.bezierCurveTo(x + 50 * u, y - 60 * u + r, x + 110 * u, y - 40 * u + r, x + 160 * u, y);
            ctx.fill();
            ctx.beginPath(); ctx.arc(x + 46 * u, y - 62 * u + r, 13 * u, 0, 7); ctx.fill();
            ctx.fillRect(x + 44 * u, y - 54 * u + r, 4 * u, 14 * u);
        }
        // Laputa — the flying island, hanging in the sky
        if (S.isl[2] > .01) {
            const { x, y } = P.lap, s = u;
            ctx.globalAlpha = S.isl[2];
            const col = mixc(haze, S.seaD, .28);
            ctx.fillStyle = rgb(col);
            ctx.beginPath();
            ctx.moveTo(x - 92 * s, y);
            ctx.quadraticCurveTo(x - 60 * s, y + 40 * s, x - 18 * s, y + 70 * s);
            ctx.lineTo(x, y + 92 * s); ctx.lineTo(x + 16 * s, y + 66 * s);
            ctx.quadraticCurveTo(x + 64 * s, y + 38 * s, x + 92 * s, y);
            ctx.closePath(); ctx.fill();
            ctx.beginPath(); ctx.ellipse(x, y, 94 * s, 13 * s, 0, 0, 7); ctx.fill();
            const towers = [[-64, 22], [-40, 36], [-14, 50], [12, 30], [36, 44], [62, 24]];
            for (const [dx, h] of towers) {
                ctx.fillRect(x + dx * s - 6 * s, y - h * s, 12 * s, h * s);
                ctx.beginPath(); ctx.moveTo(x + dx * s - 7 * s, y - h * s); ctx.lineTo(x + dx * s, y - (h + 12) * s); ctx.lineTo(x + dx * s + 7 * s, y - h * s); ctx.fill();
            }
            // a telescope on the observatory, looking back
            ctx.save(); ctx.translate(x - 14 * s, y - 52 * s); ctx.rotate(-.5);
            ctx.fillRect(0, -2 * s, 26 * s, 4 * s); ctx.restore();
            // cloud skirts
            ctx.fillStyle = rgb(S.cloud, .9);
            for (const [dx, dy, r] of [[-96, 8, 18], [-78, 16, 14], [84, 8, 16], [100, 14, 12], [-20, 76, 10], [10, 84, 8]]) {
                ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, r * s, 0, 7); ctx.fill();
            }
        }
        ctx.restore();
    }

    function drawBack() {
        const ctx = bx, hy = hz();
        ctx.clearRect(0, 0, W, H);
        // sky
        const g = ctx.createLinearGradient(0, 0, 0, hy);
        g.addColorStop(0, rgb(S.skyT)); g.addColorStop(1, rgb(S.skyH));
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, hy + 2);
        // stars
        if (S.stars > .01) {
            ctx.fillStyle = '#fff';
            for (const s of stars) {
                ctx.globalAlpha = S.stars * (.45 + .55 * Math.sin(T * 1.4 + s.p) ** 2) * (1 - s.y * .6);
                ctx.beginPath(); ctx.arc(s.x * W, s.y * hy, s.r, 0, 7); ctx.fill();
            }
            ctx.globalAlpha = 1;
        }
        // sun / moon
        const sx = S.sunX * W, sy = hy - S.sunAlt * hy, glowA = Math.max(S.sunA, S.moonA * .6);
        if (glowA > .01) {
            const R = (S.moonA > S.sunA ? 26 : 38) * U;
            const halo = ctx.createRadialGradient(sx, sy, R * .6, sx, sy, R * 6);
            halo.addColorStop(0, rgb(S.sun, .45 * glowA)); halo.addColorStop(1, rgb(S.sun, 0));
            ctx.fillStyle = halo; ctx.fillRect(sx - R * 6, sy - R * 6, R * 12, R * 12);
            ctx.fillStyle = rgb(S.sun, glowA);
            ctx.beginPath(); ctx.arc(sx, sy, R, 0, 7); ctx.fill();
            if (S.moonA > .01) { ctx.fillStyle = rgb(S.skyT, S.moonA * .9); ctx.beginPath(); ctx.arc(sx + R * .45, sy - R * .25, R * .9, 0, 7); ctx.fill(); }
        }
        // clouds
        for (const c of clouds) {
            const span = 1.5;
            let cx = ((c.x + T * c.v * .05 - travel * .00004 * c.s) % span + span) % span - .25;
            const R = 52 * U * c.s;
            drawCloud(ctx, c, cx * W, c.y * hy * .9, R);
        }
        // gulls
        if (S.night < .6) {
            ctx.strokeStyle = rgb(mixc([40, 46, 50], S.skyT, .2), .75 * (1 - S.night));
            ctx.lineWidth = 1.8 * U; ctx.lineCap = 'round';
            for (const b of gulls) {
                const x = ((b.x + T * b.v * .1) % 1.3 - .15) * W, y = b.y * hy + Math.sin(T * .7 + b.p) * 8 * U, s = 11 * U * b.s, f = Math.sin(T * 5 + b.p) * 5 * U * b.s;
                ctx.beginPath(); ctx.moveTo(x - s, y - f); ctx.quadraticCurveTo(x - s * .4, y - s * .6, x, y); ctx.quadraticCurveTo(x + s * .4, y - s * .6, x + s, y - f); ctx.stroke();
            }
        }
        drawIslands(ctx);
        // sea body
        const sg = ctx.createLinearGradient(0, hy, 0, H);
        sg.addColorStop(0, rgb(S.seaH)); sg.addColorStop(1, rgb(S.seaD));
        ctx.fillStyle = sg; ctx.fillRect(0, hy, W, H - hy);
        // glitter under the sun / moon
        if (glowA > .05 && S.sunAlt < .8) {
            ctx.fillStyle = rgb(S.sun, .55 * glowA);
            for (let i = 0; i < 26; i++) {
                const yy = hy + 4 + i * i * .55 * U, w = (6 + i * 2.2) * U * (.5 + .5 * Math.sin(T * 2 + i * 1.7));
                if (yy > shipLine()) break;
                ctx.fillRect(sx - w / 2 + Math.sin(T + i) * 6 * U, yy, w, 1.5 * U);
            }
        }
        // far wave bands
        const sl = shipLine();
        BACK_LAYERS.forEach((L, i) => {
            const base = hy + (sl - hy) * L.d;
            ctx.fillStyle = rgb(mixc(S.seaH, S.seaD, .25 + i * .2), .9);
            ctx.beginPath(); ctx.moveTo(0, H);
            for (let x = 0; x <= W + 12; x += 12) ctx.lineTo(x, base + wave(x, L));
            ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = rgb(S.foam, .18 + i * .06); ctx.lineWidth = 1.2;
            ctx.beginPath();
            for (let x = 0; x <= W + 12; x += 12) { const y = base + wave(x, L); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
            ctx.stroke();
        });
    }

    let shipPose = { x: 0, y: 0, w: 0, h: 0, rot: 0, bow: [0, 0] };
    function drawFore() {
        const ctx = fx, sl = shipLine();
        ctx.clearRect(0, 0, W, H);
        // spray at the bow
        if (Math.random() < .55) {
            const [bx0, by0] = shipPose.bow;
            spray.push({ x: bx0 + (Math.random() - .3) * 14 * U, y: by0, vx: (Math.random() * 1.6 + .4) * U, vy: -(Math.random() * 2.4 + .8) * U, life: 1 });
        }
        ctx.fillStyle = rgb(S.foam);
        for (let i = spray.length - 1; i >= 0; i--) {
            const p = spray[i];
            p.x += p.vx; p.y += p.vy; p.vy += .09 * U; p.life -= .022;
            if (p.life <= 0) { spray.splice(i, 1); continue; }
            ctx.globalAlpha = p.life * .8;
            ctx.beginPath(); ctx.arc(p.x, p.y, 2.2 * U * p.life + .6, 0, 7); ctx.fill();
        }
        ctx.globalAlpha = 1;
        FORE_LAYERS.forEach((L, i) => {
            const base = sl + H * L.off;
            ctx.fillStyle = rgb(mixc(S.seaH, S.seaD, .62 + i * .22));
            ctx.beginPath(); ctx.moveTo(0, H);
            for (let x = 0; x <= W + 10; x += 10) ctx.lineTo(x, base + wave(x, L));
            ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
            // foam caps only on the crests
            ctx.strokeStyle = rgb(S.foam, .55 - i * .15); ctx.lineWidth = 2.4 * U; ctx.lineCap = 'round';
            ctx.beginPath();
            let on = false;
            for (let x = 0; x <= W + 8; x += 8) {
                const y = base + wave(x, L), crest = wave(x, L) < -H * L.a * .55;
                if (crest) { on ? ctx.lineTo(x, y) : ctx.moveTo(x, y); on = true; } else on = false;
            }
            ctx.stroke();
        });
    }

    // telescope: lowered at the start of the hero, then aimed
    let scopeAngle = 62, headAngle = 0;
    function placeShip(raise, aimAt) {
        const sl = shipLine();
        const L = FORE_LAYERS[0];
        const wBase = Math.min(W * (W < 700 ? .92 : .5), H * .62 * (680 / 440));
        const w = wBase * S.shipS, h = w * 440 / 680;
        const x = clamp(S.shipX * W, Math.min(W / 2, w * .46), Math.max(W / 2, W - w * .46));
        const y = sl + H * L.off + wave(x, L) - 2 * U;
        const slope = (wave(x + 40, L) - wave(x - 40, L)) / 80;
        const rot = Math.atan(slope) * 57.3 * .7 + Math.sin(T * .8) * 1.1;
        ship.style.width = w + 'px';
        ship.style.transform = `translate(${x - w * .5}px, ${y - h * .909}px) rotate(${rot}deg)`;
        shipPose = { x, y, w, h, rot, bow: [x + w * (600 - 340) / 680, y - h * .02] };
        // aim the telescope
        const k = w / 680;
        const px = x + (543 - 340) * k, py = y - (400 - 256) * k;
        let aim = -4 + Math.sin(T * .35) * 4;
        if (aimAt) aim = clamp(Math.atan2(aimAt[1] - py, aimAt[0] - px) * 57.3 - rot, -38, 12);
        const target = lerp(62, aim, raise);
        scopeAngle += (target - scopeAngle) * .12;
        headAngle = clamp(scopeAngle, -40, 10) * .45 * raise;
        scope.setAttribute('transform', `rotate(${scopeAngle.toFixed(2)} 543 256)`);
        head.setAttribute('transform', `rotate(${headAngle.toFixed(2)} 538 248)`);
        lantern.setAttribute('opacity', (S.night * (.5 + .2 * Math.sin(T * 3))).toFixed(2));
        ship.style.filter = S.night > .02 ? `brightness(${(1 - S.night * .55).toFixed(2)})` : '';
    }

    // ====================================================
    // 3. HERO SEQUENCE
    // ====================================================
    const hero = $('#home');
    const lines = $$('.hero-title .ln');
    const heroDek = $('.hero-dek'), heroActions = $('.hero-actions');
    const aside = $('#hero-aside'), cue = $('#scroll-cue'), meta = $('#hero-meta');
    const lens = $('#lens'), lensImg = $('#lens-img'), lensQuote = $('#lens-quote'), ring = $('#lens-ring');
    let heroTop = 0, heroLen = 1;

    function heroFrame(hp) {
        const out = range(hp, .03, .2);
        lines[0].style.transform = `translate3d(${-out * W * .22}px, ${-out * 40}px, 0)`;
        lines[1].style.transform = `translate3d(${out * W * .22}px, ${-out * 40}px, 0)`;
        lines.forEach(l => {
            l.style.opacity = 1 - out;
            l.style.filter = out > .01 ? `blur(${out * 10}px)` : '';
            l.style.visibility = out >= 1 ? 'hidden' : '';
        });
        const out2 = range(hp, .01, .12);
        heroDek.style.opacity = heroActions.style.opacity = 1 - out2;
        heroActions.style.pointerEvents = out2 > .5 ? 'none' : '';
        heroDek.style.transform = heroActions.style.transform = `translateY(${-out2 * 30}px)`;
        cue.style.opacity = meta.style.opacity = 1 - range(hp, 0, .05);
        const a = range(hp, .22, .3) * (1 - range(hp, .48, .55));
        aside.style.opacity = a;
        aside.style.visibility = a <= 0 ? 'hidden' : '';
        aside.style.transform = `translateY(${(1 - range(hp, .22, .3)) * 24}px)`;

        // the scene during the hero
        S.shipX = lerp(W < 700 ? .5 : .74, W < 700 ? .46 : .42, ease(range(hp, .04, .45)));
        S.shipS = lerp(W < 700 ? .78 : .74, W < 700 ? .92 : 1.15, ease(range(hp, .04, .45)));
        S.isl[2] = ease(range(hp, .16, .4));
        S.sunAlt = lerp(.08, .22, hp);

        // lens opens from the flying island
        const P = islandPositions().lap;
        const diag = Math.hypot(Math.max(P.x, W - P.x), Math.max(P.y, H - P.y));
        const lp = ease(range(hp, .5, .9));
        const r = lp * diag * 1.04;
        lens.style.clipPath = `circle(${r.toFixed(1)}px at ${P.x.toFixed(1)}px ${P.y.toFixed(1)}px)`;
        lens.style.visibility = r < 1 ? 'hidden' : 'visible';
        lensImg.style.transform = `scale(${lerp(1.5, 1.02, lp)})`;
        lensImg.style.transformOrigin = '48% 52%';
        const ringOn = r > 1 && r < diag;
        ring.style.opacity = ringOn ? 1 : 0;
        if (ringOn) {
            ring.style.width = ring.style.height = (r * 2 + 20) + 'px';
            ring.style.transform = `translate(${P.x - r - 10}px, ${P.y - r - 10}px)`;
        }
        const q = range(hp, .8, .92);
        lensQuote.style.opacity = q;
        lensQuote.style.transform = `translateY(${(1 - q) * 30}px)`;
        return P;
    }

    // ====================================================
    // 4. SCROLL-LINKED PIECES
    // ====================================================
    const sceneEls = $$('[data-scene]');
    const logEls = $$('[data-log]');
    const glasses = $$('.glass');
    const course = $('#course'), courseFill = $('#course-fill'), courseBoat = $('#course-boat'), legs = $$('.leg');
    const refs = $('#references'), refsTrack = $('#refs-track'), refsFill = $('#refs-fill');
    const lessonTitle = $('#lesson-title'), wordmark = $('#wordmark');
    const parallaxImgs = $$('.parallax-img');
    const windows = $$('.window');
    let refsWide = false, refsDist = 0;

    // word-by-word scrub on the intro statement
    const scrubs = $$('.scrub').map(el => {
        const words = el.textContent.trim().split(/\s+/);
        el.innerHTML = words.map(w => `<span class="wd">${w}</span>`).join(' ');
        return { el, words: $$('.wd', el) };
    });

    function measure() {
        heroTop = hero.offsetTop;
        heroLen = Math.max(1, hero.offsetHeight - H);
        refsWide = window.innerWidth >= 1000 && !reduce;
        if (refsWide) {
            refsDist = Math.max(0, refsTrack.scrollWidth - W);
            refs.style.height = (H + refsDist) + 'px';
        } else {
            refs.style.height = '';
            refsTrack.style.transform = '';
        }
    }

    function scrollPieces(y) {
        // realms: the engraving opens through a lens
        for (const g of glasses) {
            const r = g.getBoundingClientRect();
            if (r.bottom < -50 || r.top > H + 50) continue;
            const p = reduce ? 1 : easeOut(range((H - r.top) / (H * .75 + r.height * .3), 0, 1));
            const img = g.querySelector('img'), inner = g.firstElementChild, kind = g.dataset.lens;
            let cx = 50, cy = 50, rad = lerp(8, 76, p), sc = 1, ty = 0;
            if (kind === 'small') { rad = lerp(3, 76, p); sc = lerp(1.35, 1, p); }
            if (kind === 'giant') { rad = lerp(30, 76, p); sc = lerp(1.8, 1.02, p); }
            if (kind === 'float') { cy = lerp(0, 50, p); rad = lerp(14, 78, p); ty = Math.sin(T * .9) * 6; sc = 1.05; }
            if (kind === 'noble') { cx = lerp(0, 50, p); rad = lerp(12, 78, p); sc = lerp(1.15, 1, p); }
            inner.style.clipPath = p >= .999 ? 'none' : `circle(${rad}% at ${cx}% ${cy}%)`;
            img.style.transform = `translateY(${ty}px) scale(${sc})`;
        }
        // plot: the course line fills and the boat sails along it
        {
            const r = course.getBoundingClientRect();
            const p = clamp((H * .55 - r.top) / r.height);
            courseFill.style.transform = `scaleY(${p})`;
            courseBoat.style.transform = `translateY(${p * r.height}px) rotate(${Math.sin(T * 1.6) * 6}deg)`;
            legs.forEach(l => {
                const lr = l.getBoundingClientRect();
                l.classList.toggle('passed', lr.top + lr.height / 2 < H * .55);
            });
        }
        // references: sideways passage
        if (refsWide) {
            const r = refs.getBoundingClientRect();
            const p = clamp(-r.top / Math.max(1, refsDist));
            refsTrack.style.transform = `translate3d(${-p * refsDist}px,0,0)`;
            refsFill.style.transform = `scaleX(${p})`;
        }
        // word scrub
        for (const s of scrubs) {
            const r = s.el.getBoundingClientRect();
            const p = clamp((H * .85 - r.top) / (r.height + H * .4));
            const n = Math.round(p * s.words.length);
            s.words.forEach((w, i) => w.classList.toggle('lit', i < n));
        }
        // lesson title grows into its full size
        {
            const r = lessonTitle.getBoundingClientRect();
            const p = easeOut(clamp((H - r.top) / (H * .8)));
            lessonTitle.style.transform = `scale(${lerp(.82, 1, p)})`;
            lessonTitle.style.opacity = lerp(.15, 1, p);
        }
        // footer wordmark rises
        {
            const r = wordmark.getBoundingClientRect();
            const p = clamp((H - r.top) / (H * .6));
            wordmark.style.transform = `translateY(${(1 - easeOut(p)) * 60}px)`;
        }
        // portrait parallax
        for (const img of parallaxImgs) {
            const r = img.parentElement.getBoundingClientRect();
            if (r.bottom < 0 || r.top > H) continue;
            const p = (r.top + r.height / 2 - H / 2) / H;
            img.style.transform = `translateY(${p * -40}px) scale(1.12)`;
        }
    }

    // ====================================================
    // 5. SHIP'S LOG, NAV, PROGRESS
    // ====================================================
    const hud = $('#hud'), hudFill = $('#hud-fill');
    const hudDate = $('#hud-date'), hudPlace = $('#hud-place');
    const progress = $('#reading-progress');
    const nav = $('#main-nav');
    let lastLog = '', lastY = 0;

    function setLog(text) {
        if (text === lastLog) return;
        lastLog = text;
        const [d, p] = text.split('|');
        hudDate.textContent = d; hudPlace.textContent = p;
        for (const el of [hudDate.parentElement, hudPlace.parentElement]) {
            el.classList.remove('roll'); void el.offsetWidth; el.classList.add('roll');
        }
    }

    function activeAt(els, line) {
        let hit = null;
        for (const el of els) {
            const r = el.getBoundingClientRect();
            if (r.top <= line && r.bottom > line) hit = el;
        }
        return hit;
    }

    function chrome(y, hp) {
        const max = document.documentElement.scrollHeight - H;
        const p = max > 0 ? y / max : 0;
        progress.style.transform = `scaleX(${p})`;
        hudFill.style.transform = `scaleY(${p})`;

        // the deepest element carrying a log wins (realms inside places)
        let best = null;
        for (const el of logEls) {
            const r = el.getBoundingClientRect();
            if (r.top <= H * .5 && r.bottom > H * .5) { if (!best || best.contains(el)) best = el; }
        }
        if (best) setLog(best.dataset.log);

        const sceneEl = activeAt(sceneEls, H * .5);
        const isNight = sceneEl && sceneEl.dataset.scene === 'night';
        hud.classList.toggle('is-on', hp > .04);
        // the readout sits at the foot of the screen: light over the sea or the night
        const footEl = activeAt(sceneEls, H - 50);
        const overSea = footEl && !footEl.classList.contains('sheet');
        hud.classList.toggle('is-light', !!(isNight || overSea || (footEl && footEl.dataset.scene === 'night')));
        hud.classList.toggle('on-paper', !!(footEl && footEl.classList.contains('sheet')));

        // nav: solid once the hero is done; dark over night; hides while reading down
        const navEl = activeAt(sceneEls, 40);
        const overPaper = navEl && (navEl.classList.contains('sheet'));
        nav.classList.toggle('is-solid', y > heroTop + heroLen + H * .5 || !!overPaper);
        nav.classList.toggle('is-dark', !!(navEl && navEl.dataset.scene === 'night'));
        const menuOpen = $('#mobile-menu').classList.contains('open');
        if (!menuOpen && Math.abs(y - lastY) > 4) {
            nav.classList.toggle('is-hidden', y > lastY && y > H * .6 && !$('.dd.open'));
            lastY = y;
        }
        return sceneEl;
    }

    // ====================================================
    // MAIN LOOP
    // ====================================================
    let prev = performance.now();
    function frame(now) {
        const dt = Math.min(.05, (now - prev) / 1000); prev = now;
        if (lenis) lenis.raf(now);
        T += reduce ? 0 : dt;
        const y = window.scrollY;
        smoothY += (y - smoothY) * .1;
        travel = smoothY * .9 + T * 26;

        const hp = clamp((y - heroTop) / heroLen);
        const sceneEl = chrome(y, hp);

        // blend the scene toward the active chapter's preset
        const key = sceneEl ? sceneEl.dataset.scene : 'dawn';
        const P = PRESETS[key] || PRESETS.dawn;
        const k = reduce ? 1 : 1 - Math.exp(-dt * 1.8);
        for (const c of COLORS) S[c] = mixc(S[c], P[c], k);
        for (const n of ['sunX', 'sunAlt', 'sunA', 'moonA', 'stars', 'night', 'shipX', 'shipS']) S[n] = lerp(S[n], P[n], k);
        for (let i = 0; i < 4; i++) S.isl[i] = lerp(S.isl[i], P.isl[i], k);

        let aimAt = null, raise = 1;
        const inHero = y < heroTop + heroLen + H;
        if (inHero) {
            const lap = heroFrame(hp);
            raise = ease(range(hp, .2, .4));
            if (hp > .15) aimAt = [lap.x, lap.y];
        } else if (key === 'landho' || key === 'night') {
            const P2 = islandPositions();
            aimAt = key === 'landho' ? [P2.lap.x, P2.lap.y + Math.sin(T * .3) * 30 * U] : null;
        }

        // draw only while the sea can be seen (hero, windows, sheet edges)
        let visible = inHero;
        if (!visible) for (const w of windows) { const r = w.getBoundingClientRect(); if (r.bottom > -40 && r.top < H + 40) { visible = true; break; } }
        if (visible) {
            placeShip(raise, aimAt);
            drawBack();
            drawFore();
        }
        scrollPieces(y);
        requestAnimationFrame(frame);
    }

    // ====================================================
    // ENTRANCES
    // ====================================================
    $$('.split').forEach(el => {
        const words = el.textContent.trim().split(/\s+/);
        el.setAttribute('aria-label', el.textContent.trim());
        el.innerHTML = words.map((w, i) => `<span class="sw" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`).join(' ');
    });
    const io = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });
    $$('[data-reveal], .split').forEach(el => io.observe(el));

    // ====================================================
    // MENUS
    // ====================================================
    const mobileMenuBtn = $('#mobile-menu-btn'), mobileMenu = $('#mobile-menu');
    const hamburgerIcon = $('#hamburger-icon'), closeIcon = $('#close-icon');
    function closeMenu() {
        if (!mobileMenu.classList.contains('open')) return;
        mobileMenu.classList.remove('open');
        hamburgerIcon.classList.remove('hidden'); closeIcon.classList.add('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        if (lenis) lenis.start();
    }
    mobileMenuBtn.addEventListener('click', () => {
        if (mobileMenu.classList.contains('open')) return closeMenu();
        mobileMenu.classList.add('open');
        hamburgerIcon.classList.add('hidden'); closeIcon.classList.remove('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
        nav.classList.remove('is-hidden');
        if (lenis) lenis.stop();
    });
    [['#mobile-characters-btn', '#mobile-characters-list', '#mobile-char-arrow'], ['#mobile-places-btn', '#mobile-places-list', '#mobile-place-arrow']].forEach(([b, l, a]) => {
        $(b).addEventListener('click', () => { $(l).classList.toggle('hidden'); $(a).classList.toggle('rotate-180'); });
    });
    function closeDropdowns() { $$('.dd.open').forEach(d => { d.classList.remove('open'); d.firstElementChild.setAttribute('aria-expanded', 'false'); }); }
    ['#characters-dropdown-btn', '#places-dropdown-btn'].forEach(sel => {
        const btn = $(sel);
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const dd = btn.closest('.dd'), open = !dd.classList.contains('open');
            closeDropdowns();
            dd.classList.toggle('open', open);
            btn.setAttribute('aria-expanded', String(open));
        });
    });
    document.addEventListener('click', e => { if (!e.target.closest('.dd')) closeDropdowns(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeDropdowns(); closeMenu(); } });

    $('#back-to-top').addEventListener('click', () => goTo(0));

    // ====================================================
    // START
    // ====================================================
    window.addEventListener('resize', resize);
    resize();
    if (location.hash && location.hash.length > 1) {
        const el = document.getElementById(location.hash.slice(1));
        if (el) setTimeout(() => goTo(el), 400);
    }
    const ready = () => root.classList.add('is-loaded');
    Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 500))])
        .then(ready);
    window.addEventListener('load', measure);
    requestAnimationFrame(frame);
})();

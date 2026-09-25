// @ts-nocheck
import { PHASES, SVG_VB } from './landingData';

export function stageArt(i: number, u: string, phaseIdx: number) {
  const p = PHASES[phaseIdx];
  const W = '#fff', OK = '#3CD6C0', WARN = '#FFB35C', BAD = '#FF6A55', INK = '#0C0F2B';
  const B = (s: number) => (s < 21 ? s + 2 : s);
  const T = (x: number, y: number, s: number, t: string, o: any = {}) => `<text x="${x}" y="${y}" font-size="${B(s)}" font-weight="${o.w || 500}" fill="${o.f || W}" fill-opacity="${o.o == null ? 1 : o.o}" text-anchor="${o.a || 'start'}" style="font-family:${o.m ? 'ui-monospace,SFMono-Regular,Menlo,monospace' : 'var(--font)'}">${t}</text>`;
  const R = (x: number, y: number, w: number, h: number, r: number, f: string, fo: number, s?: string, so?: number, dash?: boolean) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${f || 'none'}" fill-opacity="${fo == null ? 1 : fo}"${s ? ` stroke="${s}" stroke-opacity="${so == null ? 1 : so}" stroke-width="2"` : ''}${dash ? ' stroke-dasharray="8 8"' : ''}/>`;
  const C = (x: number, y: number, r: number, f?: string, fo?: number, s?: string, so?: number) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f || 'none'}" fill-opacity="${fo == null ? 1 : fo}"${s ? ` stroke="${s}" stroke-opacity="${so == null ? 1 : so}" stroke-width="2"` : ''}/>`;
  const L = (x1: number, y1: number, x2: number, y2: number, s: string, so?: number, w?: number, dash?: boolean) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${s}" stroke-opacity="${so == null ? 1 : so}" stroke-width="${w || 2}"${dash ? ' stroke-dasharray="6 8"' : ''} stroke-linecap="round"/>`;
  const chk = (x: number, y: number, r: number, c?: string) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c || OK}"/><path d="M${(x - r * .4).toFixed(1)} ${y} l${(r * .28).toFixed(1)} ${(r * .3).toFixed(1)} l${(r * .55).toFixed(1)} ${(-r * .6).toFixed(1)}" fill="none" stroke="${INK}" stroke-width="${(r * .22).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const pill = (x: number, y: number, w: number, h: number, t: string, f: string, tc?: string, fs?: number, fo?: number) => R(x, y, w, h, h / 2, f, fo) + T(x + w / 2, y + h / 2 + B(fs || 22) * .35, fs || 22, t, { a: 'middle', f: tc || INK, w: 600 });
  const head = (x2: number, y2: number, a: number, c: string, so?: number) => `<path d="M${x2} ${y2} L${(x2 - 14 * Math.cos(a - .45)).toFixed(1)} ${(y2 - 14 * Math.sin(a - .45)).toFixed(1)} L${(x2 - 14 * Math.cos(a + .45)).toFixed(1)} ${(y2 - 14 * Math.sin(a + .45)).toFixed(1)} Z" fill="${c}" fill-opacity="${so == null ? 1 : so}"/>`;
  const arrD = (x1: number, y1: number, x2: number, y2: number, c: string, so?: number) => A('a-dash', 0, L(x1, y1, x2, y2, c, so, 3, true)) + head(x2, y2, Math.atan2(y2 - y1, x2 - x1), c, so);
  const arrDraw = (x1: number, y1: number, x2: number, y2: number, c: string, dl: number) => A('a-draw', dl, `<path d="M${x1} ${y1} L${x2} ${y2}" pathLength="1" stroke-dasharray="1" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`) + A('a-pop', dl + .45, head(x2, y2, Math.atan2(y2 - y1, x2 - x1), c));
  function A(cls: string, d: number, inner: string) { return `<g class="${cls}" style="--d:${d}s">${inner}</g>`; }
  const lock = (x: number, y: number, c: string, dl?: number) => R(x, y + 10, 30, 24, 6, c, 1) + A('a-shackle', dl || 0, `<path d="M${x + 6} ${y + 10} v-6 a9 9 0 0 1 18 0 v6" fill="none" stroke="${c}" stroke-width="4"/>`);
  const dots = A('a-float', 0, C(516, 214, 6, p.d, .9)) + A('a-float', .7, C(78, 590, 5, p.c, .8)) + A('a-float', 1.3, C(548, 620, 4, p.c, .7));
  let mid = '', fg = dots;

  const IX = 300, IY = 298, IR = 174;
  const badge = () => C(IX, IY, IR, '#fff', .045, p.c, .32) + A('a-spin mid', 0, `<circle cx="${IX}" cy="${IY}" r="${IR + 18}" fill="none" stroke="${p.c}" stroke-opacity=".2" stroke-width="2" stroke-dasharray="1 13" stroke-linecap="round"/>`);
  const cap = (text: string, y: number, on?: boolean) => { const w = Math.round(text.length * 10.8 + 60); return A('a-rise', 1, pill(IX - w / 2, y, w, 44, text, on ? p.d : W, on ? INK : W, 20, on ? 1 : .12)); };
  const glyph = (d: string, extra?: string) => `<path d="${d}" fill="none" stroke="${p.c}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"${extra || ''}/>`;

  switch (i) {
    case 0: {
      mid = badge() +
        R(IX - 95, IY - 70, 190, 120, 28, 'none', 1, p.c, .5) +
        `<path d="M${IX - 56} ${IY + 50} L${IX - 56} ${IY + 84} L${IX - 22} ${IY + 50} Z" fill="${p.d}"/>` +
        [-30, 0, 30].map((dx, k) => A('a-pulse', k * .22, C(IX + dx, IY - 10, 9, W, .9))).join('');
      mid += cap('Plain language in', 512);
      break;
    }
    case 1: {
      mid = badge() +
        glyph(`M${IX - 90} ${IY - 80} L${IX + 90} ${IY - 80} L${IX + 16} ${IY + 22} L${IX + 16} ${IY + 58} L${IX - 16} ${IY + 58} L${IX - 16} ${IY + 22} Z`) +
        A('a-pop', .6, chk(IX, IY + 84, 14));
      mid += cap('Open questions, resolved', 512);
      break;
    }
    case 2: {
      mid = badge() +
        R(IX - 78, IY - 92, 118, 150, 14, 'none', 1, p.c, .3) +
        A('a-spread', 0, R(IX - 66, IY - 104, 118, 150, 14, INK, .55, p.c, .55)) +
        [0, 1, 2].map(k => L(IX - 40, IY - 60 + k * 26, IX + 30, IY - 60 + k * 26, W, k === 2 ? .3 : .55, 5)).join('') +
        A('a-pop', .6, lock(IX + 8, IY + 48, p.d, .8));
      mid += cap('SPEC-v2 · locked', 512);
      break;
    }
    case 3: {
      const rO = 96, rI = 54;
      mid = badge() +
        C(IX, IY, rO, 'none', 1, p.c, .4) + C(IX, IY, rI, 'none', 1, p.c, .25) + C(IX, IY, 8, p.d) +
        [-90, 30, 150].map((deg, k) => { const a = deg * Math.PI / 180, x = IX + Math.cos(a) * 150, y = IY + Math.sin(a) * 150, bad = k === 2;
          return L(IX + Math.cos(a) * rO, IY + Math.sin(a) * rO, x, y, W, .3, 2, !bad) +
            (bad ? A('a-pulse', 0, C(x, y, 13, BAD, .95)) : C(x, y, 10, W, .5)); }).join('') +
        A('a-ping', 1.1, C(IX, IY, rO, 'none', 1, BAD, .6));
      mid += cap('Invariants enforced', 512);
      break;
    }
    case 4: {
      const nd = [[IX, IY - 96], [IX - 92, IY + 66], [IX + 92, IY + 66]];
      mid = badge() +
        arrD(nd[0][0] - 14, nd[0][1] + 26, nd[1][0] + 20, nd[1][1] - 26, p.c) +
        arrD(nd[0][0] + 14, nd[0][1] + 26, nd[2][0] - 20, nd[2][1] - 26, p.c) +
        arrD(nd[1][0] + 34, nd[1][1], nd[2][0] - 34, nd[2][1], p.c) +
        nd.map((n, k) => A('a-pop', k * .25, C(n[0], n[1], 27, INK, .6, p.c, .6)) + (k === 0 ? A('a-pulse', .4, C(n[0], n[1], 9, p.d)) : C(n[0], n[1], 9, W, .55))).join('');
      mid += cap('Modules mapped', 512);
      break;
    }
    case 5: {
      const gy = IY - 4;
      mid = badge() +
        glyph(`M${IX - 96} ${gy - 46} L${IX - 138} ${gy} L${IX - 96} ${gy + 46}`) +
        glyph(`M${IX + 96} ${gy - 46} L${IX + 138} ${gy} L${IX + 96} ${gy + 46}`) +
        A('a-blink', 0, R(IX - 8, gy - 34, 16, 68, 4, p.d, 1)) +
        L(IX - 34, gy + 74, IX + 34, gy + 74, W, .3, 4);
      mid += cap('Native to the VM', 512);
      break;
    }
    case 6: {
      const hex = Array.from({ length: 6 }, (_, k) => { const a = (k / 6) * Math.PI * 2 - Math.PI / 2, r = 92; return `${(IX + Math.cos(a) * r).toFixed(1)},${(IY + Math.sin(a) * r).toFixed(1)}`; }).join(' ');
      mid = badge() + A('a-spin mid', 0, `<polygon points="${hex}" fill="none" stroke="${p.c}" stroke-width="7" stroke-linejoin="round"/>`) +
        A('a-pop', .9, C(IX + 84, IY + 78, 30, OK) + chk(IX + 84, IY + 78, 15));
      mid += cap('Isolated worker', 512);
      break;
    }
    case 7: {
      mid = badge() + R(IX - 70, IY - 96, 140, 176, 20, 'none', 1, p.c, .35) + R(IX - 30, IY - 106, 60, 20, 8, INK, .7, p.c, .3) +
        [0, 1, 2].map(k => { const y = IY - 46 + k * 44; return A('a-pop', .3 + k * .3, chk(IX - 40, y, 14)) + T(IX - 14, y + 7, 0, '', {}); }).join('') +
        [0, 1, 2].map(k => { const y = IY - 46 + k * 44; return A('a-rise', .3 + k * .3, L(IX - 14, y, IX + 46, y, W, .35, 6)); }).join('');
      mid += cap('13 layers, one system', 512);
      break;
    }
    case 8: {
      const s = 116;
      mid = badge() + A('a-ping', .9, `<path d="M${IX} ${IY - s} L${IX + s} ${IY - s * .3} L${IX + s} ${IY + s * .5} Q${IX} ${IY + s * 1.05} ${IX - s} ${IY + s * .5} L${IX - s} ${IY - s * .3} Z" fill="none" stroke="${BAD}" stroke-opacity=".55" stroke-width="2"/>`) +
        glyph(`M${IX} ${IY - s * .72} L${IX + s * .87} ${IY - s * .26} L${IX + s * .87} ${IY + s * .43} Q${IX} ${IY + s * .9} ${IX - s * .87} ${IY + s * .43} L${IX - s * .87} ${IY - s * .26} Z`) +
        A('a-blink', 0, R(IX - 5, IY - 34, 10, 46, 5, BAD, 1)) + A('a-pop', .6, C(IX, IY + 42, 7, BAD));
      mid += cap('Evidence required', 512);
      break;
    }
    case 9: {
      mid = badge() + C(IX, IY, 96, 'none', 1, p.c, .4) + C(IX, IY, 55, 'none', 1, p.c, .25) +
        L(IX, IY - 96, IX, IY - 78, p.c, .5, 2) + L(IX, IY + 78, IX, IY + 96, p.c, .5, 2) + L(IX - 96, IY, IX - 78, IY, p.c, .5, 2) + L(IX + 78, IY, IX + 96, IY, p.c, .5, 2) +
        arrDraw(IX - 150, IY - 150, IX - 42, IY - 42, BAD, .2) +
        A('a-pop', 1, C(IX, IY, 10, BAD)) + A('a-ping', 1.1, C(IX, IY, 55, 'none', 1, BAD, .6));
      mid += cap('Reproducible scenarios', 512);
      break;
    }
    case 10: {
      mid = badge() + C(IX, IY - 18, 58, 'none', 1, p.c, .4) +
        `<path d="M${IX - 18} ${IY - 46} L${IX - 18} ${IY + 10} L${IX + 32} ${IY - 18} Z" fill="${p.c}"/>` +
        A('a-draw', .3, `<path d="M${IX - 120} ${IY + 88} L${IX - 60} ${IY + 60} L${IX - 20} ${IY + 100} L${IX + 30} ${IY + 46} L${IX + 70} ${IY + 88} L${IX + 120} ${IY + 66}" pathLength="1" stroke-dasharray="1" fill="none" stroke="${p.c}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`) +
        A('a-pop', 1.3, C(IX + 30, IY + 46, 8, BAD));
      mid += cap('Scenario Lab', 512);
      break;
    }
    case 11: {
      const gy = IY + 40;
      mid = badge() + R(IX - 100, gy - 130, 22, 160, 10, 'none', 1, p.c, .5) + R(IX + 78, gy - 130, 22, 160, 10, 'none', 1, p.c, .5) +
        A('a-grow', .3, R(IX - 100, gy - 150, 200, 22, 10, p.d, 1)) + A('a-pop', 1.1, chk(IX, gy - 178, 15));
      mid += cap('Deterministic', 512);
      break;
    }
    case 12: {
      mid = badge() + R(IX - 104, IY - 58, 208, 132, 18, 'none', 1, p.c, .4) + R(IX - 104, IY - 58, 208, 46, 18, INK, .55, p.c, .4) +
        C(IX + 70, IY + 8, 12, p.d) +
        A('a-draw', .4, `<path d="M${IX - 70} ${IY + 92} C ${IX - 40} ${IY + 70} ${IX - 20} ${IY + 112} ${IX + 10} ${IY + 84} S ${IX + 60} ${IY + 60} ${IX + 90} ${IY + 92}" pathLength="1" stroke-dasharray="1" fill="none" stroke="${p.c}" stroke-width="4" stroke-linecap="round"/>`);
      mid += cap('You hold the keys', 512);
      break;
    }
    case 13: {
      const gy = IY + 96;
      mid = badge() + R(IX - 46, gy, 92, 18, 8, 'none', 1, p.c, .4) + C(IX, gy, 60, 'none', 1, p.c, .16) +
        A('a-ping', 0, C(IX, gy, 60, 'none', 1, p.c, .35)) + A('a-ping', .5, C(IX, gy, 96, 'none', 1, p.c, .2)) +
        A('a-slide', .2, glyph(`M${IX} ${gy - 12} L${IX} ${IY - 88} M${IX - 30} ${IY - 58} L${IX} ${IY - 92} L${IX + 30} ${IY - 58}`)) +
        A('a-pop', 1.2, C(IX, IY - 96, 16, OK) + chk(IX, IY - 96, 8));
      mid += cap('Tracked to finality', 512);
      break;
    }
    case 14: {
      const lx = IX - 20, ly = IY - 12;
      mid = badge() + C(lx, ly, 68, 'none', 1, p.c, .5) + L(lx + 48, ly + 48, lx + 108, ly + 108, p.c, .6, 10) +
        A('a-pop', .7, chk(lx, ly, 24));
      mid += cap('Source to state', 512);
      break;
    }
    case 15: {
      mid = badge() +
        A('a-draw', 0, `<path d="M${IX - 130} ${IY} L${IX - 60} ${IY} L${IX - 38} ${IY - 60} L${IX - 12} ${IY + 60} L${IX + 10} ${IY} L${IX + 130} ${IY}" pathLength="1" stroke-dasharray="1" fill="none" stroke="${p.c}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`) +
        A('a-ping', 1, C(IX - 38, IY - 60, 10, BAD)) + C(IX, IY, 118, 'none', 1, p.c, .18);
      mid += cap('Read-only watch', 512);
      break;
    }
    case 16: {
      const s = 108, ty = IY + 20;
      mid = badge() + A('a-ping', .3, `<path d="M${IX} ${ty - s} L${IX + s * .95} ${ty + s * .7} L${IX - s * .95} ${ty + s * .7} Z" fill="none" stroke="${BAD}" stroke-opacity=".5" stroke-width="2"/>`) +
        glyph(`M${IX} ${ty - s * .78} L${IX + s * .74} ${ty + s * .55} L${IX - s * .74} ${ty + s * .55} Z`) +
        A('a-blink', 0, R(IX - 5, ty - s * .38, 10, s * .5, 5, BAD, 1)) + A('a-pop', .5, C(IX, ty + s * .38, 7, BAD)) +
        A('a-pop', 1.3, `<g transform="translate(${IX} ${ty + 106})"><path d="M-16 -2 A16 16 0 1 1 12 11" fill="none" stroke="${p.d}" stroke-width="6" stroke-linecap="round"/><path d="M2 3 L13 12 L20 -1 Z" fill="${p.d}"/></g>`);
      mid += cap('Evidence preserved', 512);
      break;
    }
    default: {
      mid = badge() + C(IX, IY, 118, 'none', 1, p.c, .5) +
        [0, 1, 2, 3].map(k => { const a = (k / 4) * Math.PI * 2 - Math.PI / 2, x = IX + Math.cos(a) * 118, y = IY + Math.sin(a) * 118; return A('a-pop', k * .2, C(x, y, 10, k === 0 ? p.d : W, k === 0 ? 1 : .6)); }).join('') +
        head(IX + 118, IY - 14, Math.PI / 2, p.c, .7) +
        A('a-orbit', 0, C(IX, IY - 118, 9, p.d)) + C(IX, IY, 9, W, .75);
      mid += cap('Security memory', 512);
    }
  }

  const bg = `<circle cx="540" cy="90" r="230" fill="${p.c}" fill-opacity=".12"/>` +
    A('a-spin', 0, `<circle cx="80" cy="650" r="170" fill="none" stroke="${p.c}" stroke-opacity=".22" stroke-width="2" stroke-dasharray="2 14" stroke-linecap="round"/>`) +
    A('a-spin r', 0, `<circle cx="560" cy="330" r="110" fill="none" stroke="${p.d}" stroke-opacity=".2" stroke-width="2" stroke-dasharray="1 10" stroke-linecap="round"/>`);

  return `<svg ${SVG_VB} class="art" aria-hidden="true"><defs><linearGradient id="sg${u}${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.a}"/><stop offset="1" stop-color="${p.b}"/></linearGradient><pattern id="sp${u}${i}" width="36" height="36" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="#fff" fill-opacity=".16"/></pattern></defs>` +
    `<rect width="600" height="720" fill="url(#sg${u}${i})"/><rect width="600" height="720" fill="url(#sp${u}${i})"/>` +
    `<g class="d1">${bg}</g><g transform="translate(300 430) scale(.93) translate(-300 -430)"><g class="d2">${mid}</g><g class="d3">${fg}</g></g></svg>`;
}

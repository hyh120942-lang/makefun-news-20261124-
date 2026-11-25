// The World in One Day — Tuesday 24 November 2026.
// A front-page image drawn by this program alone, with the Node 22 standard
// library only: a software rasteriser, a 5x7 bitmap font written here, and a
// hand-rolled PNG encoder (zlib deflate, CRC32). No network, no time, no
// randomness: two runs write byte-identical files.
//
// Run it: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// The grader runs it as `node main.ts` with MAKEFUN_OUTPUT_DIR=/output.

import { mkdirSync, writeFileSync, chmodSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

// ---------------------------------------------------------------- font
// A 5 wide by 7 tall bitmap font. Each glyph is 7 rows of 5 bits, '#' on.
// Only capitals, digits and a few marks are needed: drawText uppercases.

const FONT: Record<string, string[]> = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  C: ['.####', '#....', '#....', '#....', '#....', '#....', '.####'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.####', '#....', '#....', '#..##', '#...#', '#...#', '.###.'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['.###.', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  J: ['..###', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
  X: ['#...#', '.#.#.', '..#..', '..#..', '..#..', '.#.#.', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  '0': ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  '1': ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  '2': ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  '3': ['####.', '....#', '....#', '.###.', '....#', '....#', '####.'],
  '4': ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  '5': ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  '6': ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.'],
  '7': ['#####', '....#', '...#.', '..#..', '..#..', '..#..', '..#..'],
  '8': ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  '9': ['.###.', '#...#', '#...#', '.####', '....#', '....#', '.###.'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
  '.': ['.....', '.....', '.....', '.....', '.....', '.....', '.##..'],
  ',': ['.....', '.....', '.....', '.....', '.....', '.##..', '.#...'],
  ':': ['.....', '..#..', '.....', '..#..', '.....', '.....', '.....'],
  '-': ['.....', '.....', '.....', '#####', '.....', '.....', '.....'],
  "'": ['..#..', '..#..', '.....', '.....', '.....', '.....', '.....'],
  '/': ['....#', '...#.', '...#.', '..#..', '.#...', '.#...', '#....'],
  '(': ['...#.', '..#..', '.#...', '.#...', '.#...', '..#..', '...#.'],
  ')': ['.#...', '..#..', '...#.', '...#.', '...#.', '..#..', '.#...'],
  '%': ['#...#', '#..#.', '...#.', '..#..', '.#...', '#..#.', '#...#'],
  '!': ['..#..', '..#..', '..#..', '..#..', '..#..', '.....', '..#..'],
  '?': ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..'],
  '&': ['.##..', '#..#.', '#..#.', '.#...', '#.#.#', '#..#.', '.##.#'],
  '+': ['.....', '..#..', '..#..', '.###.', '..#..', '..#..', '.....'],
  '=': ['.....', '.....', '#####', '.....', '#####', '.....', '.....'],
  '"': ['.#.#.', '.#.#.', '.....', '.....', '.....', '.....', '.....'],
  '|': ['..#..', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
};

// ---------------------------------------------------------------- pixels
const W = 1024;
const H = 1024;
const PAPER: [number, number, number] = [246, 241, 231];
const INK: [number, number, number] = [26, 26, 26];
const NAVY: [number, number, number] = [20, 33, 61];
const RED: [number, number, number] = [180, 35, 24];
const TEAL: [number, number, number] = [14, 107, 107];
const GOLD: [number, number, number] = [201, 138, 27];
const GREY: [number, number, number] = [107, 107, 107];
const WHITE: [number, number, number] = [255, 255, 255];
const CARD: [number, number, number] = [255, 255, 255];
const BORDER: [number, number, number] = [216, 210, 196];

type RGB = [number, number, number];
const buf = new Uint8Array(W * H * 3);

function fill(c: RGB): void {
  for (let i = 0; i < W * H; i++) {
    buf[i * 3] = c[0];
    buf[i * 3 + 1] = c[1];
    buf[i * 3 + 2] = c[2];
  }
}

function px(x: number, y: number, c: RGB): void {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  buf[i] = c[0];
  buf[i + 1] = c[1];
  buf[i + 2] = c[2];
}

function rect(x: number, y: number, w: number, h: number, c: RGB): void {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) px(xx, yy, c);
  }
}

function circle(cx: number, cy: number, r: number, c: RGB): void {
  for (let yy = cy - r; yy <= cy + r; yy++) {
    const dx = Math.floor(Math.sqrt(Math.max(0, r * r - (yy - cy) * (yy - cy))));
    for (let xx = cx - dx; xx <= cx + dx; xx++) px(xx, yy, c);
  }
}

function line(x0: number, y0: number, x1: number, y1: number, c: RGB): void {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const n = Math.max(Math.abs(dx), Math.abs(dy), 1);
  for (let i = 0; i <= n; i++) {
    px(Math.round(x0 + (dx * i) / n), Math.round(y0 + (dy * i) / n), c);
  }
}

function text(s: string, x: number, y: number, scale: number, c: RGB): number {
  const up = s.toUpperCase();
  let cx = x;
  for (const ch of up) {
    const g = FONT[ch] ?? FONT[' '];
    for (let r = 0; r < 7; r++) {
      for (let col = 0; col < 5; col++) {
        if (g[r][col] === '#') {
          rect(cx + col * scale, y + r * scale, scale, scale, c);
        }
      }
    }
    cx += 6 * scale;
  }
  return cx - x;
}

function textWidth(s: string, scale: number): number {
  return s.length * 6 * scale - scale;
}

function centred(s: string, y: number, scale: number, c: RGB): void {
  text(s, Math.floor((W - textWidth(s, scale)) / 2), y, scale, c);
}

// ---------------------------------------------------------------- PNG
const CRC_TABLE: number[] = (() => {
  const t: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(data: Buffer): number {
  let c = 0xffffffff;
  for (const b of data) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, 'ascii'), data])), 8 + data.length);
  return out;
}

function encodePng(): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0; // filter: none
    Buffer.from(buf.buffer, y * W * 3, W * 3).copy(raw, y * (1 + W * 3) + 1);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------- icons
// Small flat pictograms, one per story, drawn from rectangles and circles.

function iconShip(x: number, y: number, s: number, c: RGB): void {
  rect(x, y + 34 * s, 56 * s, 10 * s, c); // hull
  rect(x + 8 * s, y + 22 * s, 20 * s, 12 * s, c); // cabin
  rect(x + 34 * s, y + 14 * s, 4 * s, 8 * s, c); // funnel
  line(x + 18 * s, y + 22 * s, x + 18 * s, y + 6 * s, c); // mast
  rect(x + 18 * s, y + 6 * s, 12 * s, 8 * s, c); // flag
  line(x, y + 50 * s, x + 56 * s, y + 50 * s, c); // waterline
  line(x + 6 * s, y + 54 * s, x + 20 * s, y + 54 * s, c);
  line(x + 30 * s, y + 54 * s, x + 50 * s, y + 54 * s, c);
}

function iconBlast(x: number, y: number, s: number, c: RGB): void {
  const cx = x + 28 * s;
  const cy = y + 28 * s;
  circle(cx, cy, 10 * s, c);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    line(cx, cy, Math.round(cx + Math.cos(a) * 24 * s), Math.round(cy + Math.sin(a) * 24 * s), c);
  }
}

function iconBuilding(x: number, y: number, s: number, c: RGB): void {
  rect(x + 10 * s, y + 6 * s, 36 * s, 46 * s, c);
  for (let r = 0; r < 3; r++) {
    for (let col = 0; col < 3; col++) {
      rect(x + 16 * s + col * 11 * s, y + 12 * s + r * 13 * s, 5 * s, 6 * s, PAPER);
    }
  }
  rect(x + 4 * s, y + 52 * s, 48 * s, 4 * s, c);
}

function iconTower(x: number, y: number, s: number, c: RGB): void {
  rect(x + 20 * s, y + 12 * s, 16 * s, 44 * s, c);
  rect(x + 24 * s, y + 4 * s, 8 * s, 8 * s, c);
  for (let r = 0; r < 4; r++) rect(x + 24 * s, y + 18 * s + r * 9 * s, 8 * s, 4 * s, PAPER);
  line(x + 28 * s, y, x + 22 * s, y + 10 * s, RED);
  line(x + 28 * s, y, x + 34 * s, y + 10 * s, RED);
}

function iconJet(x: number, y: number, s: number, c: RGB): void {
  line(x + 6 * s, y + 28 * s, x + 50 * s, y + 28 * s, c);
  line(x + 50 * s, y + 28 * s, x + 40 * s, y + 18 * s, c);
  line(x + 50 * s, y + 28 * s, x + 40 * s, y + 38 * s, c);
  line(x + 26 * s, y + 28 * s, x + 18 * s, y + 12 * s, c);
  line(x + 26 * s, y + 28 * s, x + 18 * s, y + 44 * s, c);
  rect(x + 44 * s, y + 25 * s, 8 * s, 6 * s, c);
}

function iconGlobe(x: number, y: number, s: number, c: RGB): void {
  circle(x + 28 * s, y + 28 * s, 24 * s, c);
  circle(x + 28 * s, y + 28 * s, 20 * s, PAPER);
  rect(x + 8 * s, y + 24 * s, 40 * s, 4 * s, c);
  rect(x + 12 * s, y + 34 * s, 32 * s, 4 * s, c);
  rect(x + 20 * s, y + 12 * s, 12 * s, 8 * s, c);
}

function iconWarn(x: number, y: number, s: number, c: RGB): void {
  line(x + 28 * s, y + 4 * s, x + 52 * s, y + 50 * s, c);
  line(x + 52 * s, y + 50 * s, x + 4 * s, y + 50 * s, c);
  line(x + 4 * s, y + 50 * s, x + 28 * s, y + 4 * s, c);
  rect(x + 25 * s, y + 20 * s, 6 * s, 18 * s, c);
  rect(x + 25 * s, y + 42 * s, 6 * s, 6 * s, c);
}

// ---------------------------------------------------------------- layout
// Front page, 1024 x 1024. All text is pre-wrapped by hand so nothing
// overflows: headline scale 2 is 12 px per character, deck scale 2 the same,
// masthead scale 5 is 30 px per character, date scale 3 is 18 px.

function card(x: number, y: number, w: number, tag: string, tagColour: RGB, head: string[], deck: string[], icon: (x: number, y: number, s: number, c: RGB) => void, iconColour: RGB): void {
  rect(x, y, w, 160, CARD);
  rect(x, y, w, 4, tagColour);
  rect(x, y, 4, 160, tagColour);
  text(tag, x + 16, y + 16, 2, tagColour);
  head.forEach((ln, i) => text(ln, x + 16, y + 46 + i * 24, 2, INK));
  deck.forEach((ln, i) => text(ln, x + 16, y + 100 + i * 22, 2, GREY));
  rect(x + w - 76, y + 12, 60, 60, PAPER);
  icon(x + w - 74, y + 14, 1, iconColour);
  rect(x, y + 159, w, 1, BORDER);
}

function drawPage(): void {
  fill(PAPER);

  // Masthead.
  rect(16, 16, 992, 124, NAVY);
  text('THE WORLD IN ONE DAY', Math.floor((W - textWidth('THE WORLD IN ONE DAY', 5)) / 2), 36, 5, WHITE);
  rect(16, 108, 992, 3, GOLD);
  centred('TUESDAY 24 NOVEMBER 2026', 118, 2, WHITE);

  // Lead story.
  rect(16, 152, 992, 200, CARD);
  rect(16, 152, 12, 200, RED);
  text('LEAD STORY', 44, 168, 2, RED);
  text('IRAN STANDOFF DEEPENS', 44, 198, 3, INK);
  text('TEHRAN WARNS SHIPS IN HORMUZ AS', 44, 240, 2, INK);
  text('US WEIGHS STRIKES ON ITS LEADERS', 44, 264, 2, INK);
  text('RIAL PLUNGES AFTER NEW SANCTIONS', 44, 288, 2, INK);
  text('VANCE AND RUBIO MEET QATAR PM AT WHITE HOUSE', 44, 322, 2, GREY);
  iconShip(856, 196, 2, NAVY);

  // Six stories, two columns by three rows.
  const cols = [16, 520];
  const rows = [364, 536, 708];
  card(cols[0], rows[0], 488, 'GAZA - MIDDLE EAST', RED,
    ['HAMAS SECURITY CHIEF', 'KILLED IN GAZA'],
    ['ISRAELI STRIKE KILLS SEVEN,', 'TWO OF THEM POLICE, DESPITE', 'A CEASEFIRE IN PLACE.'],
    iconBlast, RED);
  card(cols[1], rows[0], 488, 'UKRAINE - EUROPE', NAVY,
    ['ZAPORIZHZHIA HIT', 'OVERNIGHT'],
    ['RUSSIAN ATTACK KILLS 2,', 'WOUNDS 40, INCLUDING FOUR', 'CHILDREN. FLATS ARE HIT.'],
    iconBuilding, NAVY);
  card(cols[0], rows[1], 488, 'SAUDI ARABIA - MIDDLE EAST', TEAL,
    ['HOUTHI STRIKE HITS', 'RIYADH TOWER'],
    ['11 INJURED IN THE FINANCIAL', 'DISTRICT. SECOND HIT ON THE', 'TOWER IN LESS THAN A WEEK.'],
    iconTower, TEAL);
  card(cols[1], rows[1], 488, 'KOREA - ASIA', GOLD,
    ['RUSSIAN JETS ENTER', 'KOREA AIR ZONE'],
    ['SEOUL SAYS PLANES FLEW INTO', 'ITS AIR DEFENCE ZONE OVER', 'WATERS NEAR JAPAN.'],
    iconJet, GOLD);
  card(cols[0], rows[2], 488, 'CLIMATE - WORLD', TEAL,
    ['COP31 ENDS WITHOUT', 'A DEAL'],
    ['SUMMIT FAILS ON FOSSIL FUELS', 'AS A DIVIDED WORLD LEAVES', 'WITH NO AGREEMENT.'],
    iconGlobe, TEAL);
  card(cols[1], rows[2], 488, 'GLOBAL - WORLD', RED,
    ['LANDMINE TOLL HITS', 'FIVE-YEAR HIGH'],
    ['7,000 CASUALTIES IN 2025,', 'MYANMAR AND SYRIA TOP THE', 'LIST, SAYS MONITOR.'],
    iconWarn, RED);

  // Ticker: three more stories of the day.
  rect(16, 880, 992, 64, NAVY);
  centred('ALSO TODAY: GERMANY FIRST TO GET UKRAINE DELTA ACCESS', 892, 2, WHITE);
  centred('NATO VOWS TO DEFEND SPACE  |  CHESS FINAL OPENS', 918, 2, WHITE);

  // Footer: what the day is, in one line.
  centred('ALL EVENTS HAPPENED OR WERE FIRST REPORTED ON 24 NOVEMBER 2026', 968, 2, GREY);
}

// ---------------------------------------------------------------- run
function main(): void {
  drawPage();
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  mkdirSync(outDir, { recursive: true });
  const png = encodePng();
  const outPath = join(outDir, 'entry.png');
  writeFileSync(outPath, png);
  chmodSync(outPath, 0o644);
}

main();

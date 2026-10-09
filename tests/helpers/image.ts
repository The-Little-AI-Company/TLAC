import { deflateSync, inflateSync } from 'node:zlib';

export interface ImageInfo {
  width: number;
  height: number;
  /** True when the file can carry transparent pixels. */
  alpha: boolean;
}

/** Reads the pixel size and alpha flag from a WebP file header (lossy, lossless or extended). */
export function readWebp(buf: Buffer): ImageInfo {
  if (buf.length < 16 || buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error('not a WebP file');
  }
  const kind = buf.toString('ascii', 12, 16);
  const needs = { VP8X: 30, VP8L: 25, 'VP8 ': 30 }[kind];
  if (needs === undefined) throw new Error(`unknown WebP chunk ${kind}`);
  if (buf.length < needs) throw new Error(`truncated WebP ${kind} header`);
  if (kind === 'VP8X') {
    return { width: buf.readUIntLE(24, 3) + 1, height: buf.readUIntLE(27, 3) + 1, alpha: (buf[20]! & 0x10) !== 0 };
  }
  if (kind === 'VP8L') {
    if (buf[20] !== 0x2f) throw new Error('bad VP8L signature');
    const bits = buf.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1, alpha: ((bits >>> 28) & 1) === 1 };
  }
  if (buf[23] !== 0x9d || buf[24] !== 0x01 || buf[25] !== 0x2a) throw new Error('bad VP8 start code');
  return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff, alpha: false };
}

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export interface Png {
  width: number;
  height: number;
  /** RGBA bytes, row by row. */
  pixels: Uint8Array;
}

const paeth = (a: number, b: number, c: number): number => {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
};

/** Reads only the size from a PNG header. */
export function readPngSize(buf: Buffer): { width: number; height: number } {
  if (!buf.subarray(0, 8).equals(PNG_SIGNATURE)) throw new Error('not a PNG file');
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

/** Decodes a non-interlaced 8-bit PNG (gray, RGB, palette, gray+alpha or RGBA) to RGBA. */
export function decodePng(buf: Buffer): Png {
  if (!buf.subarray(0, 8).equals(PNG_SIGNATURE)) throw new Error('not a PNG file');
  let width = 0;
  let height = 0;
  let depth = 0;
  let colorType = 0;
  let interlace = 0;
  let palette: Buffer = Buffer.alloc(0);
  const idat: Buffer[] = [];
  for (let pos = 8; pos < buf.length; ) {
    const length = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      depth = data[8]!;
      colorType = data[9]!;
      interlace = data[12]!;
    } else if (type === 'PLTE') palette = Buffer.from(data);
    else if (type === 'IDAT') idat.push(Buffer.from(data));
    else if (type === 'IEND') break;
    pos += 12 + length;
  }
  if (depth !== 8 || interlace !== 0) throw new Error(`unsupported PNG (depth ${depth}, interlace ${interlace})`);
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  if (!channels) throw new Error(`unsupported PNG color type ${colorType}`);
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const rows = new Uint8Array(height * stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]!;
    for (let x = 0; x < stride; x++) {
      const value = raw[y * (stride + 1) + 1 + x]!;
      const left = x >= channels ? rows[y * stride + x - channels]! : 0;
      const up = y > 0 ? rows[(y - 1) * stride + x]! : 0;
      const upLeft = y > 0 && x >= channels ? rows[(y - 1) * stride + x - channels]! : 0;
      const add = [0, left, up, (left + up) >> 1, paeth(left, up, upLeft)][filter];
      if (add === undefined) throw new Error(`bad PNG filter ${filter}`);
      rows[y * stride + x] = (value + add) & 0xff;
    }
  }
  const pixels = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const o = i * 4;
    const s = i * channels;
    if (colorType === 6) pixels.set([rows[s]!, rows[s + 1]!, rows[s + 2]!, rows[s + 3]!], o);
    else if (colorType === 2) pixels.set([rows[s]!, rows[s + 1]!, rows[s + 2]!, 255], o);
    else if (colorType === 0) pixels.set([rows[s]!, rows[s]!, rows[s]!, 255], o);
    else if (colorType === 4) pixels.set([rows[s]!, rows[s]!, rows[s]!, rows[s + 1]!], o);
    else {
      const p = rows[s]! * 3;
      pixels.set([palette[p]!, palette[p + 1]!, palette[p + 2]!, 255], o);
    }
  }
  return { width, height, pixels };
}

export function pixelAt(png: Png, x: number, y: number): [number, number, number, number] {
  const o = (y * png.width + x) * 4;
  return [png.pixels[o]!, png.pixels[o + 1]!, png.pixels[o + 2]!, png.pixels[o + 3]!];
}

/** Builds a minimal valid RGB or RGBA PNG. Used by the helper self-tests and nothing else. */
export function encodePng(width: number, height: number, colorType: 2 | 6, paint: (x: number, y: number) => number[]): Buffer {
  const channels = colorType === 6 ? 4 : 3;
  const raw = Buffer.alloc(height * (width * channels + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (width * channels + 1)] = 0;
    for (let x = 0; x < width; x++) {
      const px = paint(x, y);
      for (let c = 0; c < channels; c++) raw[y * (width * channels + 1) + 1 + x * channels + c] = px[c] ?? 255;
    }
  }
  const chunk = (type: string, data: Buffer): Buffer => {
    const head = Buffer.alloc(8);
    head.writeUInt32BE(data.length, 0);
    head.write(type, 4, 'ascii');
    return Buffer.concat([head, data, Buffer.alloc(4)]); // CRC is not checked by decodePng
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = colorType;
  return Buffer.concat([PNG_SIGNATURE, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

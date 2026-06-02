interface RGB { r: number; g: number; b: number; }
interface HSL { h: number; s: number; l: number; }

export class ColorManager {

  analyzeAndPatch(barElement: HTMLElement): void {
    const varNames = [
      '--acc-color-base', '--acc-color-contrast', '--acc-color-secondary',
      '--acc-color-surface', '--acc-color-border', '--acc-color-muted', '--acc-color-accent',
    ];
    const resolved = this.resolveBatch(varNames, barElement);

    const base = resolved['--acc-color-base'];
    if (!base) return;

    const lBase = this.parseLuminance(base);
    let goDark: boolean;
    if (lBase < 0.18) {
      goDark = false; // dark theme — push text light
    } else if (lBase >= 0.75) {
      goDark = true;  // light theme — push text dark
    } else {
      // mid tone — force near-white base treatment
      goDark = true;
    }

    const patches: Record<string, string> = {};
    const contrast   = resolved['--acc-color-contrast'];
    const muted      = resolved['--acc-color-muted'];
    const surface    = resolved['--acc-color-surface'];
    const border     = resolved['--acc-color-border'];
    const secondary  = resolved['--acc-color-secondary'];

    if (contrast && base) {
      const safe = this.makeSafe(contrast, base, 7, goDark);
      if (safe) patches['--acc-color-contrast'] = safe;
    }
    if (muted && base) {
      const safe = this.makeSafe(muted, base, 4.5, goDark);
      if (safe) patches['--acc-color-muted'] = safe;
    }
    if (muted && surface) {
      const safe = this.makeSafe(muted, surface, 4.5, goDark);
      if (safe) patches['--acc-color-muted'] = safe;
    }
    if (border && surface) {
      const safe = this.makeSafe(border, surface, 3, goDark);
      if (safe) patches['--acc-color-border'] = safe;
    }
    if (secondary && base) {
      const safe = this.makeSafe(secondary, base, 3, goDark);
      if (safe) patches['--acc-color-secondary'] = safe;
    }
    if (base && secondary) {
      const safe = this.makeSafe(base, secondary, 4.5, goDark);
      if (safe) patches['--acc-color-base'] = safe;
    }

    if (Object.keys(patches).length > 0) {
      this.inject(patches);
    }
  }

  private resolveBatch(varNames: string[], el: HTMLElement): Record<string, RGB> {
    const cs = getComputedStyle(el);
    const result: Record<string, RGB> = {};
    for (const name of varNames) {
      const val = cs.getPropertyValue(name).trim();
      const rgb = this.parseRgb(val);
      if (rgb) result[name] = rgb;
    }
    return result;
  }

  private parseRgb(val: string): RGB | null {
    if (!val) return null;
    // Handle rgb(r, g, b) or rgba(r, g, b, a)
    const m = val.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (m) return { r: +m[1], g: +m[2], b: +m[3] };
    // Handle hex
    const hex = val.replace('#', '');
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
      };
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
    return null;
  }

  private parseLuminance(rgb: RGB): number {
    const chan = (c: number) => {
      const s = c / 255;
      return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * chan(rgb.r) + 0.7152 * chan(rgb.g) + 0.0722 * chan(rgb.b);
  }

  private contrastRatio(l1: number, l2: number): number {
    const lighter = Math.max(l1, l2);
    const darker  = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  private analyzeContrast(c1: RGB, c2: RGB): number {
    return this.contrastRatio(this.parseLuminance(c1), this.parseLuminance(c2));
  }

  private makeSafe(fg: RGB, bg: RGB, minRatio: number, goDark: boolean): string | null {
    if (this.analyzeContrast(fg, bg) >= minRatio) return null;

    const hsl = this.toHSL(fg.r, fg.g, fg.b);
    const step = 1.5;
    const maxIter = 67; // covers full 0-100 range

    for (let i = 0; i < maxIter; i++) {
      if (goDark) {
        hsl.l = Math.max(0, hsl.l - step);
      } else {
        hsl.l = Math.min(100, hsl.l + step);
      }
      const candidate = this.fromHSL(hsl.h, hsl.s, hsl.l);
      const rgb = this.parseRgb(candidate);
      if (rgb && this.analyzeContrast(rgb, bg) >= minRatio) return candidate;
    }
    return goDark ? '#000000' : '#ffffff';
  }

  private inject(patches: Record<string, string>): void {
    const existing = document.getElementById('acc-color-patch');
    if (existing) existing.remove();

    const rules = Object.entries(patches)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join('\n');

    const style = document.createElement('style');
    style.id = 'acc-color-patch';
    style.textContent = `.acc-barra {\n${rules}\n}`;
    document.head.appendChild(style);
  }

  private toHSL(r: number, g: number, b: number): HSL {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  private fromHSL(h: number, s: number, l: number): string {
    h /= 360; s /= 100; l /= 100;
    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}

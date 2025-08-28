import { Hsv, Rgba } from './ColourTypes';

const hsvColour = (hue: number, saturation: number, value: number): Hsv => ({
  hue,
  saturation,
  value
});

const fromRgb = (rgbaColour: Rgba): Hsv => {
  let h = 0; let s = 0; let v = 0;
  const r = rgbaColour.red / 255;
  const g = rgbaColour.green / 255;
  const b = rgbaColour.blue / 255;

  const minRGB = Math.min(r, Math.min(g, b));
  const maxRGB = Math.max(r, Math.max(g, b));

  if (minRGB === maxRGB) {
    v = minRGB;

    return hsvColour(
      0,
      0,
      v * 100
    );
  }

  /* eslint no-nested-ternary:0 */
  const d = (r === minRGB) ? g - b : ((b === minRGB) ? r - g : b - r);
  h = (r === minRGB) ? 3 : ((b === minRGB) ? 1 : 5);
  h = 60 * (h - d / (maxRGB - minRGB));
  s = (maxRGB - minRGB) / maxRGB;
  v = maxRGB;

  return hsvColour(
    Math.round(h),
    Math.round(s * 100),
    Math.round(v * 100)
  );
};

export {
  hsvColour,
  fromRgb
};

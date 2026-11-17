// The oxide skin is injected as a <style> element (instead of a plain CSS import) so the
// internal CSS Properties addon can swap it for another skin or for the build compiled
// with @custom-properties-enabled at runtime.
const SKIN_STYLE_ID = 'tox-storybook-skin';

export const setSkinCss = (css: string): void => {
  let style = document.getElementById(SKIN_STYLE_ID);
  if (style === null) {
    style = document.createElement('style');
    style.id = SKIN_STYLE_ID;
    document.head.appendChild(style);
  }
  if (style.textContent !== css) {
    style.textContent = css;
  }
};

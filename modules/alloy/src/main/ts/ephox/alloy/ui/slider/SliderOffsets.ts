import { AlloyComponent } from '../../api/component/ComponentApi';

const top = 'top',
  right = 'right',
  bottom = 'bottom',
  left = 'left',
  width = 'width',
  height = 'height';

// Screen offsets from bounding client rect
const getBounds = (component: AlloyComponent): DOMRect => component.element.dom.getBoundingClientRect();
const getBoundsProperty = (bounds: DOMRect, property: keyof Omit<DOMRect, 'toJSON'>): number => bounds[property];

const getMinXBounds = (component: AlloyComponent): number => {
  const bounds = getBounds(component);
  return getBoundsProperty(bounds, left);
};
const getMaxXBounds = (component: AlloyComponent): number => {
  const bounds = getBounds(component);
  return getBoundsProperty(bounds, right);
};
const getMinYBounds = (component: AlloyComponent): number => {
  const bounds = getBounds(component);
  return getBoundsProperty(bounds, top);
};
const getMaxYBounds = (component: AlloyComponent): number => {
  const bounds = getBounds(component);
  return getBoundsProperty(bounds, bottom);
};
const getXScreenRange = (component: AlloyComponent): number => {
  const bounds = getBounds(component);
  return getBoundsProperty(bounds, width);
};
const getYScreenRange = (component: AlloyComponent): number => {
  const bounds = getBounds(component);
  return getBoundsProperty(bounds, height);
};

const getCenterOffsetOf = (componentMinEdge: number, componentMaxEdge: number, spectrumMinEdge: number): number =>
  (componentMinEdge + componentMaxEdge) / 2 - spectrumMinEdge;

const getXCenterOffSetOf = (component: AlloyComponent, spectrum: AlloyComponent): number => {
  const componentBounds = getBounds(component);
  const spectrumBounds = getBounds(spectrum);
  const componentMinEdge = getBoundsProperty(componentBounds, left);
  const componentMaxEdge = getBoundsProperty(componentBounds, right);
  const spectrumMinEdge = getBoundsProperty(spectrumBounds, left);
  return getCenterOffsetOf(componentMinEdge, componentMaxEdge, spectrumMinEdge);
};
const getYCenterOffSetOf = (component: AlloyComponent, spectrum: AlloyComponent): number => {
  const componentBounds = getBounds(component);
  const spectrumBounds = getBounds(spectrum);
  const componentMinEdge = getBoundsProperty(componentBounds, top);
  const componentMaxEdge = getBoundsProperty(componentBounds, bottom);
  const spectrumMinEdge = getBoundsProperty(spectrumBounds, top);
  return getCenterOffsetOf(componentMinEdge, componentMaxEdge, spectrumMinEdge);
};

export {
  getMinXBounds,
  getMaxXBounds,
  getMinYBounds,
  getMaxYBounds,
  getXScreenRange,
  getYScreenRange,
  getXCenterOffSetOf,
  getYCenterOffSetOf
};

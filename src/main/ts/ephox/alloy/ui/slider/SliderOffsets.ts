import { ClientRect } from '@ephox/dom-globals';
import { AlloyComponent } from '../../api/component/ComponentApi';

const t = 'top',
      r = 'right',
      b = 'bottom',
      l = 'left',
      w = 'width',
      h = 'height';

// Offsets
const getBounds = (component: AlloyComponent): ClientRect => component.element().dom().getBoundingClientRect();
const getBoundsProperty = (bounds: ClientRect, property: string): number => bounds[property];

const getMinXBounds = (component: AlloyComponent): number => {
  const bounds = getBounds(component);
  return getBoundsProperty(bounds, l);
};
const getMaxXBounds = (component: AlloyComponent): number => {
  const bounds = getBounds(component);
  return getBoundsProperty(bounds, r);
};
const getMinYBounds = (component: AlloyComponent): number => {
  const bounds = getBounds(component);
  return getBoundsProperty(bounds, t);
};
const getMaxYBounds = (component: AlloyComponent): number => {
  const bounds = getBounds(component);
  return getBoundsProperty(bounds, b);
};
const getXScreenRange = (component: AlloyComponent): number => {
  const bounds = getBounds(component);
  return getBoundsProperty(bounds, w);
};
const getYScreenRange = (component: AlloyComponent): number => {
  const bounds = getBounds(component);
  return getBoundsProperty(bounds, h);
};

const getCenterOffsetOf = (componentMinEdge: number, componentMaxEdge: number, spectrumMinEdge: number): number => 
  (componentMinEdge + componentMaxEdge) / 2 - spectrumMinEdge;

const getXCenterOffSetOf = (component: AlloyComponent, spectrum: AlloyComponent): number => {
  const componentBounds = getBounds(component);
  const spectrumBounds = getBounds(spectrum);
  const componentMinEdge = getBoundsProperty(componentBounds, l);
  const componentMaxEdge = getBoundsProperty(componentBounds, r);
  const spectrumMinEdge = getBoundsProperty(spectrumBounds, l);
  return getCenterOffsetOf(componentMinEdge, componentMaxEdge, spectrumMinEdge);
};
const getYCenterOffSetOf = (component: AlloyComponent, spectrum: AlloyComponent): number => {
  const componentBounds = getBounds(component);
  const spectrumBounds = getBounds(spectrum);
  const componentMinEdge = getBoundsProperty(componentBounds, t);
  const componentMaxEdge = getBoundsProperty(componentBounds, b);
  const spectrumMinEdge = getBoundsProperty(spectrumBounds, t);
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
}
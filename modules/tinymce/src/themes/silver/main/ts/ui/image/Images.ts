import { AddEventsBehaviour, AlloyEvents, Behaviour, SimpleSpec } from '@ephox/alloy';
import { Arr, Obj, Optional } from '@ephox/katamari';
import { Css, Insert, Remove, SelectorFind, SugarElement } from '@ephox/sugar';

export type ImageProvider = () => Record<string, string>;

interface ImageSpec {
  readonly tag: string;
  readonly classes: string[];
  readonly attributes?: Record<string, string>;
  readonly behaviours?: Array<Behaviour.NamedConfiguredBehaviour<any, any, any>>;
  readonly label: Optional<string>;
}

const getInnerHTML = (url: string): string => `
  <div style="width: 46px; height: 46px; display: flex; align-items: center; justify-content: center;">
    <img src="${url}" />
  </div>
`;

const spinnerWrapperStyles = {
  'position': 'relative',
  'width': '100%',
  'height': '100%',
  'display': 'flex',
  'justify-content': 'center',
  'align-items': 'center'
};

const spinnerStyles = {
  'position': 'absolute',
  'width': 'min(24px, 30%)',
  'aspect-ratio': '1 / 1',
  'border-radius': '50%',
  'border': '3px solid #207ab7',
  'border-bottom-color': 'transparent',
  'animation': 'tox-rotation 1s linear infinite'
};

const renderImage = (spec: ImageSpec, imageUrl: string): SimpleSpec => {
  const spinnerElement = SugarElement.fromTag('div');
  Css.setAll(spinnerElement, spinnerStyles);

  const addSpinnerElement = (loadingElement: SugarElement) => {
    Css.setAll(loadingElement, spinnerWrapperStyles);

    Insert.append(loadingElement, spinnerElement);
  };

  const removeSpinnerElement = (loadingElement: SugarElement) => {
    Arr.each(Obj.keys(spinnerWrapperStyles), (k) => {
      Css.remove(loadingElement, k);
    });

    Remove.remove(spinnerElement);
  };
  return {
    dom: {
      tag: spec.tag,
      attributes: spec.attributes ?? {},
      classes: spec.classes,
      innerHtml: getInnerHTML(imageUrl),
    },
    components: [],
    behaviours: Behaviour.derive([
      ...spec.behaviours ?? [],
      AddEventsBehaviour.config('render-image-events', [
        AlloyEvents.runOnAttached((component) => {
          addSpinnerElement(component.element);
          SelectorFind.descendant<SVGImageElement>(component.element, 'img').each((image) => {
            image.dom.addEventListener('load', () => {
              removeSpinnerElement(component.element);
            });
          });
        })
      ]),
    ])
  };
};

const render = (imageUrl: string, spec: ImageSpec): SimpleSpec =>
  renderImage(spec, imageUrl);

export { render };

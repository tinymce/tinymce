import { AddEventsBehaviour, AlloyEvents, Behaviour, SimpleSpec } from '@ephox/alloy';
import { Arr, Obj } from '@ephox/katamari';
import { Css, Insert, Ready, Remove, SelectorFind, SugarElement } from '@ephox/sugar';
import createDompurify from 'dompurify';

export type ImageProvider = () => Record<string, string>;

interface ImageSpec {
  readonly tag: string;
  readonly classes: string[];
  readonly attributes?: Record<string, string>;
  readonly behaviours?: Array<Behaviour.NamedConfiguredBehaviour<any, any, any>>;
}

const getInnerHTML = (url: string): string => createDompurify().sanitize(`
  <div style="width: 46px; height: 46px; display: flex; align-items: center; justify-content: center;">
    <img style="max-width: 100%; max-height: 100%" src="${url}" />
  </div>
`);

const spinnerWrapperStyles = {
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
          SelectorFind.descendant<HTMLImageElement>(component.element, 'img').each((image) => {
            Ready.image(image).then(() => {
              removeSpinnerElement(component.element);
            }).catch(() => {
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

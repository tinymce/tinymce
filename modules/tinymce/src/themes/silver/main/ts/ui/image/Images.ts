import { AddEventsBehaviour, AlloyEvents, AlloySpec, Behaviour, SimpleSpec } from '@ephox/alloy';
import { Optional } from '@ephox/katamari';
import { Class, Insert, Ready, Remove, SelectorFind, SugarElement } from '@ephox/sugar';

export type ImageProvider = () => Record<string, string>;

interface ImageSpec {
  readonly tag: string;
  readonly classes: string[];
  readonly attributes?: Record<string, string>;
  readonly behaviours?: Array<Behaviour.NamedConfiguredBehaviour<any, any, any>>;
  readonly checkMark: Optional<AlloySpec>;
}

const renderImage = (spec: ImageSpec, imageUrl: string): SimpleSpec => {
  const spinnerElement = SugarElement.fromTag('div');
  Class.add(spinnerElement, 'tox-image-selector-loading-spinner');

  const addSpinnerElement = (loadingElement: SugarElement) => {
    Class.add(loadingElement, 'tox-image-selector-loading-spinner-wrapper');

    Insert.append(loadingElement, spinnerElement);
  };

  const removeSpinnerElement = (loadingElement: SugarElement) => {
    Class.remove(loadingElement, 'tox-image-selector-loading-spinner-wrapper');
    Remove.remove(spinnerElement);
  };

  return {
    dom: {
      tag: spec.tag,
      attributes: spec.attributes ?? {},
      classes: spec.classes,
    },
    components: [
      {
        dom: {
          tag: 'div',
          classes: [ 'tox-image-selector-image-wrapper' ]
        },
        components: [
          {
            dom: {
              tag: 'img',
              attributes: { src: imageUrl },
              classes: [ 'tox-image-selector-image-img' ]
            }
          },
        ]
      },
      ...spec.checkMark.toArray()
    ],
    behaviours: Behaviour.derive([
      ...spec.behaviours ?? [],
      AddEventsBehaviour.config('render-image-events', [
        AlloyEvents.runOnAttached((component) => {
          addSpinnerElement(component.element);
          SelectorFind.descendant<HTMLImageElement>(component.element, 'img').each((image) => {
            Ready.image(image).catch((e) => {
              // eslint-disable-next-line no-console
              console.error(e);
            }).finally(() => {
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

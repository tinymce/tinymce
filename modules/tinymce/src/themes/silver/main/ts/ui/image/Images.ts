import { AddEventsBehaviour, AlloyEvents, Behaviour, SimpleSpec } from '@ephox/alloy';
import { Arr, Optional } from '@ephox/katamari';
import { SelectorFilter, SelectorFind } from '@ephox/sugar';

export type ImageProvider = () => Record<string, string>;

interface ImageSpec {
  readonly tag: string;
  readonly classes: string[];
  readonly attributes?: Record<string, string>;
  readonly behaviours?: Array<Behaviour.NamedConfiguredBehaviour<any, any, any>>;
  readonly label: Optional<string>;
}

const getSvgWithLoading = (url: string): string => `<svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
  <style>
    .ball {
      animation: bounce 2s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        cy: 30px;
      }
      50% {
        cy: 170px;
      }
    }
  </style>
  <circle class="ball" cx="10" cy="5" r="5" fill="red" />
  <image
    width="48"
    height="48"
    preserveaspectratio="xMidYMid slice"
    href="${url}"
  />
</svg>`;

const renderImage = (spec: ImageSpec, imageUrl: string): SimpleSpec => {
  return {
    dom: {
      tag: spec.tag,
      attributes: spec.attributes ?? {},
      classes: spec.classes,
      innerHtml: getSvgWithLoading(imageUrl),
    },
    components: [],
    behaviours: Behaviour.derive([
      ...spec.behaviours ?? [],
      AddEventsBehaviour.config('render-image-events', [
        AlloyEvents.runOnAttached((component) => {
          SelectorFind.descendant<SVGImageElement>(component.element, 'image').each((image) => {
            image.dom.addEventListener('load', () => {
              Arr.each(SelectorFilter.descendants<SVGAElement>(component.element, 'circle, style'), (e) => {
                e.dom.remove();
              });
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

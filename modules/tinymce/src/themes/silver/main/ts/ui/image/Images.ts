import { AddEventsBehaviour, AlloyEvents, Behaviour, SimpleSpec } from '@ephox/alloy';
import { Optional } from '@ephox/katamari';
import { Class, Insert, SelectorFind, SugarElement } from '@ephox/sugar';

export type ImageProvider = () => Record<string, string>;

interface ImageSpec {
  readonly tag: string;
  readonly classes: string[];
  readonly attributes?: Record<string, string>;
  readonly behaviours?: Array<Behaviour.NamedConfiguredBehaviour<any, any, any>>;
  readonly label: Optional<string>;
}

// const getSvgWithLoading = (url: string): string => `<svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
//   <style>
//     .ball {
//       animation: bounce 2s infinite;
//     }

//     @keyframes bounce {
//       0%, 100% {
//         cy: 30px;
//       }
//       50% {
//         cy: 170px;
//       }
//     }
//   </style>
//   <circle class="ball" cx="10" cy="5" r="5" fill="red" />
//   <image
//     width="48"
//     height="48"
//     preserveaspectratio="xMidYMid slice"
//     href="${url}"
//   />
// </svg>`;

const getInnerHTML = (url: string): string => `
  <div style="width: 48px; height: 48px; display: flex; align-items: center;">
    <img src="${url}" />
  </div>
`;

const spinnerWrapperClass = 'tox-uc-loading-spinner-wrapper';
const spinnerElementClass = 'tox-uc-loading-spinner';

const addSpinnerElement = (loadingElement: SugarElement) => {
  Class.add(loadingElement, spinnerWrapperClass);

  const spinnerElement = SugarElement.fromTag('div');
  Class.add(spinnerElement, spinnerElementClass);
  Insert.append(loadingElement, spinnerElement);
};

const renderImage = (spec: ImageSpec, imageUrl: string): SimpleSpec => {
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
              // eslint-disable-next-line no-console
              console.log('img loaded');
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

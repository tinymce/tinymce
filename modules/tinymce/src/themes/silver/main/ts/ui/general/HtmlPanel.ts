import { AlloyComponent, Behaviour, Bubble, Container as AlloyContainer, Focusing, Layout, SketchSpec, Tabstopping, Tooltipping, AddEventsBehaviour, AlloyEvents } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Fun } from '@ephox/katamari';
import { Attribute, Focus, SelectorFind } from '@ephox/sugar';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';

type HtmlPanelSpec = Omit<Dialog.HtmlPanel, 'type'>;

export const renderHtmlPanel = (spec: HtmlPanelSpec, providersBackstage: UiFactoryBackstageProviders): SketchSpec => {
  const classes = [ 'tox-form__group', ...(spec.stretched ? [ 'tox-form__group--stretched' ] : []) ];
  const init = AddEventsBehaviour.config('htmlpanel', [
    AlloyEvents.runOnAttached((comp) => {
      spec.onInit(comp.element.dom);
    })
  ]);

  if (spec.presets === 'presentation') {
    return AlloyContainer.sketch({
      dom: {
        tag: 'div',
        classes,
        innerHtml: spec.html
      },
      containerBehaviours: Behaviour.derive([
        Tooltipping.config({
          ...providersBackstage.tooltips.getConfig({
            tooltipText: '',
            onShow: (comp) => {
              SelectorFind.descendant(comp.element, '[data-mce-tooltip]:hover').orThunk(() => Focus.search(comp.element))
                .each((current) => {
                  Attribute.getOpt(current, 'data-mce-tooltip').each((text) => {
                    Tooltipping.setComponents(comp, providersBackstage.tooltips.getComponents( { tooltipText: text }));
                  });
                });
            },
          }),
          mode: 'children-normal',
          anchor: (comp: AlloyComponent) => ({
            type: 'node',
            node: SelectorFind.descendant(comp.element, '[data-mce-tooltip]:hover')
              .orThunk(() => Focus.search(comp.element).filter((current) => Attribute.getOpt(current, 'data-mce-tooltip').isSome())),
            root: comp.element,
            layouts: {
              onLtr: Fun.constant([ Layout.south, Layout.north, Layout.southeast, Layout.northeast, Layout.southwest, Layout.northwest ]),
              onRtl: Fun.constant([ Layout.south, Layout.north, Layout.southeast, Layout.northeast, Layout.southwest, Layout.northwest ])
            },
            bubble: Bubble.nu(0, -2, {}),
          })
        }),
        init
      ])
    });
  } else {
    return AlloyContainer.sketch({
      dom: {
        tag: 'div',
        classes,
        innerHtml: spec.html,
        attributes: {
          role: 'document'
        }
      },
      containerBehaviours: Behaviour.derive([
        Tabstopping.config({ }),
        Focusing.config({ }),
        init
      ])
    });
  }
};

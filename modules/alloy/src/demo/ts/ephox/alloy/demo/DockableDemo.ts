import { Optional } from '@ephox/katamari';
import { Class, Css, DomEvent, SelectorFind, SugarElement, SugarLocation } from '@ephox/sugar';

import * as Boxes from 'ephox/alloy/alien/Boxes';
import * as AddEventsBehaviour from 'ephox/alloy/api/behaviour/AddEventsBehaviour';
import { AllowBubbling } from 'ephox/alloy/api/behaviour/AllowBubbling';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Docking } from 'ephox/alloy/api/behaviour/Docking';
import { Dragging } from 'ephox/alloy/api/behaviour/Dragging';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { AlloySpec } from 'ephox/alloy/api/component/SpecTypes';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as SystemEvents from 'ephox/alloy/api/events/SystemEvents';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import { Button } from 'ephox/alloy/api/ui/Button';
import { DockingConfigSpec, DockingViewport } from 'ephox/alloy/behaviour/docking/DockingTypes';
import * as HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';

export default (): void => {
  const gui = Gui.create();
  const body = SugarElement.fromDom(document.body);
  Class.add(gui.element, 'gui-root-demo-container');

  Attachment.attachSystem(body, gui);
  // Css.set(body, 'margin-top', '2000px');
  Css.set(body, 'padding-bottom', '2000px');

  // The example without a bounding scrolling container is rather large, so it can
  // be useful to just remove it when focusing on scrolling container development.
  const includeWindowExample = false;

  // TINY-9242: Make scrollable examples work properly
  const includeScrollableExamples = true;

  const listenToWindowScroll = true;
  // Until TINY-9242 is implemented, element scroll is emulated by a window scroll
  const listenToElementScroll = true;

  /* As of alloy 3.51.0, alloy root contains must be told about scroll events */
  DomEvent.bind(SugarElement.fromDom(window), 'scroll', (evt) => {
    if (listenToWindowScroll) {
      gui.broadcastEvent(SystemEvents.windowScroll(), evt);
    }
  });

  const toggleButton = (boxId: number) => {

    const runOnComp = (dockingApi: (comp: AlloyComponent) => void) => () => {
      const comp = gui.getByDom(SelectorFind.first('.docking-' + boxId).getOrDie()).getOrDie();
      dockingApi(comp);
    };

    const apiButton = (label: string, dockingApi: (comp: AlloyComponent) => void) => {
      return Button.sketch({
        dom: {
          tag: 'button',
          innerHtml: label
        },
        action: runOnComp(dockingApi)
      });
    };

    return {
      dom: {
        tag: 'div',
        classes: [ `button-container-${boxId}` ],
        styles: {
          'position': 'fixed',
          'bottom': '0px',
          'left': `${(boxId - 1) * 350}px`,
          'padding': '1em',
          'background-color': 'black',
          'color': 'white',
          'z-index': '150'
        }
      },
      components: [
        {
          dom: {
            tag: 'span',
            styles: {
              'font-size': '1.5em',
              'font-weight': 'bold'
            },
            innerHtml: `(${boxId})`
          }
        },
        apiButton('Top', Docking.forceDockToTop),
        apiButton('Bottom', Docking.forceDockToBottom),
        apiButton('Refresh', Docking.refresh),
        apiButton('Reset (Undock)', Docking.reset)
      ]
    };
  };

  const barStyles = {
    'background': '#cadbee',
    'width': '400px',
    'height': '50px',
    'border': '2px solid black',
    'z-index': '100'
  };

  const redPanelStyles = {
    'background': 'red',
    'width': '500px',
    'height': '3600px',
    'z-index': '50'
  };

  const dockingSharedContext = {
    transitionClass: 'demo-alloy-dock-transition',
    fadeOutClass: 'demo-alloy-dock-fade-out',
    fadeInClass: 'demo-alloy-dock-fade-in',
  };

  const makeExampleWith = (
    settings: {
      boxId: number;
      label: string;
      scrollableContainerStyles: Optional<Record<string, string>>;
      extraRedPanelStyles: Record<string, string>;
      extraBarStyles: Record<string, string>;
      lazyViewport: DockingConfigSpec['lazyViewport'];
      hideWhenContextGone: boolean;
    }
  ): AlloySpec => {
    const redPanel: AlloySpec = {
      uid: `panel-container-${settings.boxId}`,
      dom: {
        tag: 'div',
        styles: {
          ...redPanelStyles,
          ...settings.extraRedPanelStyles
        }
      },
      components: [
        {
          dom: {
            tag: 'div',
            styles: {
              background: 'black',
              opacity: '0.5',
              height: '75px',
              width: '400px'
            }
          }
        },
        {
          dom: {
            tag: 'div',
            classes: [ `docking-${settings.boxId}` ],
            styles: {
              ...barStyles,
              ...settings.extraBarStyles
            }
          },
          behaviours: Behaviour.derive([
            Dragging.config({
              mode: 'mouse',
              blockerClass: 'blocker'
            }),

            Docking.config({
              lazyViewport: settings.lazyViewport,
              ...(settings.hideWhenContextGone ? {
                contextual: {
                  ...dockingSharedContext,
                  lazyContext: (component) => {
                    return component.getSystem()
                      .getByUid(`panel-container-${settings.boxId}`)
                      .toOptional()
                      .map((c) => Boxes.box(c.element));
                  }
                }
              } : { })
            })
          ]),
          eventOrder: {
            [SystemEvents.windowScroll()]: [ 'dragging', 'docking' ]
          }
        }
      ]
    };

    return {
      dom: {
        tag: 'div',
        classes: [ 'docking-example' ]
      },
      components: [
        {
          dom: {
            tag: 'h3',
            innerHtml: `(${settings.boxId}) ${settings.label}`
          }
        },
        toggleButton(settings.boxId),
        settings.scrollableContainerStyles.map((styles) => ({
          uid: `scrollable-container-${settings.boxId}`,
          dom: {
            tag: 'div',
            classes: [ 'scroller' ],
            styles: {
              background: 'purple',
              height: '400px',
              overflow: 'auto',
              ...styles
            }
          },
          components: [ redPanel ],
          // TINY-9242: Support element scroll natively through alloy and docking, rather than
          // just emulating a window scroll
          behaviours: Behaviour.derive([
            AllowBubbling.config({
              events: [
                {
                  native: 'scroll',
                  simulated: 'bubbled.scroll'
                }
              ]
            }),
            AddEventsBehaviour.config('bubbled-scroll-events', [
              AlloyEvents.run('bubbled.scroll', (comp, se) => {
                if (listenToElementScroll) {
                  comp.getSystem().broadcastEvent(SystemEvents.externalElementScroll(), se.event);
                }
              })
            ])
          ]),
        })).getOr(redPanel)
      ]
    };
  };

  const getCommonLazyViewport = (boxId: number) => (comp: AlloyComponent): DockingViewport => {
    const scroller = comp.getSystem().getByUid(
      `scrollable-container-${boxId}`
    ).getOrDie();

    return {
      bounds: Boxes.box(scroller.element),
      optScrollEnv: Optional.some({
        currentScrollTop: scroller.element.dom.scrollTop,
        scrollElmTop: SugarLocation.absolute(scroller.element).top
      })
    };
  };

  const example1 = () => {
    const boxId = 1;
    return makeExampleWith({
      boxId,
      label: 'The blue panel will always stay on screen as long as the red rectangle is on screen',
      extraRedPanelStyles: {
        'margin-top': '1400px'
      },
      extraBarStyles: { left: '150px', top: '2500px', position: 'absolute' },
      scrollableContainerStyles: Optional.none(),
      lazyViewport: undefined,
      hideWhenContextGone: true
    });
  };

  const example2 = () => {
    const boxId = 2;
    return makeExampleWith({
      boxId,
      label: 'Docking with scrollable containers',
      extraRedPanelStyles: {
        'margin-top': '1000px',
        'margin-bottom': '200px',
        'position': 'relative'
      },
      extraBarStyles: {
        'position': 'absolute',
        'top': '200px',
        'left': '150px',
        'z-index': '100'
      },
      scrollableContainerStyles: Optional.some({ }),
      lazyViewport: getCommonLazyViewport(boxId),
      hideWhenContextGone: true
    });
  };

  const example3 = () => {
    const boxId = 3;
    return makeExampleWith({
      boxId,
      label: 'Docking with a scrollable container that is the offset parent',
      extraRedPanelStyles: {
        'margin-top': '1400px',
        'margin-bottom': '500px'
      },
      extraBarStyles: {
        top: '200px',
        left: '150px',
        position: 'absolute'
      },
      scrollableContainerStyles: Optional.some({ position: 'relative' }),
      lazyViewport: getCommonLazyViewport(boxId),
      // Because this is a relative scroller, and the top of bar is considerably
      // less than the top of the red panel, we just always show the bar
      hideWhenContextGone: false
    });
  };

  const example4 = () => {
    const boxId = 4;
    return makeExampleWith({
      boxId,
      label: 'Docking with scrollable containers but no sink (no relative ancestor)',
      extraRedPanelStyles: {
        'margin-top': '1400px',
        'margin-bottom': '500px'
      },
      extraBarStyles: {
        position: 'absolute',
        top: '800px',
        left: '10px'
      },
      scrollableContainerStyles: Optional.some({ }),
      lazyViewport: getCommonLazyViewport(boxId),
      hideWhenContextGone: true
    });
  };

  HtmlDisplay.section(
    gui,
    `A collection of docking examples. The blue rectangle has docking.
    The API calls are in a black command panel at the bottom of the screen,
    labelled by the example they control`,
    {
      dom: {
        tag: 'div',
      },
      components: [
        ...(includeWindowExample ? [ example1() ] : []),
        ...(includeScrollableExamples ? [
          example2(),
          example3(),
          example4()
        ] : [])
      ]
    }
  );
};

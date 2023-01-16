import { TestStore, Waiter } from '@ephox/agar';
import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Optional, Result } from '@ephox/katamari';
import { Css, SelectorFind, Selectors, SugarElement, SugarLocation } from '@ephox/sugar';
import { assert } from 'chai';

import * as Boxes from 'ephox/alloy/alien/Boxes';
import * as AddEventsBehaviour from 'ephox/alloy/api/behaviour/AddEventsBehaviour';
import { AllowBubbling } from 'ephox/alloy/api/behaviour/AllowBubbling';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Docking } from 'ephox/alloy/api/behaviour/Docking';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { AlloySpec } from 'ephox/alloy/api/component/SpecTypes';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import * as SystemEvents from 'ephox/alloy/api/events/SystemEvents';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';

describe('browser.alloy.behaviour.docking.DockingInScrollingContainerTest', () => {

  const boxClass = 'docking-box';
  const scrollerClass = 'box-scroller';

  const makeDividingSection = (height: number, color: string) => ({
    dom: {
      tag: 'div',
      styles: {
        'height': `${height}px`,
        'background-color': color
      }
    }
  });

  const getRect = (comp: AlloyComponent): DOMRect =>
    (comp.element as SugarElement<HTMLElement>).dom.getBoundingClientRect();

  const makeScrollerBehaviours = () => Behaviour.derive([
    AllowBubbling.config({
      events: [
        {
          native: 'scroll',
          simulated: 'test.bubbled.scroll'
        }
      ]
    }),
    AddEventsBehaviour.config('bubbled-scroll-events', [
      AlloyEvents.run('test.bubbled.scroll', (comp, se) => {
        comp.getSystem().broadcastEvent(SystemEvents.externalElementScroll(), se.event);
        // Don't bubble up to the next scroller.
        se.stop();
      })
    ])
  ]);

  const makeBoxWithStyles = (store: TestStore<string>, styles: Record<string, string>): AlloySpec => {
    return {
      dom: {
        tag: 'div',
        classes: [ boxClass ],
        styles: {
          width: '200px',
          height: '200px',
          background: '#cadbee',
          ...styles
        }
      },
      behaviours: Behaviour.derive([
        Docking.config({
          onDocked: store.adder('static.onDocked'),
          onUndocked: store.adder('static.onUndocked'),
          lazyViewport: (boxComp) => {
            const scroller = boxComp.getSystem().getByDom(
              SelectorFind.ancestor(boxComp.element, `.${scrollerClass}`).getOrDie(
                'Could not find scroller of box'
              )
            ).getOrDie();
            return {
              bounds: Boxes.box(scroller.element),
              optScrollEnv: Optional.some({
                currentScrollTop: scroller.element.dom.scrollTop,
                scrollElmTop: SugarLocation.absolute(scroller.element).top
              })
            };
          }
        })
      ])
    };
  };

  const pAssertBoxDockedToTop = (label: string, scroller: AlloyComponent, box: AlloyComponent) =>
    Waiter.pTryUntil(
      `[WAIT for top dock]: ${label}`,
      () => {
        assert.isTrue(
          Math.abs(getRect(scroller).top - getRect(box).top) < 5,
          'Check that the top positions of scroller and box are approximately equal'
        );

        assert.equal(
          'fixed',
          Css.getRaw(box.element, 'position').getOrDie('Should have position'),
          'Checking "position" style'
        );
      }
    );

  const pAssertBoxDockedToBottom = (label: string, scroller: AlloyComponent, box: AlloyComponent) =>
    Waiter.pTryUntil(
      `[WAIT for bottom dock]: ${label}`,
      () => {
        assert.isTrue(
          Math.abs(getRect(scroller).bottom - getRect(box).bottom) < 5,
          'Check that the bottom positions of scroller and box are approximately equal'
        );

        assert.equal(
          'fixed',
          Css.getRaw(box.element, 'position').getOrDie('Should have position'),
          'Checking "position" style'
        );
      }
    );

  const findCompBySelector = (comp: AlloyComponent, selector: string): Result<AlloyComponent, any> => {
    const optElement = SelectorFind.descendant(comp.element, selector);
    return optElement.fold(
      () => Result.error<AlloyComponent, any>(`Could not find element defined by select "${selector}"`),
      (elem) => comp.getSystem().getByDom(elem)
    );
  };

  const getSubjects = (component: AlloyComponent): Result<{ scroller: AlloyComponent; box: AlloyComponent }, any> => {
    const resScroller = Selectors.is(component.element, `.${scrollerClass}`)
      ? Result.value(component)
      : findCompBySelector(component, `.${scrollerClass}`);

    return resScroller
      .bind((scroller) => findCompBySelector(scroller, `.${boxClass}`)
        .map((box) => ({ scroller, box }))
      );
  };

  const runRoundtrippingTest = (label: string, component: AlloyComponent, scrollOffset: number) => {
    const { scroller, box } = getSubjects(component).getOrDie();

    // Scroll the specified amount before starting the round-tripping. This catches the cases
    // where an initial scroll value compounds the error.
    scroller.element.dom.scrollTop = scrollOffset;

    // Now dock, and undock, and dock, and undock, and compare position.
    const initialPos = box.element.dom.getBoundingClientRect().top;

    Docking.forceDockToTop(box);
    Docking.refresh(box);
    Docking.forceDockToTop(box);
    Docking.refresh(box);

    const newPos = box.element.dom.getBoundingClientRect().top;
    assert.isTrue(
      Math.abs(initialPos - newPos) < 5,
      `${label}. Docking box should not have moved after round-tripping docking on and off\n
        Initial y: ${initialPos}\n
        New y: ${newPos}`
    );
  };

  context('Static Positioning', () => {
    const makeStaticBox = (store: TestStore<string>): AlloySpec => makeBoxWithStyles(
      store,
      { }
    );

    context('Single scroller', () => {

      const hook = GuiSetup.bddSetup(
        (store, _doc, _body): AlloyComponent => {

          const staticBox: AlloySpec = makeStaticBox(store);

          return GuiFactory.build(
            {
              dom: {
                tag: 'div',
                classes: [ scrollerClass ],
                styles: {
                  'height': '600px',
                  'overflow': 'auto',
                  'margin-bottom': '1000px',
                }
              },
              components: [
                makeDividingSection(1000, 'purple'),
                staticBox,
                makeDividingSection(1000, 'purple')
              ],
              behaviours: makeScrollerBehaviours()
            }
          );
        }
      );

      beforeEach(() => {
        const { scroller } = getSubjects(hook.component()).getOrDie();
        scroller.element.dom.scrollTop = 0;
        window.scrollTo(0, 0);
      });

      it('Round trip Docking and Undocking with scroll', () => {
        runRoundtrippingTest('Nested static', hook.component(), 900);
      });

      it('Docking and Undocking', async () => {
        const scroller = hook.component();

        const staticBox = scroller.components()[1];

        // OK. so initially, the static box will be off-screen, because no scrolling event has occurred,
        // so we'll fire an external scrolling event to get it into position.
        AlloyTriggers.emit(scroller, 'test.bubbled.scroll');

        // It should have docked to the bottom
        await pAssertBoxDockedToBottom(
          'The static box should dock to the bottom after emulated event',
          scroller,
          staticBox
        );

        // Now, scroll the scroller down 900px. That should make 100px of the dividing section still visible,
        // and because the height of the scroller is 400px, the static box should have moved.
        scroller.element.dom.scrollTop = 900;
        await Waiter.pTryUntil(
          'Wait until is undocked',
          () => {
            assert.isFalse(
              Css.getRaw(staticBox.element, 'position').isSome(),
              'Checking "position" style'
            );

            // Check that it is appearing about 100 pixels lower than the top of the scroller
            assert.isTrue(
              Math.abs(getRect(staticBox).top - (getRect(scroller).top + 100)) < 5,
              'Check that the static box is appearing about 100px down from the scroller'
            );
          }
        );

        // Scroll a further 125px and check that it is docking to the top
        scroller.element.dom.scrollTop = 900 + 125;
        await pAssertBoxDockedToTop(
          'After the 125px additional scroll',
          scroller,
          staticBox
        );

        // Now, scroll the window so that the top position of the scroller moves. We want
        // to check that when it will undock later, it will still be in the right position.
        // We choose 50 so that it doesn't scroll all the way to the end of the first dividing
        // section
        window.scrollTo(0, getRect(scroller).top + 50);

        // Now, we want to check that it will undock at the right point, even though the
        // window has scrolled. So if we trigger a scroll event now, it should stay docked.
        AlloyTriggers.emit(scroller, 'test.bubbled.scroll');

        // And is we scroll the scroller back up 125 px, it should undock.
        scroller.element.dom.scrollTop = 900;
        await Waiter.pTryUntil(
          'Wait until is undocked post the scroll',
          () => {
            assert.isFalse(
              Css.getRaw(staticBox.element, 'position').isSome(),
              'Checking "position" style'
            );

            // Check that it is appearing about 100 pixels lower than the top of the scroller
            assert.isTrue(
              Math.abs(getRect(staticBox).top - (getRect(scroller).top + 100)) < 5,
              'Check that the static box is appearing about 100px down from the scroller'
            );
          }
        );
      });
    });

    context('Nested scrollers', () => {
      const hook = GuiSetup.bddSetup(
        (store, _doc, _body): AlloyComponent => {

          const staticBox: AlloySpec = makeStaticBox(store);

          return GuiFactory.build(
            {
              dom: {
                tag: 'div',
                styles: {
                  'height': '600px',
                  'overflow': 'auto',
                  'margin-bottom': '1000px',
                }
              },
              components: [
                makeDividingSection(200, 'orange'),
                {
                  dom: {
                    tag: 'div',
                    classes: [ scrollerClass ],
                    styles: {
                      'height': '500px',
                      'overflow': 'auto',
                      'margin-bottom': '1000px',
                      'outline': '10px solid magenta'
                    }
                  },
                  components: [
                    makeDividingSection(300, 'green'),
                    staticBox,
                    makeDividingSection(1200, 'lime')
                  ],
                  behaviours: makeScrollerBehaviours()
                },
                makeDividingSection(200, 'orange')
              ],
              behaviours: makeScrollerBehaviours()
            }
          );
        }
      );

      beforeEach(() => {
        const { scroller } = getSubjects(hook.component()).getOrDie();
        scroller.element.dom.scrollTop = 0;
        window.scrollTo(0, 0);
      });

      it('Round trip Docking and Undocking with scroll', () => {
        runRoundtrippingTest('Nested static', hook.component(), 40);
      });

      it('Docking and Undocking', async () => {

        /*
         * The main issue here is that our Location.absolute, which we tend to use everywhere
         * considers only the page scroll and not the wrapping scrolling container's scroll. We
         * have code in docking to consider the "top" position of the scroller (which would be
         * influenced by ancestor scrollers scrolling), and we want to test that here. The basic
         * approach is:
         *
         * (1) Scroll the inner scroller until the box is docked by about 10px
         * (2) Scroll the outer scroller so that it is much further down the page
         * (3) Scroll the inner scroller back by just more than the docking delta (e.g. 10px)
         * (4) Check that it has undocked.
         */
        const outerScroller = hook.component();
        const innerScroller = outerScroller.components()[1];
        const staticBox = innerScroller.components()[1];

        // The height of the green divider is 300px, so scroll the inner scroller by 310 px to trigger
        // docking
        innerScroller.element.dom.scrollTop = 310;
        await pAssertBoxDockedToTop(
          'After scrolling the inner scroller',
          innerScroller,
          staticBox
        );

        // Now, scroll the outer scroller 800px down the page
        outerScroller.element.dom.scrollTop = 400;

        // Now, scroll the inner scroller 100px up the page, so the static box should undock
        innerScroller.element.dom.scrollTop = 210;
        await Waiter.pTryUntil(
          'Wait until is undocked even though the outer scroll has changed',
          () => {
            assert.isFalse(
              Css.getRaw(staticBox.element, 'position').isSome(),
              'Checking "position" style'
            );

            // Check that it is appearing about 90 pixels lower than the top of the scroller
            assert.isTrue(
              Math.abs(getRect(staticBox).top - (getRect(innerScroller).top + 90)) < 5,
              'Check that the static box is appearing about 100px down from the scroller'
            );
          }
        );
      });

    });
  });

  context('Absolute Positioning', () => {
    const makeAbsoluteBox = (store: TestStore<string>, top: number): AlloySpec => makeBoxWithStyles(
      store,
      {
        position: 'absolute',
        top: `${top}px`,
        left: '50px'
      }
    );

    context('Single scroller (position relative [Offset parent] on scroller)', () => {
      const hook = GuiSetup.bddSetup(
        (store, _doc, _body): AlloyComponent => {

          // We use "800" as the top here
          const absoluteBox: AlloySpec = makeAbsoluteBox(store, 800);

          return GuiFactory.build(
            {
              dom: {
                tag: 'div',
                classes: [ scrollerClass ],
                styles: {
                  'height': '600px',
                  'overflow': 'auto',
                  'margin-bottom': '1000px',
                  'position': 'relative'
                }
              },
              components: [
                makeDividingSection(1000, 'purple'),
                absoluteBox,
                makeDividingSection(1000, '#4f8585')
              ],
              behaviours: makeScrollerBehaviours()
            }
          );
        }
      );

      beforeEach(() => {
        const { scroller } = getSubjects(hook.component()).getOrDie();
        scroller.element.dom.scrollTop = 0;
        window.scrollTo(0, 0);
      });

      it('Round trip Docking and Undocking with scroll', () => {
        runRoundtrippingTest('Absolute', hook.component(), 510);
      });

      it('Docking and Undocking', async () => {
        const { scroller, box: absoluteBox } = getSubjects(hook.component()).getOrDie();

        // OK. so initially, the absolute box will be off-screen, because no scrolling event has occurred,
        // so we'll fire an external scrolling event to get it into position.
        AlloyTriggers.emit(scroller, 'test.bubbled.scroll');

        // It should have docked to the bottom
        await pAssertBoxDockedToBottom(
          'The absolute box should dock to the bottom after emulated event',
          scroller,
          absoluteBox
        );
        // Now, scroll the scroller down 500px. That should make 500px of the dividing section still visible,
        // and the box should be at 300px (800 - 500). It should undock.
        scroller.element.dom.scrollTop = 500;

        await Waiter.pTryUntil(
          'Wait until is undocked',
          () => {
            assert.equal(
              'absolute',
              Css.getRaw(absoluteBox.element, 'position').getOrDie(),
              'Checking "position" style'
            );

            // Check that it is appearing about 100 pixels lower than the top of the scroller
            assert.isTrue(
              Math.abs(getRect(absoluteBox).top - (getRect(scroller).top + 300)) < 5,
              'Check that the static box is appearing about 300px down from the scroller'
            );
          }
        );
      });
    });

    context('Single scroller (position relative inside scroller)', () => {
      const hook = GuiSetup.bddSetup(
        (store, _doc, _body): AlloyComponent => {

          const absoluteBox: AlloySpec = makeAbsoluteBox(store, 800);

          return GuiFactory.build(
            {
              dom: {
                tag: 'div',
                classes: [ scrollerClass ],
                styles: {
                  'height': '600px',
                  'overflow': 'auto',
                  'margin-bottom': '1000px',
                  'position': 'relative'
                }
              },
              components: [
                {
                  dom: {
                    tag: 'div',
                    styles: {
                      position: 'relative'
                    }
                  },
                  components: [
                    makeDividingSection(1000, 'purple'),
                    absoluteBox,
                    makeDividingSection(1000, '#4f8585')
                  ]
                }
              ],
              behaviours: makeScrollerBehaviours()
            }
          );
        }
      );

      beforeEach(() => {
        const { scroller } = getSubjects(hook.component()).getOrDie();
        scroller.element.dom.scrollTop = 0;
        window.scrollTo(0, 0);
      });

      it('Round trip Docking and Undocking with scroll', () => {
        // Scroll to the end of the box and subtract the height and add a bit more
        runRoundtrippingTest('Absolute', hook.component(), 800 + 200 - 600 + 50);
      });

      it('Docking and Undocking', async () => {
        const scroller = hook.component();
        const sink = scroller.components()[0];

        const absoluteBox = sink.components()[1];

        // OK. so initially, the absolute box will be off-screen, because no scrolling event has occurred,
        // so we'll fire an external scrolling event to get it into position.
        AlloyTriggers.emit(scroller, 'test.bubbled.scroll');

        // It should have docked to the bottom
        await pAssertBoxDockedToBottom(
          'The absolute box should dock to the bottom after emulated event',
          scroller,
          absoluteBox
        );

        // Now, scroll the scroller down 500px. That should make 500px of the dividing section still visible,
        // and the box should be at 300px (800 - 500). It should undock.
        scroller.element.dom.scrollTop = 500;

        await Waiter.pTryUntil(
          'Wait until is undocked',
          () => {
            assert.equal(
              'absolute',
              Css.getRaw(absoluteBox.element, 'position').getOrDie(),
              'Checking "position" style'
            );

            // Check that it is appearing about 100 pixels lower than the top of the scroller
            assert.isTrue(
              Math.abs(getRect(absoluteBox).top - (getRect(scroller).top + 300)) < 5,
              'Check that the absolute box is appearing about 100px down from the scroller'
            );
          }
        );

        // Scroll a further 400px down the page. It should dock again
        scroller.element.dom.scrollTop = 500 + 400;
        await pAssertBoxDockedToTop(
          'After scrolling past the box, it should dock to the top',
          scroller,
          absoluteBox
        );

        // Scroll back up to make the box on screen again (750 < 800)
        scroller.element.dom.scrollTop = 800 - 50;
        await Waiter.pTryUntil(
          'After scrolling back before the box, it should undock again, 50px',
          () => {
            assert.equal(
              'absolute',
              Css.getRaw(absoluteBox.element, 'position').getOrDie(),
              'Checking "position" style'
            );

            // Check that it is appearing about 100 pixels lower than the top of the scroller
            assert.isTrue(
              Math.abs(getRect(absoluteBox).top - (getRect(scroller).top + 50)) < 5,
              'Check that the absolute box is appearing about 100px down from the scroller'
            );
          }
        );
      });
    });
  });
});

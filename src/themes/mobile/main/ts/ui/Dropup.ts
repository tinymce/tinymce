import { Behaviour } from '@ephox/alloy';
import { Replacing } from '@ephox/alloy';
import { Sliding } from '@ephox/alloy';
import { GuiFactory } from '@ephox/alloy';
import { Container } from '@ephox/alloy';
import { Fun } from '@ephox/katamari';
import Receivers from '../channels/Receivers';
import Styles from '../style/Styles';

var build = function (refresh, scrollIntoView) {
  var dropup = GuiFactory.build(
    Container.sketch({
      dom: {
        tag: 'div',
        classes: Styles.resolve('dropup')
      },
      components: [
        
      ],
      containerBehaviours: Behaviour.derive([
        Replacing.config({ }),
        Sliding.config({
          closedClass: Styles.resolve('dropup-closed'),
          openClass: Styles.resolve('dropup-open'),
          shrinkingClass: Styles.resolve('dropup-shrinking'),
          growingClass: Styles.resolve('dropup-growing'),
          dimension: {
            property: 'height'
          },
          onShrunk: function (component) {
            refresh();
            scrollIntoView();

            Replacing.set(component, [ ]);
          },
          onGrown: function (component) {
            refresh();
            scrollIntoView();
          }
        }),
        Receivers.orientation(function (component, data) {
          disappear(Fun.noop);
        })
      ])
    })
  );

  var appear = function (menu, update, component) {
    if (Sliding.hasShrunk(dropup) === true && Sliding.isTransitioning(dropup) === false) {
      window.requestAnimationFrame(function () {
        update(component);
        Replacing.set(dropup, [ menu() ]);
        Sliding.grow(dropup);
      });
    }
  };

  var disappear = function (onReadyToShrink) {
    window.requestAnimationFrame(function () {
      onReadyToShrink();
      Sliding.shrink(dropup);
    });
  };

  return {
    appear: appear,
    disappear: disappear,
    component: Fun.constant(dropup),
    element: dropup.element
  };
};

export default <any> {
  build: build
};
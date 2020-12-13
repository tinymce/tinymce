/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, Behaviour, Container, GuiFactory, Replacing, Sliding } from '@ephox/alloy';
import { Fun } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as Receivers from '../channels/Receivers';
import * as Styles from '../style/Styles';

export interface DropUp {
  readonly appear: (menu: any, update: any, component: any) => void;
  readonly disappear: (onReadyToShrink: any) => void;
  readonly component: AlloyComponent;
  readonly element: SugarElement;
}

const build = (refresh, scrollIntoView): DropUp => {
  const dropup = GuiFactory.build(
    Container.sketch({
      dom: {
        tag: 'div',
        classes: [ Styles.resolve('dropup') ]
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
          onShrunk: (component) => {
            refresh();
            scrollIntoView();

            Replacing.set(component, [ ]);
          },
          onGrown: (_component) => {
            refresh();
            scrollIntoView();
          }
        }),
        Receivers.orientation((_component, _data) => {
          disappear(Fun.noop);
        })
      ])
    })
  );

  const appear = (menu, update, component) => {
    if (Sliding.hasShrunk(dropup) === true && Sliding.isTransitioning(dropup) === false) {
      window.requestAnimationFrame(() => {
        update(component);
        Replacing.set(dropup, [ menu() ]);
        Sliding.grow(dropup);
      });
    }
  };

  const disappear = (onReadyToShrink) => {
    window.requestAnimationFrame(() => {
      onReadyToShrink();
      Sliding.shrink(dropup);
    });
  };

  return {
    appear,
    disappear,
    component: dropup,
    element: dropup.element
  };
};

export {
  build
};

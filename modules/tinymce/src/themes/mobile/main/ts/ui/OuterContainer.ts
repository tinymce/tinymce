/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Behaviour, Container, Gui, GuiFactory, Swapping } from '@ephox/alloy';

import * as Styles from '../style/Styles';

const READ_ONLY_MODE_CLASS = Styles.resolve('readonly-mode');
const EDIT_MODE_CLASS = Styles.resolve('edit-mode');

export default function (spec) {
  const root = GuiFactory.build(
    Container.sketch({
      dom: {
        classes: [ Styles.resolve('outer-container') ].concat(spec.classes)
      },

      containerBehaviours: Behaviour.derive([
        Swapping.config({
          alpha: READ_ONLY_MODE_CLASS,
          omega: EDIT_MODE_CLASS
        })
      ])
    })
  );

  return Gui.takeover(root);
}

/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, Gui, Replacing } from '@ephox/alloy';
import { Singleton } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as IosWebapp from '../api/IosWebapp';
import * as Styles from '../style/Styles';
import { ScrollingToolbar } from '../toolbar/ScrollingToolbar';
import * as CommonRealm from './CommonRealm';
import * as Dropup from './Dropup';
import OuterContainer from './OuterContainer';

type MobileWebApp = IosWebapp.MobileWebApp;

export interface MobileRealm {
  readonly system: Gui.GuiSystem;
  readonly element: SugarElement;
  readonly init: (spec) => void;
  readonly exit: () => void;
  readonly setToolbarGroups: (rawGroups) => void;
  readonly setContextToolbar: (rawGroups) => void;
  readonly focusToolbar: () => void;
  readonly restoreToolbar: () => void;
  readonly updateMode: (readOnly: boolean) => void;
  readonly socket: AlloyComponent;
  readonly dropup: Dropup.DropUp;
}

export default (scrollIntoView: () => void): MobileRealm => {
  const alloy = OuterContainer({
    classes: [ Styles.resolve('ios-container') ]
  });

  const toolbar = ScrollingToolbar();

  const webapp = Singleton.api<MobileWebApp>();

  const switchToEdit = CommonRealm.makeEditSwitch(webapp);

  const socket = CommonRealm.makeSocket();

  const dropup = Dropup.build(function () {
    webapp.run(function (w) {
      w.refreshStructure();
    });
  }, scrollIntoView);

  alloy.add(toolbar.wrapper);
  alloy.add(socket);
  alloy.add(dropup.component);

  const setToolbarGroups = function (rawGroups) {
    const groups = toolbar.createGroups(rawGroups);
    toolbar.setGroups(groups);
  };

  const setContextToolbar = function (rawGroups) {
    const groups = toolbar.createGroups(rawGroups);
    toolbar.setContextToolbar(groups);
  };

  const focusToolbar = function () {
    toolbar.focus();
  };

  const restoreToolbar = function () {
    toolbar.restoreToolbar();
  };

  const init = function (spec) {
    webapp.set(
      IosWebapp.produce(spec)
    );
  };

  const exit = function () {
    webapp.run(function (w) {
      Replacing.remove(socket, switchToEdit);
      w.exit();
    });
  };

  const updateMode = function (readOnly) {
    CommonRealm.updateMode(socket, switchToEdit, readOnly, alloy.root);
  };

  return {
    system: alloy,
    element: alloy.element,
    init,
    exit,
    setToolbarGroups,
    setContextToolbar,
    focusToolbar,
    restoreToolbar,
    updateMode,
    socket,
    dropup
  };
};

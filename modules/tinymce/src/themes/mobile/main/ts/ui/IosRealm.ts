/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Replacing, Gui, AlloyComponent } from '@ephox/alloy';
import { Fun, Singleton } from '@ephox/katamari';

import IosWebapp, { MobileWebApp } from '../api/IosWebapp';
import Styles from '../style/Styles';
import ScrollingToolbar from '../toolbar/ScrollingToolbar';
import CommonRealm from './CommonRealm';
import * as Dropup from './Dropup';
import OuterContainer from './OuterContainer';
import { SugarElement } from '../alien/TypeDefinitions';

export interface MobileRealm {
  system(): Gui.GuiSystem;
  element(): SugarElement;
  init(spec): void;
  exit(): void;
  setToolbarGroups(rawGroups): void;
  setContextToolbar(rawGroups): void;
  focusToolbar(): void;
  restoreToolbar(): void;
  updateMode(readOnly: boolean): void;
  socket(): AlloyComponent;
  dropup(): Dropup.DropUp;
}

export default function (scrollIntoView: () => void) {
  const alloy = OuterContainer({
    classes: [ Styles.resolve('ios-container') ]
  }) as Gui.GuiSystem;

  const toolbar = ScrollingToolbar();

  const webapp = Singleton.api<MobileWebApp>();

  const switchToEdit = CommonRealm.makeEditSwitch(webapp);

  const socket = CommonRealm.makeSocket() as AlloyComponent;

  const dropup = Dropup.build(function () {
    webapp.run(function (w) {
      w.refreshStructure();
    });
  }, scrollIntoView);

  alloy.add(toolbar.wrapper());
  alloy.add(socket);
  alloy.add(dropup.component());

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
    CommonRealm.updateMode(socket, switchToEdit, readOnly, alloy.root());
  };

  return {
    system: Fun.constant(alloy),
    element: alloy.element,
    init,
    exit,
    setToolbarGroups,
    setContextToolbar,
    focusToolbar,
    restoreToolbar,
    updateMode,
    socket: Fun.constant(socket),
    dropup: Fun.constant(dropup)
  } as MobileRealm;
}
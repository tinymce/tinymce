/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Replacing, ComponentApi, Gui } from '@ephox/alloy';
import { Fun, Singleton } from '@ephox/katamari';

import AndroidWebapp from '../api/AndroidWebapp';
import Styles from '../style/Styles';
import ScrollingToolbar from '../toolbar/ScrollingToolbar';
import CommonRealm from './CommonRealm';
import * as Dropup from './Dropup';
import OuterContainer from './OuterContainer';
import { SugarElement } from 'tinymce/themes/mobile/alien/TypeDefinitions';
import { MobileRealm } from 'tinymce/themes/mobile/ui/IosRealm';
import { MobileWebApp } from 'tinymce/themes/mobile/api/IosWebapp';

export default function (scrollIntoView: () => void) {
  const alloy = OuterContainer({
    classes: [ Styles.resolve('android-container') ]
  }) as Gui.GuiSystem;

  const toolbar = ScrollingToolbar();

  const webapp = Singleton.api<MobileWebApp>();

  const switchToEdit = CommonRealm.makeEditSwitch(webapp);

  const socket = CommonRealm.makeSocket() as ComponentApi.AlloyComponent;

  const dropup = Dropup.build(Fun.noop, scrollIntoView);

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

  // You do not always want to do this.
  const focusToolbar = function () {
    toolbar.focus();
  };

  const restoreToolbar = function () {
    toolbar.restoreToolbar();
  };

  const init = function (spec) {
    webapp.set(
      AndroidWebapp.produce(spec)
    );
  };

  const exit = function () {
    webapp.run(function (w) {
      w.exit();
      Replacing.remove(socket, switchToEdit);
    });
  };

  const updateMode = function (readOnly) {
    CommonRealm.updateMode(socket, switchToEdit, readOnly, alloy.root());
  };

  return {
    system: Fun.constant(alloy),
    element: alloy.element as () => SugarElement,
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
/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Replacing } from '@ephox/alloy';
import { Fun, Singleton } from '@ephox/katamari';

import * as AndroidWebapp from '../api/AndroidWebapp';
import * as Styles from '../style/Styles';
import ScrollingToolbar from '../toolbar/ScrollingToolbar';
import * as CommonRealm from './CommonRealm';
import * as Dropup from './Dropup';
import OuterContainer from './OuterContainer';
import { MobileRealm } from 'tinymce/themes/mobile/ui/IosRealm';
import { MobileWebApp } from 'tinymce/themes/mobile/api/IosWebapp';

export default (scrollIntoView: () => void): MobileRealm => {
  const alloy = OuterContainer({
    classes: [ Styles.resolve('android-container') ]
  });

  const toolbar = ScrollingToolbar();

  const webapp = Singleton.api<MobileWebApp>();

  const switchToEdit = CommonRealm.makeEditSwitch(webapp);

  const socket = CommonRealm.makeSocket();

  const dropup = Dropup.build(Fun.noop, scrollIntoView);

  alloy.add(toolbar.wrapper());
  alloy.add(socket);
  alloy.add(dropup.component());

  const setToolbarGroups = (rawGroups) => {
    const groups = toolbar.createGroups(rawGroups);
    toolbar.setGroups(groups);
  };

  const setContextToolbar = (rawGroups) => {
    const groups = toolbar.createGroups(rawGroups);
    toolbar.setContextToolbar(groups);
  };

  // You do not always want to do this.
  const focusToolbar = () => {
    toolbar.focus();
  };

  const restoreToolbar = () => {
    toolbar.restoreToolbar();
  };

  const init = (spec) => {
    webapp.set(
      AndroidWebapp.produce(spec)
    );
  };

  const exit = () => {
    webapp.run((w) => {
      w.exit();
      Replacing.remove(socket, switchToEdit);
    });
  };

  const updateMode = (readOnly) => {
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
  };
};

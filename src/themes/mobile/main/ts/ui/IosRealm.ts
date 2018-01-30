import { Replacing } from '@ephox/alloy';
import { Fun, Singleton } from '@ephox/katamari';

import IosWebapp from '../api/IosWebapp';
import Styles from '../style/Styles';
import ScrollingToolbar from '../toolbar/ScrollingToolbar';
import CommonRealm from './CommonRealm';
import Dropup from './Dropup';
import OuterContainer from './OuterContainer';

export default function (scrollIntoView?) { // unsure if this should be optional?
  const alloy = OuterContainer({
    classes: [ Styles.resolve('ios-container') ]
  });

  const toolbar = ScrollingToolbar();

  const webapp = Singleton.api();

  const switchToEdit = CommonRealm.makeEditSwitch(webapp);

  const socket = CommonRealm.makeSocket();

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
  };
}
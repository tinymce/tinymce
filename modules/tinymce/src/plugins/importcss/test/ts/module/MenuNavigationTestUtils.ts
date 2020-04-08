import { Keyboard, Step, Keys, FocusTools } from '@ephox/agar';
import { Arr } from '@ephox/katamari';

const sAssertFocusOnItem = (doc, text) => FocusTools.sTryOnSelector(
  'Focus should be on: ' + text,
  doc,
  `.tox-collection__item:contains(${text})`
);

const sDelay = Step.wait(0);

const generateNavigation = (doc, navigation) => {
  if (navigation.length === 0) { return [ ]; }

  return Arr.bind(navigation.concat(navigation.slice(0, 1)), (nav, i) => {
    const exploration = (nav.subitems.length > 0) ? [
      Keyboard.sKeydown(doc, Keys.right(), { }),
      sAssertFocusOnItem(doc, nav.subitems[0])
    ].concat(
      Arr.bind(
        nav.subitems.slice(1).concat(nav.subitems.slice(0, 1)),
        (si) => [
          Keyboard.sKeydown(doc, Keys.down(), { }),
          sDelay,
          sAssertFocusOnItem(doc, si)
        ]
      )
    ).concat([
      Keyboard.sKeydown(doc, Keys.escape(), { })
    ]) : [
      // Should do nothing
      Keyboard.sKeydown(doc, Keys.right(), { })
    ];

    return Arr.flatten([
      [ sAssertFocusOnItem(doc, nav.item) ],
      exploration,
      [ sAssertFocusOnItem(doc, nav.item) ],
      [ sDelay ],
      // Move to the next one
      i < navigation.length ? [ Keyboard.sKeydown(doc, Keys.down(), { }) ] : [ ]
    ]);
  });
};

export const MenuNavigationTestUtils = {
  sAssertFocusOnItem,
  generateNavigation
};
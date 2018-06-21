import Buttons from './Buttons';
import { SketchSpec } from '@ephox/alloy';

const button = function (realm, clazz, makeItems): SketchSpec {
  return Buttons.forToolbar(clazz, function () {
    const items = makeItems();
    realm.setContextToolbar([
      {
        // FIX: I18n
        label: clazz + ' group',
        items
      }
    ]);
  }, { });
};

export {
  button
};
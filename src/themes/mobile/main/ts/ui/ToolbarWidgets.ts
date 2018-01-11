import Buttons from './Buttons';

const button = function (realm, clazz, makeItems) {
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

export default {
  button
};
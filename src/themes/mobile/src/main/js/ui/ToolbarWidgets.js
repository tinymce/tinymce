import Buttons from './Buttons';

var button = function (realm, clazz, makeItems) {
  return Buttons.forToolbar(clazz, function () {
    var items = makeItems();
    realm.setContextToolbar([
      {
        // FIX: I18n
        label: clazz + ' group',
        items: items
      }
    ]);
  }, { });
};

export default <any> {
  button: button
};
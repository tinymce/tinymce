define(
  'ephox.alloy.api.component.ComponentUtil',

  [

  ],

  function () {
    var toElem = function (component) {
      return component.element();
    };

    var getByUid = function (component, uid) {
      return component.getSystem().getByUid(uid).toOption();
    };

    return {
      toElem: toElem,
      getByUid: getByUid
    };
  }
);

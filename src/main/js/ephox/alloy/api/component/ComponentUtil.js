var toElem = function (component) {
  return component.element();
};

var getByUid = function (component, uid) {
  return component.getSystem().getByUid(uid).toOption();
};

export default <any> {
  toElem: toElem,
  getByUid: getByUid
};
const toElem = function (component) {
  return component.element();
};

const getByUid = function (component, uid) {
  return component.getSystem().getByUid(uid).toOption();
};

export {
  toElem,
  getByUid
};
const make = function (detail, components, spec, externals) {

  return {
    uid: detail.uid(),
    dom: detail.dom(),
    components
  };
};

export {
  make
};
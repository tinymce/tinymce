var skip = function () {
  return navigator.userAgent.indexOf('PhantomJS') > -1;
};

export default <any> {
  skip: skip
};
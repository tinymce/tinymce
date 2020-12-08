const skip = (): boolean => navigator.userAgent.indexOf('PhantomJS') > -1;

export {
  skip
};

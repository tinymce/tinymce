// This API is intended to give the capability to return namespaced strings.
// For CSS, since dots are not valid class names, the dots are turned into dashes.
var css = function (namespace: string) {
  var dashNamespace = namespace.replace(/\./g, '-');

  var resolve = function (str: string) {
    return dashNamespace + '-' + str;
  };

  return {
    resolve: resolve
  };
};

export default {
  css: css
};
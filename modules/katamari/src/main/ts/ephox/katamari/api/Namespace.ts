export interface CssNamespace {
  readonly resolve: (str: string) => string;
}

// This API is intended to give the capability to return namespaced strings.
// For CSS, since dots are not valid class names, the dots are turned into dashes.
export const css = (namespace: string): CssNamespace => {
  const dashNamespace = namespace.replace(/\./g, '-');

  const resolve = (str: string) => {
    return dashNamespace + '-' + str;
  };

  return {
    resolve
  };
};

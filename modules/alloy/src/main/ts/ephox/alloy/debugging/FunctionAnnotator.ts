import { Arr, Option, Strings } from '@ephox/katamari';

export type FunctionWithAnnotation<T extends Function> = T & { toFunctionAnnotation?: () => { name: string; parameters: string[] } };

const markAsBehaviourApi = <T extends Function>(f: T, apiName: string, apiFunction: Function): FunctionWithAnnotation<T> => {
  const delegate = apiFunction.toString();
  const endIndex = delegate.indexOf(')') + 1;
  const openBracketIndex = delegate.indexOf('(');
  const parameters = delegate.substring(openBracketIndex + 1, endIndex - 1).split(/,\s*/);

  (f as FunctionWithAnnotation<T>).toFunctionAnnotation = () => ({
    name: apiName,
    parameters: cleanParameters(parameters.slice(0, 1).concat(parameters.slice(3)))
  });
  return f;
};

// Remove any comment (/*) at end of parameter names
const cleanParameters = (parameters: string[]) => Arr.map(parameters, (p) => Strings.endsWith(p, '/*') ? p.substring(0, p.length - '/*'.length) : p);

const markAsExtraApi = <T extends Function>(f: T, extraName: string): FunctionWithAnnotation<T> => {
  const delegate = f.toString();
  const endIndex = delegate.indexOf(')') + 1;
  const openBracketIndex = delegate.indexOf('(');
  const parameters = delegate.substring(openBracketIndex + 1, endIndex - 1).split(/,\s*/);

  (f as FunctionWithAnnotation<T>).toFunctionAnnotation = () => ({
    name: extraName,
    parameters: cleanParameters(parameters)
  });
  return f;
};

const markAsSketchApi = <T extends Function>(f: T, apiFunction: Function): FunctionWithAnnotation<T> => {
  const delegate = apiFunction.toString();
  const endIndex = delegate.indexOf(')') + 1;
  const openBracketIndex = delegate.indexOf('(');
  const parameters = delegate.substring(openBracketIndex + 1, endIndex - 1).split(/,\s*/);

  (f as FunctionWithAnnotation<T>).toFunctionAnnotation = () => ({
    name: 'OVERRIDE',
    parameters: cleanParameters(parameters.slice(1))
  });
  return f;
};

const getAnnotation = <T extends Function>(f: FunctionWithAnnotation<T>) => Option.from(
    f.toFunctionAnnotation?.()
);

export {
  markAsBehaviourApi,
  markAsExtraApi,
  markAsSketchApi,
  getAnnotation
};

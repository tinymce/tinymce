import { Arr, Option, Strings } from '@ephox/katamari';

const markAsBehaviourApi = (f, apiName, apiFunction) => {
  const delegate = apiFunction.toString();
  const endIndex = delegate.indexOf(')') + 1;
  const openBracketIndex = delegate.indexOf('(');
  const parameters = delegate.substring(openBracketIndex + 1, endIndex - 1).split(/,\s*/);

  f.toFunctionAnnotation = () => {
    return {
      name: apiName,
      parameters: cleanParameters(parameters.slice(0, 1).concat(parameters.slice(3)))
    };
  };
  return f;
};

// Remove any comment (/*) at end of parameter names
const cleanParameters = (parameters) => {
  return Arr.map(parameters, (p) => {
    return Strings.endsWith(p, '/*') ? p.substring(0, p.length - '/*'.length) : p;
  });
};

const markAsExtraApi = (f, extraName) => {
  const delegate = f.toString();
  const endIndex = delegate.indexOf(')') + 1;
  const openBracketIndex = delegate.indexOf('(');
  const parameters = delegate.substring(openBracketIndex + 1, endIndex - 1).split(/,\s*/);

  f.toFunctionAnnotation = () => {
    return {
      name: extraName,
      parameters: cleanParameters(parameters)
    };
  };
  return f;
};

const markAsSketchApi = (f, apiFunction) => {
  const delegate = apiFunction.toString();
  const endIndex = delegate.indexOf(')') + 1;
  const openBracketIndex = delegate.indexOf('(');
  const parameters = delegate.substring(openBracketIndex + 1, endIndex - 1).split(/,\s*/);

  f.toFunctionAnnotation = () => {
    return {
      name: 'OVERRIDE',
      parameters: cleanParameters(parameters.slice(1))
    };
  };
  return f;
};

const getAnnotation = (f) => {
  return f.hasOwnProperty('toFunctionAnnotation') ? Option.some(
    f.toFunctionAnnotation()
  ) : Option.none();
};

export {
  markAsBehaviourApi,
  markAsExtraApi,
  markAsSketchApi,
  getAnnotation
};
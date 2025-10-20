import { Arr, Obj, Optional, Strings, Type } from '@ephox/katamari';

const isNamedParam = (segment: string) => segment.startsWith(':');
const isSplatParam = (segment: string) => segment === '*';
const isEmptySegment = (segment: string) => segment === '';
const isValidParamName = (name: string) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(name);
const isUnsupportedSplat = (segment: string) => !isSplatParam(segment) && Strings.contains(segment, '*');
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const compilePathPattern = (pattern: string) => {
  const paramNames: string[] = [];
  let splatCount = 0;

  const segments = Arr.map(pattern.split('/'), (segment) => {
    if (isEmptySegment(segment)) {
      return '';
    } else if (isNamedParam(segment)) {
      const name = segment.slice(1);

      if (!isValidParamName(name)) {
        throw new Error(`Invalid param name "${name}" in pattern "${pattern}"`);
      }

      paramNames.push(name);

      return `(?<${name}>[^/]+)`;
    } else if (isSplatParam(segment)) {
      const name = `splat${splatCount++}`;

      paramNames.push(name);

      return `(?<${name}>.*)`;
    } else if (isUnsupportedSplat(segment)) {
      throw new Error(`Splat (*) must be its own segment in pattern "${pattern}"`);
    } else {
      return escapeRegExp(segment);
    }
  });

  const regexSource = `^${segments.join('/')}$`;
  const regex = new RegExp(regexSource);

  return { regex, paramNames };
};

export const makePathMatcher = (pattern: string): (path: string) => Optional<Record<string, string>> => {
  const { regex, paramNames } = compilePathPattern(pattern);

  const matcher = (path: string): Optional<Record<string, string>> => {
    const match = regex.exec(path);

    if (Type.isNullable(match)) {
      return Optional.none();
    }

    const result: Record<string, string> = {};
    if (Type.isObject(match.groups)) {
      for (const name of paramNames) {
        if (Type.isString(match.groups[name])) {
          result[name] = match.groups[name];
        }
      }
    }

    return Optional.some(result);
  };

  return matcher;
};

export const replaceParams = (pattern: string, params: Record<string, string>): string => {
  const segments = Arr.map(pattern.split('/'), (segment) => {
    if (isEmptySegment(segment)) {
      return '';
    } else if (isNamedParam(segment)) {
      const name = segment.slice(1);

      if (!isValidParamName(name)) {
        throw new Error(`Invalid param name "${name}" in pattern "${pattern}"`);
      }

      return Obj.get(params, name).fold(
        () => {
          throw new Error(`Missing param "${name}" in params ${JSON.stringify(params)} for pattern "${pattern}"`);
        },
        (value) => encodeURIComponent(value)
      );
    } else if (isSplatParam(segment)) {
      throw new Error('Cannot replace splat parameters with replaceParams');
    } else {
      return segment;
    }
  });

  return segments.join('/');
};

export const getParamNames = (pattern: string): string[] =>
  compilePathPattern(pattern).paramNames;

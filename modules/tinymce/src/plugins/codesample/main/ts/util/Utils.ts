const isCodeSample = (elm: Element | null): boolean => {
  return elm && elm.nodeName === 'PRE' && elm.className.indexOf('language-') !== -1;
};

const trimArg = <T>(predicateFn: (a: T) => boolean) => {
  return (arg1: unknown, arg2: T): boolean => {
    return predicateFn(arg2);
  };
};

export {
  isCodeSample,
  trimArg
};

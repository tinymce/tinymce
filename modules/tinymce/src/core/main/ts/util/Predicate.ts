const or = <T>(...args: Array<(x: T) => boolean>) => {

  return (x: T): boolean => {
    for (let i = 0; i < args.length; i++) {
      if (args[i](x)) {
        return true;
      }
    }

    return false;
  };
};

const and = <T>(...args: Array<(x: T) => boolean>) => {
  return (x: T): boolean => {
    for (let i = 0; i < args.length; i++) {
      if (!args[i](x)) {
        return false;
      }
    }

    return true;
  };
};

export {
  and,
  or
};

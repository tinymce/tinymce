const or = (...args: any[]) => {

  return (x) => {
    for (let i = 0; i < args.length; i++) {
      if (args[i](x)) {
        return true;
      }
    }

    return false;
  };
};

const and = (...args: any[]) => {
  return (x) => {
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

const fail = (msg: string): never => {
  throw new Error(msg);
};

export {
  fail
};
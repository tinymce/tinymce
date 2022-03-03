export default () => {
  const unimplemented = () => {
    throw new Error('Theme did not provide a WindowManager implementation.');
  };

  return {
    open: unimplemented,
    openUrl: unimplemented,
    alert: unimplemented,
    confirm: unimplemented,
    close: unimplemented,
    getParams: unimplemented,
    setParams: unimplemented
  };
};

export const NotificationManagerImpl = () => {
  const unimplemented = (value?) => {
    throw new Error('Theme did not provide a NotificationManager implementation.');
  };

  return {
    open: unimplemented,
    close: unimplemented,
    getArgs: unimplemented
  };
};

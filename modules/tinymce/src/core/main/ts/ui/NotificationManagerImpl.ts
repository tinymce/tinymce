import { NotificationManagerImpl } from '../api/NotificationManager';

export default (): NotificationManagerImpl => {
  const unimplemented = (): never => {
    throw new Error('Theme did not provide a NotificationManager implementation.');
  };

  return {
    open: unimplemented,
    close: unimplemented,
    getArgs: unimplemented
  };
};

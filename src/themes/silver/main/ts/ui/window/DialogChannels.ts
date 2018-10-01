import { Id } from '@ephox/katamari';

const dialogChannel = Id.generate('update-dialog');
const titleChannel = Id.generate('update-title');
const bodyChannel = Id.generate('update-body');
const footerChannel = Id.generate('update-footer');

export {
  dialogChannel,
  titleChannel,
  bodyChannel,
  footerChannel
};
const createClipboardEvent = (name: string) => (win: Window, x: number, y: number, dataTransfer: DataTransfer): ClipboardEvent => {
  const event: any = document.createEvent('CustomEvent');
  event.initCustomEvent(name, true, true, null);

  event.view = win;
  event.ctrlKey = false;
  event.altKey = false;
  event.shiftKey = false;
  event.metaKey = false;
  event.button = 0;
  event.relatedTarget = null;
  event.screenX = win.screenX + x;
  event.screenY = win.screenY + y;
  event.clipboardData = dataTransfer;

  return event;
};

const createCutEvent = createClipboardEvent('cut');
const createCopyEvent = createClipboardEvent('copy');
const createPasteEvent = createClipboardEvent('paste');

export {
  createCutEvent,
  createCopyEvent,
  createPasteEvent
};

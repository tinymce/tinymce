const appendClickRemove = (link: HTMLAnchorElement, evt: MouseEvent): void => {
  document.body.appendChild(link);
  link.dispatchEvent(evt);
  document.body.removeChild(link);
};

const open = (url: string): void => {
  const link = document.createElement('a');
  link.target = '_blank';
  link.href = url;
  link.rel = 'noreferrer noopener';

  const evt = document.createEvent('MouseEvents');
  evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

  appendClickRemove(link, evt);
};

export {
  open
};

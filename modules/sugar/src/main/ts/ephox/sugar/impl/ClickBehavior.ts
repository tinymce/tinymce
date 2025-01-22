const preventDefaultClickLinkBehavior = (isMetaKeyPressed: (e: MouseEvent) => boolean): () => void => {
  const handler = (e: MouseEvent) => {
    for (let elm = e.target as Node | null; elm; elm = elm.parentNode) {
      if (elm.nodeName === 'A') {
        const href = (elm as HTMLAnchorElement).getAttribute('href');

        if (href && href.startsWith('#')) {
          e.preventDefault();
          document.getElementById(href.substring(1))?.scrollIntoView();
          return;
        }

        if (!isMetaKeyPressed(e)) {
          e.preventDefault();
        }
      }
    }
  };

  document.addEventListener('click', handler, false);
  return () => document.removeEventListener('click', handler, false);
};

export {
  preventDefaultClickLinkBehavior
};

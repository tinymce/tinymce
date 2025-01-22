const preventDefaultClickLinkBehavior = (isMetaKeyPressed: (e: MouseEvent) => boolean): void => {
  document.addEventListener('click', (e) => {
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
  }, false);
};

export {
  preventDefaultClickLinkBehavior
};

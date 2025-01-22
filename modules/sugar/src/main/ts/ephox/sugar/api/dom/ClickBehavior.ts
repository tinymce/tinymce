import * as Platform from '../view/Platform';

const preventDefaultClickLinkBehavior = (): void => {
  document.addEventListener('click', (e) => {
    for (let elm = e.target as Node | null; elm; elm = elm.parentNode) {
      if (elm.nodeName === 'A') {
        const href = (elm as HTMLAnchorElement).getAttribute('href');

        if (href && href.startsWith('#')) {
          e.preventDefault();
          document.getElementById(href.substring(1))?.scrollIntoView();
          return;
        }

        if (!Platform.isMetaKeyPressed(e)) {
          e.preventDefault();
        }
      }
    }
  }, false);
};

export {
  preventDefaultClickLinkBehavior
};

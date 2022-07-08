const strongRtl = /[\u0591-\u07FF\uFB1D-\uFDFF\uFE70-\uFEFC]/;

const hasStrongRtl = (text: string): boolean => strongRtl.test(text);

export {
  hasStrongRtl
};

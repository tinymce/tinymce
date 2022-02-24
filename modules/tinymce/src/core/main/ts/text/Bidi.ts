const strongRtl = /[\u0591-\u07FF\uFB1D-\uFDFF\uFE70-\uFEFC]/;

const hasStrongRtl = (text: string) => strongRtl.test(text);

export {
  hasStrongRtl
};

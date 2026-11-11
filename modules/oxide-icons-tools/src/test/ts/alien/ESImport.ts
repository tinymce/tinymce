import esm from 'esm';

const esmRequire = esm(module);

const importFromString = <T>(content: string, filename: string): T => {
  const Module = esmRequire('module');
  const m = new Module(filename, module);
  m._compile(content, filename);
  m.loaded = true;
  return m.exports;
};

export {
  importFromString
};
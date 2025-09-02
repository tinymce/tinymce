import { optimize, type OptimizedError, type OptimizedSvg, type OptimizeOptions } from 'svgo';

import type { Svg } from './Core.js';

const isError = (optimizedSvg: OptimizedError | OptimizedSvg): optimizedSvg is OptimizedError =>
  typeof optimizedSvg.error === 'string';

const optimizeSvgs = (svgs: Svg[], svgoOptions: OptimizeOptions): Promise<Svg[]> =>
  Promise.all(svgs.map((svg) => {
    const optimizedSvg = optimize(svg.data, svgoOptions);
    if (isError(optimizedSvg)) {
      return Promise.reject(optimizedSvg.error);
    } else {
      return Promise.resolve({
        name: svg.name,
        data: optimizedSvg.data
      });
    }
  }));

export {
  optimizeSvgs
};
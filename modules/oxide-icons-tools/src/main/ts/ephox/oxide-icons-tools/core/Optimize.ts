import { optimize, type Config } from 'svgo';

import type { Svg } from './Core.js';

export const optimizeSvg = (svg: Svg, config: Config): Promise<Svg> => {
  try {
    const optimizedSvg = optimize(svg.data, config);

    if (!('data' in optimizedSvg)) {
      return Promise.reject(new Error(`Failed to optimize SVG ${svg.name}`));
    }

    return Promise.resolve({
      name: svg.name,
      data: optimizedSvg.data
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
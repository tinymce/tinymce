declare module 'svgo' {
  export interface Config {
    plugins?: Array<string | { name: string; params?: Record<string, any> }>;
    js2svg?: {
      indent?: number;
      pretty?: boolean;
    };
    multipass?: boolean;
  }

  export interface OptimizedSvg {
    data: string;
    info: {
      width: string | number;
      height: string | number;
    };
  }

  export function optimize(svg: string, config?: Config): OptimizedSvg;
}

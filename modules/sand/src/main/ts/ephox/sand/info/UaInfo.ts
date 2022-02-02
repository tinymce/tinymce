import { Version } from '../detect/Version';

export interface UaInfo {
  readonly current: string | undefined;
  readonly version: Version;
}

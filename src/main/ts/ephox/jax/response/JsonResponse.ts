import { Result } from '@ephox/katamari';
import { JSON } from '@ephox/sand';

const parse = function (text: string): Result<any,string> {
  try {
    const parsed = JSON.parse(text);
    return Result.value(parsed);
  } catch (err) {
    return Result.error('Response was not JSON');
  }
};

export const JsonResponse = {
  parse
};
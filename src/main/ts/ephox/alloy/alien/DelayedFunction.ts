
export default function (fun: (any) => void, delay: number): { cancel: () => void; schedule: (...any) => void } {
  let ref = null;

  const schedule = function (...any): void {
    const args = arguments;
    ref = setTimeout(function () {
      fun.apply(null, args);
      ref = null;
    }, delay);
  };

  const cancel = function (): void {
    if (ref !== null) {
      clearTimeout(ref);
      ref = null;
    }
  };

  return {
    cancel,
    schedule
  };
}
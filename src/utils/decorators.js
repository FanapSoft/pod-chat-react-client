export function promiseDecorator(target, name, descriptor) {
  const original = descriptor.value;
  descriptor.value = function (...args) {
    return new Promise((resolve, reject) => {
      original.apply(this, [resolve, reject, ...args]);
    });
  };
  return descriptor;
}

export function defaultState(defaultState) {
  return (target, name, descriptor) => {
    const original = descriptor.value;
    descriptor.value = function (...args) {
      if (!args[0]) {
        args[0] = defaultState;
      }
      original.apply(this, [...args, defaultState]);
    };
    return descriptor;
  }
}
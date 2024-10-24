export const debug = (...data: any) => {
  console.debug("[REDDIT-COMMENT-ARROW]", data);
};

export const debounce = (func: Function, timeout = 300) => {
  let timer: number;
  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
};

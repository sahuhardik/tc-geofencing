export const groupBy = function <T extends Record<string, any>>(xs: T[], key: string) {
  return xs.reduce(function (rv, x: T) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {} as { [key: string]: T[] });
};

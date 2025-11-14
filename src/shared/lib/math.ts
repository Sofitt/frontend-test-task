export const roundToPrecision = (num: number, precision: number = 10): number => {
  return Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision);
};

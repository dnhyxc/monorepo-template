import { coustomPlugin } from './plugins';

const add = (a: number, b: number): number => {
  return a + b;
};

const createPlugin = () => {
  console.log(coustomPlugin('this is my test code'));
};

export { add, createPlugin };

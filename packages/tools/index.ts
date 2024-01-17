import { add } from '@dnhyxc/core';
import getNameInfo from './src/utils';

const sum: number = add(9, 12);

console.log('sum = ', sum);

const info: string = getNameInfo('dnhyxc');

console.log('info is：', info);

export { getNameInfo };

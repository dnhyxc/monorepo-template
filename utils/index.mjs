import path from 'path';
import { fileURLToPath } from 'url';

// 通过改写__dirname 为__dirnameNew，解决打包报错
const __filenameNew = fileURLToPath(import.meta.url);
const __dirnameNew = path.dirname(__filenameNew);

export const getPath = (_path) => path.resolve(__dirnameNew, _path);
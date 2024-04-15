// @ts-ignore
import fs from 'fs';
// @ts-ignore
import path from 'path';
import {spawn} from 'child_process';
import type {ChildProcessWithoutNullStreams} from 'child_process';
import type {AddressInfo} from 'net';
import {buildConfig} from './vite.common-config';

// electron 进程
let electronProcess: ChildProcessWithoutNullStreams;

// 标识是否时手动还是通过kill终止的electron进程
let manualTermination = false;

// 获取时间
const getTimer = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  return `${hours}时${minutes}分${seconds}秒`
}

// 获取 electron 进程的 stdout 输出 log 信息
const getLog = (data: Buffer) => {
  // 判断 data 是否有值
  if (data.length > 2) {
    console.log(`Log(${getTimer()}): ${data}`);
  }
};

// electron 进程终止回调
const onExit = (code: number, signal: string, server: any) => {
  // 如果是手动终止，则不退出Vite服务和node进程
  if (!manualTermination) {
    // 终止Vite服务
    server.close();
    // 退出node进程
    process.exit();
  } else {
    // 手动终止后，重置标志位
    manualTermination = false;
  }
}

// 文件更改后的回调
const onFileChange = (curr: fs.Stats, prev: fs.Stats, IP: string, server: any) => {
  if (curr.mtimeMs !== prev.mtimeMs) {
    manualTermination = true;
    // 杀死当前的 electron 进程
    electronProcess?.kill();
    // 启动服务前，先编译 electron 及 preload
    buildConfig();
    // 重新启动 electron
    electronProcess = spawn(require('electron') as any, ['dist/main.js', IP]);
    // 监听 electron 进程的 stdout 输出 log 信息
    electronProcess?.stdout?.on('data', getLog);
    // 监听 electron 进程的退出时，同时退出 vite 服务及 node 进程
    electronProcess?.on('exit', (code: number, signal: string) => onExit(code, signal, server));
  }
}

// 监听 electron 文件夹中文件的更改
const watchFolderFilesChange = (folderPath: string, IP: string, server: any) => {
  // 遍历文件夹
  fs.readdir(folderPath, (err: NodeJS.ErrnoException | null, files: string[]) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }
    files.forEach((file) => {
      const filePath = path.join(folderPath, file);
      // 检查文件状态
      fs.stat(filePath, (err: NodeJS.ErrnoException | null, stats: fs.Stats) => {
        if (err) {
          console.error('Error getting file stats:', err);
          return;
        }
        // 如果是文件夹，则递归遍历
        if (stats.isDirectory()) {
          watchFolderFilesChange(filePath, IP, server);
        } else {
          // 监听文件变化
          fs.watchFile(filePath, (curr: fs.Stats, prev: fs.Stats) => onFileChange(curr, prev, IP, server));
        }
      });
    });
  });
};

// 监听 preload 文件更改
const watchPreloadFileChange = (IP: string, server: any) => {
  fs.watchFile('preload/index.ts', (curr: fs.Stats, prev: fs.Stats) => onFileChange(curr, prev, IP, server));
}

// 导出Vite插件函数
export const ViteElectronRuntimePlugin = () => {
  return {
    name: 'vite-electron-runtime-plugin',
    // 在configureServer中实现插件的逻辑
    configureServer(server: { httpServer?: any; close?: Function; }) {
      // 启动服务前，先编译 electron 及 preload
      buildConfig();
      // 监听 Vite 的 HTTP 服务器的 listening 事件
      server?.httpServer?.once('listening', () => {
        // 获取 HTTP 服务器的监听地址和端口号
        const addressInfo = server?.httpServer?.address() as AddressInfo;
        const IP = `http://localhost:${addressInfo.port}`;
        // 启动 electron 进程
        electronProcess = spawn(require('electron') as any, ['dist/main.js', IP]);
        // 监听 electron 文件夹中文件内容更改
        watchFolderFilesChange('electron', IP, server);
        // 监听 preload 代码的更改
        watchPreloadFileChange(IP, server)
        // 监听 electron 进程的 stdout 输出 log 信息
        electronProcess?.stdout?.on('data', getLog);
        // 监听 electron 进程的退出时，同时退出 vite 服务及 node 进程
        electronProcess?.on('exit', (code: number, signal: string) => onExit(code, signal, server));
      });
    }
  };
};

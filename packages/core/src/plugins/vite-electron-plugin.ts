// @ts-ignore
import fs from 'fs';
// @ts-ignore
import path from 'path';
import {spawn} from 'child_process';
import type {ChildProcessWithoutNullStreams} from 'child_process';
import type {AddressInfo} from 'net';
import {buildConfig} from './vite.common-config';

const getTimer = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  return `${hours}时${minutes}分${seconds}秒`
}

const getLog = (data: Buffer) => {
  // 判断 data 是否有值
  if (data.length > 2) {
    console.log(`Log(${getTimer()}): ${data}`);
  }
};

// 监听文件夹中文件的变化，重新打包启动
const watchFolderFilesChange = (folderPath: string, electronProcess: ChildProcessWithoutNullStreams, IP: string) => {
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
          watchFolderFilesChange(filePath, electronProcess, IP);
        } else {
          // 监听文件变化
          fs.watchFile(filePath, (curr: fs.Stats, prev: fs.Stats) => {
            if (curr.mtimeMs !== prev.mtimeMs) {
              // 杀死当前的Electron进程
              electronProcess.kill();
              // 重新编译主进程代码并重新启动Electron进程
              buildConfig();
              electronProcess = spawn(require('electron') as any, ['dist/main.js', IP]);
              // 监听Electron进程的stdout输出
              electronProcess.stdout?.on('data', getLog);
            }
          });
        }
      });
    });
  });
};

// 导出Vite插件函数
export const ViteElectronPlugin = () => {
  return {
    name: 'vite-electron-plugin',
    // 在configureServer中实现插件的逻辑
    configureServer(server: {
      httpServer: { once: (arg0: string, arg1: () => void) => void; address: () => AddressInfo; };
    }) {
      // 调用初始化Electron函数
      buildConfig();

      // 监听Vite的HTTP服务器的listening事件
      server?.httpServer?.once('listening', () => {
        // 获取HTTP服务器的监听地址和端口号
        const addressInfo = server?.httpServer?.address() as AddressInfo;
        const IP = `http://localhost:${addressInfo.port}`;
        // 启动Electron进程
        let electronProcess: ChildProcessWithoutNullStreams = spawn(require('electron') as any, ['dist/main.js', IP]);

        watchFolderFilesChange('electron', electronProcess, IP);

        // 监听 preload 代码的更改
        fs.watchFile('preload/index.ts', () => {
          // 杀死当前的Electron进程
          electronProcess.kill();
          // 重新编译主进程代码并重新启动Electron进程
          buildConfig();
          electronProcess = spawn(require('electron') as any, ['dist/main.js', IP]);
          // 监听Electron进程的stdout输出
          electronProcess.stdout?.on('data', getLog);
        });

        // 监听Electron进程的stdout输出
        electronProcess.stdout?.on('data', getLog);
      });
    }
  };
};

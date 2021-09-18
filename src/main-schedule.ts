/* eslint-disable @typescript-eslint/prefer-ts-expect-error */
/**
 * @Copyright 2021 Yuanfudao Inc, All Rights Reserved.
 * @author: zhengjiaqibj
 * @createTime: 2021-09-08 17:04:26
 * @lastEditTime: 2021-09-17 18:30:24
 * @lastEditor: zhengjiaqibj
 * @description: 主进程启动调度文件，不负责具体业务。业务入口在platforms/electron/main.ts。
 */

// @ts-ignore
import { app } from 'electron';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const readdir = promisify(fs.readdir);

async function main() {
  if (process.env.NODE_ENV === 'development') {
    const appVersion = app.getVersion();
    setEnvAppVersion(appVersion);
    console.log('---__dirname---:', __dirname);
    const p = path.resolve(__dirname, './dist/electron/main')
    const p2 = path.resolve('./dist/electron/main')
    console.log('---p---:', p);
    console.log('---p2---:', p2);
    // @ts-ignore
    import(path.resolve('./dist/electron/main'));
  } else {
    const highestVersion = await getHighestVersion();
    setEnvAppVersion(highestVersion);
    // @ts-ignore
    import(path.resolve(`./dist/${highestVersion}/dist/electron/main`));
  }
}

main();

/**
 * @description: 设置app版本号环境变量
 * @param {string} currentVersion 当前应用真实版本号
 * @return {*}
 */
function setEnvAppVersion(currentVersion: string) {
  const appVersion = app.getVersion();
  // 当前应用真实版本号
  process.env.APPVERSION = currentVersion;
  // 当前应用框架基础版本号
  process.env.APPVERSION_BASIC = appVersion;
}

/**
 * @description: 获取dist目录下的最高目录版本
 * @param {*}
 * @return {Promise<string>} highestVersion
 */
async function getHighestVersion() {
  const files = await readdir(path.resolve('./dist'));
  const highestVersion = files.reduce((acc, val) => (compareVersion(val, acc) > 0 ? val : acc), '');
  return highestVersion;
}

/**
 * @description: 比较版本号大小
 * @param {string} version1
 * @param {string} version2
 * @return {Number} -1，0，1 (version1 < version2 => -1)
 */
function compareVersion(version1: string, version2: string) {
  const v1List = version1.split('.');
  const v2List = version2.split('.');
  let i = 0;
  for (i = 0; i < v1List.length; i++) {
    const v1 = parseInt(v1List[i], 10);
    const v2 = parseInt(v2List[i], 10);
    if (Number.isNaN(v2) && v1 > 0) {
      return 1;
    }
    if (v1 > v2) {
      return 1;
    } else if (v1 < v2) {
      return -1;
    }
  }
  if (v2List.slice(i).reduce((acc, val) => acc + parseInt(val, 10), 0) > 0) {
    return -1;
  }
  return 0;
}

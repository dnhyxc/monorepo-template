import path from 'path';
import fs from 'fs';
import { getPath } from '../utils/index.mjs'

const [, , ...args] = process.argv;

const packagesPath = getPath('../packages');
const templatePath = getPath('../template');
const buildConfigPath = getPath('../scripts/build-config.mjs');
const tsConfigPath = getPath('../tsconfig.json');

const checkProjectName = (projectName) => {
  const res = /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(projectName);
  return res;
};

// 复制模板文件
const copyFileSync = ({ templatePath, projectPath, projectName }) => {
  const stats = fs.statSync(templatePath);

  // 判断是否是文件夹
  if (stats.isDirectory()) {
    // 递归创建 packagesPath 的子目录和文件
    fs.mkdirSync(projectPath, { recursive: true });
    for (const file of fs.readdirSync(templatePath)) {
      copyFileSync({
        templatePath: path.resolve(templatePath, file),
        projectPath: path.resolve(projectPath, file),
        projectName
      });
    }
    return;
  }

  if (path.basename(templatePath) === 'package.json') {
    const pkg = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
    pkg.name = `dnhyxc-${projectName}`;
    fs.writeFileSync(projectPath, JSON.stringify(pkg, null, 2) + '\n');
    return;
  }

  if (path.basename(templatePath) === 'tsconfig.json') {
    const tsconfig = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
    tsconfig.extends = '../../tsconfig.json';
    fs.writeFileSync(projectPath, JSON.stringify(tsconfig, null, 2) + '\n');
    return;
  }

  fs.copyFileSync(templatePath, projectPath);
}

// 更新 build-config.mjs
const updateBuildConfig = (buildConfigPath, projectName) => {
  const config = fs.readFileSync(buildConfigPath, 'utf-8');
  const modifiedConfig = config.replace(/alias\(\{([\s\S]*?)entries:\s*\[([\s\S]*?)\]\s*\}\)/, (match, p1, p2) => {
    const entries = `\n            { find: '@', replacement: '../packages/${projectName}/src' }, ${p2}`;
    return `alias({${p1}entries: [${entries}]})`;
  });
  fs.writeFileSync(buildConfigPath, modifiedConfig);
}

// 更新 rollup.config.js
const updateRollupConfig = (projectName) => {
  const rollupConfigPath = getPath(`../packages/${projectName}/rollup.config.js`);
  const config = fs.readFileSync(rollupConfigPath, 'utf-8');
  const modifiedConfig = config.replace('dnhyxc-demo', `dnhyxc-${projectName}`);
  fs.writeFileSync(rollupConfigPath, modifiedConfig);
}

// 更新 vitest.config.js
const updateVitestConfig = (projectName) => {
  const vitestConfigPath = getPath(`../packages/${projectName}/vitest.config.js`);
  const config = fs.readFileSync(vitestConfigPath, 'utf-8');
  const modifiedConfig = config.replace('demo', `${projectName}`);
  fs.writeFileSync(vitestConfigPath, modifiedConfig);
}

// 更新 tsconfig.json
const updateTsConfig = (tsConfigPath, projectName) => {
  let config = fs.readFileSync(tsConfigPath, 'utf-8');
  const includeRegex = /"include":\s*\[([\s\S]*?)\]/;
  const includeMatch = includeRegex.exec(config);
  if (includeMatch) {
    const includeValue = includeMatch[1];
    const modifiedIncludeValue = `"./packages/${projectName}/src/*", 
    "./packages/${projectName}/index.ts", ${includeValue}`;
    const modifiedConfig = config.replace(includeRegex, `"include": [${modifiedIncludeValue}]`);
    const atPathsRegex = /"@\/\*": \[\s*(.*?)\]/s;
    const atPathsMatch = atPathsRegex.exec(modifiedConfig);
    if (atPathsMatch) {
      const atPathsValue = atPathsMatch[1];
      const modifiedAtPathsValue = `"./packages/${projectName}/src/*", ${atPathsValue}`;
      const modifiedConfigString = modifiedConfig.replace(atPathsRegex, `"@/*": [${modifiedAtPathsValue}]`);
      fs.writeFileSync(tsConfigPath, modifiedConfigString);
    }
  }
}

const create = async ({ templatePath, packagesPath, projectName }) => {
  const projectPath = getPath(`${packagesPath}/${projectName}`)
  if (!checkProjectName(projectName)) {
    console.log('项目名称存在非法字符，请重新输入');
    return;
  }
  if (fs.existsSync(projectPath)) {
    console.log(`已有 ${projectName} 项目，请勿重复创建！`);
    return;
  }
  copyFileSync({ templatePath, projectPath, projectName })
  updateBuildConfig(buildConfigPath, projectName)
  updateTsConfig(tsConfigPath, projectName)
  updateRollupConfig(projectName)
  updateVitestConfig(projectName)
  console.log(`创建 ${projectName} 项目成功！`);
}

create({ templatePath, packagesPath, projectName: args[0] })
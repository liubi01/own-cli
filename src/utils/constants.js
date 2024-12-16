const {
    name,
    version
} = require('../../package.json');
// 根据node运行环境判断存放模板地址
const downloadDirectory = `${process.env[process.platform === 'darwin' ? 'HOME' : 'USERPROFILE']}/.template`;
// console.log(downloadDirectory);
// ownrc 内容格式home=https://skimdb.npmjs.com/
const configFile = `${process.env[process.platform === 'darwin' ? 'HOME' : 'USERPROFILE']}/.ownrc`; // 配置文件的存储位置
// const defaultConfig = {
//     repo: 'own-cli', // 默认拉取的仓库名
// };
const defaultConfig = { // 默认拉取的仓库名
    'org':'own-cli',
}
module.exports = {
    name,
    version,
    defaultConfig,
    configFile,
    downloadDirectory
};
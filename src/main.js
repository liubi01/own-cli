const {
  program
} = require('commander');
const path = require('path');
const {
  version
} = require('./utils/constants');
const {
  mapActions
} = require('./utils/common');
// const mapActions = {
//   create: { // 创建模板
//     description: 'create project',
//     alias: 'cr',
//     examples: [
//       'own-cli create <template-name>',
//     ],
//   },
//   config: { // 配置配置文件
//     description: 'config info',
//     alias: 'c',
//     examples: [
//       'own-cli config get <k>',
//       'own-cli config set <k> <v>',
//     ],
//   },
//   '*': {
//     description: 'command not found',
//   },
// };
// 循环创建命令
Object.keys(mapActions).forEach((action) => {
  program
    .command(action) // 命令的名称
    .description(mapActions[action].description) // 命令的描述
    .action(() => { // 动作
      if (action === '*') { // 如果动作没匹配到说明输入有误
        console.log(mapActions[action].description);
      } else { // 引用对应的动作文件 将参数传入
        require(path.resolve(__dirname, action))(...process.argv.slice(3));
      }
    })
    .alias(mapActions[action].alias) // 命令的别名

});
program.on('--help', () => {
  console.log('Examples');
  Object.keys(mapActions).forEach((action) => {
    (mapActions[action].examples || []).forEach((example) => {
      console.log(`${example}`);
    });
  });
});
program.option('-ig,--initgit', 'init git')
program.version(version)
  .parse(process.argv);

  // 如果只是执行了 own-cli 命令 相当于执行 own-cli --help
if(!program.args.length){
  program.help();
}
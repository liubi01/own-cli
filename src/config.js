const fs = require('fs');
const {
    encode,
    decode
} = require('ini');
const {
    defaultConfig,
    configFile
} = require('./utils/constants');
const {
    program
  } = require('commander');
const chalk = require('chalk');
const cons = require('consolidate');
module.exports = (action, k, v) => {
    if (!action) {
        program.help();
        return;
    }
    const flag = fs.existsSync(configFile);
    const obj = {};
    if (flag) { // 配置文件存在
        const content = fs.readFileSync(configFile, 'utf8');
        const c = decode(content); // 将文件解析成对象
        Object.assign(obj, c);
    }
    // const flagKey = obj.v || (defaultConfig[k] == k);
    if (action === 'get') {
        if (obj[k] || defaultConfig[k]) {
            console.log(chalk.green(`${obj[k] || defaultConfig[k] }`));
            // console.log(obj[k] || defaultConfig[k]);
        } else {
            console.log(`没有此项，您可能是想输入为 ${chalk.green('own-cli config get <k>')}命令，\n比如:  ${chalk.green('own-cli config get org')}`);
        }
        return obj[k] || defaultConfig[k]
    }else if (action === 'set') {
        if (k || v) {
            obj[k] = v;
            fs.writeFileSync(configFile, encode(obj)); // 将内容转化ini格式写入到字符串中
            console.log(`${k}=${v}`);
        } else {
            console.log(`没有此项，您可能是想输入为 ${chalk.green('own-cli config set <k> <v></v>')}命令，\n比如:  ${chalk.green('own-cli config set org own-cli')}`);
        }
    } else if (action === 'getVal') {
        let c = {} ;
        if(obj && Object.keys(obj).length>0){
          c = Object.assign({}, obj);
        }else{
          c = Object.assign({}, defaultConfig);
          
        }
        console.log(c);
        // return obj[k];
        return c;
    }else{
        console.log(chalk.red(`no such function`));
        return 
    }
};
const ora = require('ora');
const axios = require('axios');
const {
    promisify
} = require('util');
const ncp = require('ncp');
const MetalSmith = require('metalsmith'); // 遍历文件夹
const Inquirer = require('inquirer');
const path = require('path');
const fs = require('fs');
let {
    render
} = require('consolidate').ejs;
render = promisify(render); // 包装渲染方法
const config = require('../config');
const {
    downloadDirectory
} = require("./constants");
let downloadGit = require('download-git-repo');
downloadGit = promisify(downloadGit); // 将项目下载到当前用户的临时文件夹下
// const download = async (repo, tag) => {
//     let api = `quick-cli/${repo}`; // 下载项目
//     if (tag) {
//         api += `#${tag}`;
//     }
//     const dest = `${downloadDirectory}/${repo}`; // 将模板下载到对应的目录中
//     await downLoadGit(api, dest);
//     return dest; // 返回下载目录
// };
// 下载项目
const downloadTem = async (repo, tag) => {
    console.log(tag, 'downloadTem');
    let project = `own-cli/${repo}`; //下载的项目
    if (tag) {
        project += `#${tag}`;
    }
    //     c:/users/xx/.template
    let dest = `${downloadDirectory}/${repo}`;
    //把项目下载对应的目录中
    console.log(dest, 'dest的内容。。。。。。。。。。');
    console.log(project, 'dest的内容。。。。。。。。。。');
    try {
        await downloadGit(project, dest);
    } catch (error) {
        console.log('错误了吗？？？\n');
        console.log(error);
    }
    return dest;
}
// 复制项目临时文件到本地工作项目
const cpTemp2Local = async (target, projectName) => {
    const resolvePath = path.join(path.resolve(), projectName);
    console.log("目录", path.resolve(), __dirname);
    // 仓库中有ask.js就表示是复杂的仓库项目
    if (!fs.existsSync(path.join(target, 'ask.js'))) {
        await ncp(target, resolvePath);
        fs.remove(target);
    } else {
        //复杂项目
        // 1) 让用户填信息
        await new Promise((resolve, reject) => {
            MetalSmith(__dirname)
                .source(target) // 遍历下载的目录
                .destination(resolvePath) // 最终编译好的文件存放位置
                .use(async (files, metal, done) => {
                    let args = require(path.join(target, 'ask.js'));
                    let res = await Inquirer.prompt(args);
                    // 项目名称
                    let met = metal.metadata();
                    // 将询问的结果放到metadata中保证在下一个中间件中可以获取到
                    Object.assign(met, res);
                    met.name = projectName;
                    //  ask.js 只是用于 判断是否是复杂项目 且 内容可以定制不需要复制到本地
                    delete files['ask.js'];
                    done();
                })
                .use((files, metal, done) => {
                    const res = metal.metadata();
                    Reflect.ownKeys(files).forEach(async (file) => {
                        if (file.includes('.js') || file.includes('.json')) {
                            let content = files[file].contents.toString(); //文件内容
                            if (content.includes('<%')) {
                                content = await render(content, res);
                                files[file].contents = Buffer.from(content); //渲染
                            }
                        }
                    })
                    done();
                })
                .build((err) => {
                    if (err) {
                        reject();
                    } else {
                        resolve();
                    }
                })
        });
    }
}
// 根据我们想要实现的功能配置执行动作，遍历产生对应的命令
const mapActions = {
    create: { // 创建模板
        description: 'create project',
        alias: 'cr',
        examples: [
            'own-cli create <template-name>',
        ],
    },
    config: { // 配置配置文件
        description: 'config info',
        alias: 'c',
        examples: [
            'own-cli config get <k>',
            'own-cli config set <k> <v>',
        ],
    },
    '*': {
        description: 'command not found',
    },
};
const mapRepoInfo = {
    repos: {
        mess: {
            start: '正在链接你的组织...',
            fail: '链接组织的仓库列表为空...\n'

        },
        promptObj: {
            type: 'list',
            name: 'repo',
            message: '请选择一个你要创建的项目'
        }
    },
    tags: { //配置文件
        mess: {
            start: '正在链接仓库...',
            fail: '链接仓库失败或者没有版本号信息...\n '

        },
        promptObj: {
            type: 'list',
            name: 'tag',
            message: '请选择一个该项目的版本下载'
        }
    }
}
// 封装loading效果
const wrapFetchAddLoading = (fn, message) => async (...args) => {
    const spinner = ora(message);
    spinner.start(); // 开始loading
    spinner.color = 'red';
    const r = await fn(...args);
    spinner.succeed(); // 结束loading
    return r;
};
const wrapCustomFetchAddLoading = async (fn, message, promptObj) => async (...args) => {
    // let repos = await wrapFetchAddLoading(fn, mess.start)(...args);
    let fetchRepos = await wrapFetchAddLoading(fn, mess.start)(...args);
    if (Array.isArray(repos) && repos.length > 0) {
        fetchRepos = repos.map((item) => item.name);
    } else {
        return;
    }

    // 使用inquirer 在命令行中可以交互
    const {
        choiseRepo
    } = await inquirer.prompt([{
        type: promptObj.type,
        name: 'repo',
        message: promptObj.message,
        choices: repos
    }]);
    return choiseRepo;
}
// 1).获取仓库列表
const fetchRepoList = async () => {
    // 获取当前组织中的所有仓库信息,这个仓库中存放的都是项目模板
    const org = config('get','org');
    const {
        data
    } = await axios.get(`https://api.github.com/orgs/${org}/repos`);
    return data;
};
const fetchTagList = async (repo) => {
    const {
        data
    } = await axios.get(`https://api.github.com/repos/own-cli/${repo}/tags`);
    return data;
};

module.exports = {
    // mapActions,
    wrapFetchAddLoading,
    wrapCustomFetchAddLoading,
    cpTemp2Local,
    downloadTem,
    fetchRepoList,
    fetchTagList,
    mapRepoInfo,
    mapActions
};
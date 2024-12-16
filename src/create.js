// const axios = require('axios');
// let downLoadGit = require('download-git-repo');
const Inquirer = require('inquirer');
const ora = require('ora');
const {
    program
} = require('commander');
const path = require("path");
// downLoadGit = promisify(downLoadGit);
const {
    wrapFetchAddLoading,
    wrapCustomFetchAddLoading,
    downloadTem,
    cpTemp2Local,
    fetchTagList,
    fetchRepoList,
    mapRepoInfo
} = require('./utils/common');
module.exports = async (projectName) => {
    if (!projectName) {
        program.help();
        return;
    }
    let repos, tags;
    // const {
    //     defaultRepoFlag
    // } = await inquirer.prompt([{
    //     type: 'confirm',
    //     name: 'defaultRepoFlag',
    //     message: '你是否下载默认模板?\n ',
    //     default: true
    // }]);
    // if (!defaultRepoFlag) {
    //     console.log(`${chalk.green('it belong to github organization ：')}\n`);
    //     // const {
    //     //     customOrg
    //     // } = await inquirer.prompt([{
    //     //     type: 'input',
    //     //     name: 'customOrg',
    //     //     message: 'please input organization of github ? ',
    //     // }]);
    //     // 选择模板
    //     repos = await wrapCustomFetchAddLoading(fetchRepoList, mapRepoInfo.repos.mess, mapRepoInfo.repos.promptObj)(customOrg);
    //     if (!repos) {
    //         console.log(`${chalk.yellow('dont exist this organization!')}`);
    //         return;
    //     }
    //     // 选择版本
    //     tags = await wrapCustomFetchAddLoading(fetchTagList, mapRepoInfo.tags.mess, mapRepoInfo.tags.promptObj)(customOrg);
    //     if (!tags) {
    //         console.log(`${chalk.yellow('dont find any tags!')}`);
    //         return;
    //     }
    // } else {
    // }
    // 这回用起来舒心多了～～～
    repos = await wrapFetchAddLoading(fetchRepoList, 'fetching repo list')();

    repos = repos.map((item) => item.name);
    console.log(repos);
    const {
        repo
    } = await Inquirer.prompt({
        name: 'repo',
        type: 'list',
        message: 'please choice repo template to create project',
        choices: repos, // 选择模式
    });
    tags = await wrapFetchAddLoading(fetchTagList, 'fetching tag list')(repo);
    tags = tags.map((item) => item.name);
    const {
        tag
    } = await Inquirer.prompt({
        name: 'tag',
        type: 'list',
        message: 'please choice tag to create project',
        choices: tags,
    });
    console.log(tag);
    const target = await wrapFetchAddLoading(downloadTem, 'download template')(repo, tag);
    // 复制模板到指定目录
    await cpTemp2Local(target, projectName);
    const spawn = async (...args) => {
        const {
            spawn
        } = require('child_process')
        return new Promise(resolve => {
            const spinner = ora("downloading node_modules...");
            spinner.start(); // 开始loading
            spinner.color = 'green';
            const proc = spawn(...args) // 在node.js中执行shell一般用spawn，实现从主进程的输出流连通到子进程的输出流
            proc.stdout.pipe(process.stdout) // 子进程正常流搭到主进程的正常流
            proc.stderr.pipe(process.stderr) // 子进程错误流插到主进程的错误流
            proc.on('error', function (err) {
                console.log('Oh noez, teh errurz: ' + err);
                spinner.succeed(); // 结束loading
            });
            proc.on('close', () => {
                resolve()
                spinner.succeed(); // 结束loading

            })
        })
    }
    // nodemodules download
    spawn(/^win/.test(process.platform) ? `npm.cmd` : `npm`, ['install'], {
        cwd: path.resolve(process.cwd(), projectName)
    });
};
# own-cli
> The node project is cli which is used for downloading the one of templates from github's organization and select the tag.
> 目前只能本司自用（organization 未改为自定义ownclirc）***后期版本迭代

### Features

- Create project
- Select repos and tags
- Download the repo as the project template
- Init yourself project

### Getting Started

- 默认从own-cli项目拉取模板
```bash
 npm i -g own-cli
 own-cli create <projectName>
```

### Config
*Requires github的对应organization必须有项目 以及项目必须有至少一个tag*
- 可从自己的项目拉取模板（orgs）设置你的github的对应organization
```bash
   own-cli config set orgs <your organization>
```


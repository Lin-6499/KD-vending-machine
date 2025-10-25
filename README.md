# KD 自动售货机管理系统

<div>
	<p>
    <a href="https://github.com/Lin-6499/KD-vending-machine" target="_blank">
		  <img src="https://img.shields.io/badge/License-MIT-%2343aefc" alt="License">
		</a>
		<a href="https://github.com/Lin-6499/KD-vending-machine" target="_blank">
		  <img src="https://img.shields.io/badge/vue_.js-vue3_.x-%2300b42a" alt="Vue">
		</a>
    <a href="https://github.com/Lin-6499/KD-vending-machine" target="_blank">
		  <img src="https://img.shields.io/badge/Vite-6x-%2311B337" alt="Vite">
		</a>
     <a href="https://github.com/Lin-6499/KD-vending-machine" target="_blank">
		 <img alt="arco.design" src="https://img.shields.io/badge/arco.design-2.57.0-%23%2028%2C175%2C%2063">
		</a>
	</p>
</div>

### 项目介绍 📖

KD 自动售货机管理系统是一个现代化的自动售货机后台管理平台，基于最新的前端技术栈构建，包括 Vue3, Vite6, TypeScript, Pinia 和 Arco Design。系统提供了完整的售货机运营管理功能，包括设备管理、商品管理、销售分析、维护调度等核心业务模块。

### 主要功能 🚀

- **设备管理**: 售货机列表、位置管理、状态监控
- **商品管理**: 库存管理、商品配置、补货调度
- **销售分析**: 销售报表、数据统计、收益分析
- **维护管理**: 维护计划、故障处理、设备保养
- **系统管理**: 用户权限、系统配置、数据管理

### 代码仓库 📦

| 平台   | 仓库地址                                                             |
| ------ | -------------------------------------------------------------------- |
| GitHub | [KD-vending-machine](https://github.com/Lin-6499/KD-vending-machine) |

> 主分支：main
>
> 开发分支：develop

### 先行预览 🖼️

_项目截图将在后续更新..._

### 技术特性 🔨

- **现代化技术栈**: 采用 Vue3, Vite6, TypeScript 等最新流行的技术栈
- **权限管理**: 内置 RBAC 角色权限模型，实现路由、角色、按钮权限访问控制
- **状态管理**: 使用 Pinia 替代 Vuex，轻量、简单、易用，集成 Pinia 持久化插件
- **UI 组件**: 基于 Arco Design 组件库，支持组件大小切换、多主题布局、暗黑模式
- **国际化**: 支持 i18n 国际化多语言切换
- **路由管理**: 使用 VueRouter 配置动态路由权限拦截、路由懒加载
- **页面缓存**: 使用 KeepAlive 对页面进行缓存，支持多级嵌套路由缓存
- **代码规范**: 使用 Prettier 统一格式化代码，集成 ESLint、Stylelint 代码校验规范
- **提交规范**: 使用 husky、lint-staged、commitlint 等插件，规范提交信息

### 环境准备 🏝️

确保你的环境满足以下要求（重要）：

- **git**: 你需要 git 来克隆和管理项目版本
- **NodeJS**: >=18.12.0，推荐 20.12.0 或更高
- **pnpm**: >= 8.7.0，推荐最新版本

### 安装使用步骤 📔

### 获取代码 🔗

```bash
# 克隆代码
git clone https://github.com/Lin-6499/KD-vending-machine.git
```

### 安装依赖 📌

```bash
# 进入项目目录
cd KD-vending-machine

# 安装项目依赖
pnpm install
```

### 开发环境配置 🛠️

推荐安装以下 VSCode 插件：

- [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) - Vue 服务插件
- [TypeScript Importer](https://marketplace.visualstudio.com/items?itemName=pmneo.tsimporter) - TypeScript 自动导入
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) - 代码格式化

### 项目启动 🚀

```bash
# 开发环境启动
pnpm dev

# 开发环境构建
pnpm build:dev

# 生产环境构建
pnpm build:prod

# 测试环境构建
pnpm build:test

# 预览环境启动
pnpm preview
```

### 项目结构 📚

```text
KD-vending-machine
├─ .husky                 # husky 配置文件
├─ .vscode                # VSCode 推荐配置
├─ build                  # vite项目配置目录
├─ public                 # 静态资源文件（该文件夹不会被打包）
├─ src
│  ├─ api                 # API 接口管理
│  ├─ assets              # 静态资源文件
│  ├─ components          # 全局组件
│  ├─ config              # 全局配置项
│  ├─ directives          # 全局自定义指令文件
│  ├─ globals             # 全局函数
│  ├─ hooks               # 常用 Hooks 封装
│  ├─ lang                # 语言国际化 i18n
│  ├─ layout              # 框架布局模块
│  ├─ mock                # 本地数据mock
│  ├─ router              # 路由管理
│  ├─ store               # pinia store
│  ├─ style               # 全局样式文件
│  ├─ typings             # 全局 ts 声明
│  ├─ utils               # 常用工具库
│  ├─ views               # 项目所有页面
│  │  ├─ machines         # 设备管理页面
│  │  ├─ products         # 商品管理页面
│  │  ├─ sales            # 销售分析页面
│  │  ├─ maintenance      # 维护管理页面
│  │  └─ system           # 系统管理页面
│  ├─ App.vue             # 项目主组件
│  ├─ main.ts             # 项目入口文件
│  └─ vite-env.d.ts       # 指定 ts 识别 vue
├─ .editorconfig          # 代码编辑器配置文件
├─ .env                   # 通用环境配置
├─ .env.development       # 开发环境配置
├─ .env.production        # 生产环境配置
├─ .env.test              # 测试环境配置
├─ .eslintignore          # 忽略 Eslint 校验
├─ .eslintrc.cjs          # Eslint 校验配置文件
├─ .gitignore             # 忽略 git 提交
├─ .prettierignore        # 忽略 Prettier 格式化
├─ .prettierrc.cjs        # Prettier 格式化配置
├─ .stylelintignore       # 忽略 Stylelint 校验
├─ .stylelintrc.cjs       # Stylelint 格式化配置
├─ commitlint.config.cjs  # git 提交规范配置
├─ index.html             # 入口 html
├─ LICENSE                # 开源协议
├─ lint-staged.config.cjs # lint-staged 配置文件
├─ package.json           # 依赖包管理
├─ pnpm-lock.yaml         # 依赖包包版本锁
├─ README.md              # README 介绍
├─ tsconfig.json          # typescript 全局配置
└─ vite.config.ts         # vite 全局配置文件
```

### 浏览器支持 🌎

- 本地开发推荐使用 Chrome 最新版浏览器 [Download](https://www.google.com/intl/zh-CN/chrome/)
- 生产环境支持现代浏览器，不再支持 IE 浏览器，更多浏览器可以查看 [Can I Use Es Module](https://caniuse.com/?search=ESModule)

| ![IE](https://i.imgtg.com/2023/04/11/8z7ot.png) | ![Edge](https://i.imgtg.com/2023/04/11/8zr3p.png) | ![Firefox](https://i.imgtg.com/2023/04/11/8zKiU.png) | ![Chrome](https://i.imgtg.com/2023/04/11/8zNrx.png) | ![Safari](https://i.imgtg.com/2023/04/11/8zeGj.png) |
| :---------------------------------------------: | :-----------------------------------------------: | :--------------------------------------------------: | :-------------------------------------------------: | :-------------------------------------------------: |
|                   not support                   |                  last 2 versions                  |                   last 2 versions                    |                   last 2 versions                   |                   last 2 versions                   |

### 技术栈 🧩

- [Vue3](https://v3.cn.vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://github.com/vitejs/vite) - 下一代前端构建工具
- [TypeScript](https://github.com/microsoft/TypeScript) - JavaScript 的超集
- [Pinia](https://pinia.vuejs.org/) - Vue 的状态管理库
- [Arco Design](https://arco.design/) - 字节跳动出品的企业级设计语言
- [Vue Router](https://router.vuejs.org/) - Vue.js 官方路由管理器
- [Axios](https://github.com/axios/axios) - 基于 Promise 的 HTTP 库
- [Sass](https://github.com/sass/sass) - CSS 预处理器
- [ESLint](https://github.com/eslint/eslint) - JavaScript 代码检查工具
- [Prettier](https://github.com/prettier/prettier) - 代码格式化工具

### 开源协议 📫

本项目基于 [MIT](LICENSE) 协议，可免费用于学习和商业用途。

### 支持作者 🌟

如果觉得项目不错，或者已经在使用了，希望你可以去 [GitHub](https://github.com/Lin-6499/KD-vending-machine) ⭐ Star，这将是对我极大的鼓励与支持。

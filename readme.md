
##开发环境搭建
Rollup 是一个 JavaScript 模块打包器,可以将小块代码编译成大块复杂的代码， rollup.js更专注于Javascript类库打包 （开发应用时使用Wwebpack，开发库时使用Rollup）

npm install @babel/preset-env @babel/core rollup rollup-plugin-babel rollup-plugin-serve cross-env -D

```
@babel/preset-env babel的一个预设 用来使用更高级的语法  如es6转es5 他是一个集合 将高级语法转成低级语法
 @babel/core babel的核心库
 rollup 打包工具
 rollup-plugin-babel rollup可以使用babel 相当于一个桥梁
rollup-plugin-serve 启动一个静态服务
cross-env 设置不同的环境变量
```


## vue-template-compiler
```
let compiler = require('vue-template-compiler')
const ast1 = compiler.compile('<div v-if="false"></div>')
console.log(ast1.render)
```


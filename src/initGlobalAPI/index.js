import { mergeOptions } from "../util/index"
import initMixin  from "./mixin"
import initAssetRegisters from './assets'
import { ASSETS_TYPES } from "../const"
import initExtend from './extend'
export function initGlobalAPI(Vue){
    // 整合了所以的全局相关的内容
    Vue.options = {}

    initMixin(Vue)

    // 初始化的全局过滤器 指令 组件
    ASSETS_TYPES.forEach(type => {
        Vue.options[type+'s']={}
    });

    Vue.options._base = Vue //_base 是Vue的构造函数
    // 注册extend方法
    initExtend(Vue)
    initAssetRegisters(Vue)
}

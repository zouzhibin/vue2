
/**
 *
 * @param {*} data 当前数据是不是对象
 */
export function isObject(data) {
    return typeof data === 'object' && data !== null;
}


export function proxy(vm,source,key){
    Object.defineProperty(vm,key,{
        get(){
            return vm[source][key]
        },
        set(newValue){
            vm[source][key] = newValue
        }
    })
}

/**
 * 是否是原生标签
 * @param tagName
 */
export function isReservedTag(tagName) {
    let str = 'p,div,span,input,button'
    let obj = {}
    str.split(',').forEach(tag=>{
        obj[tag]= true
    })
    return obj[tagName]
}
export function def(data,key,value){
    Object.defineProperty(data,key,{
        enumerable:false,
        configurable:false,
        value
    })
}
const LIFECYCLE_HOOKS = [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeDestory',
    'destroyed'
]

const strats = []





//合并hooks
function mergeHook(parentVal,childVal){
    // 如果儿子没有 直接用父亲的
    if(childVal){
        if(parentVal){
            return parentVal.concat(childVal)
        }else{
            return [childVal]
        }
    }else{
        return parentVal
    }
}
LIFECYCLE_HOOKS.forEach(hook=>{
    strats[hook] = mergeHook
})
function mergeAssets(parentVal,childVal){
    const res = Object.create(parentVal)
    if(childVal){
        for(let key in childVal){
            res[key] = childVal[key]
        }
    }

    return res
}

strats.components = mergeAssets



// 合并两个对象
// 自定义策略
// 1、如果父亲有的儿子也有 应该用儿子替换父亲
// 2、如果父亲有值儿子没有 用父亲的
export function mergeOptions(parent,child){
    const options = {}
    for(let key in parent){
        mergeFiled(key)
    }
    for(let key in child){ // 如果已经合并过了 就不需要在合并了
        if(!parent.hasOwnProperty(key)){
            mergeFiled(key)
        }
    }
    // 默认的合并策略 但是有些熟悉 需要有特殊的合并方式 如生命周期的合并
    function mergeFiled(key){
        if(strats[key]){
            return options[key] = strats[key](parent[key],child[key])
        }
        if(typeof parent[key]==='object'&& typeof child[key]==='object'){
            options[key] = {
                ...parent[key],
                ...child[key]
            }
        }else if(child[key]===null||child[key]===undefined){
            options[key]=parent[key]
        }else{

            options[key] = child[key]
        }
    }

    return options
}

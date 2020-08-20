// 重写数组的七个方法  push shift unshift pop reverse sort splice 会导致数组本身发生变化


let oldArrayMethods = Array.prototype;

// value.__proto__== arrayMethods 原型链查找的问题  会向上查找 先查找我重写的 重写的没有会继续向上查找

// arrayMethods.__proto__ = oldArrayMethods

export const arrayMethods = Object.create(oldArrayMethods)


const methods = [
    'push',
    'shift',
    'unshift',
    'pop',
    'reverse',
    'sort',
    'splice',

]

methods.forEach(method=>{
    arrayMethods[method] = function(...args){
        // console.log('用户调用了push 方法') //AOP切片编程

        const result = oldArrayMethods[method].apply(this,args) // 调用原生的数组方法
        // push unshift 添加的元素可能还是一个对象
        let inserted;// 当前用户插入的元素
        let ob = this.__ob__;
        switch(method){
            case 'push':
            case 'unshift':
              inserted = args;
              break;
            case 'splice': // 3个 新增的属性 splice 有删除 有新增的功能 arr.splice(0,1,{name:1})
                inserted = args.slice(2)
                break;
            default:
                break;            
        }
        if(inserted){
            ob.observeArray(inserted) // 将新增属性继续观测
            
        }
        return result
    }
})
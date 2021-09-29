export function patch(oldVnode,vnode){
    // console.log(oldVnode,vnode)
    // 组件oldVnode是null $mount()
    if(!oldVnode){
        // 通过当前的虚拟节点 创建元素并返回
        return createElm(vnode)
    }else{
        const isRealElement = oldVnode.nodeType
        // 判断是否是真实元素  因为只有真实元素采用nodeType属性
        if(isRealElement){
            const oldElm = oldVnode // div id="app"
            const parentElm = oldVnode.parentNode //body
            let el = createElm(vnode)

            parentElm.insertBefore(el,oldElm.nextSibling)

            parentElm.removeChild(oldElm)
            // 需要将渲染好的结果返回出去
            return el
        }else{
            // 1、如果都是虚拟节点的话 diff 算法
            if(oldVnode.tag!==vnode.tag){
                // 标签不一致时  直接替换
                oldVnode.el.parentNode.replaceChild(createElm(vnode),oldVnode.el)
            }

            // 2、如果文本呢？文本都没有tag
            if(!oldVnode.tag){ // 这个就是文本的情况，如果内容不一致直接替换掉文本
                if(oldVnode.text!==vnode.text){
                    oldVnode.el.textContent = vnode.text
                }
            }

            // 3、说明标签一致而且不是文本了（比对属性是否一致
            let el = vnode.el = oldVnode.el
            // vnode 是新的虚拟节点
            updateProperties(vnode,oldVnode.data)

            // 4、比对儿子
            let oldChildren = oldVnode.children||[];
            let newChildren = vnode.children||[]
            if(oldChildren.length>0&&newChildren.length>0){
                // 1 、新老都有儿子  需要比对里面的儿子 dom-diff
                updateChildren(el,oldChildren,newChildren)
            }else if(newChildren.length>0){
                // 2 、新的有孩子 老的没孩子 直接将孩子虚拟节点转换成真实节点 插入即可 直接增加即可
                for(let i=0;i<newChildren.length;i++){
                    let child = newChildren[i]
                    el.appendChild(createElm(child))
                }
            }else if(oldChildren.length>0){
                // 3、老的有孩子 新的没孩子 删除老的儿子
                el.innerHTML = ''
            }
        }
    }

    // 递归创建真实节点  替换掉老的节点
}
// 是否是同一个节点
function isSameVnode(oldVnode,newVnode) {
    return (oldVnode.tag===newVnode.tag)&&(oldVnode.key===newVnode.key)
}



function updateChildren(parent,oldChildren,newChildren) {
    // vue采用的是双指针的方式
    // vue在内部比对的过程中做了很多优化策略
    let oldStartIndex = 0 // 老的头索引
    let oldEndIndex = oldChildren.length-1 // 老的尾索引
    let oldStartVnode = oldChildren[0] // 老的开始节点
    let oldEndVnode = oldChildren[oldEndIndex] // 老的结束节点



    let newStartIndex = 0;
    let newEndIndex = newChildren.length-1;
    let newStartVnode = newChildren[0]
    let newEndVnode = newChildren[newEndIndex]


    const makeIndexByKey = (children)=>{
        let map = {}
        children.forEach((item,index)=>{
            if(item.key){
                map[item.key] = index // 根据key来创建一个映射表
            }
        })
        return map
    }
    let map = makeIndexByKey(oldChildren)

    // 在比对的过程中 新老虚拟节点有一方循环完毕就结束
    // insertBefore appendChild 都有移动性 就是会把原来的元素移走
    // 1、前端中比较常见的操作有 像尾部插入 头部插入 头移动到尾部  尾部移动头部  正序和反序
    while (oldStartIndex<=oldEndIndex&&newStartIndex<=newEndIndex){
        if(!oldStartVnode){ // 在老指针移动过程中可能会碰到undefind
            oldStartVnode = oldChildren[++oldStartIndex]

        }else if(!oldEndVnode){
            oldEndVnode = oldChildren[--oldEndIndex]
        }else
          // 1、新的比老的多 头指针向后移动的情况  代表是向后面插入 优化向后插入的情况
        if(isSameVnode(oldStartVnode,newStartVnode)){
            // 如果是同一个节点 就需要比对这个元素的属性
            patch(oldStartVnode,newStartVnode) // 比对开头节点
            oldStartVnode = oldChildren[++oldStartIndex]
            newStartVnode = newChildren[++newStartIndex]
         // 2、新的比老的多 尾指针向前移动的情况，代表是向前面插入 优化向前插入的情况
        }else if(isSameVnode(oldEndVnode,newEndVnode)){
            patch(oldEndVnode,newEndVnode) // 比对开头节点
            oldEndVnode = oldChildren[--oldEndIndex]
            newEndVnode = newChildren[--newEndIndex]
        // 3、头指针和尾指针进行比对是否相同 头指针向后移  尾指针向前移 头移尾 (涉及到 倒叙 变成正序)
        }else if(isSameVnode(oldStartVnode,newEndVnode)){
            patch(oldStartVnode,newEndVnode) // 比对开头节点 oldEndVnode.el.nextSibling 会为Null
            parent.insertBefore(oldStartVnode.el,oldEndVnode.el.nextSibling)
            oldStartVnode = oldChildren[++oldStartIndex]
            newEndVnode = newChildren[--newEndIndex]

        // 4、尾指针和头指针比对、尾指针向前移 比对是否相同 尾移头
        }else if(isSameVnode(oldEndVnode,newStartVnode)){
            patch(oldEndVnode,newStartVnode) // 比对开头节点 oldEndVnode.el.nextSibling 会为Null
            parent.insertBefore(oldEndVnode.el,oldStartVnode.el)
            oldEndVnode = oldChildren[--newEndIndex]
            newStartVnode = newChildren[++newStartIndex]
        }else {
            // 暴力比对 乱序
            // 先根据老节点的key 做一个映射表 ，拿新的虚拟节点 去映射表中查找 如果可以查找到 则进行移动操作
            //(移到头指针的前面位置) 如果找不到则直接将元素插入即可
            let moveIndex = map(newStartVnode.key) //
            if(!moveIndex){ // 找不到不需要复用
                parent.insertBefore(createElm(newStartVnode),oldStartVnode.el)
            }else{
                // 如果在映射表中查找到了 ，则直接将元素移走 ，并且将当前位置置为空
                let moveVnode = oldChildren[moveIndex] // 我要移动的那个元素
                oldChildren[moveIndex] = undefined
                parent.insertBefore(moveVnode.el,oldStartVnode.el)
                patch(moveVnode,newStartVnode)
            }
            newStartVnode = newChildren[++newStartIndex]
        }



    }
    // 新的比老的多 插入新节点
    if(newStartIndex<=newEndIndex){
        for(let i=newStartIndex;i<newStartIndex;i++){
            // 将新增的元素直接进行插入(可能是像后插入  也有可能从头插入) insertBefore
            let flag = newChildren[newEndIndex+1] === null?null:newChildren[newEndIndex+1].el
            if(flag===null){
                parent.insertBefore(createElm(newChildren[i],null)) // 写null 就等价于appendChild
            }else{
                parent.insertBefore(createElm(newChildren[i]),flag)
            }
            // parent.appendChild(createElm(newChildren[i]))
        }
    }
}

function createComponent(vnode) { // 初始化的作用
    let i = vnode.data
    // 需要创建组件的实例
    if((i=i.hook)&&(i=i.init)){
        i(vnode) // 调用组件的初始化方法
    }
    // 执行完毕后
    if(vnode.componentsInstance){
        return true
    }
    return false

}

// 根据虚拟节点创建出真实的节点
export function createElm(vnode){
    let {tag,children,key,data,text} = vnode;
   // 是标签就创建出标签
    if(typeof tag ==='string'){
        // 不是tag 是字符串的就是普通的html 还有可能就是我们的组件
        // 实例化组件  可能是组件 如果是组件 就直接根据组件创建出组件对应的真实节点
        if(createComponent(vnode)){ // 表示是返回true 说明这个虚拟节点是组件
            // 这里返回的是组件的真实的dom
            return vnode.componentsInstance.$el
        }
        vnode.el = document.createElement(tag) // 递归创建儿子节点 将儿子节点扔到父节点中
        updateProperties(vnode)
        children.forEach(child=>{
            return vnode.el.appendChild(createElm(child))
        })
    }else{
        // 虚拟dom上映射着真实dom 方便后续更新操作
        vnode.el = document.createTextNode(text)
    }
    // 如果不是标签就是文本
    return vnode.el
}

// 更新属性 如ID style class

function updateProperties(vnode,oldProps={}){
    let newProps = vnode.data||{};
    let el = vnode.el;
    // console.log('newProps',newProps)
    // 如果老的属性中有 新的属性中没有 ，在真实的dom上将这个属性删除掉
    let newStyle = newProps.style||{}
    let oldStyle = oldProps.style||{}
    // 如果是样式的话 清掉老的
    for(let key in oldStyle){
        if(!newStyle[key]){
            el.style[key]=''
        }
    }

    // 老的属性 新的没有 直接删除
    for(let key in oldProps){
        if(!newProps[key]){
            el.removeAttribute(key)
        }
    }

    // 新的属性 老的没有
    for(let key in newProps){
        if(key==='style'){
            for(let styleName in newProps.style){
                el.style[styleName] = newProps.style[styleName]
            }
        }else if(key==='class'){
            el.className = newProps.class
        }else{
            el.setAttribute(key,newProps[key])
        }
    }

}

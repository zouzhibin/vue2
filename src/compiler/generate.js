
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
function genProps(attrs){ // 处理属性 拼接成属性的字符串

    let str = '';
    for(let i=0;i<attrs.length;i++){
        let attr = attrs[i];
        if(attr.name ==='style'){
            // style="color:red;fontSize:14px"=>{style:{color:'red'},id:name}
            let obj ={}
            // console.log(attr.value.split(';'))
            attr.value.split(';').forEach(item=>{
                let [key,value] = item.split(':');
                obj[key] = value
            })
            attr.value = obj
        }

        str+= `${attr.name}:${JSON.stringify(attr.value)},`
    }
    return `{${str.slice(0,-1)}}`
}
function genChildren(el){
    let children = el.children;
    if(children&&children.length>0){
        return `${children.map(c=>gen(c)).join(',')}`
    }else{
        return false
    }
}
function gen(node){ // 区分是元素还是文本
    if(node.type===1){
        // 元素标签
        return generate(node)
    }else{
        // 文本逻辑不能用 _c 处理
        // 有{{}} 普通文本  混合文本 {{aa}} aa {{bbb}}
        let text = node.text; // a {{name}} b{{age}} c
        let tokens = [];
        let match,index;
        let lastIndex = defaultTagRE.lastIndex=0
        while(match = defaultTagRE.exec(text)){
            index = match.index
            if(index>lastIndex){
                tokens.push(JSON.stringify(text.slice(lastIndex,index)))
            }
            // console.log(match)
            tokens.push(`_s(${match[1].trim()})`)
            lastIndex = index+match[0].length;
        }
        if(lastIndex<text.length){
            tokens.push(JSON.stringify(text.slice(lastIndex)))
        }

        // _v("a"+_s(name)+"b"+_s(age)+'c')
        return `_v(${tokens.join('+')})`
    }
}

export function generate(el){ // [name:"id",value:'app',{}] {id:app,a:1,b:2}
    let children = genChildren(el);
    let code = `_c("${el.tag}",${
        el.attrs.length?genProps(el.attrs):'undefined'
    }${children?`,${children}`:''})

    `
    return code
}


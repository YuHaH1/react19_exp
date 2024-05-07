# 升级react19版本
1. 安装
```shell
npm install react@beta react-dom@beta
```
如果使用ts则需要在package.json中添加。等正式版发布直接可以使用`@types/react`了
```json
  "overrides": {
    "@types/react": "npm:types-react@beta",
    "@types/react-dom": "npm:types-react-dom@beta"
  }
```
[官方文档](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)

# 初始化项目
1. `npm create vite`  选vanilla 和 ts
2. 配置vite.config.ts
```ts
import {defineConfig} from "vite";
import react from '@vitejs/plugin-react';
/** @type {import('vite').UserConfig} */
export default {
   plugins:[react()]
}
```
3. 安装依赖,如下`package.json`文件
```json
{
  "name": "react19_exp",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "@types/node": "^20.12.10",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.2.0"
  },
  "dependencies": {
    "@types/react": "npm:types-react@beta",
    "@types/react-dom": "npm:types-react-dom@beta",
    "react": "^19.0.0-beta-b498834eab-20240506",
    "react-dom": "^19.0.0-beta-b498834eab-20240506"
  },
  "overrides": {
    "@types/react": "npm:types-react@beta",
    "@types/react-dom": "npm:types-react-dom@beta"
  }
}

```
4. 配置tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
  /*
		  tsconfig.node.json
		{
		  "compilerOptions": {
		    "composite": true,
		    "skipLibCheck": true,
		    "module": "ESNext",
		    "moduleResolution": "bundler",
		    "allowSyntheticDefaultImports": true,
		    "strict": true
		  },
		  "include": ["vite.config.ts"]
		}
*/
}
```
5. 之后将项目中的ts可以改为tsx启动项目即可


# react19新特性体验
## 表单相关Hooks
### 状态突变
什么是状态突变？状态突变是指系统或对象的状态在某个时间点发生突然、不可预测的变化。
例如，当用户提交表单以更改其姓名时，将发出 API 请求，然后处理响应。过去，需要**手动处理挂起状态、错误、乐观更新和顺序请求**。过去使用方式代码示例
```typescript
function UpdateName({}) {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async () => {
    setIsPending(true);
    const error = await updateName(name);
    setIsPending(false);
    if (error) {
      setError(error);
      return;
    } 
    redirect("/path");
  };

  return (
    <div>
      <input value={name} onChange={(event) => setName(event.target.value)} />
      <button onClick={handleSubmit} disabled={isPending}>
        Update
      </button>
      {error && <p>{error}</p>}
    </div>
  );
}
```
现在React提供了`useTransition`钩子,19使用示例

```typescript
import {useState, useTransition} from "react";

function updateName(name:string):Promise<string>{
    return new Promise((r)=>{
        setTimeout(()=>{
            if (!name)r("name不能为空")
        },2000)
    })
}

export default ()=>{
    const [name, setName] = useState("");
    const [error, setError] = useState<string|null>(null);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = () => {
        startTransition(async () => {
            const error = await updateName(name);
            if (error) {
                setError(error);
                return;
            }
        })
    };
    const renderLoading = ()=>{
        return <div className="loader"></div>
    }
    return (
        <div>
            <input value={name} onChange={(event) => setName(event.target.value)}/>
            {isPending && renderLoading()}
            <button onClick={handleSubmit} disabled={isPending}>
                Update
            </button>
            {error && <p>{error}</p>}
        </div>
    )
}
```
效果展示
![请添加图片描述](https://img-blog.csdnimg.cn/direct/6db4b91dd9a4443fba890d5d1d3788f5.gif)




### 表单提交状态+行为useActionState
`useActionState` 接受一个函数（“Action”），并返回一个包装的 `Action` 进行调用。调用包装的 Action 时， `useActionState` 将 Action 的最后一个结果返回为`data`作为`state`的值 ，并将 `Action `的挂起状态返回 `pending` 。

```typescript
//函数签名
useActionState<State,Payload>(
        action: (state: Awaited<State>,payload: Payload) => State | Promise<State>,//表单提交行为
        initialState: Awaited<State>, // 初始表单的值
        permalink?: string,  // 目前不太了解，推测是表单提交后达到某个条件跳转到该链接上。有明白的小伙伴可以评论区留言
): [state: Awaited<State>, dispatch: (payload: Payload) => void, isPending: boolean];
```
示例
```typescript
import {useActionState, useEffect} from "react";
function updateName(name:string):Promise<string>{
    return new Promise((r)=>{
        setTimeout(()=>{
            if (!name)r("name不能为空")
            r(name)
        },2000)
    })
}
export default ()=>{
    const [state, submitAction, isPending] = useActionState<string>(
        async (previousState:string, formData) => {
            const state = await updateName(formData.get("name"));
            // handle success
            return state;
        },
        "初始name值",
    );
    return (
        <form action={submitAction}>
            <input type="text" name="name" />
            <button type="submit" disabled={isPending}>Update</button>
            {isPending && <div className="loader"></div>}
            {state && <p style={{color:"green"}}>{state}</p>}
        </form>
    );
}
```
![请添加%图片描述](https://img-blog.csdnimg.cn/direct/98565088e6754a62bdb947537b82904b.gif)
### 获取父组件表单状态useFormStatus
该Hooks为Form下面的子组件提供form状态信息，让我们不依赖父组件注入的Context就能获取到父组件的表单状态。

子组件

```typescript
import {useFormStatus} from "react-dom";

export default ()=>{
    const {pending} = useFormStatus();
    return <button type="submit" disabled={pending} >提交表单</button>
}
```
父组件部分代码展示

```typescript
 <form action={submitAction}>
            <input type="text" name="name" />
            <ExpUseFormStatus></ExpUseFormStatus>
            {isPending && <div className="loader"></div>}
            {state && <p style={{color:"green"}}>{state}</p>}
        </form>
```
效果展示![请添加图片描述](https://img-blog.csdnimg.cn/direct/18a36fddcdf54faea9b8f6e400c2d002.gif)

### 乐观更新useOptimistic 
有时候有些结果99%会成功，我们希望让用户尽快看到页面展示效果。可以采用该钩子。
子组件

```typescript
import {useOptimistic} from "react";
interface Props{
    currentName:string
    onUpdateName:(name:string)=>void
}
function updateName(name:string):Promise<string>{
    return new Promise((r)=>{
        setTimeout(()=>{
            if (!name)r("name不能为空")
            r(name)
        },2000)
    })
}
export default({currentName, onUpdateName}:Props)=> {
    const [optimisticName, setOptimisticName] = useOptimistic(currentName);

    const submitAction = async (formData: { get: (arg0: string) => any; }) => {
        const newName = formData.get("name");
        setOptimisticName(newName);
        const updatedName = await updateName(newName);
        onUpdateName(updatedName);
    };

    return (
        <form action={submitAction}>
            <p>Your name is（currentName）:<span style={{color:"green"}}>{currentName}</span> </p>
            <p>Your name is（optimisticName）: {optimisticName}</p>
            <p>
                <label>Change Name:</label>

                <input
                    type="text"
                    name="name"
                    disabled={currentName !== optimisticName}
                />
            </p>
            <button type="submit">提交</button>
        </form>
    );
}
```
父组件

```typescript
export default ()=>{
    const [currentName, setCurrentName] = useState("fancy")

    return (<>
            <ExpUseOptimistic currentName={currentName} onUpdateName={(name)=>setCurrentName(name)}></ExpUseOptimistic>
    </>
    )
}
```
结果展示![请添加图片描述](https://img-blog.csdnimg.cn/direct/6f7b1ca36ea44c208b716e67d871d4ff.gif)
## 其他
### use
use Hook让我们可以读取Context和Promise的值并且**可以在循环和条件语句（如 if）中调用 use**。但需要注意的是，调用 use 的函数仍然必须是一个组件或 Hook。

```typescript
import { use } from 'react';

function MessageComponent({ messagePromise }) {
  const message = use(messagePromise);
  const theme = use(ThemeContext);
  // ...
```
### ref
以后不需要forward ref做转发了

```typescript
function MyInput({placeholder, ref}) {
  return <input placeholder={placeholder} ref={ref} />
}

<MyInput ref={ref} />
```
ref的清理函数，当组件卸载时，React 将调用从回调返回的 ref 清理函数。这适用于 DOM 引用、类组件引用和 useImperativeHandle .

```typescript
<input
  ref={(ref) => {
    // ref created

    // NEW: return a cleanup function to reset
    // the ref when element is removed from DOM.
    return () => {
      // ref cleanup
    };
  }}
/>
```

### Context 不再需要`<Context.Provider>`

```typescript
const ThemeContext = createContext('');

function App({children}) {
  return (
    <ThemeContext value="dark">
      {children}
    </ThemeContext>
  );  
}
```

## 支持在组件中编写Meta标签
当 React 渲染这个组件时，它会看到 `<title> <link>` 和 `<meta> `标签，并自动将它们提升到文档 `<head> `部分。通过本机支持这些元数据标记，我们能够确保它们适用于仅限客户端的应用、流式处理 SSR 和服务器组件。
```typescript
function BlogPost({post}) {
  return (
    <article>
      <h1>{post.title}</h1>
      <title>{post.title}</title>
      <meta name="author" content="Josh" />
      <link rel="author" href="https://twitter.com/joshcstory/" />
      <meta name="keywords" content={post.keywords} />
      <p>
        Eee equals em-see-squared...
      </p>
    </article>
  );
}
```

### 支持预加载资源
[文档](https://zh-hans.react.dev/reference/react-dom/preload)
在初始文档加载和客户端更新期间，告知浏览器可能需要尽早加载的资源可能会对页面性能产生巨大影响。React 19 包含许多用于加载和预加载浏览器资源的新 API，以便尽可能轻松地构建出色的体验，而不会因资源加载效率低下而受到阻碍。

```typescript
import { prefetchDNS, preconnect, preload, preinit } from 'react-dom'
function MyComponent() {
  preinit('https://.../path/to/some/script.js', {as: 'script' }) // loads and executes this script eagerly
  preload('https://.../path/to/font.woff', { as: 'font' }) // preloads this font
  preload('https://.../path/to/stylesheet.css', { as: 'style' }) // preloads this stylesheet
  prefetchDNS('https://...') // when you may not actually request anything from this host
  preload("https://example.com/font.woff2", {as: "font"});//加载字体
    preload("https://example.com/style.css", {as: "style"});//预加载css文件
  preconnect('https://...') // when you will request something but aren't sure what
  
}
```
这些会被转化为以下形式

```typescript
  <head>
    <!-- links/scripts are prioritized by their utility to early loading, not call order -->
    <link rel="prefetch-dns" href="https://...">
    <link rel="preconnect" href="https://...">
    <link rel="preload" as="font" href="https://.../path/to/font.woff">
    <link rel="preload" as="style" href="https://.../path/to/stylesheet.css">
    <script async="" src="https://.../path/to/some/script.js"></script>
  </head>
```
**我们可以在渲染时和事件处理中进行预加载。**
如果知道组件或其子组件将使用特定资源，那么在渲染组件时调用 preload。
在渲染时示例

```typescript
import { preload } from 'react-dom';

function AppRoot() {
  preload("https://example.com/font.woff2", {as: "font"});
  // ……
}
```
时间中

```typescript
import { preload } from 'react-dom';

function CallToAction() {
  const onClick = () => {
    preload("https://example.com/wizardStyles.css", {as: "style"});
    startWizard();
  }
  return (
    <button onClick={onClick}>Start Wizard</button>
  );
}
```


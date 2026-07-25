# TypeScript

> 依据 [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) 与 [TSConfig Reference](https://www.typescriptlang.org/tsconfig/) 整理。TypeScript 是 JavaScript 的静态类型检查器：在代码运行前发现类型错误，编译后类型会被擦除，最终仍运行 JavaScript。

## 1. 基本认知

- TypeScript 是 JavaScript 的超集，合法 JavaScript 通常可以逐步迁移到 TypeScript。
- 类型系统用于描述值、函数和模块之间的约束，提升重构、补全与 API 设计体验；它**不提供运行时校验**。
- 类型检查通过并不等于运行时数据安全。网络响应、表单、`localStorage`、第三方脚本等不可信数据仍要进行运行时验证。
- 优先让 TypeScript 推导类型；只有在推导不足、公共 API 或复杂泛型边界处显式标注。不要为每个局部变量重复写类型。

```ts
const user = { id: 1, name: 'Ada' } // 推导为 { id: number; name: string }

function greet(name: string): string {
  return `Hello, ${name}`
}
```

## 2. 常用类型

| 类型 | 用途 | 注意点 |
| --- | --- | --- |
| `string`、`number`、`boolean`、`bigint`、`symbol` | 基础值 | 使用小写原始类型，而非 `String`、`Number` 等包装对象类型 |
| `null`、`undefined` | 空值 | 开启 `strictNullChecks` 后必须显式处理 |
| `unknown` | 类型未知的安全顶层类型 | 使用前必须收窄 |
| `any` | 关闭该值相关的类型检查 | 会污染推导，应限制在迁移边界 |
| `never` | 不可能出现的值/永不返回 | 常用于穷尽检查和抛错函数 |
| `void` | 函数无有意义返回值 | 不等同于 `undefined` 的所有使用场景 |

### 对象、数组与元组

```ts
type User = {
  readonly id: string
  name: string
  email?: string
}

const tags: string[] = ['ts', 'vue']
const point: [number, number] = [120, 30]
```

- 可选属性 `email?: string` 在严格空值检查下读取结果可能为 `string | undefined`，需要处理缺失情况。
- `readonly` 是编译期约束，不能阻止运行时对象被其他 JavaScript 代码修改；数组可使用 `readonly T[]` 或 `ReadonlyArray<T>`。
- 元组描述长度和每个位置类型固定的数组，适合坐标、固定返回值等；不要用元组代替语义清晰的对象。

### 联合、交叉与字面量类型

```ts
type Status = 'idle' | 'loading' | 'success' | 'error'
type Result = { data: string } | { error: Error }
type WithTimestamps<T> = T & { createdAt: Date; updatedAt: Date }
```

- 联合 `A | B` 表示值可以是其中任一种；使用前只能访问所有成员共有的属性，或先收窄。
- 交叉 `A & B` 表示同时满足多个类型。若属性类型不兼容，结果可能难以使用甚至成为 `never`。
- 字面量联合适合有限状态、事件名、配置项，优于宽泛的 `string`。

## 3. 类型收窄与控制流分析

TypeScript 会根据运行时检查缩小联合类型，这称为**收窄（narrowing）**。

```ts
function format(value: string | number | null) {
  if (value == null) return '-'
  return typeof value === 'string' ? value.trim() : value.toFixed(2)
}
```

常用方式：`typeof`、`instanceof`、`in`、判别字段比较、相等性检查和自定义类型守卫。

```ts
type ApiResult =
  | { kind: 'success'; data: string }
  | { kind: 'error'; message: string }

function render(result: ApiResult) {
  switch (result.kind) {
    case 'success': return result.data
    case 'error': return result.message
    default: return assertNever(result)
  }
}

function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`)
}
```

- 判别联合应使用稳定的共同字面量字段，如 `kind` 或 `type`，使状态分支可穷尽检查。
- 类型断言 `value as T` 是“告诉编译器我比你更确定”，不会转换或验证值；应优先写收窄逻辑。
- 非空断言 `value!` 同样不产生运行时检查。除非生命周期可被证明，否则应先处理 `null`/`undefined`。

## 4. 函数、接口与泛型

### 函数类型

```ts
type Mapper<T, R> = (value: T, index: number) => R

function map<T, R>(items: readonly T[], fn: Mapper<T, R>): R[] {
  return items.map(fn)
}
```

- 为公共函数参数、返回值和回调签名定义类型，能让调用端在编写时获得约束。
- 函数参数在 TypeScript 中通常可以省略实际不使用的尾部参数；回调兼容性应按实际 API 签名设计。
- 函数重载适合“输入形式不同、返回类型也不同”的少数场景；能用联合参数和单一实现表达时，优先避免过多重载。

### `type` 与 `interface`

- 两者都能描述对象形状。`interface` 适合可由声明合并扩展的对象契约，例如库的公开接口；`type` 可表达联合、交叉、条件类型、映射类型和原始类型别名。
- 业务代码中可按团队规范统一使用；不要把二者当作性能或运行时差异，它们都只存在于类型层。

### 泛型与约束

```ts
function getProperty<T, K extends keyof T>(object: T, key: K): T[K] {
  return object[key]
}

type ApiResponse<T> = {
  code: number
  data: T
  message: string
}
```

- 泛型让类型与输入建立关系，而不是简单把类型写成 `any`。`T`、`K` 等类型参数应有清晰含义。
- `extends` 在泛型中常用于约束，例如 `K extends keyof T` 说明键必须属于对象；也用于条件类型判断。
- 默认泛型参数能改善常见调用场景，但不应隐藏关键类型信息。

## 5. 类型体操的常用工具

```ts
type UserPreview = Pick<User, 'id' | 'name'>
type UserPatch = Partial<User>
type RequiredUser = Required<User>
type PublicUser = Omit<User, 'email'>
type UserMap = Record<string, User>
type Element = string[number] // string
type Item = typeof tags[number] // string
```

| 工具 | 含义 |
| --- | --- |
| `keyof T` | 得到对象键的联合类型 |
| `typeof value` | 在类型位置获取变量/函数的类型 |
| `T[K]` | 索引访问类型，取出属性类型 |
| `Partial<T>` / `Required<T>` / `Readonly<T>` | 批量改变属性可选性或只读性 |
| `Pick<T, K>` / `Omit<T, K>` | 选择或移除对象属性 |
| `Record<K, V>` | 构造键为 `K`、值为 `V` 的对象类型 |
| `Exclude<T, U>` / `Extract<T, U>` | 从联合中移除或提取成员 |
| `ReturnType<F>` / `Parameters<F>` | 获取函数返回值或参数元组 |

条件类型形式为 `T extends U ? X : Y`。当 `T` 是裸类型参数且为联合时会发生分配；使用 `[T] extends [U]` 可阻止这种分配。仅在确有抽象复用价值时使用复杂类型，过度类型体操会降低可读性和诊断质量。

## 6. 类、模块与声明文件

- 类支持 `public`、`protected`、`private`、`readonly` 等编译期访问控制；JavaScript 私有字段使用 `#field`，两者语义不同。
- ES Module 使用 `import`/`export`。模块解析行为受 `module`、`moduleResolution`、`package.json` 的 `exports` 及运行环境影响，不能只靠编辑器“不报错”判断发布包可用。
- `.d.ts` 用于描述没有 TypeScript 源码的 JavaScript 包或全局 API。应优先使用包自带类型或 `@types/*`，再考虑自己编写声明。
- `declare` 只声明类型层的存在，不会创建运行时实现。全局声明要谨慎，避免污染全局命名空间。

## 7. `tsconfig.json` 与工程实践

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noEmit": true,
    "isolatedModules": true
  },
  "include": ["src"]
}
```

常见配置原则：

- `strict: true` 启用一组严格检查，是新项目的推荐起点；存量项目可分阶段开启。
- `strictNullChecks` 让 `null`/`undefined` 成为需要处理的类型，能消除大量空值错误。
- `noUncheckedIndexedAccess` 让数组/索引签名读取包含 `undefined`，更接近运行时现实。
- `exactOptionalPropertyTypes` 区分“属性不存在”与“属性存在但值为 `undefined`”，适合严格的对象 API，但迁移时需评估影响。
- `noEmit: true` 适用于由 Vite、Babel、SWC 等负责转译的项目，`tsc` 只做类型检查；若由 `tsc` 产出 JS，则根据运行环境配置 `target`、`module` 与输出目录。
- `skipLibCheck` 可减少依赖声明文件检查时间，但会掩盖依赖类型问题；按构建速度和类型可靠性取舍。

## 8. React/Vue 使用提示

- React 组件 Props 使用 `type` 或 `interface` 描述；避免使用 `React.FC` 作为默认习惯，直接为函数参数标注通常更清晰。
- Vue `<script setup lang="ts">` 可使用类型参数声明 `defineProps`、`defineEmits`；Props 的运行时校验与类型声明要按项目需求协作。
- API 响应类型不能替代运行时数据解析。可通过 Zod、Valibot 等运行时 schema 库校验外部数据，并从 schema 推导 TypeScript 类型。

## 9. 高级类型操作

### 条件类型与 `infer`

```ts
type AwaitedValue<T> = T extends Promise<infer U> ? AwaitedValue<U> : T
type FunctionResult<T> = T extends (...args: any[]) => infer R ? R : never
```

条件类型 `T extends U ? X : Y` 根据可赋值关系选择分支。`infer` 只能在条件类型的 extends 分支中声明待推导类型变量，常用于提取函数参数、返回值、Promise 内部值和数组元素。

当检查对象是裸类型参数时，联合类型会被逐项分配：

```ts
type ToArray<T> = T extends unknown ? T[] : never
type A = ToArray<string | number> // string[] | number[]

type ToArrayNonDist<T> = [T] extends [unknown] ? T[] : never
type B = ToArrayNonDist<string | number> // (string | number)[]
```

### 映射类型与键重映射

```ts
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}

type Mutable<T> = { -readonly [K in keyof T]-?: T[K] }
```

映射类型遍历键并改变属性类型、可选性和只读性。`as` 可以重新映射或过滤键；模板字面量类型适合由事件名、属性名生成有限 API。

### `satisfies`、`as const` 与 const 泛型

```ts
const routes = {
  home: '/',
  users: '/users',
} as const satisfies Record<string, `/${string}`>
```

- 类型注解可能把具体字面量拓宽为目标类型；
- 类型断言会跳过部分检查；
- `satisfies` 检查表达式符合目标，同时保留表达式自身的精确推导；
- `as const` 把字面量递归推导为只读的精确字面量类型；
- const 类型参数能让泛型 API 更容易保留调用处字面量信息。

### 递归类型与复杂度

```ts
type DeepReadonly<T> = T extends (...args: any[]) => any
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T
```

递归条件类型可表达深层变换，但要处理函数、数组、Map 等特殊类型，并注意编译器实例化深度和编辑器性能。类型代码也需要可读性、测试和边界。

## 10. 类型兼容性与方差

TypeScript 主要采用结构类型系统：只要结构兼容，就可赋值，不要求显式继承。

```ts
type Point = { x: number; y: number }
const value = { x: 1, y: 2, label: 'A' }
const point: Point = value // 结构兼容
```

对象字面量直接赋值会执行额外属性检查，用于发现拼写错误；先赋给变量后规则不同，这不是“类型不一致”，而是新鲜字面量检查。

- 协变：可以用更具体的输出代替更宽泛输出；
- 逆变：函数参数方向与输出相反；
- 不变：双向都不能安全替换；
- TypeScript 的函数方法和配置选项存在出于兼容性的特殊规则，`strictFunctionTypes` 能加强检查。

数组协变与可变写入可能产生不健全情形，公共只读输入优先使用 `readonly T[]`。

## 11. 模块解析、库发布与大型项目

### `module` 与 `moduleResolution`

- Bundler 项目通常使用 `module: ESNext` 和 `moduleResolution: bundler`；
- 直接由 Node 执行的 ESM/CJS 项目使用匹配当前 Node 语义的 `NodeNext`/`Node16` 配置；
- `paths` 只改变 TypeScript 查找，不一定改写运行时代码，Bundler/Node/test runner 必须配置相同别名；
- `package.json` 的 `type`、`exports`、`imports` 和文件扩展名共同决定 Node 模块解析。

### 声明文件与模块扩展

```ts
declare module 'express-session' {
  interface SessionData { userId: string }
}
```

Declaration Merging 可扩展已有接口，但必须放在正确模块作用域并确保文件被 tsconfig 包含。库发布应生成 `.d.ts`、设置 `exports.types`/`types`，并从打包后的消费者视角测试解析。

### Project References

大型 Monorepo 可通过 `composite`、`references` 和 `tsc -b` 建立项目依赖图，实现增量构建和包边界。每个项目明确 `rootDir/outDir/declaration`，不要让应用绕过包入口导入其他包源码。

### 类型测试

库可使用 `@ts-expect-error`、类型相等工具、tsd 或 Are the Types Wrong 等测试公开类型。`@ts-ignore` 会在错误消失后保持沉默，通常优先 `@ts-expect-error`。

## 12. 运行时边界与工程设计

- 将外部数据视为 `unknown`，用 Zod/Valibot/JSON Schema 解析后再进入领域层；
- 品牌类型可区分结构相同但语义不同的 ID，但仍需运行时构造/验证；
- 避免把数据库 Entity、API DTO 和 UI Form 类型强行复用为一个模型；
- 公共泛型应从调用参数推导，避免要求用户手工填写大量类型参数；
- 类型错误信息也是 API 体验，复杂类型应提供中间别名和文档；
- `any` 集中在明确适配边界，内部尽快转为 `unknown` 或具体类型。

## 13. 面试常考题

### 1. `any`、`unknown` 和 `never` 有什么区别？

`any` 会跳过类型检查，可被赋给/接收为几乎任意类型；`unknown` 可接收任意值，但使用前必须收窄，因此更安全；`never` 表示不可能出现的值或永不正常返回的函数，常用于判别联合穷尽检查。

### 2. `interface` 和 `type` 如何选择？

对象形状两者都能表示。需要声明合并或面向库的可扩展对象契约时使用 `interface`；需要联合、交叉、条件或映射类型时使用 `type`。业务代码最重要的是保持团队一致与类型表达清晰。

### 3. 为什么类型断言不能做类型转换？

`as` 在编译后会被完全擦除，只影响编译器如何看待该值，不会修改运行时数据或检查其结构。外部数据需要使用类型守卫或 schema 校验。

### 4. `void` 和 `never` 的区别？

`void` 表示函数没有有意义的返回值，函数仍可正常结束；`never` 表示函数永远不会正常结束，例如总会抛异常或无限循环，也表示不可能存在的类型成员。

### 5. 什么是联合类型收窄？

当变量为 `A | B` 时，TypeScript 根据 `typeof`、`in`、`instanceof`、判别字段等运行时分支，将某个分支中的类型缩小到可安全访问的成员。判别联合配合 `never` 能确保新增状态时漏处理分支会报错。

### 6. 泛型的价值是什么？

泛型让函数或类型在复用时保留输入和输出之间的类型关系。例如 `Array<T>` 的 `map` 能根据回调推导新数组元素类型；若使用 `any`，这种关系和调用端检查都会丢失。

### 7. `keyof`、`typeof` 和 `T[K]` 分别做什么？

`keyof T` 获取对象键的联合；`typeof value` 在类型位置取得变量类型；`T[K]` 通过键索引得到属性类型。三者组合可构造安全的通用对象访问函数。

### 8. 为什么开启 `strictNullChecks` 很重要？

它使 `null` 与 `undefined` 不再自动兼容所有类型，强迫代码在访问前处理空值。虽然初期会增加报错，但能在编译期暴露常见的空引用问题。

### 9. TypeScript 能保证运行时安全吗？

不能。类型会被擦除，网络响应和用户输入可能与声明不同。TypeScript 保证的是已检查代码的静态约束；边界处必须做运行时验证、错误处理和权限校验。

### 10. `satisfies`、类型注解和类型断言有什么区别？

注解把变量约束为指定类型并可能拓宽推导；断言告诉编译器按某类型看待值，可能绕过检查；`satisfies` 验证兼容性同时保留表达式自身的具体类型，适合配置对象。

### 11. 什么是分布式条件类型？

当 `T extends U` 中 T 是裸类型参数且传入联合时，条件会对每个联合成员分别执行再合并。用 `[T] extends [U]` 包裹可阻止分布。

### 12. 什么是结构类型系统？

兼容性由成员结构决定，而非类型名称或显式继承。它符合 JavaScript 鸭子类型习惯，但也意味着语义不同、结构相同的值可能互相赋值，可用品牌类型增强区分。

### 13. `moduleResolution: bundler` 和 `NodeNext` 如何选择？

源码由 Vite/Webpack 等 Bundler 解析时使用 bundler；产物直接遵循 Node ESM/CJS 规则运行时使用 NodeNext/Node16。配置必须与真实运行环境一致。

### 14. `@ts-ignore` 和 `@ts-expect-error` 区别？

前者始终忽略下一行错误；后者要求下一行确实存在错误，错误消失时会报“未使用指令”，更适合临时兼容和类型测试。

<!-- obsidian-nav:start -->
---
## 关联导航

- 所属目录：[[前端/TypeScript/00. 目录|TypeScript目录]]
- 领域入口：[[前端/00. 前端知识地图|前端知识地图]]
- 总导航：[[00. 知识库导航|知识库导航]]
<!-- obsidian-nav:end -->

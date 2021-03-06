---
---
# ZyCore核心语言

## 方向
- Zylang期望具有一个非常干净且完备的强类型系统。
- Zylang对程序的模块化管理引入基本且必要的概念。Zylang倾向使用去中心化的依赖管理机制，同时提供一些本地缓存和打包机制。

## 包管理机制
包分为核心库、标准库、私有库、共有库四种。

### 包的引用
受到deno的启发，除了核心库和标准库外，其他库使用非中心化的https服务拉取。

包地址的格式为：```https://<package-domain>/<package-name>@<version>```

如：```https://pkg.zylang.org/tour@0.0.1```

引用时为了简化，可以在包配置文件```package.json```中指定别名，如：
```
{
  "package-alias": {
    "tour": "https://pkg.zylang.org/tour@0.0.1"
  }
}
```

### 版本号的语义
版本号推荐使用三位版本号```X.Y.Z```，早起版本会支持更多为的版本号但暂时不会承诺长期支持。版本语义建议如下：

X：主版本，主版本间可以互补兼容。

Y：次要版本，代表有功能新增，但是保持向后兼容。例如，1.2.Z版本的功能必须可以被1.3.Z版本兼容替代，反之不然。

Z：小版本，不涉及明显的功能变更，通常为bug修复或内部逻辑优化。

特例：如果X为0，则建议以Y为主版本，以Z为次要兼小版本。

### 范围版本号
版本号可以使用```~```链接两个版本表示左闭右开的范围。如```1~2```表示所有```1.Y.Z```版本

### 版本号锁定
每次构建时，会对当前使用的版本号进行锁定，并将依赖的版本记入```dependency-version.json```中，如果下次构件时因为新依赖关系变更造成必要的依赖版本升级，则会要求确认。

### 版本冲突
在多个版本要求不能调和时，原则上允许同一个包的多个版本同时被引用。但是如果包间存在冲突，则需要声明冲突的版本号，如在```package.json```中做如下声明：
```
{
  "id": "https://pkg.zylang.org/tour@1.2.3",
  "conflict-with": [
    "https://pkg.zylang.org/tour@0.0.0~1.2.3"
  ]
}
```
如果某个包只允许存在一个版本被引用，推荐的方式是后面包声明对之前版本的冲突。因为要保证两个版本号的一致性，这里容易疏漏，所以我们再提供一个标识当前版本的特殊记法```current```。另外不同的包之间也可能存在冲突，所以冲突配置项是一个列表。这里再引入一个特殊记法```max```来表示无穷大版本。再举个例子：

```
{
  "id": "https://pkg.zylang.org/tour@1.2.3",
  "conflict-with": [
    "https://pkg.zylang.org/tour@0.0.0~current",
    "https://pkg.zylang.org/xtour@0.0.0~max"
  ]
}
```

### 关于接口
在有些场景下，有的包可能定义了一个自身依赖的接口但是并未提供实现。有些其他语言中并不提供相关的静态检查机制，实现包加载后再进行运行时检查或直接调用。Zylang允许包开发者显式声明这些依赖、通过独立的包进行定义、以及通过版本号机制表达其兼容性。
TODO：详细设计。

## 程序结构
注意：因为要考虑有GC和无GC的情况分别如何支持，此处仅为草稿，短期内变动的可能性较大。

### 模块
模块是包下层的文件结构，以文件路径标识，可以通过import/export机制互通。

当引用包时，等同于引用了index模块。

模块内包含变量声明、类型声明、函数声明。

### 模块变量声明
```
a : uint8 = 100u;
```
- 所有的变量声明都需要显式指定类型，虽然通过类型推导机制可以提供很多遍历，但是在zylang-core中我们不做支持，在语言族的部分上层再做支持。
- 所有的数值型字面常量都是有理数（rational），避免精度损失，如果要表达其他类型需要显示指定后缀。
- 支持部分隐式类型转换及类型转换实现的扩展。
- 行尾分号不支持省略。

### 类型声明
```
class Pixel : Location2D {
  wrap color : Color;
  member x : uint8;
  member y : uint8;
  function print (string@{maxLength:10} prefix) : void {
    zyl.print(x, y, color);
  }
}
```
- 声明接口实现：类名后跟```: <接口列表>```，接口列表使用```,```分隔。
- 继承：使用```wrap```关键字声明。可以多继承，如果多个继承有冲突声明，则编译失败。可以使用wrap partial允许被覆盖，覆盖优先级以声明顺序为准。可以使用wrap specific显示列出集成的内容。
- 属性：使用```member```关键字声明。使用```export```关键字对外暴露和允许被继承（暂不提供```protected```级别的访问控制）。
- 方法：使用```function```关键字声明。使用```export```关键字对外暴露和允许被继承。

### 函数声明
```
function print (string@{maxLength:100} content) : void {
    zyl.print("Hello", content);
  }
```
- 使用```function```关键字声明。

### 导入导出
- 使用```export``` / ```export default```进行变量、类、函数导出。
- 使用```import <identifier> from <module>[.<identifier>]```导入。

TODO 详细说明.

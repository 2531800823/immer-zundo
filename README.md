# immer-zundo

一个基于 immer 和 zustand 的状态管理插件，为您的 React 应用提供简单而强大的撤销/重做功能。

## 核心特点

本插件基于 Immer 的 Patches 系统实现状态追踪，区别于传统的全量状态存储方案：

- 🔍 **高效的差异记录**: 只记录状态变更的 diff 信息，而不是存储完整状态副本
- 📦 **更小的内存占用**: 通过 Patches 系统精确追踪修改，显著减少内存使用
- ⚡ **快速的状态恢复**: 基于 diff 补丁的快速应用和回滚
- 🎯 **精确的状态追踪**: 准确记录每一个细微的状态变化

## 致谢

本项目受到以下优秀开源项目的启发：

- [Zustand](https://github.com/pmndrs/zustand) - 简单、快速且可扩展的状态管理解决方案
- [Immer](https://github.com/immerjs/immer) - 不可变状态管理库
- [Zundo](https://github.com/charkour/zundo) - Zustand 的撤销/重做中间件

## 特性

- 🚀 简单易用 - 无缝集成到现有的 zustand store
- 💪 类型安全 - 完整的 TypeScript 支持
- 🔄 撤销/重做功能 - 轻松管理状态历史
- ⚡️ 高性能 - 基于 immer 的高效状态更新
- 🎯 精确控制 - 可以针对特定状态变更进行撤销/重做

## 安装

```bash
npm install immer-zundo
```

## 基础使用

```typescript
import { create } from 'zustand'
import { withZundo } from 'immer-zundo'

interface State {
  count: number
}

const useStore = create(
  withZundo<State>((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
  }))
)

// 在组件中使用
function Counter() {
  const { count, increment, decrement } = useStore()
  const { undo, redo } = useStore.zundo()

  return (
    <div>
      <button onClick={undo}>撤销</button>
      <button onClick={redo}>重做</button>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
      <span>Count: {count}</span>
    </div>
  )
}
```

## API

### withZundo

主要的插件函数，用于增强 zustand store。

```typescript
withZundo<T>(config: StoreConfig<T>)
```

### useStore.zundo()

提供撤销/重做功能的 hook。

返回值：
- `undo()`: 撤销上一次操作
- `redo()`: 重做上一次操作
- `history`: 当前历史记录状态

## 开发计划

未来我们计划添加以下功能：

1. 📋 更丰富的测试用例
   - 添加更多边界情况的测试
   - 提供更完整的集成测试
   - 添加性能测试基准

2. ⚙️ 自定义配置项支持
   - 历史记录长度限制
   - 状态过滤器配置
   - 自定义序列化选项
   - 状态合并策略配置

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT

// 获取事件名称
export type Names<T> = keyof T;
// 获取回调函数类型
export type CallBack<T> = T[Names<T>];
/**
 * 将传入的泛型转换成为事件列表
 * { change: (p: number) => void }
 * 转换为=>
 * { change: (:number) => void)[] }
 */
export type EventCollect<T> = {
  [key in Names<T>]: { callback: CallBack<T> }[];
};
// Parameters的自定义版本
export type CustomParameters<T> = T extends (...args: infer P) => any
  ? P
  : never;

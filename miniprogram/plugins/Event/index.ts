import { Names, EventCollect, CustomParameters } from './type';

/** 事件处理(发布订阅模式)
 * 实例化对象时，事件名称以及事件处理回调函数类型可以以键值对方式传入泛型
 * 如有传入泛型，调用on、once、emit函数时给予类型提示
 * 例如：
 *
 * type MyHandler = { change: (p: number) => void }
 * new Event<MyHandler>()
 *
 * @function on: 注册事件
 * @function once: 注册事件，触发一次后自动移除
 * @function emit: 提交事件
 * @function remove: 移除事件
 */
class Event<T = {}> {
  protected events = {} as EventCollect<T>;

  protected onceEvents = {} as EventCollect<T>;
  /** 注册事件
   * @param {string} name: 事件名称
   * @param {Function} cb: 回调函数
   */
  on<U extends Names<T>>(name: U, cb: T[U]) {
    if (!this.events[name]) this.events[name] = [];
    this.events[name].push({ callback: cb });
  }

  /**
   * 事件注册(一次性)
   */
  once<U extends Names<T>>(name: U, cb: T[U]) {
    if (!this.onceEvents[name]) this.onceEvents[name] = [];
    this.onceEvents[name].push({ callback: cb });
  }

  /**
   * 事件触发器
   * @param {string} name: 触发的事件名称
   */
  emit<U extends Names<T>>(name: U, ...prop: CustomParameters<T[U]>) {
    for (const list of [this.events[name], this.onceEvents[name]]) {
      list?.forEach((i) => {
        try {
          typeof i.callback === 'function' && i.callback(...prop);
        } catch (e) {
          console.error(`事件处理出错${e}`);
        }
      });
    }

    // 一次性事件调用后清除
    this.onceEvents[name] = [];
  }

  /** 移除事件
   * @param {string} name: 事件名称
   * @param {Function} cb: 回调函数
   *
   */
  remove<U extends Names<T>>(name: U, cb?: T[U]) {
    if (!name || !cb) return;

    for (let list of [this.events[name], this.onceEvents[name]]) {
      if (!list) break;
      const idx = list.findIndex(({ callback }) => callback === cb);
      if (idx !== -1) {
        list.splice(idx, 1);
      }
    }
  }
}
export { Event };
export default new Event();

import { EvenetName, EventCb, Events } from './type';

/** 事件处理(发布订阅模式)
 * on: 注册事件
 * once: 注册事件，触发一次后自动移除
 * emit: 提交事件
 * remove: 移除事件
 */
class Event {
  protected events: Events = {
    chr: [],
    connect: [],
    device: [],
  };

  protected onceEvents: Events = {
    chr: [],
    connect: [],
    device: [],
  };

  /** 注册事件
   * @param {string} name: 事件名称
   * @param {Function} cb: 回调函数
   */
  on(name: EvenetName, cb: EventCb) {
    if (!this.events[name]) this.events[name] = [];
    this.events[name].push({ callback: cb });
  }

  /**
   * 事件注册(一次性)
   */
  once(name: EvenetName, cb: EventCb) {
    if (!this.onceEvents[name]) this.onceEvents[name] = [];
    this.onceEvents[name].push({ callback: cb });
  }

  /**
   * 事件触发器
   * @param {string} name: 触发的事件名称
   */
  emit<T>(name: EvenetName, prop?: T, ...p: any[]) {
    for (const list of [
      this.events[name],
      this.onceEvents[name],
    ]) {
      list.forEach(({ callback }) => {
        try {
          callback<T>(prop, ...p);
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
  remove(name: EvenetName, cb?: EventCb) {
    if (!name || !cb) return;

    for (let list of [
      this.events[name],
      this.onceEvents[name],
    ]) {
      const idx = list.findIndex(
        ({ callback }) => callback === cb
      );
      if (idx !== -1) {
        list.splice(idx, 1);
      }
    }
  }
}

export { Event };
export default new Event();

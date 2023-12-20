/* 回调函数类型 */
export type EvenetName = keyof Events;

export type EventCb = <T>(arg0?: T, ...arg1: any[]) => void;

/* 事件列表 */
export interface Events {
  device: { callback: EventCb }[]; // 搜索设备事件
  connect: { callback: EventCb }[]; // 连接事件变化
  chr: { callback: EventCb }[]; // 特征值变化
}

/* 蓝牙设备信息 */
export type BlueToothDevice = {
  mac?: string;
} & WechatMiniprogram.BlueToothDevice;

/* 接收的广播数据 */
export type NotifyValue = {
  result: boolean;
  value: string;
  command?: string;
  no?: string | number; // 流水号
  errMsg?: string;
};

/* 过滤设置 */
export type Filter = {
  [key: string]: {
    properties: keyof WechatMiniprogram.BLECharacteristicProperties;
    uuid: string;
  };
};
// type ValueOf<T> = T[keyof T];

// 事件处理
export type Events = {
  device: (p: WechatMiniprogram.BlueToothDevice) => void; // 蓝牙设备搜索
  connect: (
    p: WechatMiniprogram.OnBLEConnectionStateChangeCallbackResult
  ) => void; //蓝牙连接状态
  notify: (
    p: WechatMiniprogram.OnBLECharacteristicValueChangeCallbackResult
  ) => void; // notify 特征值变化
};

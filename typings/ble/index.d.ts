declare namespace BLE {
  /* 蓝牙设备信息 */
  type BlueToothDevices = WechatMiniprogram.BlueToothDevice[];

  /* 接收的广播数据 */
  type NotifyValue = {
    result: boolean;
    value: string;
    command?: string;
    errMsg?: string;
  };

  /* 事件处理 */
  type Events = {
    device: (p: BlueToothDevices) => void; // 蓝牙设备搜索
    service: (p: WechatMiniprogram.BLEService[]) => void; // BLE服务获取
    chr: (p: WechatMiniprogram.BLECharacteristic[]) => void; // BLE某个服务下的所有特征值
    connected: (p: WechatMiniprogram.BluetoothError) => void; //蓝牙连接状态
    disConnected: (p: WechatMiniprogram.BluetoothError) => void; //蓝牙断开连接
    notify: (
      type: "notify" | "error",
      message: { text?: string; hex?: string; type?: string },
      p?: WechatMiniprogram.OnBLECharacteristicValueChangeCallbackResult
    ) => void; // notify 特征值变化
    error<T = WechatMiniprogram.BluetoothError>(p?: T): void;
  };

  // 传递给middleware的上下文类型
  type Context = {
    type?: "HEX" | "TEXT"; // 写入内容格式类型
    text?: string; // 明文内容
    hex?: string; // 十六进制内容
    ab?: ArrayBuffer; // arraybuffer 数据
    deviceId?: WechatMiniprogram.BlueToothDevice["deviceId"];
    serviceId?: WechatMiniprogram.BLEService["uuid"];
    characteristicId?: WechatMiniprogram.BLECharacteristic["uuid"];
  };
}

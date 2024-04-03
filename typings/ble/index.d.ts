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
      p: WechatMiniprogram.OnBLECharacteristicValueChangeCallbackResult
    ) => void; // notify 特征值变化
  };
}

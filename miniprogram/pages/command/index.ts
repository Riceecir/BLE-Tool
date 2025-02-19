import ble from '~/plugins/BLE/index';
import dayjs from 'dayjs/index';

// pages/comand/index.ts
Page<
  {
    properties: (keyof WechatMiniprogram.BLECharacteristicProperties)[];
    types: ['TEXT', 'HEX'];
    typeIdx: number;
    text: string;
    message: {
      text: string;
      date: string;
      type: 'write' | 'notify' | 'error';
    }[];
  },
  {
    onInput(e: WechatMiniprogram.Input): void;
    onChange(e: WechatMiniprogram.PickerChange): void;
    onDisconnected(): void;
    onNotify: BLE.Events['notify'];
    addRecord(type: 'write' | 'notify' | 'error', text: string): void;
    listen(): void;
    write(): void;
    read(): void;
  }
>({
  /**
   * 页面的初始数据
   */
  data: {
    properties: [],
    types: ['TEXT', 'HEX'],
    typeIdx: 0,
    text: '',
    message: [],
  },

  // 读取
  read() {
    if (!this.data.properties.includes('read')) {
      this.addRecord('error', '该设备不支持读取');
      return;
    }
    ble.read();
  },

  // 写入
  write() {
    if (!this.data.text) {
      return this.addRecord('error', '请输入内容');
    }
    if (!this.data.properties.includes('write')) {
      return this.addRecord('error', '该设备不支持写入');
    }
    this.addRecord('write', this.data.text);
    ble
      .write({
        text: this.data.text,
        type: this.data.types[this.data.typeIdx],
      })
      .finally(() => {
        this.setData({ text: '' });
      });
  },

  // 监听广播数据等事件
  listen() {
    ble.once('disConnected', this.onDisconnected);
    ble.on('notify', this.onNotify);
    ble.notify();
  },

  // 蓝牙断开
  onDisconnected() {
    wx.showModal({
      content: '蓝牙连接已断开',
      showCancel: false,
    });
  },

  // 添加记录
  addRecord(type, text) {
    this.setData({
      message: [
        { type, date: dayjs().format('YYYY-MM-DD HH:mm:ss'), text },
        ...this.data.message,
      ],
    });
  },

  onInput(e) {
    this.setData({ text: e.detail.value });
  },

  //
  onChange(e) {
    console.log(e);
    this.setData({
      typeIdx: +e.detail.value,
    });
  },

  // notify事件处理函数
  onNotify(type, message) {
    this.addRecord(type, message.text || '');
    message.hex && this.addRecord(type, `HEX: ${message.hex}`);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(e) {
    const properties = ble.getConnection().properties || [];
    this.setData({ properties });
    this.listen();

    /* if (wx.getAccountInfoSync().miniProgram.envVersion !== 'release') {
      this.addRecord('notify', '==== 非正式版测试 start ====');
      this.addRecord('write', '写入');
      this.addRecord('notify', '广播');
      this.addRecord('notify', 'HEX: 0F FF 00 00 00 00 0E');
      this.addRecord('notify', 'HEX: 0F FF 00 00 00 00 0E');
      this.addRecord('notify', 'HEX: 0F FF 00 00 00 00 0E');
      this.addRecord('error', '错误');
      this.addRecord('notify', '==== 非正式版测试 end ====');
    } */
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    ble.remove('notify', this.onNotify);
    ble.remove('disConnected', this.onDisconnected);
  },
});

import ble from '~/plugins/BLE/index';

type List = {
  [key: string]: {
    uuid: string;
    properties: keyof WechatMiniprogram.BLECharacteristicProperties;
  }[];
};

// pages/select/index.ts
Page<
  {
    list: List;
  },
  {
    query: (deviceId: string) => void;
  }
>({
  /**
   * 页面的初始数据
   */
  data: {
    list: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(e: { deviceId: string; name: string }) {
    this.query(e.deviceId);
  },

  // 查询 service 和 chr
  async query(deviceId) {
    const list: List = {};
    try {
      const services = await ble.getServices(deviceId);

      services.forEach(({ uuid }) => {
        if (!list[uuid]) list[uuid] = [];

        ble.getChrs(uuid).then((chrs) => {
          chrs.forEach((chr) => {
            for (let i in chr.properties) {
              // @ts-ignore
              if (chr.properties[i])
                list[uuid].push({
                  uuid: chr.uuid,
                  properties:
                    i as keyof WechatMiniprogram.BLECharacteristicProperties,
                });
            }

            this.setData({ list });
          });
        });
      });
    } catch (e) {}
  },
});

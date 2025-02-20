import ble from "~/plugins/BLE/index";
import Toast from "../../miniprogram_npm/@vant/weapp/toast/toast";

type List = {
  [key: string]: {
    uuid: string;
    properties: (keyof WechatMiniprogram.BLECharacteristicProperties)[];
  }[];
};

// pages/select/index.ts
Page<
  {
    list: List;
  },
  {
    query: (deviceId: string) => void;
    to: (
      event: WechatMiniprogram.BaseEvent<
        {},
        {
          info: {
            serviceId: string;
            characteristicId: string;
            properties: (keyof WechatMiniprogram.BLECharacteristicProperties)[];
          };
        }
      >
    ) => void;
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
    wx.setNavigationBarTitle({
      title: e.name || "BLE Tool",
    });
    this.query(e.deviceId);
  },

  // 查询 service 和 chr
  async query(deviceId) {
    Toast.loading({
      message: "loading...",
      duration: 0,
    });
    const list: List = {};
    try {
      const services = await ble.getServices(deviceId);

      services.forEach(({ uuid }) => {
        if (!list[uuid]) list[uuid] = [];

        ble.getChrs(uuid).then((chrs) => {
          chrs.forEach((chr, idx) => {
            const properties: (keyof WechatMiniprogram.BLECharacteristicProperties)[] =
              [];

            Object.entries(chr.properties).forEach(([key, value]) => {
              // @ts-ignore
              if (value) properties.push(key);
            });

            list[uuid].push({
              ...chr,
              properties,
            });

            // 结束
            if (idx === chrs.length - 1) {
              this.setData({ list });
            }
          });
        });
      });
    } catch (e) {
    } finally {
      Toast.clear();
    }
  },

  // 跳转界面
  to(e) {
    const { serviceId, characteristicId, properties } =
      e.currentTarget.dataset.info;
    if (!serviceId || !characteristicId || !properties) return;

    ble.setChrs(characteristicId, properties);
    wx.navigateTo({
      url: `/pages/command/index`,
    });
  },
});

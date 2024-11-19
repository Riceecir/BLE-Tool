import ble from "~/plugins/BLE/index";

// pages/comand/index.ts
Page({
  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(e) {
    console.log(e);
    console.log(ble);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    console.log(111);
  },
});

// index.ts
Page({
  data: {},

  onShow() {
    this.openAnimate();
  },

  onHide() {
    this.clearAnimation("#icon");
  },

  /* 开启动画 */
  openAnimate() {
    this.animate(
      "#icon",
      [{ rotate: 0 }, { rotate: 360 }],
      5000,
      this.openAnimate
    );
  },

  /* 授权 */
  authorize(cb: () => void) {
    wx.getSetting({
      success: (res) => {
        console.log(res);
        if (res.authSetting["scope.bluetooth"]) {
          cb();
        } else {
          wx.authorize({
            scope: "scope.bluetooth",
            success: (res) => {
              console.log(res);
              cb();
            },
            fail: (err) => {
              console.log(err);
            },
          });
        }
      },
    });
  },

  toMain() {
    console.log("toMain");
    this.authorize(() => {
      wx.navigateTo({
        url: "/pages/devices/index",
      });
    });
  },
});

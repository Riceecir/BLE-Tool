// app.ts
App<IAppOption>({
  globalData: {
    platform: '',
  },
  onLaunch() {
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.platform = res.platform;
      },
    });
  },
});

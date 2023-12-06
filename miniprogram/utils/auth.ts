export const setToken = (value: string) => {
  wx.setStorageSync("token", value);
};

export const getToken = () => {
  return wx.getStorageSync("token");
};

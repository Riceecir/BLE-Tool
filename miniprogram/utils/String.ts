import TextEncoderLib from "./encoding/encoding";
// ArrayBuffer转16进度字符串示例
export const abTohex = (buffer: ArrayBuffer) => {
  var hexArr = Array.prototype.map.call(new Uint8Array(buffer), function (bit) {
    return ("00" + bit.toString(16)).slice(-2);
  });
  return hexArr.join("");
};

/* ArrayBuffer转字符串 */
export const abToStr = (buffer: ArrayBuffer) => {
  const decoder = new TextEncoderLib.TextDecoder();
  return decoder.decode(buffer);
  const view = new Uint8Array(buffer);
  return String.fromCharCode.apply(null, view as any);
};

/* 字符串转16进制unicode */
export const strToHex = (str: string): string[] => {
  if (!str || str.toString() === "") return [];

  const encoder = new TextEncoderLib.TextEncoder();
  const bytes = encoder.encode(str);
  return Array.from(bytes, (byte) =>
    (byte as any).toString(16).padStart(2, "0")
  );
};

/* 字符串转ArrayBuffer */
export const strToAb = (str: string): ArrayBuffer => {
  // 首先将字符串转为16进制
  let val: string = strToHex(str).join(",");
  // 将16进制转化为ArrayBuffer
  return hexToAb(val);
};

/* 十六进制转array buff */
export const hexToAb = (str: string): ArrayBuffer => {
  return new Uint8Array(
    (str.match(/[\da-f]{2}/gi) as any).map((h: any) => parseInt(h, 16))
  ).buffer;
};

/* 十六进制(unicode)转字符串 */
export const hexToStr = (hex: string | ArrayBuffer): string => {
  const decoder = new TextEncoderLib.TextDecoder();

  if (typeof hex === "string") return decoder.decode(hexToAb(hex));
  else if (hex instanceof ArrayBuffer) return decoder.decode(hex);

  return "";
};

/* ab 转 ascii */
export const abToAscii = (buffer: ArrayBuffer) => {
  var str = Array.prototype.map.call(new Uint8Array(buffer), function (bit) {
    return String.fromCharCode(bit);
  });
  return str.join("");
};

/* 字符串按长度分割 */
export const forLengthSplit = (str = "", len = 1): string[] => {
  const reg = new RegExp(`.{1,${Math.max(1, len)}}`, "g");

  return str.match(reg) || [];
};

/* 获取指定长度的随机字符串 */
export const getRandomString = (len: number): string => {
  len = len || 8;
  const $chars =
    "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678"; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
  const maxPos = $chars.length;
  let pwd = "";
  for (let i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
};

/* 补1位0 */
export const PrefixInteger = (value: string | number) => {
  if (value.toString().length < 2) return "0" + value;
  else return value.toString();
};

/**
 * @param {string | number} value: 内容
 * @param {number} len: 补全后的完整内容长度
 */
export const prefix0 = (value: string | number, len: number): string => {
  if (value || value === 0) {
    const valLen = value.toString().length;
    if (valLen < len) {
      return new Array(len - valLen).fill("0").join("") + value;
    }
  }
  return value.toString();
};

import { getToken } from '~/utils/auth';
import { API_HOST } from '~/config/index';
import Notify from '@vant/weapp/notify/notify';

// 拦截器类型
type RequestInterceptor = [
  (
    option: WechatMiniprogram.RequestOption
  ) => WechatMiniprogram.RequestOption
];

type ResponseInterceptor = [
  (res: any) => any,
  (
    res: WechatMiniprogram.RequestSuccessCallbackResult<
      string | WechatMiniprogram.IAnyObject | ArrayBuffer
    >
  ) => any
];

// 默认配置
type DefaultConfig = {
  baseUrl?: string;
  headers?: { [key: string]: any };
};

// 基础类
class Request {
  request<T = unknown>(
    option: WechatMiniprogram.RequestOption
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // 基础请求配置
      const requestOption: WechatMiniprogram.RequestOption = {
        success: (res) => {
          if (res.statusCode !== 200) {
            if (
              this.responseInterceptor &&
              typeof this.responseInterceptor[1] === 'function'
            ) {
              this.responseInterceptor[1](res);
            }
            return reject(res.data);
          }

          // 拦截器
          if (
            this.responseInterceptor &&
            typeof this.responseInterceptor[0] === 'function'
          ) {
            return resolve(
              this.responseInterceptor[0](res.data as any)
            );
          }

          resolve(res.data as any);
        },
        fail: (err) => {
          Notify(err.errMsg || '请求出错,请重试');
          reject(err);
        },
        // 已经设置默认的success和fail不建议覆盖掉
        ...option,
      };

      // url前缀
      const { baseUrl } = this.defaultConfig;
      if (baseUrl) {
        requestOption.url = baseUrl + requestOption.url;
      }

      // 清除重复斜杠
      // requestOption.url = requestOption.url.replace(/(?<!:)\/{2,}/gi, "/");

      wx.request(
        // 拦截器调用
        this.requestInterceptor &&
          typeof this.requestInterceptor[0] === 'function'
          ? this.requestInterceptor[0](requestOption)
          : requestOption
      );
    });
  }

  get<T = unknown>(o: WechatMiniprogram.RequestOption) {
    return this.request<T>({ method: 'GET', ...o });
  }

  post<T = unknown>(o: WechatMiniprogram.RequestOption) {
    return this.request<T>({ method: 'POST', ...o });
  }

  del<T = unknown>(o: WechatMiniprogram.RequestOption) {
    return this.request<T>({ method: 'DELETE', ...o });
  }

  put<T = unknown>(o: WechatMiniprogram.RequestOption) {
    return this.request<T>({ method: 'PUT', ...o });
  }

  // 拦截器
  private requestInterceptor?: RequestInterceptor;
  private responseInterceptor?: ResponseInterceptor;

  // 请求拦截器
  setRequestInterceptor(fn: RequestInterceptor) {
    this.requestInterceptor = fn;
  }

  // 响应拦截器
  setResponseInterceptor(fn: ResponseInterceptor) {
    this.responseInterceptor = fn;
  }

  // 默认参数
  private defaultConfig: DefaultConfig = {
    baseUrl: '',
    headers: {},
  };

  setDefaultConfig(config: DefaultConfig) {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }
}

const request = new Request();
request.setDefaultConfig({ baseUrl: API_HOST });

// 拦截器设置
request.setRequestInterceptor([
  (option) => {
    const token = getToken();
    if (token) {
      // jwt
      option.header = Object.assign({}, option.header, {
        Authorization: `Bearer ${token}`,
      });
    }
    return option;
  },
]);
request.setResponseInterceptor([
  (data: Request.Respose<unknown>) => {
    const { code } = data;
    if (code === 200) return data;

    switch (code) {
      case 401: {
        Notify('用户未登录');
        break;
      }
      default: {
        Notify(`请求出错, code：${data.code}`);
      }
    }
    return data;
  },
  (data) => {
    Notify(
      typeof data.data === 'string' ? data.data : data.errMsg
    );
  },
]);

export { Request };
export default request;

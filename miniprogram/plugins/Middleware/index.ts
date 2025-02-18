type Callback<C> = (ctx: C, next: () => void) => Promise<C | void> | (C | void);
/** 中间件模式
 * @function use 注册中间件
 * @function start 开始运行
 * @function stop 停止运行
 * @function clear 清除中间件
 */
class Middleware<C = {}> {
  private queue: Callback<C>[] = [];
  private prevIndex: number = -1; // -2时会中断中间件执行
  private ctx = {} as C;

  /** 注册
   * @param callback 中间件函数,中间件函数接收下列两个参数：
   * @param callback.ctx 上下文
   * @param callback.next 运行下一个中间件函数
   */
  use(cb: Callback<C>) {
    this.queue.push(cb);
    return this;
  }

  /** 开始运行
   * @param ctx 上下文,默认为空对象
   */
  start(ctx: C) {
    this.prevIndex = -1;
    this.ctx = ctx;
    return this.runner(this.prevIndex + 1);
  }

  /* 停止运行 */
  stop() {
    this.prevIndex = -2;
  }

  /** 运行 */
  private runner(idx: number): Promise<C> {
    return new Promise(async (resolve, reject) => {
      if (this.prevIndex === -2) return resolve(this.ctx);
      if (this.prevIndex === idx) throw new Error('不可以重复调用next!');

      const middleware = this.queue[idx];
      if (!middleware) return resolve(this.ctx);
      if (typeof middleware !== 'function') throw new Error('请传入Function');
      try {
        this.prevIndex = idx;
        await middleware(this.ctx, async () => {
          await this.runner(this.prevIndex + 1);
        });

        resolve(this.ctx);
      } catch (e) {
        console.log('执行中断: ', e || '抛出错误');
        reject(e);
      }
    });
  }

  /** 清空队列
   * @param idx 中间件索引，如不传则清除所有中间件
   */
  clear(fn?: Function) {
    if (typeof fn !== 'function') {
      console.log('传入参数有误');
    } else {
      const idx = this.queue.findIndex((i) => i === fn);
      if (idx !== -1) this.queue.splice(0, idx);
      else this.queue.splice(0, this.queue.length);
    }
  }
}

export { Middleware };
export default new Middleware();

/* const sleep = (times = 0) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(1), times);
  });
};
const middleware = new Middleware<{ no: number }>();

middleware
  .use(async (ctx, next) => {
    ctx.no += 1;
    console.log(1);
    await next();
    console.log(2);
  })
  .use(async (ctx, next) => {
    ctx.no += 1;
    await sleep(300);
    console.log(3);
    next();
    console.log(4);
  })
  .use((ctx) => {
    ctx.no += 1;
    console.log(5);
  });

middleware.start({ no: 0 }).then((ctx) => {
  console.log('no: ', ctx.no);
});
 */

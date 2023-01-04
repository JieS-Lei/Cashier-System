/* 
 * 函数防抖 debounce
 *  @params
 *      func: 需要执行的函数【必需】
 *      wait: 频繁操作的设定时间【默认300ms】
 *      immediate: 设置边界【默认false: 结束边界触发，true: 开始边界触发】
 */
export const debounce = function debounce(func, wait, immediate) {
    if (typeof func !== "function") throw new TypeError('func must be an function')
    if (typeof wait === "boolean") immediate = wait
    if (typeof wait !== "number") wait = 300
    if (typeof immediate !== "boolean") immediate = false
    let timer;
    return function proxy(...params) {
        let runNow = !timer && immediate,
            self = this
        if (timer) {
            clearTimeout(timer)
            timer = null
        }
        timer = setTimeout(() => {
            if (timer) {
                clearTimeout(timer)
                timer = null
            }
            //结束边界触发
            if (!immediate) func.call(self, ...params)
        }, wait)

        //开始边界触发
        if (runNow) func.call(self, ...params)
    }
}

/* 
 * 函数节流 throttle
 *  @params
 *      func: 需要执行的函数【必需】
 *      wait: 设定的触发频率【默认300ms】
 */
export const throttle = function throttle(func, wait) {
    if (typeof func !== "function") throw new TypeError('func must be an function')
    if (typeof wait !== "number") wait = 300
    let timer,
        previous = 0
    return function proxy(...params) {
        let now = +new Date(),
            remaining = wait - (now - previous),
            self = this,
            result
        if (remaining <= 0) {
            // 间隔时间已经超过 wait（包括第一次触发），无需等待，立即执行
            if (timer) {
                clearTimeout(timer)
                timer = null
            }
            result = func.call(self, ...params)
            previous = now
        } else if (!timer) {
            timer = setTimeout(() => {
                if (timer) {
                    clearTimeout(timer)
                    timer = null
                }
                result = func.call(self, ...params)
                previous = +new Date()
            }, remaining)
        }
        return result
    }
}

// 金额输入框格式化函数
export const priceChangeFormatter = value => {
    // 删除不合规的字符
    value = value.replace(/[^\d\.]|(?<=^0)0|(?<=\.\d{2})(.*)|(?<=\.\d*)\./g, '')
    // 点开头自动补0
    value = value.replace(/^\./, '0.')
    // value = value.length
    if (1000000 <= +value) value = '999999.99'
    return value
}

// blur时完善输入的金额
export const priceBlurFormatter = value => {
    if (!value) return value = '0.00'
    value = value.replace(/^0(?=[0-9])/, '')
    if (!value.includes('.')) value += '.00'
    else value += "0".repeat(Math.max(2 - value.split('.')[1]?.length, 0))
    return value
}
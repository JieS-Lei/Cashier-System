/**
 *  @description 函数防抖 debounce
 *  @param func 需要执行的函数【必需】
 *  @param wait: 频繁操作的设定时间【默认300ms】
 *  @param immediate: 设置边界【默认false: 结束边界触发，true: 开始边界触发】
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

/**
 *  @description 节流函数 throttle
 *  @param func 需要执行的函数【必需】
 *  @param wait 设定的触发频率【默认300ms】
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
    value = value.replace(/[^\d\.]|(?<=^0)0|(?<=\.\d{2}).*|(?<=\.\d*)\./g, '')
    // 点开头自动补0
    value = value.replace(/^\./, '0.')
    // value = value.length
    if (1000000 <= +value) value = '999999.99'
    return value
}

// blur时完善输入的金额 补零
export const priceBlurFormatter = (value, len = 2) => {
    if ('number' === typeof value) value = value.toString()
    if (!value) return value = `0.${'0'.repeat(len)}`
    value = value.replace(/^0(?=[0-9])/, '')
    if (!value.includes('.')) value = `${value}.${'0'.repeat(len)}`
    else value += "0".repeat(Math.max(len - value.split('.')[1]?.length, 0))
    return value
}

/**
 *  @description: 日期格式化函数
 *  @param date 日期类型
 *  @param format 日期格式  默认 yyyy-MM-dd HH:mm:ss格式
 */
export const formatDate = (date, format = 'yyyy-MM-dd HH:mm:ss 星期w') => {
    if (!date || date.length < 4) return date
    const typeDate = date instanceof Date ? date.getTime() : date
    date = new Date(typeDate)
    const obj = {
        yyyy: date.getFullYear(), // 完整年份 例：2021 -> 2021
        yy: ('' + date.getFullYear()).slice(-2), // 缩写年份 例：2021 -> 21
        M: date.getMonth() + 1, // 月份 不足两位不补0
        MM: ('0' + (date.getMonth() + 1)).slice(-2), // 月份 不足两位补0
        d: date.getDate(), // 天 不足两位不补0
        dd: ('0' + date.getDate()).slice(-2), // 天 不足两位补0
        H: date.getHours(), // 24小时 不足两位不补0
        HH: ('0' + date.getHours()).slice(-2), // 24小时 不足两位补0
        h: date.getHours() % 12, // 12小时制 不足两位不补0
        hh: ('0' + (date.getHours() % 12)).slice(-2), // 12小时制 不足两位补0
        m: date.getMinutes(),  // 分钟 不足两位不补0
        mm: ('0' + date.getMinutes()).slice(-2), // 分钟 不足两位补0
        s: date.getSeconds(),  // 秒 不足两位不补0
        ss: ('0' + date.getSeconds()).slice(-2),  // 秒 不足两位补0
        w: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()], // 星期
    }
    return format.replace(/([a-z]+)/gi, function (key) {
        return obj[key]
    });
}

// 四舍五入，使用浏览器提供的接口(不兼容IE11)
export const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false, // 不使用千分位
});
import { ElMessage as message } from 'element-plus'
import { useUserStore } from '~/store/modules/userStore.js'

const userStore = useUserStore()

const base_url = {
    'production': 'http://vip.jingtoo.cn/index.php?s=/api/', // 生产环境地址
    'development': '/proxy' // 开发环境地址
}

// config change
export const handleChangeRequestConfig = config => {
    config.baseURL = base_url[import.meta.env.MODE]
    config.headers['Content-Type'] = 'multipart/form-data'
    config.data['wxapp_id'] = '10001'
    return config
};

// token 处理
export const handleConfigureAuth = config => {
    config.headers["token"] = userStore.token || ""
    return config
};

// network error 处理
export const handleNetworkError = errStatus => {
    const networkErrMap = {
        "400": "错误的请求", // token 失效
        "401": "未授权，请重新登录",
        "403": "拒绝访问",
        "404": "请求错误，未找到该资源",
        "405": "请求方法未允许",
        "408": "请求超时",
        "500": "服务器端出错",
        "501": "网络未实现",
        "502": "网络错误",
        "503": "服务不可用",
        "504": "网络超时",
        "505": "http版本不支持该请求",
    }
    if (errStatus) {
        message.error({ message: networkErrMap[errStatus] ?? `其他连接错误 --${errStatus}`, grouping: true })
        return
    }

    message.error("无法连接到服务器！")
};

// token error 处理
export const handleAuthError = errCode => {
    const authErrMap = {
        "-1": "登录失效，需要重新登录", // token 失效
        "10032": "您太久没登录，请重新登录~", // token 过期
        "10033": "账户未绑定角色，请联系管理员绑定角色",
        "10034": "该用户未注册，请联系管理员注册用户",
        "10037": "账号已无效",
        "10038": "账号未找到",
    }
    if (authErrMap.hasOwnProperty(errCode)) {
        message.error({ message: authErrMap[errCode], grouping: true })
        // 授权错误，登出账户
        // logout();
        return false
    }

    return true
};

// 其余错误处理
export const handleGeneralError = (errCode, errMsg) => {
    if (errCode !== 1) {
        message.error(errMsg)
        return false
    }

    return true
}
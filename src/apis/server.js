import axios from "axios"

import {
    handleChangeRequestConfig,
    handleConfigureAuth,
    handleAuthError,
    handleGeneralError,
    handleNetworkError
} from "./tools"

const instance = axios.create();

instance.interceptors.request.use(config => {
    config = handleChangeRequestConfig(config)
    config = handleConfigureAuth(config)
    return config
})

instance.interceptors.response.use(
    response => {
        if (response.status !== 200) return Promise.reject(response.data)
        let authPass = handleAuthError(response.data.code)
        authPass && handleGeneralError(response.data.code, response.data.msg)
        return response
    },
    err => {
        handleNetworkError(err.response.status)
        return Promise.reject(err.response)
    }
);

export const Get = (url, params = {}, clearFn) =>
    new Promise(resolve => {
        instance
            .get(url, { params })
            .then(result => {
                let res
                if (clearFn !== undefined) {
                    res = clearFn(result.data)
                } else {
                    res = result.data
                }
                resolve([null, res])
            })
            .catch(err => {
                resolve([err, undefined])
            })
    })

export const Post = (url, data, params = {}) => {
    return new Promise(resolve => {
        instance
            .post(url, data, { params })
            .then((result) => {
                resolve([null, result.data])
            })
            .catch(err => {
                resolve([err, undefined])
            })
    })
}
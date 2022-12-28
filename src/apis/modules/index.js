import { Get, Post } from "../server";

// 登录相关
export const loginApi = {
    login: data => Post("cashier/login", data)
};

// 商品相关
export const goodsApi = {
    // 查询商品
    getGoods: data => Post('cashier/listGoods', data),
    // 查询商品分类
    getTypes: data => Post('cashier/listCategory', data),
    // 删除商品
    deleteGoods: data => Post('cashier/delGoods', data),
    // 修改分类名称
    upadteType: data => Post('cashier/editCategory', data),
    // 删除分类
    deleteType: typeId => Post('cashier/delCategory', { category_id: typeId }),
    // 新增分类
    addType: data => Post('cashier/addCategory', data),
    // 排序更新
    sortType: data => Post('cashier/editCategorySort', data)
};

// 文件上传
export const uploadApi = {
    upload: options => {
        let config = {}
        if ('function' === typeof options.onProgress) {
            config['onUploadProgress'] = evt => {
                const progressEvt = evt;
                progressEvt.percent = evt.total > 0 ? evt.loaded / evt.total * 100 : 0;
                options.onProgress(progressEvt);
            }
        }
        return Post('upload/image', { ...options.data, token: true }, config)
    },
};
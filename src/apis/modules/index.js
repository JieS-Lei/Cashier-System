import { Get, Post } from "../server";

// 登录相关
export const loginApi = {
    login: data => Post('cashier/login', data),
    getAdminInfo: token => Post('cashier/getStoreUser', { token })
};

// 商品相关
export const goodsApi = {
    // 查询商品
    getGoods: data => Post('cashier/listGoods', data),
    // 查询商品分类
    getTypes: () => Post('cashier/listCategory'),
    // 删除商品
    deleteGoods: data => Post('cashier/delGoods', data),
    // 修改分类名称
    upadteType: data => Post('cashier/editCategory', data),
    // 删除分类
    deleteType: typeIds => Post('cashier/delCategory', { category_id: typeIds }),
    // 新增分类
    addType: data => Post('cashier/addCategory', data),
    // 分类排序更新
    sortType: data => Post('cashier/editCategorySort', data),
    // 查询商品单位
    getGoodsUnit: () => Post('cashier/listUnit'),
    // 新增商品单位
    addGoodsUnit: data => Post('cashier/addUnit', data),
    // 删除单位
    deleteGoodsUnit: unitId => Post('cashier/delUnit', { unit_id: unitId }),
    // 添加商品
    addGoods: data => Post('cashier/addGoods', data),
    // 删除商品（可批量）
    deleteGoodsById: goodsIds => Post('cashier/delGoods', { goodsId: goodsIds }),
    // 分类ID批量删除商品
    deleteGoodsByTypeId: typeIds => Post('cashier/delGoodsByCatId', { category_id: typeIds }),
    // 修改商品信息
    updataGoods: data => Post('cashier/editGoods', data),
    // 批量修改商品分类|单位|金额
    batchReviseGoodsInfo: data => Post('cashier/batchEditGoods', data),
    // 所有商品自动生成条码
    autoCreateBarCode: () => Post('cashier/autoGenOrderNo'),
    // 获取会员列表
    getVips: data => Post('cashier/listUser', data),
    // 获取会员基础设置
    getVipSetting: () => Post('cashier/getVipSetting'),
    // 修改会员基础设置
    setVIPSetting: data => Post('cashier/vipSetting', data),
    // 修改会员信息
    setVip: data => Post('cashier/setUserInfo', data),
    // 成为会员
    becomeVip: user_id => Post('cashier/setUserVip', { user_id }),
    // 取消会员
    cancelVip: user_id => Post('cashier/cancelUserVip', { user_id }),
    // 会员 积分|余额 充值
    vipRecharge: data => Post('cashier/recharge', data),
    // 获取用户余额改变记录
    getBalanceRecord: data => Post('cashier/getBalanceLog', data),
    // 获取收银固定优惠参数
    getCheckoutDiscount: () => Post('cashier/getDiscountParam'),
    // 修改收银固定优惠参数
    setCheckoutDiscount: data => Post('cashier/updateDiscountParam', data),
    // 创建订单 | 挂单
    createOrder: data => Post('cashier/createCashierOrder', data),
    // 获取挂单列表
    getPendingOrder: data => Post('cashier/pendingOrderList', data),
    // 删除订单
    deleteOrder: data => Post('cashier/delOrder', data),
    // 订单现金支付
    cashPay: order_sn => Post('cashier/cashPay', { order_sn }),
    // 轮询订单结果
    polling: data => Post('', data)

};

// 文件上传
export const uploadApi = {
    upload: options => {
        let config = {}
        if ('function' === typeof options.onProgress) {
            // 上传进度事件
            config['onUploadProgress'] = evt => {
                const progressEvt = evt;
                progressEvt.percent = evt.total > 0 ? evt.loaded / evt.total * 100 : 0;
                options.onProgress(progressEvt);
            }
        }
        return Post('upload/image', { ...options.data, token: true }, config)
    },
};
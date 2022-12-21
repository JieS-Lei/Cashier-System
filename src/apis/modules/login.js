import { Get, Post } from "../server";

export const loginApi = {
    // 登录
    login: data => Post("cashier/login", data),
    // 查询商品
    getGoods: data => Post('cashier/listGoods', data),
    // 查询商品分类
    getTypes: data => Post('cashier/listCategory', data),
    // 删除商品
    deleteGoods: data => Post('cashier/delGoods', data)
};
import { Get, Post } from "../server";

export const loginApi = {
    login: data => Post("cashier/login", data),
    getGoods: data => Post('cashier/listGoods', data)
};
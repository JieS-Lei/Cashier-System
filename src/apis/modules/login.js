import { Get } from "../server";

export const userApi = {
    getUserInfo: id => Get("/user/info", { id }),
};
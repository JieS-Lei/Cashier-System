import { loginApi, goodsApi, uploadApi } from "./modules";

export const apis = {
    ...loginApi,
    ...goodsApi,
    ...uploadApi
};
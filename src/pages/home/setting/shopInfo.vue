<script setup>
import { apis } from '~/apis'
import { useSystemStore } from '~/store/modules/systemStore'
import { storeToRefs } from 'pinia'

const systemStore = useSystemStore()
const { shopInfo } = storeToRefs(systemStore)

// form表单
const formRef = ref() // 实例
const loading = ref(false)
if (!shopInfo.value.shop_id) {
    loading.value = true
    apis.getShopInfo().then(([error, { code, data }]) => {
        loading.value = false
        if (error || 1 !== code) return ElMessage('店铺信息获取失败')
        shopInfo.value = data
    })
}
const rules = reactive({
    shop_name: [
        { required: true, message: '请输入店铺名称', trigger: 'blur' }
    ],
    linkman: [
        { required: true, message: '请输入管理员姓名', trigger: 'blur' }
    ],
    phone: [
        { required: true, message: '请输入管理员手机号', trigger: 'blur' },
        { pattern: /^1((3[\d])|(4[5,6,7,9])|(5[0-3,5-9])|(6[5-7])|(7[0-8])|(8[\d])|(9[1,8,9]))\d{8}$/, len: 11, message: '请输入11位正确的手机号码', trigger: 'blur' }
    ]
})

// 所在地区
const location = computed({
    get: () => [shopInfo.value.province_id, shopInfo.value.city_id, shopInfo.value.region_id],
    set(newVal) {
        shopInfo.value.province_id = newVal[0]
        shopInfo.value.city_id = newVal[1]
        shopInfo.value.region_id = newVal[2]
    }
})
const props = {
    lazy: true,
    lazyLoad(node, resolve) {
        const { value } = node
        apis.getLocation({ pid: value }).then(([error, { code, data }]) => {
            if (error || 1 !== code) {
                ElMessage('获取省市县信息失败')
                return resolve()
            }
            const nodes = data.map(item => ({
                value: item.id,
                label: item.name,
                leaf: item.level > 2,
            }))
            resolve(nodes)
        })
    },
}

// 行业范围
apis.getShopBusinessScope().then(([error, { code, data }]) => {
    if (error || 1 !== code) return ElMessage('获取行业范围信息失败')
    businessScopeList.value = data
})
const businessScopeList = ref([])

// 保存
const submitLoading = ref(false)
const submit = async formEl => {
    if (!formEl) return
    await formEl.validate(async (valid, fields) => {
        if (valid) {
            submitLoading.value = true
            let [error, { code }] = await apis.setShopInfo(shopInfo.value)
            submitLoading.value = false
            if (error || 1 !== code) return ElMessage({ message: '保存失败', grouping: true })
            ElMessage.success({ message: '保存成功' })
        } else {
            ElMessage.warning({ message: '表单存在错误项，请检查', grouping: true })
            console.warn(fields);
        }
    })
}
</script>
<template>
    <el-form v-loading="loading" ref="formRef" :rules="rules" :model="shopInfo" label-width="68" size="large"
        hide-required-asterisk>
        <el-form-item label="店铺名称" prop="shop_name">
            <el-input v-model="shopInfo.shop_name" onfocus="this.select()" />
        </el-form-item>
        <el-form-item label="管理人员" prop="linkman">
            <el-input v-model="shopInfo.linkman" onfocus="this.select()" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
            <el-input v-model="shopInfo.phone" onfocus="this.select()" />
        </el-form-item>
        <el-form-item label="所在地区">
            <el-cascader v-model="location" :props="props" />
        </el-form-item>
        <el-form-item label="所在地区">
            <el-input v-model="shopInfo.address" onfocus="this.select()" />
        </el-form-item>
        <el-form-item label="行业范围">
            <el-select v-model="shopInfo.category_id" size="large">
                <el-option v-for="item in businessScopeList" :key="item.category_id" :label="item.name"
                    :value="item.category_id" />
            </el-select>
        </el-form-item>
        <el-form-item>
            <el-button disabled auto-insert-space style="width: 100px;">清空</el-button>
            <el-button :loading="submitLoading" type="primary" auto-insert-space style="width: 100px;"
                @click="submit(formRef)">保存</el-button>
        </el-form-item>
    </el-form>
</template>
<style scoped>
:deep(.el-form-item__content) {
    max-width: 500px;
}

:deep(.el-cascader) {
    width: 100%;
}
</style>
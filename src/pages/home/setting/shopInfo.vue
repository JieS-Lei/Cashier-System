<script setup>
import { ElMessage } from 'element-plus';
import { apis } from '~/apis'
import { useSystemStore } from '~/store/modules/systemStore'
import { storeToRefs } from 'pinia'

const systemStore = useSystemStore()
const { shopInfo } = storeToRefs(systemStore)


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
})
console.log(shopInfo.value);

apis.getLocation().then(([error, { code, data }]) => {
    console.log(data);
})

let id = 0
const props = {
    lazy: true,
    lazyLoad(node, resolve) {
        const { level } = node
        setTimeout(() => {
            const nodes = Array.from({ length: level + 1 }).map((item) => ({
                value: ++id,
                label: `Option - ${id}`,
                leaf: level >= 2,
            }))
            // Invoke `resolve` callback to return the child nodes data and indicate the loading is finished.
            resolve(nodes)
        }, 1000)
    },
}

</script>
<template>
    <el-form v-loading="loading" ref="formRef" :rules="rules" :model="shopInfo" label-width="auto" size="large" status-icon>
        <el-form-item label="店铺名称" prop="shop_name">
            <el-input v-model="shopInfo.shop_name" onfocus="this.select()" />
        </el-form-item>
        <el-form-item label="管理员" prop="linkman">
            <el-input v-model="shopInfo.linkman" onfocus="this.select()" />
        </el-form-item>
        <el-form-item label="位置">
            <el-cascader :props="props" />
        </el-form-item>
    </el-form>
</template>
<style scoped></style>
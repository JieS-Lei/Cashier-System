<script setup>
import { useGoodsStore } from '~/store/modules/goodsStore'
import { storeToRefs } from 'pinia'
import { apis } from '~/apis';

const emit = defineEmits(['done', 'delGoods', 'delType'])
const props = defineProps({
    show: {
        type: Boolean,
        required: true
    }
})

const store = useGoodsStore()
const { typeList } = storeToRefs(store) // 分类列表

const treeRef = ref() // 树节点

const switchVal = ref(false) // 过滤后是否完全显示子节点
const filterText = ref('') // 过滤文本
watch(filterText, (val) => treeRef.value.filter(val))
// 根据文本过滤
let filterCheckedId = -1 // 匹配到的父级ID
const filterNode = (value, data) => {
    if (!value) return true
    let { id, text, label } = data, pass = label.includes(value)
    if (switchVal.value) {
        if ('level1' === text && -1 != filterCheckedId) filterCheckedId = -1
        if ('level1' === text && pass) filterCheckedId = id
        if ('level2' === text) pass = data.parentId === filterCheckedId || pass
    }
    return pass
}

const checkedVal = ref(false)
const loading = ref(false)
const submit = async () => {
    let keys = treeRef.value.getCheckedNodes()
    if (!keys) return ElMessage.warning({ message: '初始化未完成，请稍后重试', grouping: true })
    if (!keys.length) return ElMessage.warning({ message: '未选择分类', grouping: true })
    let tempkey, checkedKeys = []
    // loading.value = true
    keys.forEach(item => {
        if ('level1' === item.text) {
            tempkey = item.id
            checkedKeys.push(tempkey)
        } else if (tempkey !== item.parentId) checkedKeys.push(item.id)
    })
    let [error, { code }] = await apis.deleteGoodsByTypeId(checkedKeys.join())
    if (error || 1 !== code) {
        ElMessage('商品删除失败')
        return loading.value = true
    }
    emit('delGoods')
    ElMessage.success('商品删除成功')
    if (checkedVal.value) {
        let [err, { code: code1 }] = await apis.deleteType(checkedKeys.join())
        if (err || 1 !== code1) ElMessage('分类删除失败')
        else {
            emit('delType')
            ElMessage.success('分类删除成功')
        }
    }
    emit('done')
    loading.value = true
}

</script>
<template>
    <el-dialog class="delGoodsDialog" :model-value="props.show" width="400px" title="批量删除" align-center
        :close-on-click-modal="false" :before-close="() => emit('done')">
        <el-scrollbar height="250" style="padding: 0 20px;">
            <el-input v-model="filterText" placeholder="请输入分类名称" style="padding: 0 10px 10px;" />
            <div class="dSwitch" v-show="filterText">
                <span>显示符合匹配条件的分类下的全部子分类：</span>
                <el-switch v-model="switchVal" size="small" @change="treeRef.filter(filterText)" />
            </div>
            <el-tree ref="treeRef" :data="typeList" check-strictly show-checkbox node-key="id"
                :filter-node-method="filterNode" />
        </el-scrollbar>
        <template #footer>
            <span><el-checkbox v-model="checkedVal" label="同时删除分类" /></span>
            <span>
                <el-button :loading="loading" type="primary" size="large" auto-insert-space
                    @click="submit">删除</el-button>
            </span>
        </template>
    </el-dialog>
</template>
<style scoped>
.dSwitch {
    align-items: center;
    padding: 0 20px 5px;
}

.dSwitch>span {
    font-size: 12px;
    line-height: 1;
    vertical-align: middle;
}
</style>
<style>
.delGoodsDialog .el-dialog__body {
    padding: 15px 0 10px;
}

.delGoodsDialog .el-dialog__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>
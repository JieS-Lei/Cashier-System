<script setup>
import { useGoodsTypeStore } from '~/store/modules/goodsTypeStore'
import { storeToRefs } from 'pinia'
import { apis } from '~/apis';

const emit = defineEmits(['done', 'updataList'])
const props = defineProps({
    show: {
        type: Boolean,
        required: true
    }
})

const store = useGoodsTypeStore()
const { typeList } = storeToRefs(store) // 一级分类

// 关闭对话框，初始化数据
const close = typeItem => {
    // if ('function' === typeof typeItem) typeItem = null
    // itemKey.value = -1
    // childTypeList.value = []
    emit('done', typeItem) // 关闭
}

</script>
<template>
    <el-dialog :model-value="props.show" width="500px" title="批量删除" align-center :close-on-click-modal="false"
        :before-close="close">
        <el-table :data="typeList" style="width: 100%; margin-bottom: 20px" row-key="id" border default-expand-all>
            <el-table-column prop="date" label="label" sortable />
            <el-table-column prop="name" label="Name" sortable />
        </el-table>
        <template #footer class="diy">
            <span class="dialog-footer">
                <el-button :loading="loading" type="primary" size="large" auto-insert-space style="width: 50%;"
                    @click="submit">完成</el-button>
            </span>
        </template>
    </el-dialog>
</template>
<style scoped>

</style>
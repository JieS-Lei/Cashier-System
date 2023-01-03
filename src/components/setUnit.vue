<script setup>
import { apis } from '~/apis'
import { useGoodsStore } from '~/store/modules/goodsStore'
import { storeToRefs } from 'pinia'

const emit = defineEmits(['done', 'checked'])
const props = defineProps({
    show: {
        type: Boolean,
        required: true
    }
})
const store = useGoodsStore()
const { unitList, checkedUnit } = storeToRefs(store) // 单位列表

const list = ref([]) // 数据
const loading = ref(true)
const checkedId = ref(-1) // 选中的id

if (unitList.value.length) {
    list.value = unitList.value
    loading.value = false
    checkedId.value = Number(checkedUnit.value.unit_id) || -1
} else apis.getGoodsUnit().then(([error, { data, code }]) => {
    loading.value = false
    if (error || 1 !== code) return false
    if (Array.isArray(data.list)) list.value = unitList.value = data.list
    checkedId.value = Number(checkedUnit.value.unit_id) || -1
})

// 是否编辑状态
const isEdit = ref(false)
const handleCurrentChange = row => {
    if (isEdit.value) return
    checkedId.value = row.unit_id
    checkedUnit.value = row
}

// 删除单位
const handleDelete = (index, row) => {
    let { name, unit_id } = row
    ElMessageBox({
        message: h('p', null, [
            '是否删除',
            h('i', { style: 'margin: 0 5px;color: teal' }, name),
            '商品单位？'
        ]),
        title: '提示',
        confirmButtonText: '删除',
        type: 'warning',
        draggable: true,
        beforeClose: async (action, instance, done) => {
            if (action !== 'confirm') return done()
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '删除中'
            let [error, { code }] = await apis.deleteGoodsUnit(unit_id)
            instance.confirmButtonLoading = false
            instance.confirmButtonText = '删除'
            if (error || 1 !== code) return ElMessage('删除失败')
            list.value.splice(index, 1)
            done()
        }
    })
        .then(() => ElMessage.success('删除成功'))
        .catch(() => false)
}

// 新增单位
const addUnit = () => {
    ElMessageBox({
        message: `请输入新增商品单位名称`,
        title: `新增商品单位`,
        inputType: 'text',
        showInput: true,
        inputPlaceholder: '请输入名称',
        confirmButtonText: '立即新增',
        draggable: true,
        beforeClose: async (action, instance, done) => {
            if (action !== 'confirm') return done()
            let name = (instance.inputValue ?? '').trim()
            if (!name) return ElMessage.warning({ message: '未输入名称', grouping: true })
            if (name.length > 5) return ElMessage.warning({ message: '名称长度限制在5个字符以内', grouping: true })
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '新增中'
            let [error, { data, code }] = await apis.addGoodsUnit({ name, type: 0 })
            instance.confirmButtonLoading = false
            instance.confirmButtonText = '立即新增'
            if (error || 1 !== code) return ElMessage(`单位新增失败`)
            list.value.push({
                name,
                type: 0,
                unit_id: data.unit_id
            })
            done()
        }
    })
        .then(() => ElMessage.success(`单位新增成功`))
        .catch(() => false)

}

// 点击单元格提交
const submit = row => {
    if (isEdit.value) return
    emit('checked', row)
    emit('done')
}
</script>
<template>
    <el-dialog :model-value="props.show" width="525px" title="单位管理" align-center :close-on-click-modal="false"
        :before-close="() => emit('done')">
        <el-table class="table" v-loading="loading" ref="singleTableRef" size="large" max-height="370px" :data="list"
            :show-header="false" @current-change="handleCurrentChange" @row-click="submit">
            <el-table-column property="name" label="Name" />
            <el-table-column align="right" width="53px" center>
                <template #default="scope">
                    <el-icon v-if="!isEdit && (checkedId === scope.row.unit_id)" color="#f56c6c"
                        style="vertical-align: middle;">
                        <epCheck />
                    </el-icon>
                    <!-- <el-button v-if="scope.row.type && isEdit" disabled type="info" link>
                        <el-icon>
                            <epRemove />
                        </el-icon>
                    </el-button> -->
                    <el-button v-if="!scope.row.type && isEdit" type="danger" link
                        @click.stop="handleDelete(scope.$index, scope.row)">
                        <el-icon>
                            <epCircleClose />
                        </el-icon>
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" text @click="addUnit">新增</el-button>
                <el-button type="primary" text @click="isEdit = !isEdit">
                    {{ isEdit ? '完成' : '编辑' }}
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>
<style scoped>
.table:deep(.el-table__inner-wrapper::after) {
    content: '';
    position: absolute;
    top: 0;
    height: 1px;
    width: 100%;
    z-index: 3;
    background-color: var(--el-table-border-color);
}
</style>
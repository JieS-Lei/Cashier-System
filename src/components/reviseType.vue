<script setup>
import { useGoodsTypeStore } from '~/store/modules/goodsTypeStore'
import { storeToRefs } from 'pinia'
import draggable from "vuedraggable";
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
const itemKey = ref(-1) // 一级分类数组下标
const childItemKey = ref(-1) // 二级分类下标

const anim = ref(false) // 二级分类出现动画
let animTimer = null // 移除二级分类动画定时器

let isSolt = false // 是否进行过排序

const childTypeList = ref([])// 二级分类数据

// watch(typeList, newVal => {
//     console.log(typeList.value);
// })

// 点击一级分类处理函数
const handleStart = event => {
    if (itemKey.value == event.oldIndex) return false // 处理重复点击
    if (animTimer) clearTimeout(animTimer)
    anim.value = true // 开启动画
    childItemKey.value = -1 // 初始化二级分类选中下标
    itemKey.value = event.oldIndex // 更新选中元素下标
    childTypeList.value = typeList.value[event.oldIndex].children // 更新二级分类数据
    animTimer = setTimeout(() => anim.value = false, childTypeList.value.length * 100)
}

const handleEnd = event => {
    itemKey.value = event.newIndex
    if (!isSolt) isSolt = true
}

// 二级分类点击移动后处理函数
const childHandleEnd = event => {
    childItemKey.value = event.newIndex
    typeList.value[itemKey.value].children = childTypeList.value
    if (!isSolt) isSolt = true
}

// 分类功能按钮点击（修改，删除）
const clickItemFn = (level, event) => {
    let btn = event.target.getAttribute('data-btn')
    if (null == btn) return false
    let { label, id } = level - 1 ? childTypeList.value[childItemKey.value] : typeList.value[itemKey.value]
    if ('updata' === btn) {
        ElMessageBox({
            message: h('p', null, [
                '请输入分类',
                h('i', { style: 'margin: 0 5px;color: teal' }, label),
                '的新名称?'
            ]),
            title: '重命名',
            inputType: 'text',
            showInput: true,
            inputPlaceholder: '请输入新名称',
            confirmButtonText: '修改',
            beforeClose: async (action, instance, done) => {
                if (action !== 'confirm') return done()
                let newLabel = (instance.inputValue ?? '').trim()
                if (!newLabel) return ElMessage.warning({ message: '请输入新名称', grouping: true })
                if (newLabel === label) return ElMessage.warning({ message: '新名称与原名称相同', grouping: true })
                instance.confirmButtonLoading = true
                instance.confirmButtonText = '修改中'
                let [error, { code }] = await apis.upadteType({
                    name: newLabel,
                    category_id: id
                })
                instance.confirmButtonLoading = false
                instance.confirmButtonText = '修改'
                if (error || 1 !== code) return ElMessage('名称修改失败')
                if (level - 1) childTypeList.value[childItemKey.value].label = newLabel
                else typeList.value[itemKey.value].label = newLabel
                done()
            }
        })
            .then(({ value }) => ElMessage.success(`修改成功（ ${label} -> ${value} ）`))
            .catch(() => false)
    } else if ('delete' === btn) {
        // 删除分类
        ElMessageBox({
            message: h('p', null, [
                '是否删除',
                h('i', { style: 'margin: 0 5px;color: teal' }, label),
                '分类?'
            ]),
            title: '提示',
            confirmButtonText: '删除',
            type: 'warning',
            draggable: true,
            beforeClose: async (action, instance, done) => {
                if (action !== 'confirm') return done()
                instance.confirmButtonLoading = true
                instance.confirmButtonText = '删除中'
                let [error, { code }] = await apis.deleteType(id)
                instance.confirmButtonLoading = false
                instance.confirmButtonText = '删除'
                if (error || 1 !== code) return ElMessage('删除失败')
                if (level - 1) childTypeList.value.splice(childItemKey.value, 1)
                else {
                    typeList.value.splice(itemKey.value, 1)
                    childTypeList.value = []
                }
                done()
            }
        })
            .then(() => ElMessage.success('删除成功'))
            .catch(() => false)
    }
}

// 关闭对话框，初始化数据
const close = typeItem => {
    if ('function' === typeof typeItem) typeItem = null
    itemKey.value = -1
    childTypeList.value = []
    emit('done', typeItem) // 关闭
}

// 新增分类
const addType = async isChild => {
    isChild = Boolean(isChild - 1)
    ElMessageBox({
        message: `请输入新增${isChild ? '子' : ''}分类名称`,
        title: `新增${isChild ? '子' : ''}分类`,
        inputType: 'text',
        showInput: true,
        inputPlaceholder: '请输入名称',
        confirmButtonText: '立即新增',
        beforeClose: async (action, instance, done) => {
            if (action !== 'confirm') return done()
            let label = (instance.inputValue ?? '').trim()
            if (!label) return ElMessage.warning({ message: '未输入名称', grouping: true })
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '新增中'
            let [error, { data, code }] = await apis.addType({
                image_id: 0,
                sort: 0,
                parent_id: isChild ? typeList.value[itemKey.value].id : 0,
                name: label
            })
            instance.confirmButtonLoading = false
            instance.confirmButtonText = '立即新增'
            if (error || 1 !== code) return ElMessage(`新增${isChild ? '子' : ''}分类失败`)
            if (isChild) childTypeList.value.push({
                label,
                text: 'level2',
                id: data.category_id
            })
            else typeList.value.push({
                label,
                text: 'level1',
                id: data.category_id,
                children: []
            })
            done()
        }
    })
        .then(({ value }) => ElMessage.success(`新增 ${value} ${isChild ? '子' : ''}分类成功`))
        .catch(() => false)
}

// 点击更新排序
const loading = ref(false)
const handelList = list => {
    let sortWeight = 1
    let arr = list.map(item => {
        let sub = []
        if (Array.isArray(item.children)) sub = handelList(item.children)
        return {
            category_id: item.id,
            sort: sortWeight++,
            sub
        }
    })
    return arr
}
const submit = async () => {
    let typeItem = null
    if (childItemKey.value !== -1) typeItem = childTypeList.value[childItemKey.value]
    else if (itemKey.value !== -1) typeItem = typeList.value[itemKey.value]
    if (!isSolt) return close(typeItem) // 关闭
    let newTypeList = handelList(typeList.value)
    loading.value = true
    let [error, { data, code }] = await apis.sortType({ categorys: JSON.stringify(newTypeList) })
    if (error || 1 !== code) {
        ElMessage(`新增${isChild ? '子' : ''}分类失败`)
        return loading.value = false
    }
    loading.value = false
    emit('updataList', typeItem) // 更新数据
    close(typeItem) // 关闭
}

</script>
<template>
    <el-dialog :model-value="props.show" width="650px" title="分类管理" align-center :close-on-click-modal="false"
        :before-close="close">
        <el-row :gutter="5">
            <el-col :span="12">
                <div class="box">
                    <el-button class="addBtn" type="primary" plain size="large" bg @click="addType(1)">
                        <el-icon style="margin-right: 5px;">
                            <epPlus />
                        </el-icon>
                        新增分类
                    </el-button>
                    <div class="gap"></div>
                    <el-scrollbar>
                        <draggable v-model="typeList" ghost-class="ghost" animation="300" item-key="id"
                            @click.capture="clickItemFn(1, $event)" @choose="handleStart" @sort="handleEnd">
                            <template #item="{ element, index }">
                                <div :class="['item', { 'is-checked': index == itemKey }]" :data-index="index">
                                    <p class="overflow">{{ element.label }}</p>
                                    <span v-show="index == itemKey">
                                        <span class="sp-btns">
                                            <span class="mask" data-btn="updata"></span>
                                            <el-icon size="15">
                                                <epEditPen />
                                            </el-icon>
                                        </span>
                                        <span class="sp-btns">
                                            <span class="mask" data-btn="delete"></span>
                                            <el-icon size="15">
                                                <epDelete />
                                            </el-icon>
                                        </span>
                                    </span>
                                </div>
                            </template>
                        </draggable>
                    </el-scrollbar>
                </div>
            </el-col>
            <el-col :span="12">
                <div class="box">
                    <el-button class="addBtn" type="primary" plain size="large" bg @click="addType(2)">
                        <el-icon style="margin-right: 5px;">
                            <epPlus />
                        </el-icon>
                        新增子分类
                    </el-button>
                    <div class="gap"></div>
                    <el-scrollbar>
                        <draggable :class="{ 'anim': anim }" v-model="childTypeList" ghost-class="ghost" animation="300"
                            item-key="id" @click="clickItemFn(2, $event)"
                            @choose="event => childItemKey = event.oldIndex" @sort="childHandleEnd">
                            <template #item="{ element, index }">
                                <div :class="['item', { 'is-checked': index == childItemKey }]"
                                    :style="`animation-duration: .${index}s;`">
                                    {{ element.label }}
                                    <span v-show="index == childItemKey">
                                        <span class="sp-btns">
                                            <span class="mask" data-btn="updata"></span>
                                            <el-icon size="15">
                                                <epEditPen />
                                            </el-icon>
                                        </span>
                                        <span class="sp-btns">
                                            <span class="mask" data-btn="delete"></span>
                                            <el-icon size="15">
                                                <epDelete />
                                            </el-icon>
                                        </span>
                                    </span>
                                </div>
                            </template>
                            <template v-if="!childTypeList?.length" #footer>
                                <el-empty :description="itemKey + 1 ? '暂无子分类' : '请选择父分类'" />
                            </template>
                        </draggable>
                    </el-scrollbar>
                </div>
            </el-col>
        </el-row>
        <template #footer class="diy">
            <span class="dialog-footer">
                <el-button :loading="loading" type="primary" size="large" auto-insert-space style="width: 50%;"
                    @click="submit">完成</el-button>
            </span>
        </template>
    </el-dialog>
</template>
<style scoped>
.dialog-footer {
    display: inline-block;
    width: 100%;
    text-align: center;
}

.box {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--el-border-color-lighter);
    padding: 10px 5px;
    height: 400px;
    box-sizing: border-box;
}

@keyframes bounce-in {
    0% {
        opacity: 0;
        transform: translateX(-40%);
    }

    100% {
        opacity: 1;
        transform: translateX(0);
    }
}

.anim .item {
    animation: bounce-in .3s;
}

.item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 30px;
    height: 18px;
    line-height: 1;
    transition: background-color .3s;
    cursor: move;
}

.item+.item {
    margin-top: 2px;
}

.item>span {
    font-size: 0;
    margin-right: -8px;
}

.item .sp-btns {
    position: relative;
    display: inline-block;
    margin-right: 8px;
}

.item .sp-btns .mask {
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    width: 100%;
    height: 100%;
    cursor: pointer;
    z-index: 1;
}

.item .sp-btns .mask:hover~.el-icon {
    color: var(--el-color-primary);
}

.item:hover,
.item.chosen,
.item.is-checked {
    background-color: var(--el-border-color-lighter);
}

.item:has(~.ghost),
.item.ghost~.item {
    background-color: #fff;
}

.item p.overflow {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.gap {
    height: 10px;
}
</style>
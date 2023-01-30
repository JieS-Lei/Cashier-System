<script setup>
import { useRouter } from 'vue-router'
import { apis } from '~/apis'
import { useVipStore } from '~/store/modules/vipStore'
import { watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '~/store/modules/userStore'
import { priceChangeFormatter as priceFormatter, priceBlurFormatter, debounce, formatDate } from '~/utils'

const router = useRouter()
const store = useVipStore()
const userStore = useUserStore()

const search = ref('') // 搜索内容

const birthdayOptions = [{
    value: '',
    label: '全部',
}, {
    value: 'month',
    label: '本月',
}, {
    value: 'today',
    label: '本日',
}]
const birthdayVal = ref()
const statusOption = [{
    value: '-1',
    label: '全部',
}, {
    value: '1',
    label: '已激活',
}, {
    value: '0',
    label: '未激活',
}]
const statusVal = ref('1')

const loading = ref(false) // 列表加载
const multipleTableRef = ref() // 表格实例
const userList = ref([]) // 列表数据
const selectionDatas = ref([]) // 表格选中数据
const currentPage = ref(1) // 当前页数
const page = reactive({ // 分页参数
    pageSize: 10, // 一页的数据数量
    total: 0 // 总数
})
// 页数改变 重新获取数据
watch(currentPage, () => getVipList())
/* Start - 动态计算列表数据容量，设置pageSize */
let _clientHeight = 0, remainder = 0 // 初始高度 | 空余高度
const getPageSize = async el => {
    let elHeader, elBody
    if (!_clientHeight) {
        await nextTick(() => {
            elHeader = el.querySelector('.el-table__header-wrapper')
            elBody = el.querySelector('.el-table__body-wrapper')
        })
    } else {
        elHeader = el.querySelector('.el-table__header-wrapper')
        elBody = el.querySelector('.el-table__body-wrapper')
    }
    let oneHei = elHeader.offsetHeight, boxHei = elBody.offsetHeight
    let showNum = Math.floor(boxHei / oneHei)
    remainder = boxHei % oneHei
    if (!_clientHeight && remainder < 32) {
        showNum--
        remainder += oneHei // 补充剩余高度
    }
    if (!_clientHeight) remainder = Math.max(remainder - 32, 0)  // 剩余高度需要留出分页控件空间
    return isNaN(showNum) ? 10 : showNum
}
onMounted(async () => {
    let el = multipleTableRef.value?.$el
    if (el) page.pageSize = await getPageSize(el)
    _clientHeight = document.body.clientHeight
    window.onresize = debounce(async function () {
        if (page.total <= page.pageSize) return
        let clientHeight = document.body.clientHeight
        if (clientHeight - _clientHeight + remainder < 48) return
        _clientHeight = clientHeight
        page.pageSize = await getPageSize(el)
        getVipList()
    }, 1000)
    getVipList()
})
onBeforeUnmount(() => window.onresize = null)
/* End - 动态计算列表数据容量，设置pageSize */

// 获取列表数据 
const getVipList = async () => {
    loading.value = true
    let options = {
        page: currentPage.value,
        listRows: page.pageSize,
        search: search.value,
        birthday: birthdayVal.value,
        vip: statusVal.value
    }
    // console.log(options);
    let [error, { data, code }] = await apis.getVips(options)
    if (error || 1 !== code) return loading.value = false
    page.total = +data.list.total || 0
    userList.value = data.list.data
    loading.value = false
}
// 替换空数据
const replace = (row, column, cellValue, index) => {
    if (/^\d+$/.test(cellValue)) return +cellValue || '-'
    return cellValue || '-'
}

// 获取会员基本设置
if (!store.setting.discount_ratio) {
    apis.getVipSetting().then(([error, { data: { data }, code }]) => {
        if (error || 1 !== code) return false
        data.is_open = !!+data.is_open
        data.one_pay_money_open = !!+data.one_pay_money_open
        store.setSetting(data)
    })
}

// 对话框显隐
const dialogInfoVisible = ref(false)
const isEdit = ref(false) // 是否编辑状态
const vipInfo = ref({}) // 对话框数据
// 单条数据点击
const rowClick = row => {
    if (isEdit.value) isEdit.value = false
    vipInfo.value = row
    dialogInfoVisible.value = true
}
const editForm = reactive({})
const editFn = () => {
    let { nickName, mobile, birthday, detail, gender, memo } = vipInfo.value
    if (!+mobile) mobile = ''
    Object.assign(editForm, { nickName, mobile, birthday, detail, gender, memo })
    if (vipInfo.value.birthday) editForm.birthday = new Date(vipInfo.value.birthday).getTime()
    isEdit.value = true
}

const visible = ref(false) // 拓展提示框显隐
const triggerRef = ref() // 拓展提示框位置
const triggerTxt = ref('') // 内容
const onHoverTip = event => {
    let target = event.currentTarget
    if (target.scrollHeight <= target.offsetHeight) return
    triggerRef.value = target
    triggerTxt.value = target.innerText
    visible.value = true
}

const handleUnd = data => replace(null, null, data)

// 提交修改
const editLoading = ref(false)
const submitEdit = async () => {
    let options = {}
    if (vipInfo.value.nickName && !editForm.nickName) return ElMessage.warning({ message: '未填写会员名称', grouping: true })
    if (+vipInfo.value.mobile && !+editForm.mobile) return ElMessage.warning({ message: '未填写手机号', grouping: true })
    for (const key in editForm) {
        if (Object.hasOwnProperty.call(editForm, key)) {
            const value = editForm[key];
            if (key === 'mobile') {
                if (value != +vipInfo.value.mobile) options.mobile = value
            } else if (key === 'birthday') {
                let tempDate = formatDate(value, 'yyyy-MM-dd')
                if (tempDate != vipInfo.value.birthday) options.birthday = value.getTime()
            } else if (value !== vipInfo.value[key]) options[key] = value
        }
    }
    if (!Object.keys(options).length) return isEdit.value = false
    if (options.gender) options.gender = +{ '男': 1, '女': 2 }[options.gender]
    options.user_id = vipInfo.value.user_id
    editLoading.value = true
    let [error, { code }] = await apis.setVip(options)
    editLoading.value = false
    if (error || 1 !== code) {
        ElMessage('保存失败')
        return isEdit.value = false
    }
    ElMessage.success('保存成功')
    dialogInfoVisible.value = false
    getVipList()
}

// 激活|注销 会员
const handleUserToVip = type => ElMessageBox({
    title: '提示',
    message: h('p', null, [
        '确定',
        h('i', { style: 'margin: 0 5px;color: teal' }, type ? '激活' : '注销'),
        '会员信息？'
    ]),
    cancelButtonText: '取消',
    confirmButtonText: type ? '激活' : '注销',
    center: true,
    showCancelButton: true,
    showClose: false,
    draggable: true,
    customStyle: {
        display: 'block',
        margin: '18vh auto 0'
    },
    async beforeClose(action, instance, done) {
        if (action !== 'confirm') return done()
        instance.confirmButtonLoading = true
        let [error, { code }] = await apis[`${type ? 'become' : 'cancel'}Vip`](vipInfo.value.user_id)
        if (error || 1 !== code) ElMessage(type ? '激活' : '注销' + '失败，请重试！')
        else {
            ElMessage.success((type ? '激活' : '注销') + '成功')
            vipInfo.value.vip = +type
            dialogInfoVisible.value = false
        }
        done()
    },
    callback() { }
})

// 判断管理员信息是否存在
const judgeAdminId = callback => {
    if (!userStore.userInfo.store_user_id) {
        const loadingRef = ElLoading.service({ text: '正在初始化管理员信息', fullscreen: true })
        return userStore.getUserInfo(apis.getAdminInfo, callback, loadingRef)
    }
    callback()
}

// 修改会员积分
const handleVipIntegral = () => judgeAdminId(handleVipIntegralCallback)
const handleVipIntegralCallback = (res, loadingRef) => {
    loadingRef?.close()
    if (res && (res[0] || 1 !== res[1]?.code)) return false
    const integral = reactive({
        checked: true,
        val: ''
    })
    ElMessageBox({
        message: () => h('div', null, [
            h('div', null, [
                h('span', null, '修改方式：'),
                h(ElSwitch, {
                    modelValue: integral.checked,
                    'onUpdate:modelValue': val => integral.checked = val,
                    activeText: "增加",
                    inactiveText: "减少",
                    inlinePrompt: true,
                    style: "--el-switch-off-color: #F56C6C",
                    disabled: !+vipInfo.value.points
                })
            ]),
            h('div', { style: 'margin-top: 5px' }, [
                h(ElInput, {
                    modelValue: integral.val,
                    'onUpdate:modelValue': value => integral.val = value,
                    placeholder: `请输入积分数量`,
                    formatter: value => {
                        value = value.replace(/^0|\D/g, '')
                        if (value > 9999999) value = '9999999'
                        return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    },
                })
            ])
        ]),
        title: `当前可用积分：${vipInfo.value.points}`,
        showCancelButton: true,
        cancelButtonText: '取消',
        confirmButtonText: '保存',
        showClose: false,
        center: true,
        draggable: true,
        autofocus: false,
        async beforeClose(action, instance, done) {
            if (action !== 'confirm') return done()
            let integralNum = +integral.val.replace(/\$\s?|(,*)/g, '')
            if (!integralNum) return ElMessage.warning({ message: '请输入积分数量', grouping: true })
            if (!integral.checked && integralNum > vipInfo.value.points) return ElMessage.warning({ message: `此用户积分不足，最多只能减少 ${vipInfo.value.points} 积分`, grouping: true })
            instance.confirmButtonLoading = true
            let [error, { code }] = await apis.vipRecharge({
                user_id: vipInfo.value.user_id,
                mode: integral.checked ? 'inc' : 'dec',
                num: integralNum,
                source: 1,
                remark: userStore.userInfo.real_name + '后台充值',
                store_user_name: userStore.userInfo.real_name,
            })
            if (error || 1 !== code) ElMessage('保存失败')
            else {
                ElMessage.success('保存成功')
                let num = +vipInfo.value.points
                vipInfo.value.points = integral.checked ? num + integralNum : num - integralNum
                dialogInfoVisible.value = false
            }
            done()
        },
        callback() { }
    })
}

// 会员余额充值
const balanceRechargeVisible = ref(false)
const BalRecForm = reactive({
    giveMoney: '',
    rechargeMoney: ''
})
const rechargeRecord = ref([]) // 表格数据
const tablePageOption = reactive({
    currentPage: 1,
    pageSize: 5,
    total: 0,
})
// 页数改变 重新获取数据
watch(() => tablePageOption.currentPage, () => getRecordList())
// 打开充值对话框
const serverError = ref(false) // 表格数据加载是否错误
const tableLoading = ref(false) // 表格数据加载中
const getRecordList = async () => {
    tableLoading.value = true
    let [error, { code, data: { data } }] = await apis.getBalanceRecord({
        user_id: vipInfo.value.user_id,
        // user_id: 10126,
        page: tablePageOption.currentPage,
        listRows: tablePageOption.pageSize
    })
    tableLoading.value = false
    if (error || 1 !== code) return rechargeRecord.value = true
    console.log(data);
    tablePageOption.total = data.total
    rechargeRecord.value = data.data
}
const rechargeBtnClick = () => judgeAdminId(rechargeBtnClickCallback)
const rechargeBtnClickCallback = () => {
    balanceRechargeVisible.value = true
    tablePageOption.total = 0
    if (tablePageOption.currentPage - 1) tablePageOption.currentPage = 1
    else getRecordList()
}

const priceBlur = key => {
    let money = priceBlurFormatter(BalRecForm[key])
    BalRecForm.rechargeMoney = +money ? money : ''
}
const balRecLoading = ref(false)
const balRecSubmit = async () => {
    if (!BalRecForm.rechargeMoney) return ElMessage.warning({ message: '请输入充值金额', grouping: true })
    balRecLoading.value = true
    let [error, { code }] = await apis.vipRecharge({
        user_id: vipInfo.value.user_id,
        mode: 'inc',
        num: BalRecForm.rechargeMoney,
        source: 0,
        remark: userStore.userInfo.real_name + '后台充值',
        store_user_name: userStore.userInfo.real_name,
    })
    balRecLoading.value = false
    if (error || 1 !== code) return ElMessage('充值失败')
    ElMessage.success('充值成功')
    let num = +vipInfo.value.balance
    vipInfo.value.balance = priceBlurFormatter(+BalRecForm.rechargeMoney + num)
    BalRecForm.rechargeMoney = ''
    getRecordList()
}

</script>
<template>
    <el-scrollbar>
        <el-container class="container">
            <el-header class="header">
                <div class="box">
                    <el-button size="large" text @click="router.back()">
                        <el-icon>
                            <epArrowLeftBold />
                        </el-icon>
                        返回 [ESC]
                    </el-button>
                </div>
                <span class="title">会员管理</span>
                <div class="box herder-right">
                    <el-button class="radius" plain size="large"
                        @click="router.push({ name: 'vipSetting' })">会员设置</el-button>
                </div>
            </el-header>
            <el-main class="main pageBgColor">
                <div class="top">
                    <div class="left">
                        <el-input v-model="search" class="large search radius" placeholder="请输入姓名/手机号/刷卡" clearable
                            @change="getVipList" />
                        <el-select v-model="birthdayVal" class="large radius select" placeholder="生日设置" size="large"
                            @change="getVipList">
                            <el-option v-for="item in birthdayOptions" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                        <el-select v-model="statusVal" class="large radius select" placeholder="会员状态" size="large"
                            @change="getVipList">
                            <el-option v-for="item in statusOption" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                        <div class="discount">
                            <el-button class="radius discount-btn" plain size="large" disabled>批量修改折扣</el-button>
                        </div>
                    </div>
                    <div class="right">
                        <el-button class="addBtn radius" plain size="large" disabled>批量导入</el-button>
                        <el-button class="addBtn radius" type="primary" size="large" disabled>新增会员</el-button>
                    </div>
                </div>
                <div class="content">
                    <div class="table" v-loading="loading" element-loading-text="Loading...">
                        <el-table class="table-main" ref="multipleTableRef" :data="userList" stripe size="large"
                            @selection-change="val => selectionDatas = val" @row-click="rowClick">
                            <el-table-column type="selection" width="55" />
                            <el-table-column prop="nickName" label="姓名" min-width="160" show-overflow-tooltip
                                :formatter="replace" />
                            <el-table-column prop="mobile" label="手机号" show-overflow-tooltip align="center"
                                :formatter="replace" />
                            <el-table-column prop="birthday" label="生日" width="120" align="center">
                                <template #default="scope">
                                    {{ formatDate(replace(scope.row, scope.column, scope.row.birthday, scope.$index),
                                    'yyyy-MM-dd') }}
                                </template>
                            </el-table-column>>
                            <el-table-column label="折扣" align="center">
                                {{ store.setting.discount_ratio ? `${store.setting.discount_ratio}折` : '-' }}
                            </el-table-column>
                            <el-table-column prop="balance" label="储值余额" min-width="100" show-overflow-tooltip
                                align="center" />
                            <el-table-column prop="points" label="会员积分" min-width="100" show-overflow-tooltip
                                align="center" />
                            <el-table-column prop="create_time" label="注册时间" width="120" align="center"
                                :formatter="(row, column, cellValue) => cellValue.split(' ')[0] || '-'" />
                            <el-table-column prop="vip" label="会员状态" width="100" align="center">
                                <template #default="scope">
                                    <el-tag :type="+scope.row.vip ? 'success' : 'info'" size="small">
                                        {{ `${+scope.row.vip ? '激活' : '注销'}` }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                        </el-table>
                        <el-pagination class="pagination" v-model:current-page="currentPage" :total="page.total"
                            :page-size="page.pageSize" layout="total, prev, pager, next" hide-on-single-page />
                    </div>
                </div>
            </el-main>
        </el-container>
    </el-scrollbar>
    <el-dialog class="vipUserDialog" v-model="dialogInfoVisible" title="会员信息" width="550" draggable
        :close-on-click-modal="false">
        <!-- <el-space size="large" fill direction="vertical" style="width: 100%;"> -->
        <header class="face">
            <el-avatar :size="50" :src="vipInfo.avatarUrl">
                <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" />
            </el-avatar>
            <div class="name">
                <p v-if="!isEdit">{{ handleUnd(vipInfo.nickName) }}</p>
                <el-row v-else align="middle">
                    <span class="tit" style="margin-right: 10px;">会员姓名</span>
                    <el-input v-model="editForm.nickName" style="flex: .6;" placeholder="请输入名称" maxlength="10" />
                </el-row>
                <p v-if="!isEdit">{{ handleUnd(vipInfo.mobile) }}</p>
                <el-row v-else align="middle">
                    <span class="tit" style="margin-right: 10px;">联系电话</span>
                    <el-input v-model="editForm.mobile" :formatter="value => `${value}`.replace(/\D/g, '')"
                        style="flex: .6;" placeholder="请输入手机号" maxlength="20" />
                </el-row>
            </div>
            <el-button v-show="vipInfo.vip" type="danger" @click="handleUserToVip(0)">注销</el-button>
            <el-button v-show="!vipInfo.vip" @click="handleUserToVip(1)">激活</el-button>
        </header>
        <el-divider />
        <el-row class="assets">
            <el-col :span="14">
                <div class="integral">
                    <div>可用积分</div>
                    <div class="num">
                        <span>{{ vipInfo.points || 0 }}</span>
                        <el-icon style="cursor: pointer;" @click="handleVipIntegral">
                            <epEdit />
                        </el-icon>
                    </div>
                </div>
            </el-col>
            <el-col :span="10">
                <div class="balance">
                    <div>余额（元）</div>
                    <div class="num">
                        <span>{{ vipInfo.balance || '0.00' }}</span>
                        <el-button type="warning" plain @click="rechargeBtnClick">充值</el-button>
                    </div>
                </div>
            </el-col>
        </el-row>
        <el-divider />
        <div class="info">
            <div class="item">
                <span class="tit">会员生日</span>
                <span class="con" v-if="!isEdit">{{ handleUnd(vipInfo.birthday) }}</span>
                <el-date-picker v-else v-model="editForm.birthday" type="date" :clearable="false" placeholder="请选择日期" />
            </div>
            <div class="item">
                <span class="tit">联系地址</span>
                <span v-if="!isEdit" class="con" @mouseover="onHoverTip">{{ handleUnd(vipInfo.detail) }}</span>
                <el-input v-else v-model="editForm.detail" placeholder="请输入地址" maxlength="50" />
            </div>
            <div class="item">
                <span class="tit">性别</span>
                <span class="con" v-if="!isEdit">{{ vipInfo.gender }}</span>
                <el-radio-group v-else v-model="editForm.gender">
                    <el-radio label="男">男</el-radio>
                    <el-radio label="女">女</el-radio>
                </el-radio-group>
            </div>
            <div class="item">
                <span class="tit">备注</span>
                <span v-if="!isEdit" class="con" @mouseover="onHoverTip">{{ handleUnd(vipInfo.memo) }}</span>
                <el-input v-else v-model="editForm.memo" placeholder="请输入备注(20字)" maxlength="20" />
            </div>
        </div>
        <el-tooltip v-model:visible="visible" :content="triggerTxt" effect="light" trigger="hover" virtual-triggering
            :virtual-ref="triggerRef" />
        <template #footer>
            <div class="dialog-footer" v-if="!isEdit">
                <el-button type="primary" size="large" style="width: 100px" @click="editFn">编辑</el-button>
            </div>
            <div class="dialog-footer" v-else>
                <el-button plain size="large" style="width: 100px" @click="isEdit = false">取消</el-button>
                <el-button type="primary" size="large" :loading="editLoading" style="width: 100px"
                    @click="submitEdit">保存</el-button>
            </div>
        </template>
    </el-dialog>
    <el-dialog class="balanceRechargeDialog" v-model="balanceRechargeVisible" title="会员充值" center width="800" draggable
        :close-on-click-modal="false" align-center>
        <div class="b-r-block">
            <el-row>
                <el-col :span="12">
                    <el-descriptions :column="1" class="fWeight">
                        <el-descriptions-item label="会员姓名:">{{ handleUnd(vipInfo.nickName) }}</el-descriptions-item>
                        <el-descriptions-item label="手机号:">{{ handleUnd(vipInfo.mobile) }}</el-descriptions-item>
                        <el-descriptions-item label="当前余额:">{{ vipInfo.balance }}</el-descriptions-item>
                    </el-descriptions>
                </el-col>
                <el-col :span="12">
                    <el-form :model="BalRecForm" class="fWeight" label-width="80px">
                        <el-form-item label="充值金额" required>
                            <el-input v-model="BalRecForm.rechargeMoney" :formatter="priceFormatter"
                                @blur="priceBlur('rechargeMoney')" onfocus="this.select()" style="width: auto;" />
                            <template #error>
                                <div class="el-form-item__error">请输入充值金额</div>
                            </template>
                        </el-form-item>
                        <el-form-item label="赠送金额">
                            <el-input v-model="BalRecForm.giveMoney" disabled style="width: auto;" />
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" :loading="balRecLoading" @click="balRecSubmit">充值</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
        </div>
        <el-divider />
        <div class="b-r-record" v-loading="tableLoading">
            <el-table v-if="!serverError" :data="rechargeRecord" style="width: 100%;max-height: 285px;">
                <el-table-column prop="create_time" label="日期" min-width="130" />
                <el-table-column prop="money" label="充值/消费/赠送" align="center" />
                <el-table-column prop="scene.text" label="来源" align="center" />
                <el-table-column prop="remark" label="描述" align="center" />
                <el-table-column prop="account_type"
                    :formatter="(row, column, cellValue) => ['现金', '微信', '支付宝'][cellValue - 1]" label="收款账户"
                    align="center" />
            </el-table>
            <el-pagination v-if="!serverError" class="pagination" v-model:current-page="tablePageOption.currentPage"
                :total="tablePageOption.total" :page-size="tablePageOption.pageSize" layout="total, prev, pager, next"
                style="margin-top: 5px;" />
            <el-result v-else icon="error" title="加载余额记录出错" sub-title="请关闭对话框重新打开加载余额记录">
                <template #extra>
                    <el-button type="primary" @click="balanceRechargeVisible = serverError = false">关闭</el-button>
                </template>
            </el-result>
        </div>
    </el-dialog>
</template>
<style scoped>
@import url(~/assets/style/common.css);

.herder-right {
    text-align: right;
    padding-right: 12px;
}

.select {
    width: 130px;
    height: 100%;
}

.select:deep(div) {
    height: 100%;
    box-sizing: border-box;
}

.select:deep(input) {
    padding: 0 5px;
}

.discount {
    display: inline-block;
    width: 120px;
    height: 100%;
}

.discount-btn {
    width: 100%;
    height: 100%;
    font-size: 15px;
}

.discount-btn:not(.is-disabled):hover {
    color: var(--el-button-text-color);
    border-color: var(--el-border-color-hover);
}

.discount-btn:not(.is-disabled):focus {
    color: var(--el-button-text-color);
    border-color: var(--el-button-hover-border-color);
}

.discount-btn:not(.is-disabled):active {
    color: var(--el-button-active-text-color);
    background-color: var(--el-color-primary-light-9);
}

.face {
    display: flex;
    align-items: center;
    line-height: 1;
}

.face .name {
    flex: 1;
    padding: 0 20px;
}

.face .name p {
    min-height: 32px;
    line-height: 32px;
}

.assets {
    color: var(--el-color-warning);
}

.assets .num {
    display: flex;
    align-items: center;
    height: 40px;
    font-size: 24px;
    font-weight: bolder;
}

.assets .num span {
    min-width: 120px;
}

.info {
    display: grid;
    grid-template-columns: repeat(2, calc(50% - 10px));
    /* grid-template-rows: 40px; */
    grid-gap: 5px 20px;
}

.info .item {
    display: flex;
    align-items: center;
    line-height: 1;
    min-height: 34px;
}

.tit {
    display: inline-block;
    min-width: 4em;
    margin-right: 20px;
    font-weight: bold;
    /* text-align: right; */
}

.info .con {
    flex: 1;
    color: var(--el-color-info);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.1;
}

.fWeight:deep(.el-descriptions__cell),
.fWeight:deep(.el-form-item__label) {
    /* font-size: 15px; */
    font-weight: bold;
}
</style>
<style>
.vipUserDialog .el-dialog__body,
.vipUserDialog .el-dialog__footer {
    padding-left: 50px;
    padding-right: 50px;
}
</style>
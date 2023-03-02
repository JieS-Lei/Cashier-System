<script setup>
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router'
import { apis } from '~/apis'
import { formatDate, priceBlurFormatter } from '~/utils'

const router = useRouter()

const todayStr = formatDate(Date.now(), 'yyyy-MM-dd')
// const todayStart = new Date(`${todayStr} 00:00:00`),
//   todayEnd = new Date(`${todayStr} 23:59:59`)

const todayStart = new Date(`2023-1-1 00:00:00`),
  todayEnd = new Date(`${todayStr} 23:59:59`)
const options = reactive({
  keywords: '',
  user_keywords: '',
  date: [todayStart, todayEnd],
  pay_type: '',
  type: ''
})
const page = reactive({ // 分页参数
  current: 1, // 当前页
  pageSize: 20, // 一页的数据数量
  total: 0, // 总条数
  total_money: '0.00', // 总金额
})
const loading = ref(false)
const noMore = computed(() => (page.current - 1) * page.pageSize >= page.total)
const disabled = computed(() => loading.value || noMore.value)

// 选择日期后，默认选中的时间
const defaultTime = [new Date(2000, 1, 1, 8, 0, 0), new Date(2000, 2, 1, 23, 59, 59)]

// 支付方式选择列表
const PayMethodList = {
  '': '全部支付方式',
  'cash': '现金',
  'weixin': '微信',
  'alipay': '支付宝'
}

// 订单类型选择列表
const orderTypeList = [
  { label: '全部单据', value: '' },
  { label: '收款', value: '0' },
  { label: '退款', value: '1' },
]

// 订单查询
const mapList = ref(new Map())
const findLoading = ref(false)
const submit = async () => {
  findLoading.value = true
  let parameter = {
    ...options,
    start_time: options.date[0].getTime() / 1000,
    end_time: options.date[1].getTime() / 1000,
    listRows: page.pageSize,
    page: page.current
  }
  delete parameter.date
  let [error, { code, data }] = await apis.getOrderList(parameter)
  findLoading.value = false
  if (error || 1 !== code) return ElMessage('订单列表查询失败')
  page.total = data.list.total
  page.total_money = data.list.total_money
  console.log(data)
  let list = data.list.data ?? []
  list.forEach(element => {
    if (mapList.value.has(element.day)) mapList.value.get(element.day).child.push(...element.child)
    else mapList.value.set(element.day, element)
  });
  if (!defaultActive.value && list.length) defaultActive.value = list[0].child[0].order_sn
  page.current++
}
submit()

// 默认选中
const defaultActive = ref('')
const handleSelect = id => defaultActive.value = id

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
        <span class="title">销售明细</span>
        <div class="box herder-right">
        </div>
      </el-header>
      <el-main class="main pageBgColor">
        <div class="top" style="height: auto;">
          <div class="left">
            <el-input v-model="options.keywords" class="large radius " placeholder="商品名称/条码/首字母/扫码/备注" clearable />
            <el-input v-model="options.user_keywords" class="large radius" placeholder="请输入会员姓名/手机号" clearable
              style="width: 240px;" />
            <el-date-picker class="date radius" v-model="options.date" type="datetimerange" :default-time="defaultTime"
              range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
            <el-select v-model="options.pay_type" class="radius select" placeholder="支付方式" style="width: 140px;">
              <el-option v-for="(key, val) in PayMethodList" :key="key" :label="key" :value="val" />
            </el-select>
            <el-select v-model="options.type" class="radius select" placeholder="订单类型">
              <el-option v-for="item in orderTypeList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <div>
              <el-button class="addBtn radius" type="primary" style="width: 100px;" @click="submit">查询</el-button>
            </div>
          </div>
          <div class="right">
            <el-button class="addBtn radius" type="primary" style="height: 44px;">导出表格</el-button>
          </div>
        </div>
        <el-container class="content" style="overflow-y: auto;">
          <el-aside class="aside" width="360px">
            <el-scrollbar style="height: calc(100% - 50px);">
              <el-menu :default-active="defaultActive" class="menu" @select="handleSelect" v-infinite-scroll="submit"
                :infinite-scroll-disabled="disabled" :infinite-scroll-immediate="false">
                <el-menu-item-group v-for="[key, value] in mapList">
                  <template #title class="dateTip">
                    <span>{{ key }}</span>
                    <span>{{ value.total_pay_amount }}</span>
                  </template>
                  <el-menu-item :index="row.order_sn" v-for="row of value.child">
                    <div class="menu-item-box" style="padding-top:3px;">
                      <span>{{ PayMethodList[row.pay_type] ?? '**' }}支付</span>
                      <span>10.00</span>
                    </div>
                    <div class="menu-item-box" style="padding-bottom:3px;">
                      {{ formatDate(row.create_time * 1000, 'HH:mm:ss') }}
                    </div>
                  </el-menu-item>
                </el-menu-item-group>
              </el-menu>
            </el-scrollbar>
            <div class="amountTo">
              <span>共{{ page.total }}单</span>
              <span>合计：￥{{ priceBlurFormatter(page.total_money) }}</span>
            </div>
          </el-aside>
          <el-main class="content-main">
            <div class="content-main-top">
              <span>销售单详情</span>
              <span>
                <el-button>退货</el-button>
                <el-button>打印</el-button>
              </span>
            </div>
            <p>单号：XSD23030200001.1</p>
            <p>时间：2023-03-02 10:40:00</p>
            <el-table :data="tableData" class="table">
              <el-table-column type="index" width="20" />
              <el-table-column prop="date" label="名称" width="180" />
              <el-table-column prop="name" label="条码" />
              <el-table-column prop="address" label="数量" />
              <el-table-column prop="address" label="单价" />
              <el-table-column prop="address" label="折扣" />
              <el-table-column prop="address" label="小计" />
            </el-table>
            <div class="footer">
              <div>
                <span>收银员：管理员</span>
                <span>优惠：￥0.00</span>
                <span>结算方式：现金</span>
                <span>说明：无</span>
              </div>
              <div>
                <span>应收：￥10.00</span>
                <span>实收：￥10.00</span>
              </div>
              <div>
                <span>找零：￥0.00</span>
              </div>
            </div>
          </el-main>
        </el-container>
      </el-main>
    </el-container>
  </el-scrollbar>
</template>
<style scoped>
@import url(~/assets/style/common.css);

.content .aside,
.content .content-main {
  /* border: 1px solid var(--el-border-color-light); */
  background-color: var(--el-bg-color-overlay);
}

.aside {
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  /* border-right: 1px solid var(--el-border-color-light); */
  box-sizing: border-box;
}

.aside:deep(.el-scrollbar__view) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.aside:deep(.el-menu) {
  flex: 1;
}

.aside .amountTo {
  height: 50px;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: bolder;
  color: #fff;
  background-color: var(--el-color-primary);
}

.menu:deep(.el-menu-item-group__title) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 40px;
}

.menu:deep(.el-menu-item.is-active) {
  background-color: var(--el-menu-hover-bg-color);
}

.menu:deep(.el-menu-item) {
  flex-direction: column;
  align-items: normal;
}

.menu-item-box {
  display: flex;
  justify-content: space-between;
  height: 50%;
  line-height: 1;
  align-items: center;
}

.content-main {
  padding: 5px 0;
  display: flex;
  flex-direction: column;
}

.content-main-top {
  padding: 5px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: bolder;
  color: var(--el-color-primary);
}

.content-main>p {
  padding: 3px 20px;
  font-size: 14px;
  font-weight: bolder;
  line-height: 1;
}

.content-main .table {
  display: flex;
  width: 100%;
}

.content-main .footer {
  padding: 0 20px;
  display: flex;
  align-items: center;
}

.content-main .footer>div {
  flex: 1;
  display: flex;
  flex-direction: column;
  line-height: 2;
}

.top .left {
  margin-top: -10px;
  margin-left: -10px;
  margin-right: 100px;
  width: 300px;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
}

.top .left>div {
  margin-top: 10px;
  margin-left: 10px;
  height: 44px;
}

.large {
  width: 300px;
  height: 100%;
}

:deep(.date) {
  margin-top: 10px;
  margin-left: 10px;
  height: 44px;
  flex-grow: 0;
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
</style>
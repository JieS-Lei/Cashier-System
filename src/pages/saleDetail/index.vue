<script setup>
import { useRouter } from 'vue-router'
import { apis } from '~/apis'
import { formatDate } from '~/utils'

const router = useRouter()

const todayStr = formatDate(Date.now(), 'yyyy-MM-dd')
const todayStart = new Date(`${todayStr} 00:00:00`),
  todayEnd = new Date(`${todayStr} 23:59:59`)
const options = reactive({
  search: '',
  search1: '',
  date: [todayStart, todayEnd],
  PayMethod: '',
  orderType: ''
})

// 选择日期后，默认选中的时间
const defaultTime = [new Date(2000, 1, 1, 8, 0, 0), new Date(2000, 2, 1, 23, 59, 59)]

// 支付方式选择列表
const PayMethodList = [
  { label: '全部支付方式', value: '' },
  { label: '现金', value: 'cash' },
  { label: '微信', value: 'weixin' },
  { label: '支付宝', value: 'alipay' },
]

// 订单类型选择列表
const orderTypeList = [
  { label: '全部单据', value: '' },
  { label: '收款', value: '0' },
  { label: '退款', value: '1' },
]

// 订单查询
const submit = () => {

}

// 默认选中
const defaultActive = ref('1')
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
            <el-input v-model="options.search" class="large radius " placeholder="商品名称/条码/首字母/扫码/备注" clearable />
            <el-input v-model="options.search1" class="large radius" placeholder="请输入会员姓名/手机号" clearable
              style="width: 240px;" />
            <el-date-picker class="date radius" v-model="options.date" type="datetimerange" :default-time="defaultTime"
              range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
            <el-select v-model="options.PayMethod" class="radius select" placeholder="支付方式" style="width: 140px;">
              <el-option v-for="item in PayMethodList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-select v-model="options.orderType" class="radius select" placeholder="订单类型">
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
              <el-menu :default-active="defaultActive" class="menu" @select="handleSelect">
                <div class="dateTip">
                  <span>2023-03-01</span>
                  <span>10.00</span>
                </div>
                <el-menu-item index="1">
                  <span>店铺设置</span>
                </el-menu-item>
                <el-menu-item index="2">
                  <span>密码修改</span>
                </el-menu-item>
              </el-menu>
            </el-scrollbar>
            <div class="amountTo">
              <span>共1单</span>
              <span>合计：￥10.00</span>
            </div>
          </el-aside>
          <el-main class="main">
            <el-scrollbar>
              <div style="width: 100%;height: 100%;">sdabjksajdhk </div>
            </el-scrollbar>
          </el-main>
        </el-container>
      </el-main>
    </el-container>
  </el-scrollbar>
</template>
<style scoped>
@import url(~/assets/style/common.css);

.content .aside,
.content .main {
  /* border: 1px solid var(--el-border-color-light); */
  padding: 5px 0;
  background-color: var(--el-bg-color-overlay);
}

.aside {
  padding-bottom: 0 !important;
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

.dateTip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 30px;
  font-size: 14px;
  color: #fff;
  background-color: var(--el-color-primary);
}

.menu:deep(.el-menu-item.is-active) {
  background-color: var(--el-menu-hover-bg-color);
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
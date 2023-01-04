<script setup>
import { apis } from '~/apis'
import { genFileId } from 'element-plus'
import { useGoodsStore } from '~/store/modules/goodsStore'
import { storeToRefs } from 'pinia'
import { priceChangeFormatter as priceFormatter, priceBlurFormatter } from '~/utils'

const emit = defineEmits(['done', 'typeClick', 'unitClick', 'updata'])
const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  rowForm: Object
})
const store = useGoodsStore()
const { checkedType, checkedUnit, rowForm } = storeToRefs(store)

const formRef = ref() // 表单实例
const defaultFrom = {
  goods_name: '', // 名称
  short_name: '', // 简称
  goods_no: '', // 条码
  goods_price: '0.00', // 售价
  goods_cost_price: '0.00', // 进价
  goods_vip_price: '0.00', // vip价格
  goods_unit: computed(() => checkedUnit.value.unit_id ?? ''), // 商品单位
  category_id: checkedType.value.id ?? '', // 商品分类id
  stock_num: 0, // 库存
  goods_production_date: '', // 生产日期
  goods_expiration_day: '', // 保质期
  image_id: '' // 图片id
}
const form = reactive({
  ...defaultFrom
})

watch(checkedType, () => {
  form.category_id = checkedType.value.id ?? ''
  if (formRef.value) formRef.value.validateField('category_id', (isValid, invalidFields) => {
    if (!isValid) return console.warn(invalidFields);
  })
})

// 是否单行数据点击打开
const isRow = ref(!!rowForm.value.goods_id)
watch(rowForm, newVal => {
  isRow.value = !!newVal.goods_id
  if (!isRow.value) return
  form.goods_name = rowForm.value.goods_name
  form.short_name = rowForm.value.short_name
  form.goods_no = rowForm.value.goods_no
  form.goods_price = rowForm.value.goods_sku.goods_price
  form.goods_vip_price = rowForm.value.goods_sku.goods_vip_price
  form.goods_cost_price = rowForm.value.goods_sku.goods_cost_price
  form.stock_num = rowForm.value.goods_sku.stock_num
  form.goods_expiration_day = rowForm.value.goods_sku.goods_expiration_day
  let unitId = rowForm.value.goods_sku.goods_unit,
    typeObj = rowForm.value.category ?? {},
    date = rowForm.value.goods_sku.goods_production_date,
    imageObj = rowForm.value.image[0]
  if (date) {
    form.goods_production_date = new Date(date * 1000)
  }
  if (typeObj.category_id) checkedType.value = {
    label: typeObj.name,
    id: typeObj.category_id
  }
  if (unitId) {
    checkedUnit.value = {
      unit_id: unitId,
      name: rowForm.value.goods_sku.goods_unit_name
    }
  }
  if (imageObj && imageObj.image_id) {
    form.image_id = imageObj.image_id
    fileList.value.push({
      name: imageObj.file_name,
      url: imageObj.file_path
    })
  }
})

// blur时完善输入的金额
const priceBlur = key => form[key] = priceBlurFormatter(form[key])

const rules = reactive({
  goods_name: { required: true, message: '请填写商品名单', trigger: 'blur' },
  goods_price: { required: true, message: '请输入价格', trigger: 'blur' },
  category_id: { required: true, message: '请选择分类' }
})

// 库存输入框格式化函数
const numFormatter = value => {
  value = value.replace(/[^\d\-\.]|(?<=.)-|(?<=\.\d*)\.|(?<=^0)0|(?<=\.\d{3})(.*)/g, '')
  // 点开头自动补0
  value = value.replace(/^(-)?\./, (val, matchVal) => `${matchVal || ''}0.`)
  if (+value >= 99999) value = '99999'
  if (+value <= -99999) value = '-99999'
  return value
}

// blur时完善库存
const numBlur = () => {
  if (!form.stock_num || form.stock_num === '-' || 0 === Number(form.stock_num)) {
    return form.stock_num = 0
  } else if (Number.isNaN(form.stock_num)) return form.stock_num = 0
  form.stock_num.toString()
  form.stock_num = form.stock_num.replace(/^0(?=[0-9])|\.$/, '')
}

// 上传
const uploadRef = ref() // 上传组件实例
const fileList = ref([]) // 上传文件列表
const dialogImageUrl = ref('') // 大图预览路径
const dialogVisible = ref(false) // 大图预览开关
// 允许上传的文件类型
const accept = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif'
]

// 上传限制
const beforeAvatarUpload = rawFile => {
  if (!accept.includes(rawFile.type)) {
    ElMessage.error('只能上传 JPG|JPEG|PNG|GIF 类型图像!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('图像限制在 2MB 以内')
    return false
  }
  return true
}

// 覆盖替换
const handleExceed = files => {
  uploadRef.value.clearFiles()
  const file = files[0]
  file.uid = genFileId()
  uploadRef.value.handleStart(file)
  uploadRef.value.submit()
}

const handleRemove = (uploadFile, uploadFiles) => {
  form.image_id = ''
  console.log(uploadFile, uploadFiles)
}

// 查看大图
const handlePictureCardPreview = file => {
  dialogImageUrl.value = file.url
  dialogVisible.value = true
  console.log(fileList.value);
}

// 上传处理
const upload = options => new Promise((resolve, reject) => {
  apis.upload({
    onProgress: options.onProgress,
    data: {
      'iFile': options.file
    }
  }).then(([err, res]) => {
    if (err || 1 !== res.code) {
      let e = err || res
      return reject(e)
    }
    resolve(res)
    form.image_id = res.data.file_id
  })
})

// 新增商品 | 修改商品[isUpdata]
const submit = (isClose, isUpdata) => {
  if (!formRef.value) return ElMessage.warning('初始化未完成，请稍后重试！')
  formRef.value.validate().then(async isValid => {
    if (!isValid) return console.warn('表单验证失败')
    let options = { ...form }
    // 处理日期
    if (form.goods_production_date) options.goods_production_date = form.goods_production_date.getTime() / 1000
    // 修改商品传入id
    if (isUpdata) options['goods_id'] = rowForm.value.goods_id
    console.log(options);
    let [error, { code }] = await apis[isUpdata ? 'updataGoods' : 'addGoods'](options)
    if (error || 1 !== code) return ElMessage(`商品${isUpdata ? '修改' : '新增'}失败`)
    ElMessage.success(`商品${isUpdata ? '修改' : '新增'}成功`)
    if (isUpdata) {
      checkedUnit.value = {} // 清空选中单位
      checkedType.value = {} // 清空选中分类
      formRef.value.resetFields()
    }
    emit('updata')
    if (isClose) close()
    else clearFrom()
  }).catch(err => {
    console.warn('error', err)
  })
}

// 清空表单数据
const clearFrom = () => {
  checkedUnit.value = {} // 清空选中单位
  checkedType.value = {} // 清空选中分类
  fileList.value = [] // 图片清空
  formRef.value.resetFields()
  for (const key in defaultFrom) {
    if (Object.hasOwnProperty.call(defaultFrom, key)) form[key] = defaultFrom[key]
  }
}
// 关闭对话框
const close = () => {
  emit('done')
  rowForm.value = {}
  clearFrom() // 清除选中数据
}

// 修改商品信息
const remove = () => {
  ElMessageBox({
    message: '是否删除商品',
    title: '提示',
    confirmButtonText: '删除',
    type: 'warning',
    draggable: true,
    beforeClose: async (action, instance, done) => {
      if (action !== 'confirm') return done()
      instance.confirmButtonLoading = true
      instance.confirmButtonText = '删除中'
      let [error, { code }] = await apis.deleteGoodsById(rowForm.value.goods_id)
      instance.confirmButtonLoading = false
      instance.confirmButtonText = '删除'
      if (error || 1 !== code) return ElMessage('删除失败')
      done()
      close()
      emit('updata')
    }
  })
    .then(() => ElMessage.success('删除成功'))
    .catch(() => false)
}

</script>

<template>
  <el-dialog class="addGoodsDialog" destroy-on-close :model-value="props.show" width="650px" title="新增商品" align-center
    :close-on-click-modal="false" :before-close="close" style="">
    <el-scrollbar height="400px" noresize>
      <el-form ref="formRef" class="from" :model="form" :rules="rules" label-width="80px" scroll-to-error size="large">
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="form.goods_name" maxlength="50" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品条码" prop="goods_no">
              <el-input v-model="form.goods_no" maxlength="16"
                :formatter="value => value = value.replace(/[^\da-zA-Z]/g, '')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品简称" prop="short_name">
              <el-input v-model="form.short_name" maxlength="4" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品分类" prop="category_id">
              <div class="select" @click="$emit('typeClick')">
                {{ checkedType.label ?? '请选择' }}
                <el-icon>
                  <epArrowRight />
                </el-icon>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位">
              <div class="select" @click="$emit('unitClick')">
                {{ checkedUnit.name || '请选择' }}
                <el-icon>
                  <epArrowRight />
                </el-icon>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="零售价" prop="goods_price">
              <el-input class="pad-input" v-model="form.goods_price" :formatter="priceFormatter"
                @blur="priceBlur('goods_price')" onfocus="this.select()" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="进货价" prop="goods_cost_price">
              <el-input class="pad-input" v-model="form.goods_cost_price" :formatter="priceFormatter"
                @blur="priceBlur('goods_cost_price')" onfocus="this.select()" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="会员价" prop="goods_vip_price">
              <el-input class="pad-input" v-model="form.goods_vip_price" :formatter="priceFormatter"
                @blur="priceBlur('goods_vip_price')" onfocus="this.select()" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存数量" prop="stock_num">
              <el-input class="pad-input" v-model="form.stock_num" :formatter="numFormatter" @blur="numBlur"
                onfocus="this.select()" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生产日期" prop="goods_production_date">
              <el-date-picker v-model="form.goods_production_date" type="date" placeholder="请选择生产日期"
                style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="保质期(天)" prop="goods_expiration_day">
              <el-input class="pad-input" v-model="form.goods_expiration_day"
                :formatter="value => (value = value.replace(/\D/g, ''), value = value >= 10000 ? '9999' : value)"
                onfocus="this.select()" />
            </el-form-item>
          </el-col>
        </el-row>
        <div style="display: flex;">
          <el-form-item label="上传图片" prop="image_id" style="margin-bottom: 0;">
            <el-upload ref="uploadRef" class="upload-photo" v-model:file-list="fileList" list-type="picture-card" drag
              :http-request="upload" :accept="accept.join()" :limit="1" :on-exceed="handleExceed"
              :on-remove="handleRemove" :before-upload="beforeAvatarUpload" :on-preview="handlePictureCardPreview">
              <el-icon class="el-icon--upload">
                <ep-upload-filled />
              </el-icon>
              <div class="el-upload__text">
                拖拽 或 <em>单击上传</em>
              </div>
            </el-upload>
            <el-dialog v-model="dialogVisible">
              <img w-full :src="dialogImageUrl" alt="Preview Image" />
            </el-dialog>
          </el-form-item>
          <div class="ps">
            <span>图片建议比例 1:1 (正方形)</span>
            <span>图片类型为：jpg jpeg png gif</span>
            <span>图片大小不超过2MB</span>
          </div>
        </div>
      </el-form>
    </el-scrollbar>
    <template #footer>
      <div v-show="!isRow">
        <el-button @click="close">取消</el-button>
        <el-button @click="submit(false)">新增并继续</el-button>
        <el-button type="primary" @click="submit(true)">立即新增</el-button>
      </div>
      <div class="footer-flex" v-show="isRow">
        <el-button type="danger" @click="remove">删除</el-button>
        <span>
          <el-button @click="close">取消</el-button>
          <el-button type="primary" @click="submit(1, 1)">保存</el-button>
        </span>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.from {
  padding: 0 20px;
  overflow-x: hidden;
}

.select {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 0 15px;
  border-radius: var(--el-border-radius-base);
  box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset;
  transition: var(--el-transition-box-shadow);
}

.select:hover {
  box-shadow: 0 0 0 1px var(--el-border-color-hover) inset;
}

.pad-input:deep(.el-input__wrapper) {
  padding-top: 10px;
  padding-bottom: 10px;
}

.pad-input:deep(input) {
  --el-input-inner-height: 20px;
}

:deep(.el-form-item__label) {
  cursor: default;
  user-select: none;
}

.upload-photo:deep(.el-upload-dragger) {
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.ps {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 25px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.ps span+span {
  margin-top: 5px;
}

.footer-flex {
  padding-left: 20px;
  padding-right: 20px;
  display: flex;
  justify-content: space-between;
}
</style>
<style>
.addGoodsDialog .el-dialog__body {
  padding-left: 0;
  padding-right: 0;
}
</style>

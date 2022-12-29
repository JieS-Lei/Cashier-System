<script setup>
import { apis } from '~/apis'
import { ElMessage, genFileId } from 'element-plus'

const emit = defineEmits(['done', 'typeClick', 'unitClick', 'addEnd'])
const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  itemType: {
    type: Object,
    default: {}
  },
  unitItem: {
    type: Object,
    default: {}
  }
})

const formRef = ref() // 表单实例
const form = reactive({
  goods_name: '', // 名称
  short_name: '', // 简称
  goods_no: '', // 条码
  goods_price: '0.00', // 售价
  goods_cost_price: '0.00', // 进价
  goods_vip_price: '0.00', // vip价格
  goods_unit: computed(() => props.unitItem.unit_id ?? ''), // 商品单位
  category_id: computed(() => props.itemType.id ?? ''), // 商品分类id
  stock_num: 0, // 库存
  goods_production_date: '', // 生产日期
  goods_expiration_day: '', // 保质期
  image: '' // 图片
})

let openCheckedTypeValidate = false
const typeName = computed(() => {
  if (!openCheckedTypeValidate) openCheckedTypeValidate = true
  else if (formRef.value) formRef.value.validateField('category_id', (isValid, invalidFields) => {
    if (!isValid) return console.warn(invalidFields);
  })
  return props.itemType.label ?? '请选择'
})

const rules = reactive({
  goods_name: { required: true, message: '请填写商品名单', trigger: 'blur' },
  goods_price: { required: true, message: '请输入价格', trigger: 'blur' },
  category_id: { required: true, message: '请选择分类' }
})

// 金额输入框格式化函数
const priceFormatter = value => {
  // 删除不合规的字符
  value = value.replace(/[^\d\.]|(?<=^0)0|(?<=\.\d{2})(.*)|(?<=\.\d*)\./g, '')
  // 点开头自动补0
  value = value.replace(/^\./, '0.')
  // value = value.length
  if (1000000 <= +value) value = '999999.99'
  return value
}

// blur时完善输入的金额
const priceBlur = key => {
  if (!form[key]) return form[key] = '0.00'
  form[key] = form[key].replace(/^0(?=[0-9])/, '')
  if (!form[key].includes('.')) form[key] += '.00'
  else form[key] += "0".repeat(Math.max(2 - form[key].split('.')[1]?.length, 0))
}

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
  })
})

// 新增商品
const submit = isStorage => {
  if (!formRef.value) return ElMessage.warning('初始化未完成，请稍后重试！')
  formRef.value.validate().then(async isValid => {
    if (!isValid) return console.warn('表单验证失败')
    // return console.log(form);
    if (isStorage) window.localStorage.setItem('__ADD_GOODS_FORM_DATA', JSON.stringify(form))
    let [error, { code }] = await apis.addGoods({ ...form })
    if (error || 1 !== code) return ElMessage('商品新增失败')
    ElMessage.success('商品新增成功')
    formRef.value.resetFields()
    emit('addEnd')
  }).catch(err => {
    console.warn('error', err)
  })
}

</script>

<template>
  <el-dialog class="addGoodsDialog" destroy-on-close :model-value="props.show" width="650px" title="新增商品" align-center
    :close-on-click-modal="false" :before-close="() => emit('done')" style="">
    <el-scrollbar height="400px" noresize>
      <el-form ref="formRef" class="from" :model="form" :rules="rules" label-width="80px" scroll-to-error size="large">
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="form.goods_name" maxlength="50" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品条码">
              <el-input v-model="form.goods_no" maxlength="16"
                :formatter="value => value = value.replace(/[^\da-zA-Z]/g, '')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品简称">
              <el-input v-model="form.short_name" maxlength="4" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品分类" prop="category_id">
              <div class="select" @click="$emit('typeClick')">
                {{ typeName }}
                <el-icon>
                  <epArrowRight />
                </el-icon>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位">
              <div class="select" @click="$emit('unitClick')">
                {{ props.unitItem.name || '请选择' }}
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
            <el-form-item label="进货价">
              <el-input class="pad-input" v-model="form.goods_cost_price" :formatter="priceFormatter"
                @blur="priceBlur('goods_cost_price')" onfocus="this.select()" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="会员价">
              <el-input class="pad-input" v-model="form.goods_vip_price" :formatter="priceFormatter"
                @blur="priceBlur('goods_vip_price')" onfocus="this.select()" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存数量">
              <el-input class="pad-input" v-model="form.stock_num" :formatter="numFormatter" @blur="numBlur"
                onfocus="this.select()" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生产日期">
              <el-date-picker v-model="form.goods_production_date" type="date" placeholder="请选择生产日期"
                style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="保质期(天)">
              <el-input class="pad-input" v-model="form.goods_expiration_day"
                :formatter="value => (value = value.replace(/\D/g, ''), value = value >= 10000 ? '9999' : value)"
                onfocus="this.select()" />
            </el-form-item>
          </el-col>
        </el-row>
        <div style="display: flex;">
          <el-form-item label="上传图片" style="margin-bottom: 0;">
            <el-upload ref="uploadRef" class="upload-photo" v-model:file-list="fileList" list-type="picture-card" drag
              :http-request="upload" :accept="accept.join()" :limit="1" :on-exceed="handleExceed"
              :before-upload="beforeAvatarUpload" :on-preview="handlePictureCardPreview">
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
      <span class="dialog-footer">
        <el-button @click="$emit('done')">取消</el-button>
        <el-button @click="submit(true)">
          保存并新增
        </el-button>
        <el-button type="primary" @click="submit(false)">
          立即新增
        </el-button>
      </span>
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
</style>
<style>
.addGoodsDialog .el-dialog__body {
  padding-left: 0;
  padding-right: 0;
}
</style>

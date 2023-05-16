<template>
 <!-- <el-input v-model="input" placeholder="Please input" /> -->
  <el-upload v-model:file-list="fileList" list-type="picture-card" :on-preview="handlePictureCardPreview"
    :on-remove="handleRemove" :limit="1" :on-change="handleChange" :auto-upload="false"
    accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    >
    <el-icon>
      <Plus />
    </el-icon>
  </el-upload>

  <el-button @click="btnClick" type="primary">导出数据</el-button>

  <el-dialog v-model="dialogVisible">
    <img w-full :src="dialogImageUrl" alt="Preview Image" />
  </el-dialog>

  <div>
    <p>{{ result }}</p>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import * as XLSX from 'xlsx'
import { Plus } from '@element-plus/icons-vue'
import { ElDialog, ElUpload, ElIcon,ElButton } from 'element-plus'
import type { UploadProps, UploadUserFile } from 'element-plus'
import { utill,geo,distanceGL } from '../computer/calculate'
import { json } from 'stream/consumers'

const fileList = ref<UploadUserFile[]>([])
const result = ref<string>("");
const dialogImageUrl = ref('')
const dialogVisible = ref(false);
let  jsonData:any[] = [];


const handleRemove: UploadProps['onRemove'] = (uploadFile, uploadFiles) => {
  console.log(uploadFile, uploadFiles)
}

const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url!
  dialogVisible.value = true
}

const handleChange: UploadProps['onChange'] = (uploadFile) => {
  if (uploadFile) {
    const blob = uploadFile.raw as Blob
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = e.target?.result
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
       jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      console.log(jsonData)
      geo('益阳中南电子商务产业园','益阳').then(res=>{
            utill.computer(jsonData,res.geocodes[0]!.location)
      })

    }
    reader.readAsArrayBuffer(blob)
  }
}

function isExcelDate(value: any) {
  return typeof value === "number" && value > 0 && Math.floor(value) === value;
}


function btnClick(event:any){
  const resultData = JSON.parse(JSON.stringify(jsonData)).reverse();
  for (const [index, arrayList] of resultData.entries()) {
    if(distanceGL[index]){
      arrayList[6] =  distanceGL[index]/1000
    };
  }
  exportExcel(resultData.reverse())
}



// 导出数据表格，data 是包含数据的二维数组
function exportExcel(data:Array<any>) {
  const sheetName = 'Sheet1'; // 工作表名称
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const fileName = 'example.xlsx'; // 导出的文件名
  XLSX.writeFile(wb, fileName);
}


</script>

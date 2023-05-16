<template>
  <el-upload
    v-model:file-list="fileList"
    action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
    list-type="picture-card"
    :on-preview="handlePictureCardPreview"
    :on-remove="handleRemove"
    :limit="1"
    :on-change="handleChange"
    :auto-upload = "false"
  >
    <el-icon><Plus /></el-icon>
  </el-upload>

  <el-dialog v-model="dialogVisible">
    <img w-full :src="dialogImageUrl" alt="Preview Image" />
  </el-dialog>

  <div><p>{{result}}</p></div>
</template>

<script lang="ts" setup>
import { ref} from 'vue'
import {createWorker} from 'tesseract.js'
import { Plus } from '@element-plus/icons-vue'
import {ElDialog,ElUpload,ElIcon} from 'element-plus'
import type { UploadProps, UploadUserFile } from 'element-plus'


const fileList = ref<UploadUserFile[]>([])
const result = ref<string>("");
const dialogImageUrl = ref('')
const dialogVisible = ref(false)

const handleRemove: UploadProps['onRemove'] = (uploadFile, uploadFiles) => {
  console.log(uploadFile, uploadFiles)
}

const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url!
  dialogVisible.value = true
}

const handleChange : UploadProps['onChange'] = (uploadFile) =>{
  recognizeImage(uploadFile.url as string)
}


  const  recognizeImage = async function(ImageUrl:string) {
        const worker = await createWorker({
          logger: m => console.log(m), // 输出日志信息,
          langPath:'./'
        });
        await worker.load();
        await worker.loadLanguage('zh');
        await worker.initialize('zh');
        const content = await worker.recognize(ImageUrl);
        console.log(content)



        await worker.terminate();
      }
      
</script>

<template>
  <div class="uploader">
    <h2>分片上传 + 并发 + 断点续传（Vue）</h2>

    <input type="file" @change="onFileChange" />

    <button :disabled="uploading" @click="startUpload">
      {{ uploading ? '上传中...' : '开始上传' }}
    </button>

    <div class="progress-bar">
      <div class="progress-inner" :style="{ width: progress + '%' }"></div>
    </div>

    <p class="progress-text">进度：{{ progress }}%</p>
  </div>
</template>
  <script setup>
  import { ref } from 'vue'
  
  /* ================== 配置 ================== */
  const CHUNK_SIZE = 1024 * 1024 // 1MB
  const MAX_CONCURRENT = 12 // 并发数
  const MAX_RETRY = 3            // 单分片最大重试次数
  
  /* ================== 状态 ================== */
  const file = ref(null)
  const uploading = ref(false)
  const progress = ref(0)
  
  /* ================== 文件切片 ================== */
  function sliceFile(file) {
    const chunks = []
    let index = 0
  
    for (let start = 0; start < file.size; start += CHUNK_SIZE) {
      const end = Math.min(start + CHUNK_SIZE, file.size)
      chunks.push({
        index,
        data: file.slice(start, end)
      })
      index++
    }
  
    return chunks
  }
  
  /* ================== 模拟上传单分片 ================== */
  function uploadChunk(chunk, total) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.9) {
          console.log(`分片 ${chunk.index + 1}/${total} 上传成功`)
          resolve()
        } else {
          reject(new Error(`分片 ${chunk.index + 1} 上传失败`))
        }
      }, 400 + Math.random() * 600)
    })
  }
  
  /* ================== 单分片重试 ================== */
  async function uploadChunkWithRetry(chunk, total) {
    for (let i = 1; i <= MAX_RETRY; i++) {
      try {
        await uploadChunk(chunk, total)
        return
      } catch (err) {
        console.warn(err.message, `第 ${i} 次尝试`)
        if (i === MAX_RETRY) throw err
      }
    }
  }
  
  /* ================== 并发 + 断点续传 ================== */
  async function uploadWithConcurrency(chunks, fileId) {
    const finishedChunks = JSON.parse(localStorage.getItem(fileId) || '[]')
    const queue = chunks.filter(c => !finishedChunks.includes(c.index))
    let finished = finishedChunks.length
  
    async function worker() {
      while (queue.length) {
        const chunk = queue.shift()
        try {
          await uploadChunkWithRetry(chunk, chunks.length)
          finished++
          finishedChunks.push(chunk.index)
          localStorage.setItem(fileId, JSON.stringify(finishedChunks))
          progress.value = Math.round((finished / chunks.length) * 100)
        } catch (err) {
          console.error(err.message)
          queue.push(chunk) // 失败重新入队
        }
      }
    }
  
    const workers = Array.from({ length: MAX_CONCURRENT }, worker)
    try {
      await Promise.all(workers)
    } catch (err) {
      console.error(err.message)
      uploading.value = false
      progress.value = 0
      alert('上传失败 💔')
    }
  }
  
  /* ================== 事件 ================== */
  function onFileChange(e) {
    file.value = e.target.files[0]
  }
  
  async function startUpload() {
    if (!file.value) {
      alert('请选择文件')
      return
    }
  
    uploading.value = true
    progress.value = 0
  
    const fileId = `${file.value.name}_${file.value.size}_${file.value.lastModified}`
    const chunks = sliceFile(file.value)
  
    await uploadWithConcurrency(chunks, fileId)
  
    setTimeout(() => {
      alert('上传完成 🎉')
      uploading.value = false
      progress.value = 0
    }, 10)
  }
  </script>
  
  <style scoped>
  .uploader {
    max-width: 480px;
    margin: 20px auto;
    padding: 30px;
    background: #f9f9f9;
    border-radius: 12px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    text-align: center;
  }
  
  h2 {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
  }
  
  input[type="file"] {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin: 12px 0;
    background: #f1f1f1;
    color: #666;
    font-size: 14px;
  }
  
  input[type="file"]:hover {
    border-color: #42b883;
  }
  
  button {
    padding: 12px 24px;
    border: none;
    background: #42b883;
    color: white;
    font-size: 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s;
    width: 100%;
    margin-bottom: 20px;
  }
  
  button:disabled {
    background-color: #d8d8d8;
    cursor: not-allowed;
  }
  
  button:hover:not(:disabled) {
    background-color: #36a07b;
    transform: translateY(-2px);
  }
  
  .progress-bar {
    width: 100%;
    height: 12px;
    background: #eee;
    border-radius: 8px;
    overflow: hidden;
    margin-top: 20px;
  }
  
  .progress-inner {
    height: 100%;
    background: #42b883;
    transition: width 0.3s ease;
  }
  
  .progress-text {
    font-size: 14px;
    color: #666;
    margin-top: 10px;
    font-weight: 500;
  }
  </style>

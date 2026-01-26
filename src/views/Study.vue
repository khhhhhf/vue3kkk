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
  
      <p>进度：{{ progress }}%</p>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  /* ================== 配置 ================== */
  const CHUNK_SIZE = 1024 * 1024 // 1MB
  const MAX_CONCURRENT = 3       // 并发数
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
        if (Math.random() < 0.85) {
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
    await Promise.all(workers)
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
  
    uploading.value = false
    alert('上传完成 🎉')
  }
  </script>
  
  <style scoped>
  .uploader {
    width: 420px;
    padding: 20px;
    background: #fafafa;
    border-radius: 8px;
  }
  
  input,
  button {
    display: block;
    margin: 12px 0;
  }
  
  button {
    padding: 6px 14px;
    cursor: pointer;
  }
  
  .progress-bar {
    width: 100%;
    height: 20px;
    background: #eee;
    border-radius: 10px;
    overflow: hidden;
    margin-top: 10px;
  }
  
  .progress-inner {
    height: 100%;
    width: 0%;
    background: #42b883;
    transition: width 0.3s ease;
  }
  </style>
  
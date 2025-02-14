<template>
  <div>
    <div class="settingRow">
      <div class="content">
        <span class="name">Automatic operation</span>
        <div class="control">
          <el-switch v-model="autoRun" @change="autoRunChange"></el-switch>
        </div>
      </div>
      <div class="desc">Automatically run 1 second after input stops</div>
    </div>
    <div class="settingRow">
      <div class="content">
        <span class="name">Keep previous logs</span>
        <div class="control">
          <el-switch
            v-model="keepPreviousLogs"
            @change="keepPreviousLogsChange"
          ></el-switch>
        </div>
      </div>
      <div class="desc">After closing, the log will be cleared each time you restart</div>
    </div>
    <div class="settingRow">
      <div class="content">
        <span class="name">Enable full debugging</span>
        <div class="control">
          <el-switch
            v-model="openAlmightyConsole"
            @change="openAlmightyConsoleChange"
          ></el-switch>
        </div>
      </div>
      <div class="desc">
        A button will appear in the lower right corner of the preview page. Click it to open the full-featured debugging console.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useStore } from 'vuex'
import { ElSwitch } from 'element-plus'

// hooks定义部分

// 初始化
const useInit = () => {
  const store = useStore()
  return {
    store,
    config: store.state.editData.config
  }
}

// 保留日志设置
const usePreviousLogs = ({ store, config }) => {
  // 保留之前的日志
  const keepPreviousLogs = ref(false)
  keepPreviousLogs.value = config.keepPreviousLogs
  watch(
    () => {
      return config.keepPreviousLogs
    },
    value => {
      keepPreviousLogs.value = value
    }
  )

  // 切换是否保留之前的日志
  const keepPreviousLogsChange = e => {
    store.commit('setKeepPreviousLogs', e)
  }

  return {
    keepPreviousLogs,
    keepPreviousLogsChange
  }
}

// 自动运行设置
const useAutoRun = ({ store, config }) => {
  // 自动运行
  const autoRun = ref(false)
  autoRun.value = config.autoRun
  watch(
    () => {
      return config.autoRun
    },
    value => {
      autoRun.value = value
    }
  )

  // 切换自动运行
  const autoRunChange = e => {
    store.commit('setAutoRun', e)
  }

  return {
    autoRun,
    autoRunChange
  }
}

// 全能调试设置
const useAlmightyConsole = ({ store, config }) => {
  // 开启全能调试
  const openAlmightyConsole = ref(false)
  openAlmightyConsole.value = config.openAlmightyConsole
  watch(
    () => {
      return config.openAlmightyConsole
    },
    value => {
      openAlmightyConsole.value = value
    }
  )

  // 切换全能调试
  const openAlmightyConsoleChange = e => {
    store.commit('setOpenAlmightyConsole', e)
  }

  return {
    openAlmightyConsole,
    openAlmightyConsoleChange
  }
}

// created部分
const { store, config } = useInit()
const { keepPreviousLogs, keepPreviousLogsChange } = usePreviousLogs({
  store,
  config
})
const { autoRun, autoRunChange } = useAutoRun({ store, config })
const { openAlmightyConsole, openAlmightyConsoleChange } = useAlmightyConsole({
  store,
  config
})
</script>

<style scoped lang="less">
.settingRow {
  margin-bottom: 20px;

  .content {
    display: flex;
    align-items: center;

    .name {
      margin-right: 10px;
    }
  }

  .desc {
    font-size: 12px;
    color: #999;
  }
}
</style>

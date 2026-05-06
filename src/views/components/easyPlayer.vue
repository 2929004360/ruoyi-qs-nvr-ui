<template>
  <div>
    <EasyPlayer
        ref="EasyPlayerRef"
        style="width: 100%;height: 100vh"
        width="100"
        height="100"
        :isPercentage="true"
        :videoUrl="url"/>
  </div>
</template>

<script setup>
import {useRoute} from "vue-router";
import EasyPlayer from "@/components/EasyPlayer/index.vue";
const {proxy} = getCurrentInstance()
const route = useRoute();

const url = ref(null)

onMounted(()=>{
  nextTick(async ()=>{
    url.value = route.query && route.query.url;
    await nextTick(async () => {
      if(proxy.$refs["EasyPlayerRef"]){
        proxy.$refs["EasyPlayerRef"].play(url.value);
      }
    })
  })
})
</script>

<style scoped>

</style>
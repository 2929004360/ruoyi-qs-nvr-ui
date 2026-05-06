<script setup name="RightBottom" lang="ts">
import * as echarts from 'echarts';
import {getChartTheme, getBaseOption} from '@/utils/echarts-theme';

function refreshChart() {
  if (savedData.value?.length) {
    setData(savedData.value);
  }
}

defineExpose({setData, refreshChart})

const myChart = ref({})
const savedData = ref([])

function setData(diskList) {
  savedData.value = diskList || [];
  let pathList = savedData.value?.map(i => i.path)
  let freeList = savedData.value?.map(i => i.free.toFixed(2))
  let useList = savedData.value?.map(i => i.use.toFixed(2))
  nextTick(() => {
    const chartDom = document.getElementById('rightBottomChart');
    if(!chartDom){
      return
    }
    let chart = echarts.init(chartDom);
    myChart.value = chart
    const t = getChartTheme();

    let option = {
      ...getBaseOption(),
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: t.tooltipBg,
        borderColor: t.tooltipBorder,
        borderWidth: 1,
        textStyle: { color: t.tooltipText },
        padding: [10, 14],
        extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 8px;'
      },
      legend: { textStyle: { color: t.text } },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        boundaryGap: [0, 0.01],
        nameTextStyle: { color: t.text },
        axisLine: { lineStyle: { color: t.axisLine } },
        axisTick: { lineStyle: { color: t.axisLine } },
        axisLabel: { color: t.subText, formatter: '{value} GB' },
        splitLine: { lineStyle: { color: t.splitLine, type: 'dashed' } }
      },
      yAxis: {
        type: 'category',
        data: pathList,
        axisLine: { lineStyle: { color: t.axisLine } },
        axisTick: { lineStyle: { color: t.axisLine } },
        axisLabel: { color: t.text }
      },
      series: [
        {
          name: '未使用',
          type: 'bar',
          stack: 'disk',
          itemStyle: { color: '#73d13d' },
          data: freeList
        },
        {
          name: '已使用',
          type: 'bar',
          stack: 'disk',
          itemStyle: { color: '#ff4d4f' },
          data: useList
        }
      ]
    };
    window.addEventListener("resize", resize);

    chart.setOption(option);
  })
}

function resize() {
  myChart.value.resize();
}

onBeforeUnmount(() => {
  window.removeEventListener("resize",resize);
})
</script>

<template>
  <div style="width: 100%;height: 350px;" id="rightBottomChart"></div>
</template>

<style scoped lang="scss"></style>

<script setup name="LeftBottom" lang="ts">
import * as echarts from 'echarts';
import moment from 'moment'
import {getChartTheme, getBaseOption} from '@/utils/echarts-theme';

function refreshChart() {
  if (savedData.value?.length) {
    setData(savedData.value);
  }
}

defineExpose({setData, refreshChart})

const myChart = ref({})
const savedData = ref([])

function setData(netList) {
  savedData.value = netList || [];
  let timeList = savedData.value?.map(i => moment(i.time).format("HH:mm:ss"))
  let inList = savedData.value?.map(i => i.in.toFixed(2))
  let outList = savedData.value?.map(i => i.out.toFixed(2))
  nextTick(() => {
    const chartDom = document.getElementById('leftBottomChart');
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
        nameTextStyle: { color: t.text },
        axisLine: { lineStyle: { color: t.axisLine } },
        axisTick: { lineStyle: { color: t.axisLine } },
        axisLabel: { color: t.subText, formatter: '{value} MB' },
        splitLine: { lineStyle: { color: t.splitLine, type: 'dashed' } }
      },
      yAxis: {
        type: 'category',
        data: timeList,
        axisLine: { lineStyle: { color: t.axisLine } },
        axisTick: { lineStyle: { color: t.axisLine } },
        axisLabel: { color: t.text }
      },
      series: [
        {
          name: '下载',
          type: 'bar',
          itemStyle: { color: '#409EFF', borderRadius: [0, 4, 4, 0] },
          data: inList
        },
        {
          name: '上传',
          type: 'bar',
          itemStyle: { color: '#36cfc9', borderRadius: [0, 4, 4, 0] },
          data: outList
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
  <div style="width: 100%;height: 350px;" id="leftBottomChart"></div>
</template>

<style scoped lang="scss">

</style>

<script setup name="BottomCenter" lang="ts">
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

function setData(memList) {
  savedData.value = memList || [];
  let timeList = savedData.value?.map(i => moment(i.time).format("HH:mm:ss"))
  let dataList = savedData.value?.map(i => (i.data*100).toFixed(2))
  nextTick(() => {
    const chartDom = document.getElementById('bottomCenterChart');
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
        backgroundColor: t.tooltipBg,
        borderColor: t.tooltipBorder,
        borderWidth: 1,
        textStyle: { color: t.tooltipText },
        padding: [10, 14],
        extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 8px;'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: timeList,
          axisLine: { lineStyle: { color: t.axisLine } },
          axisTick: { lineStyle: { color: t.axisLine } },
          axisLabel: { color: t.subText }
        }
      ],
      yAxis: [
        {
          type: 'value',
          min: 0,
          max: 100,
          nameTextStyle: { color: t.text },
          axisLine: { lineStyle: { color: t.axisLine } },
          axisTick: { lineStyle: { color: t.axisLine } },
          axisLabel: { color: t.subText, formatter: '{value} %' },
          splitLine: { lineStyle: { color: t.splitLine, type: 'dashed' } }
        }
      ],
      series: [
        {
          type: 'bar',
          data: dataList,
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#409EFF' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.3)' }
            ])
          },
          markPoint: {
            data: [
              { type: 'max', name: 'Max' },
              { type: 'min', name: 'Min' }
            ],
            itemStyle: { color: t.primary }
          },
          markLine: {
            data: [{ type: 'average', name: 'Avg' }],
            lineStyle: { color: t.primary, type: 'dashed' }
          }
        },
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
  <div style="width: 100%;height: 350px;" id="bottomCenterChart"></div>
</template>

<style scoped lang="scss">

</style>

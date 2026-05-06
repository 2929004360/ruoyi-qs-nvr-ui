<template>
  <div>
    <div ref="chartRef" style="width: 100%;height: 350px;"></div>
  </div>
</template>

<script setup name="TopCenter" lang="ts">
import * as echarts from 'echarts';
import {defineExpose} from "vue";
import {getChartTheme, chartPalette, getBaseOption} from '@/utils/echarts-theme';
defineExpose({setData, refreshChart})

function refreshChart() {
  initChart();
}

const apiResponseList = ref([])

const chartRef = ref(null);
let chartInstance = null;

const initChart = () => {
  if (!chartRef.value) return;
  chartInstance = echarts.init(chartRef.value);
  const t = getChartTheme();
  const seriesList = [];

  apiResponseList.value.forEach((node, index) => {
    // 提取当前节点的负载数据 (合并 threads 和 work)
    const nodeLoadData = [
      ...node.threadsLoad.map(i => i.load),
      ...node.workThreadsLoad.map(i => i.load)
    ];

    // 提取当前节点的延迟数据
    const nodeDelayData = [
      ...node.threadsLoad.map(i => i.delay),
      ...node.workThreadsLoad.map(i => i.delay)
    ];

    // 添加负载系列 (柱状图)
    seriesList.push({
      name: `${node.id} - 负载`,
      type: 'bar',
      stack: 'total_load',
      data: nodeLoadData,
      itemStyle: { borderRadius: index === apiResponseList.value.length - 1 ? [4, 4, 0, 0] : 0 },
      emphasis: {
        itemStyle: {
          shadowBlur: 12,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.2)'
        }
      }
    });

    // 添加延迟系列 (折线图)
    seriesList.push({
      name: `${node.id} - 延迟`,
      type: 'line',
      yAxisIndex: 1,
      data: nodeDelayData,
      lineStyle: { width: 2, type: 'dashed' },
      symbol: 'circle',
      symbolSize: 6,
      smooth: true
    });
  });

  const option = {
    ...getBaseOption(),
    color: chartPalette,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      backgroundColor: t.tooltipBg,
      borderColor: t.tooltipBorder,
      borderWidth: 1,
      textStyle: { color: t.tooltipText },
      padding: [10, 14],
      extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 8px;'
    },
    legend: {
      data: seriesList.map(s => s.name),
      top: 5,
      type: 'scroll',
      textStyle: { color: t.text }
    },
    grid: {
      left: '3%',
      right: '10%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: [
          ...apiResponseList.value[0].threadsLoad.map(i => i.name),
          ...apiResponseList.value[0].workThreadsLoad.map(i => i.name)
        ],
        axisLabel: {
          interval: 0,
          rotate: 45,
          color: t.text,
          formatter: (value) => value.substring(value.lastIndexOf(' ') + 1)
        },
        axisLine: { lineStyle: { color: t.axisLine } },
        axisTick: { lineStyle: { color: t.axisLine } }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '负载 (Load)',
        position: 'left',
        nameTextStyle: { color: t.text },
        axisLine: { show: true, lineStyle: { color: t.axisLine } },
        axisLabel: { color: t.subText },
        splitLine: { lineStyle: { color: t.splitLine, type: 'dashed' } }
      },
      {
        type: 'value',
        name: '延迟 (ms)',
        position: 'right',
        nameTextStyle: { color: t.text },
        axisLine: { show: true, lineStyle: { color: t.axisLine } },
        axisLabel: { color: t.subText },
        splitLine: { show: false }
      }
    ],
    series: seriesList
  };

  chartInstance.setOption(option);
};

const handleResize = () => chartInstance?.resize();

function setData(data) {
  apiResponseList.value = data
  initChart();
  window.addEventListener('resize', handleResize);
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  chartInstance?.dispose();
});
</script>

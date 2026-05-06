<template>
  <div>
    <div ref="chartRef" style="width: 100%;height: 350px;"></div>
  </div>
</template>

<script setup name="LeftTop" lang="ts">
import {defineExpose, onBeforeUnmount, ref} from 'vue';
import * as echarts from 'echarts';
import {getChartTheme, chartPalette, getBaseOption} from '@/utils/echarts-theme';

defineExpose({setData, refreshChart})

function refreshChart() {
  initChart();
}
let apiData = {};

const chartRef = ref(null);
let chartInstance = null;

const fieldMap = {
  totalOnlineCount: '总在线数',
  totalOfflineCount: '总离线数',
  enableCount: '启用设备数',
  deactivateCount: '停用设备数',
  rtspCount: 'RTSP',
  rtmpCount: 'RTMP',
  flvCount: 'FLV',
  hlsCount: 'HLS',
  onvifCount: 'ONVIF',
  fileCount: '视频文件',
  hikSdkCount: '海康SDK',
  hikIsupCount: '海康ISUP',
  dahuaSdkCount: '大华SDK',
  gb28181Count: 'GB28181',
  jt1078Count: 'JT1078',
  pushCount: '推流设备'
};

function setData(data) {
  apiData = data;
  initChart();
  window.addEventListener('resize', handleResize);
}

const initChart = () => {
  if (!chartRef.value) return;
  chartInstance = echarts.init(chartRef.value);
  const t = getChartTheme();

  // 过滤掉值为 0 或 null 的项，避免图表过于杂乱
  const pieData = Object.keys(fieldMap)
      .map(key => ({
        name: fieldMap[key],
        value: apiData[key] || 0
      }))
      .filter(item => item.value > 0);

  const option = {
    ...getBaseOption(),
    color: chartPalette,
    title: {
      subtext: `总数: ${apiData.totalDeviceCount}`,
      left: 'center',
      top: 8,
      textStyle: { fontSize: 14, color: t.subText },
      subtextStyle: { fontSize: 22, color: t.text, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: t.tooltipBg,
      borderColor: t.tooltipBorder,
      borderWidth: 1,
      textStyle: { color: t.tooltipText },
      padding: [10, 14],
      extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 8px;',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 8,
      top: 'middle',
      textStyle: { color: t.text, fontSize: 12 },
      itemGap: 12,
      data: pieData.map(item => item.name)
    },
    series: [
      {
        name: '设备类型',
        type: 'pie',
        radius: ['38%', '65%'],
        center: ['62%', '52%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: t.itemBorder,
          borderWidth: 2
        },
        label: {
          show: true,
          color: t.text,
          formatter: '{b}\n{d}%',
          fontSize: 12
        },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' },
          itemStyle: {
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowColor: t.primaryGlow
          }
        },
        labelLine: {
          show: true,
          lineStyle: { color: t.axisLine }
        },
        data: pieData
      }
    ]
  };

  chartInstance.setOption(option);
};

const handleResize = () => chartInstance?.resize();

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  chartInstance?.dispose();
});
</script>

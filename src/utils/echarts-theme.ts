// ECharts 主题颜色适配工具 - 与 Element Plus 主题保持一致

/** 获取当前暗黑模式状态与对应颜色 */
export function getChartTheme() {
  const isDark = document.documentElement.classList.contains('dark');

  return {
    // 核心主题色
    primary: '#409EFF',
    primaryLight: 'rgba(64, 158, 255, 0.12)',
    primaryFade: 'rgba(64, 158, 255, 0.35)',
    primaryGlow: 'rgba(64, 158, 255, 0.4)',

    // 文字
    text: isDark ? '#e2e8f0' : '#1f2937',
    subText: isDark ? '#94a3b8' : '#6b7280',

    // 轴线与网格
    axisLine: isDark ? '#475569' : '#e5e7eb',
    splitLine: isDark ? '#334155' : '#f3f4f6',

    // Tooltip
    tooltipBg: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.95)',
    tooltipBorder: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(209, 213, 219, 0.5)',
    tooltipText: isDark ? '#e2e8f0' : '#1f2937',

    // 边框（饼图等需要白色/深色边框分隔）
    itemBorder: isDark ? '#0f172a' : '#ffffff',

    isDark
  };
}

/** 统一配色板 */
export const chartPalette = [
  '#409EFF', '#36cfc9', '#73d13d', '#ffc53d',
  '#ff4d4f', '#9254de', '#f759ab', '#ff7a45',
  '#597ef7', '#36d3f5'
];

/** 生成通用基础配置（背景透明、tooltip 样式、文字颜色等） */
export function getBaseOption() {
  const t = getChartTheme();
  return {
    backgroundColor: 'transparent',
    textStyle: { color: t.text },
    tooltip: {
      backgroundColor: t.tooltipBg,
      borderColor: t.tooltipBorder,
      borderWidth: 1,
      textStyle: { color: t.tooltipText },
      padding: [10, 14],
      extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 8px;'
    }
  };
}

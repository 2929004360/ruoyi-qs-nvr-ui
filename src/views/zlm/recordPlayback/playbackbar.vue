<template>
  <div class="playbackbar" id="playbackbar_div">
    <canvas id="playbackbar"></canvas>
  </div>
</template>

<script>
import moment from "moment";
export default {
  components: {},
  props: {
    // 初始化时间 => 2021-08-20 00:00:00
    initDate: {
      type: String,
    },
    /**
     * 记录的区域列表
     * @attribute startTime 开始时间 YYYY-MM-DD HH:mm:ss
     * @attribute endTime 结束时间 YYYY-MM-DD HH:mm:ss
     */
    timeData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      nowDate: "", // 当前时间
      mouseNowDate: "", // 鼠标移入画布时当前时间记录

      ctx: null, // 画布区域环境
      _width: 0, // 画布宽
      _height: 0, // 画布高

      isMouseDown: false, // 是否在画布上按下鼠标
      mousedownX: 0, // 鼠标按下的X
      mousedownY: 0, // 鼠标按下的Y
      size: 160, // 坐标尺寸
      axisTick: 1, // 默认刻度1，默认一小时一刻度
    };
  },

  watch: {
    initDate() {
      this.nowDate = this.initDate;
      this.initCanvas();
    },
  },
  computed: {
    // 计算1个移动像素代表多少秒数
    pxToSecond() {
      return (this.axisTick * 60 * 60) / this.size;
    },
  },
  mounted() {
    this.nowDate = this.initDate;
    this.initCanvas();
    this.onDocumentEvent();
    // 注册事件 -- 防抖
    let bAntiShike = false;
    window.onresize = () => {
      if (!bAntiShike) {
        bAntiShike = true;
        setTimeout(() => {
          this.initCanvas();
          bAntiShike = false;
        }, 300);
      }
    };
  },
  beforeDestroy() {
    // 事件注销
    window.onresize = null;
    document.onmousemove = null;
    document.onmouseup = null;
  },
  methods: {
    initCanvas() {
      const box = document.getElementById("playbackbar_div");
      this._width = box.offsetWidth;
      this._height = box.offsetHeight;
      const canvas = document.getElementById("playbackbar");
      canvas.width = this._width;
      canvas.height = this._height;
      this.ctx = canvas.getContext("2d");
      this.onBaseFill(this.ctx, this._width, this._height);
      this.onDrawNowDate(this.ctx, this._width);
      this.onMouseHandle(canvas, this.ctx, this._width, this._height);
    },
    // 初始化绘制
    onBaseFill(ctx, _width, _height) {
      // 时间线上轴线
      ctx.beginPath();
      ctx.strokeStyle = "#303030";
      ctx.lineWidth = 3;
      ctx.moveTo(0, 40.5);
      ctx.lineTo(_width, 40.5);
      ctx.stroke();

      this.onDrawTick(ctx, _width, _height);
      this.onDrawRecordArea(ctx, _width, _height);
      // 时间抽线区域线
      ctx.beginPath();
      ctx.strokeStyle = "#B1BE76";
      ctx.lineWidth = 1;
      ctx.moveTo(0, 42.5);
      ctx.lineTo(_width, 42.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.strokeStyle = "#FFFF00";
      ctx.lineWidth = 1;
      ctx.moveTo(0, 50.5);
      ctx.lineTo(_width, 50.5);
      ctx.stroke();
      // 中间时间线
      ctx.beginPath();
      ctx.strokeStyle = "#ffcc00";
      ctx.lineWidth = 2;
      ctx.moveTo(_width / 2 - 1 + 0.5, 0);
      ctx.lineTo(_width / 2 - 1 + 0.5, _height);
      ctx.stroke();
    },
    // 轴线刻度线
    onDrawTick(ctx, _width, _height) {
      // 当前时间的毫秒数
      const nowTime = new Date(this.nowDate).getTime();
      // 离当前时间左边最近的整数点毫秒数
      const leftIntTime = new Date(
          moment(this.nowDate).format("YYYY-MM-DD HH") + ":00:00"
      ).getTime();
      const nowHour = moment(this.nowDate).format("HH");
      // 当前时间距离左侧整数时间的秒数
      const leftIntSecond = (nowTime - leftIntTime) / 1000;
      // 求出中间时间点距离左侧整数点的像素距离
      const leftIntLength = leftIntSecond / this.pxToSecond;
      // 以该整数点为中间点向左右绘制轴线
      const center = _width / 2 - 1 - leftIntLength;
      // 左侧轴线个数
      const leftTickNumber = Math.floor(center / this.size);
      // 右侧轴线个数
      const rightTickNumber = Math.floor((_width - center) / this.size);
      // 左轴线绘制
      for (let i = 0; i <= leftTickNumber; i++) {
        // 当前X轴的位置
        const _X = center - i * this.size;
        let hour = Number(nowHour) - i;
        if (hour < 0) {
          hour += 24;
        }
        const timeText = hour < 10 ? `0${hour}:00` : `${hour}:00`;
        // 绘制轴线
        ctx.beginPath();
        ctx.strokeStyle = "#4B4B4B";
        ctx.lineWidth = 2;
        ctx.moveTo(_X + 0.5, 40);
        ctx.lineTo(_X + 0.5, _height);
        ctx.stroke();
        ctx.font = "10px Arial";
        ctx.fillStyle = "#969696";
        ctx.fillText(timeText, _X + 0.5 - 12, 34);
      }
      // 右轴线绘制
      for (let i = 1; i <= rightTickNumber; i++) {
        // 当前X轴的位置
        const _X = center + i * this.size;
        let hour = Number(nowHour) + i;
        if (hour >= 24) {
          hour -= 24;
        }
        const timeText = hour < 10 ? `0${hour}:00` : `${hour}:00`;
        // 绘制轴线
        ctx.beginPath();
        ctx.strokeStyle = "#4B4B4B";
        ctx.lineWidth = 2;
        ctx.moveTo(_X + 0.5, 40);
        ctx.lineTo(_X + 0.5, _height);
        ctx.stroke();
        ctx.font = "10px Arial";
        ctx.fillStyle = "#969696";
        ctx.fillText(timeText, _X + 0.5 - 12, 34);
      }
    },
    // 绘制当前时间
    onDrawNowDate(ctx, _width) {
      ctx.font = "14px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(this.nowDate, _width / 2 - 75, 24);
    },
    // 绘制存在视频记录区域
    onDrawRecordArea(ctx, _width, _height) {
      // 当前时间的毫秒数
      const nowTime = new Date(this.nowDate).getTime();
      // 左侧顶点的时间秒数
      const leftVertexTime = nowTime / 1000 - (_width / 2) * this.pxToSecond;
      // 右侧顶点的时间秒数
      const rightVertexTime = nowTime / 1000 + (_width / 2) * this.pxToSecond;
      // 在可视范围内的视频记录
      const timeList = this.timeData.filter((r) => {
        const startTimeSecond = new Date(r.startTime).getTime() / 1000;
        const endTimeSecond = new Date(r.endTime).getTime() / 1000;
        if (
            (startTimeSecond < leftVertexTime &&
                endTimeSecond > leftVertexTime) ||
            (startTimeSecond >= leftVertexTime &&
                startTimeSecond < rightVertexTime)
        ) {
          return true;
        } else {
          return false;
        }
      });
      timeList.map((r) => {
        const startTimeSecond = new Date(r.startTime).getTime() / 1000;
        const endTimeSecond = new Date(r.endTime).getTime() / 1000;
        //如果起始时间比左侧顶点时间小，说明区域从左侧顶点开始
        if (startTimeSecond < leftVertexTime) {
          // 获取该时间段在可视范围的长度
          const _W =
              endTimeSecond < rightVertexTime
                  ? (endTimeSecond - leftVertexTime) / this.pxToSecond
                  : _width;

          // 绘制播放长度 矩形区域
          ctx.beginPath();
          ctx.fillStyle = "#637DEC";
          ctx.fillRect(0, 43, _W, 8);
        }
        // 如果起始时间在可视范围内
        if (startTimeSecond >= leftVertexTime) {
          // 算出起始时间的X位置
          const _X = (startTimeSecond - leftVertexTime) / this.pxToSecond;
          const _W = (endTimeSecond - startTimeSecond) / this.pxToSecond; // 记录长度
          // 绘制播放长度 矩形区域
          ctx.beginPath();
          ctx.fillStyle = "#637DEC";
          ctx.fillRect(_X, 43, _W, 8);
        }
      });
    },
    // 鼠标事件
    onMouseHandle(canvas, ctx, _width, _height) {
      // 鼠标移入
      canvas.onmouseover = (e) => {
        // 移入时记录当前时间，在鼠标移动时不会根据当前时间变化而变化
        if (!this.isMouseDown) {
          this.mouseNowDate = this.nowDate;
        }
      };
      // 鼠标移出
      canvas.onmouseout = (e) => {
        ctx.clearRect(0, 0, _width, _height);
        this.onBaseFill(ctx, _width, _height);
        this.onDrawNowDate(ctx, _width);
      };
      // 鼠标移动
      canvas.onmousemove = (e) => {
        if (!this.isMouseDown) {
          ctx.clearRect(0, 0, _width, _height);
          this.onBaseFill(ctx, _width, _height);
          const offsetX = e.offsetX; // 鼠标在画布的X轴位置
          // 鼠标移动的距离, 画布中间为起点
          const moveLength = offsetX - _width / 2;
          let nowDateTime = new Date(this.mouseNowDate).getTime();
          const nowDate = moment(
              nowDateTime + this.pxToSecond * moveLength * 1000
          ).format("YYYY-MM-DD HH:mm:ss");
          ctx.font = "12px Arial";
          ctx.fillStyle = "#ffffff";
          ctx.fillText(nowDate, offsetX - 62, 12);
          this.onDrawNowDate(ctx, _width);
        }
      };
      // 鼠标按下
      canvas.onmousedown = (e) => {
        this.mousedownX = e.clientX;
        this.mousedownY = e.clientY;
        this.isMouseDown = true;
      };
    },
    // 全局事件
    onDocumentEvent() {
      // 全局鼠标抬起
      document.onmouseup = (e) => {
        // 只有在画布中按下鼠标才生效
        if (this.isMouseDown) {
          this.mouseNowDate = this.nowDate; // 鼠标抬起时获取到最终的当前时间
          this.isMouseDown = false;
        }
      };
      // 全局鼠标移动
      document.onmousemove = (e) => {
        // 只有在画布中按下鼠标才生效
        if (this.isMouseDown) {
          this.ctx.clearRect(0, 0, this._width, this._height);
          this.onBaseFill(this.ctx, this._width, this._height);
          const clientX = e.clientX; // 鼠标在可视窗口的X轴位置
          let nowDateTime = new Date(this.mouseNowDate).getTime();
          // 画布移动的距离, 鼠标按下为起点
          const moveLength = this.mousedownX - clientX;
          this.nowDate = moment(
              nowDateTime + this.pxToSecond * moveLength * 1000
          ).format("YYYY-MM-DD HH:mm:ss");
          this.onDrawNowDate(this.ctx, this._width);
        }
      };
    },
  },
};
</script>
<style lang="scss" scoped>
.playbackbar {
  width: 100%;
  height: 65px;
  background-color: #343434;
  canvas {
    cursor: pointer;
    background: #000;
  }
}
</style>


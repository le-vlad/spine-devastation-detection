<template>
  <div>
    <img ref="preview" v-show="false" alt="">
    <canvas ref="canvPreview" class="photo-preview" v-show="loaded"></canvas>
  </div>
</template>

<script>
  export default {
    props: {
      data: File,
      type: String,
      array: Array,
    },
    name: "ImagePreview",
    data() {
      return {
        loaded: false,
        MAX_IMAGE_HEIGHT: 620,
      }
    },
    watch: {
      array(v) {
        if (v !== null) {
          this.drawResult();
        }
      }
    },
    methods: {
      drawResult() {
        const cv = this.$refs.canvPreview;
        const context = cv.getContext('2d');
        context.fillStyle = 'green';
        this.array.map((point) => {
          context.fillRect(point.x, point.y, 5, 5);
        });

        const imageBase64 = cv.toDataURL('image/jpeg', 1.0);
        this.$emit('detectedImage', imageBase64);
      },
      initGoLang() {
        if (!WebAssembly.instantiateStreaming) {
          // polyfill
          WebAssembly.instantiateStreaming = async (resp, importObject) => {
            const source = await (await resp).arrayBuffer();
            return await WebAssembly.instantiate(source, importObject);
          };
        }

        // eslint-disable-next-line
        const go = new Go();

        // eslint-disable-next-line
        let mod, inst;

        WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject).then(
          async result => {
            mod = result.module;
            inst = result.instance;
            go.run(inst).then(async () => {
              inst = await WebAssembly.instantiate(mod, go.importObject);
            });
          }
        );
      },
      runAnalysis() {
        const cv = this.$refs.canvPreview;
        const context = cv.getContext('2d');

        const pixels = [];
        console.log(cv.height, cv.width);
        let lastX, lastY = 0;

        for (let i = 0; i <= cv.height; i += 1) {
          pixels[i] = [];
          lastY = i;
          for (let j = 0; j <= cv.width * 2; j += 1) {
            lastX = j;
            const pixelData = context.getImageData(i, j, 1, 1).data;
            pixels[i][j] = {
              r: pixelData[0],
              g: pixelData[1],
              b: pixelData[2],
            };
          }
        }

        console.log(lastY, lastX);

        console.log(pixels.length);

        const jsonWorker = new Worker("json.worker.js");
        jsonWorker.onmessage = message => {
          const result = window.pixelCalc(message.data);
          console.log(JSON.parse(result).length);
          this.$emit('onArray', { type: this.type, array: result, });
          jsonWorker.terminate();
        };

        jsonWorker.postMessage(pixels);
      },
    },
    created() {
      const reader = new FileReader();
      reader.addEventListener('load', async (event) => {
        const image = new Image();
        const MAXWidthHeight = this.MAX_IMAGE_HEIGHT;
        const c = this.$refs.canvPreview;
        const context = c.getContext('2d');

        const self = this;
        image.onload = async function () {
          const r = MAXWidthHeight / Math.max(this.width, this.height);
          const w = Math.round(this.width * r);
          const h = Math.round(this.height * r);
          c.width = w;
          c.height = h;

          self.loaded = true;
          context.drawImage(this, 0, 0, w, h);

          self.initGoLang();
          setTimeout(() => {
            self.runAnalysis()
          }, 2000);
        };

        image.src = event.target.result;
      });

      reader.readAsDataURL(this.data);
    }
  }
</script>

<style scoped>
  .photo-preview {
    width: 100%;
    height: auto;
    position: relative;
  }
</style>

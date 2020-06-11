<template>
  <div v-if="!imageBase64">
    <h1>Оберіть зображення для початку</h1>
    <div class="hello">
      <section>
        <ImagePreview @detectedImage="onImageDetected" :asPoints="false" :array="arrayToDraw" v-if="infraRedFile" @onArray="onArrayData"
                      :type="'i'" :data="infraRedFile"></ImagePreview>
        <ImagePicker @filePicked="onInfraredPicked" :type="'x'" text="Термограмма"></ImagePicker>
      </section>
      <section></section>
      <section>
        <ImagePreview @detectedImage="onImageDetected" v-if="xRayFile" @onArray="onArrayData" :type="'x'"
                      :data="xRayFile"></ImagePreview>
        <ImagePicker @filePicked="onXRayPicked" text="Ренген"></ImagePicker>
      </section>
    </div>

    <button v-if="canStart" @click="startAnalysis">Згенерувати репорт</button>
  </div>

  <div class="report" v-else>
    <ImagePreview :asPoints="drawAsPoints" @detectedImage="onImageDetected" :array="arrayToDraw" v-show="false" @onArray="onArrayData"
                  :type="'i'" :data="infraRedFile"></ImagePreview>
    <div>
      <h1>Результат роботи</h1>
      <p>
        Отриманий результат роботи може бути додатково налаштований шляхом зміни порогу реагування та типу індикації запалення
      </p>
      <img :src="imageBase64" alt="Reported image">
    </div>

    <div class="div">
      <h1>Температурна карта запалення </h1>
      <div class="plot" id="plot">
      </div>

      Поріг реагування: {{threshold}} <br>
      <input type="range" v-model="thresholdRange">
      <br>
      <button v-if="regenerate" @click="startAnalysis">Згенерувати репорт</button>

      <br>
      Малювати точками
      <input type="checkbox" v-model="drawAsPoints">
    </div>
  </div>
</template>

<script>

  import Plotly from 'plotly.js-dist'
  import ImagePicker from "@/components/ImagePicker";
  import Image from "@/components/Image";

  export default {
    name: 'HelloWorld',
    components: {
      ImagePreview: Image,
      ImagePicker,
    },
    data() {
      return {
        xRayFile: null,
        infraRedFile: null,
        xRayArray: null,
        infraRedArray: null,
        mergedArray: [],
        arrayToDraw: null,
        imageBase64: null,
        canStart: false,
        drawAsPoints: false,
        threshold: 0.9,
        thresholdRange: this.threshold * 100,
        regenerate: false,
      };
    },
    props: {
      msg: String
    },
    watch: {
      thresholdRange(v) {
        this.threshold = v / 100;
        this.regenerate = true;
      },
      drawAsPoints() {
        this.regenerate = true;
      },
    },
    methods: {
      startAnalysis() {
        this.mergeArrays();
      },
      async onImageDetected(img) {
        this.imageBase64 = img;

        await this.$nextTick();

        const sortedArray = this.mergedArray.map((i) => i.filter((ii) => {
          if (ii <= 1 && ii !== 0) {
            return true;
          }
          return false;
        }));

        sortedArray.map((i, ix) => i.filter((ii, iix) => {
          if (((ix / i.length) * 100 < 10 || (ix / i.length) * 100 > 80) && ii > 0.5) {
            sortedArray[ix][iix] = Math.random() * (0.6 - 0.3) + 0.3;
            return true;
          }
        }));

        Plotly.newPlot('plot', [{
          z: sortedArray,
          type: 'surface',
        }]);
      },
      onArrayData({array, type}) {
        if (type === 'x') {
          this.xRayArray = JSON.parse(array);
          let max = 0;
          for (let i = 0; i < this.xRayArray.length; i += 1) {
            let arrayMax = Math.max(...this.xRayArray[i]);
            max = arrayMax > max ? arrayMax : max;
          }

          console.log(max);
          for (let i = 0; i < this.xRayArray.length; i += 1) {
            for (let j = 0; j < this.xRayArray[i].length; j += 1) {
              this.xRayArray[i][j] = this.xRayArray[i][j] / max;
            }
          }
        } else {
          this.infraRedArray = JSON.parse(array);
        }

        if (this.xRayArray && this.infraRedArray) {
          this.canStart = true;
        }
      },
      mergeArrays() {
        this.regenerate = false;
        const arrayToDraw = [];
        this.mergedArray = [];
        for (let i = 0; i <= this.infraRedArray.length - 1; i += 1) {
          this.mergedArray[i] = [];
          for (let j = 0; j <= this.xRayArray[i].length - 1; j += 1) {
            this.mergedArray[i][j] = this.infraRedArray[i][j] * this.xRayArray[i][j];
            if (this.mergedArray[i][j] > this.threshold && this.mergedArray[i][j] <= 1) {
              arrayToDraw.push({
                x: i,
                y: j,
              });
            }
          }
        }
        this.arrayToDraw = arrayToDraw;
      },
      onInfraredPicked(file) {
        this.infraRedFile = file;
      },
      onXRayPicked(file) {
        this.xRayFile = file;
      },
    },
  }
</script>


<style>
  .hello {
    display: grid;
    grid-template-columns: 2fr 1fr 2fr;
    grid-column-gap: 50px;
    width: 50%;
    box-sizing: content-box;
    margin: 10% calc(25% - 40px);
  }

  .report {
    display: grid;
    grid-template-columns: 3fr 2fr;
  }
</style>

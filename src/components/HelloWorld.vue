<template>
  <div class="hello" v-if="!imageBase64">
    <section>
      <ImagePreview @detectedImage="onImageDetected" :array="arrayToDraw" v-if="infraRedFile" @onArray="onArrayData" :type="'i'" :data="infraRedFile"></ImagePreview>
      <ImagePicker @filePicked="onInfraredPicked" :type="'x'" text="Pick Infra-red image"></ImagePicker>
    </section>
    <section></section>
    <section>
      <ImagePreview @detectedImage="onImageDetected" v-if="xRayFile" @onArray="onArrayData" :type="'x'" :data="xRayFile"></ImagePreview>
      <ImagePicker @filePicked="onXRayPicked" text="Pick x-ray image"></ImagePicker>
    </section>
  </div>

  <div class="report" v-else>
    <div>
      <h1>Analysis report</h1>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Architecto excepturi hic illum iste, molestias omnis perspiciatis quae quia unde voluptatibus?
      </p>
      <img :src="imageBase64" alt="Reported image">
    </div>

    <div class="div">
      <h1>Plot</h1>
      <div class="plot" id="plot">
    </div>

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
      };
    },
    props: {
      msg: String
    },
    methods: {
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
          this.mergeArrays();
        }
      },
      mergeArrays() {
        const arrayToDraw = [];
        for (let i = 0; i <= this.infraRedArray.length - 1; i += 1) {
          this.mergedArray[i] = [];
          for (let j = 0; j <= this.xRayArray[i].length - 1; j += 1) {
            this.mergedArray[i][j] = this.infraRedArray[i][j] * this.xRayArray[i][j];
            if (this.mergedArray[i][j] > 0.9 && this.mergedArray[i][j] <= 1) {
              arrayToDraw.push({
                x: i,
                y: j,
              });
            }
            window.arr = this.mergedArray;

          }
        }
        this.arrayToDraw = arrayToDraw;
      },
      onInfraredPicked(file) {
        console.log(file, 'infrared');
        this.infraRedFile = file;
      },
      onXRayPicked(file) {
        this.xRayFile = file;
        console.log(file, 'xray');
      },
    },
  }
</script>


<style>
  .hello {
    display: grid;
    grid-template-columns: 2fr 1fr 2fr;
    width: 700px;
    margin: 0 auto;
  }

  .report {
    display: grid;
    grid-template-columns: 3fr 2fr;
  }
</style>

<template>
  <div class="hello">
    <section>
      <ImagePreview :array="arrayToDraw" v-if="infraRedFile" @onArray="onArrayData" :type="'i'" :data="infraRedFile"></ImagePreview>
      <ImagePicker @filePicked="onInfraredPicked" :type="'x'" text="Pick Infra-red image"></ImagePicker>
    </section>
    <section></section>
    <section>
      <ImagePreview v-if="xRayFile" @onArray="onArrayData" :type="'x'" :data="xRayFile"></ImagePreview>
      <ImagePicker @filePicked="onXRayPicked" text="Pick x-ray image"></ImagePicker>
    </section>
  </div>
</template>

<script>
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
      };
    },
    props: {
      msg: String
    },
    methods: {
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
            if (this.infraRedArray[i][j] > 0.98 && this.infraRedArray[i][j] <= 1) {
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
</style>

<template>
  <div class="picker">
    <img v-if="!picked" @click="pickFile" :src="`https://via.placeholder.com/350?text=${text}`" alt="">
    <input ref="pickerDialog" type="file" @change="onFilePicked" style="display: none;"/>
  </div>
</template>

<script>
  export default {
    props: {
      text: String,
    },
    data() {
      return {
        picked: false,
      }
    },
    name: "ImagePicker",
    methods: {
      pickFile() {
        this.$refs.pickerDialog.click();
      },
      onFilePicked(ev) {
        const fileObject = ev.target.files[0];
        if (!fileObject) {
          alert('File required');
        }

        this.picked = true;
        this.$emit('filePicked', fileObject);
      }
    }
  }
</script>

<style scoped>
  img {
    cursor: pointer;
  }

  .picker {
    text-align: center;
  }
</style>

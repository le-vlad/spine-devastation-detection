<template>
    <div>
        <button @click="pickFile">{{text}}</button>
        <input ref="pickerDialog" type="file" @change="onFilePicked" style="display: none;" />
    </div>
</template>

<script>
  export default {
    props: {
      text: String,
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

        this.$emit('filePicked', fileObject);
      }
    }
  }
</script>

<style scoped>

</style>

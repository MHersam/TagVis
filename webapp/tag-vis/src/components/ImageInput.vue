<!-- Component for the profile image upload, handles the uploaded image and does the validation -->
<template>
  <div>
    <!-- slot for parent component to activate the file changer -->
    <div @click="launchFilePicker()" style="cursor: pointer">
      <slot name="activator"></slot>
    </div>
    <input
      type="file"
      ref="file"
      :name="uploadFieldName"
      @change="onFileChange($event.target.name, $event.target.files, $event)"
      style="display: none"
    />
    <v-alert type="error" v-if="errorText.length > 0" style="width: 450px">{{
      errorText
    }}</v-alert>
  </div>
</template>

<script>
import Vue from "vue";
import axios from "axios";
export default Vue.extend({
  name: "ImageInput",
  data: () => ({
    errorText: "",
    uploadFieldName: "file",
    maxSize: 10000,
    avatar: null,
  }),
  mounted() {
    this.setImage();
  },
  props: {
    value: Object,
  },
  watch: {
    "$store.getters.get_photo_url": function () {
      this.setImage();
    },
  },
  methods: {
    setImage() {
      var uri = null;
      axios
        .get("/api/users/photo/uri?userid=" + this.$store.getters.get_user_id)
        .then((res) => {
          console.log(res)
          uri = res.data;
          if (uri != null) {
            var imageURL = URL.createObjectURL(this.dataURItoBlob(uri));
            this.avatar = { uri: uri, imageURL: imageURL };
            this.$emit("input", { uri, imageURL });
          }
        });
      //var uri = this.$store.getters.get_photo_url;
    },
    launchFilePicker() {
      this.$refs.file.click();
    },
    onFileChange(fieldName, file, e) {
      const { maxSize } = this;
      var vm = this;
      let imageFile = file[0];
      if (file.length > 0) {
        let size = imageFile.size / 1000 / maxSize;
        if (!imageFile.type.match("image.*")) {
          // check whether the upload is an image
          this.errorText = "Please choose an image file";
        } else if (size > 1) {
          // check whether the size is greater than the size limit
          this.errorText =
            "Your file is too big! Please select an image under 10MB";
        } else {
          this.errorText = "";
          // reduce size of uploaded image to 128x128px
          const width = 128;
          const height = 128;
          const fileName = e.target.files[0].name;
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            (img.onload = () => {
              //create canvas with specified dimensions
              const elem = document.createElement("canvas");
              elem.width = width;
              elem.height = height;
              const ctx = elem.getContext("2d");
              //draw original image on canvas
              ctx.drawImage(img, 0, 0, width, height);
              ctx.canvas.toBlob(
                (blob) => {
                  //create new new file from canvas
                  const file = new File([blob], fileName, {
                    type: "image/png",
                    lastModified: Date.now(),
                  });
                  imageFile = file;
                  let imageURL = URL.createObjectURL(file);
                  // read the new image file
                  const reader = new FileReader();
                  reader.onload = function () {
                    console.log(reader.result);
                    var uri = reader.result;
                    console.log(imageURL);

                    // Emit the image to the parent component
                    vm.avatar = { uri: reader.result, imageURL: imageURL };
                    vm.$emit("input", { uri, imageURL });
                    //vm.avatar = { uri: reader.result, imageURL: imageURL, file: file };
                    //vm.$emit("input", { uri, imageURL, file });
                  };
                  reader.readAsDataURL(imageFile);
                },
                "image/png",
                1
              );
            }),
              (reader.onerror = (error) => console.log(error));
          };
          reader.readAsDataURL(imageFile);
        }
      }
    },
    dataURItoBlob(dataURI) {
      var mime = dataURI.split(",")[0].split(":")[1].split(";")[0];
      var binary = atob(dataURI.split(",")[1]);
      var array = [];
      for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
      return new Blob([new Uint8Array(array)], { type: mime });
    },
  },
});
</script>
<!-- Component for the bibtex file upload, also parses the bibtex to json -->
<template>
  <vue-dropzone
    ref="dropzone"
    id="dropzone"
    :options="dropzoneOptions"
    :useCustomSlot="true"
  >
    <div>
      <h3>Drag and drop BibTeX file(s) here</h3>
      <div>or click to select file(s) from your device</div>
    </div>
  </vue-dropzone>
</template>

<script lang="ts">
import Vue from "vue";
import vue2Dropzone from "vue2-dropzone";
import "vue2-dropzone/dist/vue2Dropzone.min.css";
import bibtexParse from "bibtex-parse-js";

export default Vue.extend({
  name: "FileUpload",
  components: {
    vueDropzone: vue2Dropzone,
  },
  data: function () {
    return {
      dropzoneOptions: {
        url: "https://localhost",
        autoQueue: false,
        thumbnailWidth: 200,
        maxFilesize: 10,
        acceptedFiles: ".bib",
        addRemoveLinks: true,
      },
    };
  },
  mounted() {
    this.$refs.dropzone.$on("vdropzone-files-added", (files) => {
      const docs = [];
      const promises = [];
      files.forEach((file) => promises.push(this.parseDocuments(file)));
      Promise.all(promises).then((d) => {
        d.forEach((d2) => {
          d2.forEach((d3) => {
            // d3 is a single document
            docs.push(d3);
          });
        });
        this.$store.commit("add_documents", docs);
        if (this.$router.currentRoute.path != "/library") {
          this.$router.push("/library");
        }
      });
    });
  },
  methods: {
    parseDocuments: async function (file) {
      return new Promise((resolve, reject) => {
        file.text().then((fileContent) => {
          const docJSON = bibtexParse.toJSON(fileContent);
          const docs = [];
          docJSON.forEach((doc) => {
            const entry = doc.entryTags;
            let tagName = "";
            Object.keys(entry).forEach((key) => {
              if (key.includes("tags")) {
                tagName = key;
              }
            });
            entry.tags = doc.entryTags[tagName]
              ? doc.entryTags[tagName].split(",")
              : [];
            if (doc.entryTags.journal || doc.entryTags.booktitle || doc.entryTags.publisher) {
              if (doc.entryTags.journal) entry.source = doc.entryTags.journal;
              else if (doc.entryTags.booktitle)
                entry.source = doc.entryTags.booktitle;
              else if (doc.entryTags.publisher)
                entry.source = doc.entryTags.publisher;
            }
            entry.created = new Date().toISOString().slice(0, 10);
            entry.id =
              "_" + Math.random().toString(36) + Math.random().toString(36);
            entry.authors = this.parseAuthorString(
              doc.entryTags.author ? doc.entryTags.author : ""
            );
            entry.authorsString = "";
            entry.authors.forEach((author) => {
              entry.authorsString += author.first_name
                ? author.first_name + " "
                : "";
              entry.authorsString += author.last_name + ", ";
            });
            entry.authorsString = entry.authorsString.substring(
              0,
              entry.authorsString.length - 2
            );
            entry.identifiers = this.parseIdentifiers(entry);
            entry.user = {};
            entry.user.photo = null;
            entry.user._id = 0;
            entry.user.display_name = "Anonymous";
            docs.push(entry);
          });
          resolve(docs);
        });
      });
    },
    parseAuthorString(authors: string) {
      const authorsArray = [];
      const a = authors.split(" and ");
      a.forEach((author) => {
        const obj = {};
        if (author.includes(",")) {
          const a = author.split(",");
          obj.first_name = a[1].slice(1);
          obj.last_name = a[0];
        } else {
          const a = author.split(" ");
          obj.last_name = a.pop();
          obj.first_name = a.join(" ")
        }
        authorsArray.push(obj);
      });
      return authorsArray;
    },
    parseIdentifiers(doc: any) {
      const identifiers = {};
      doc.doi ? (identifiers.doi = doc.doi) : null;
      doc.eprint ? (identifiers.arxiv = doc.eprint) : null;
      doc.pmid ? (identifiers.pmid = doc.pmid) : null;
      doc.mag ? (identifiers.mag = doc.mag) : null;
      doc.acl ? (identifiers.acl = doc.acl) : null;
      doc.isbn ? (identifiers.isbn = doc.isbn) : null;
      doc.issn ? (identifiers.issn = doc.issn) : null;
      return identifiers;
    },
  },
});
</script>
<style scoped>
</style>

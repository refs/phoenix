<template>
<div>
  <h4>Choose files ...</h4>
  <div>
    <oc-loader id="files-list-progress" v-if="loadingFolder"></oc-loader>
    <div id="files-list-container" class="uk-overflow-auto uk-flex-auto">
      <file-list ref="fileList" :fileData="activeFiles" id="files-list" :loading="loadingFolder" :actions="[]" :isActionEnabled="() => false">
        <template #headerColumns>
          <oc-table-cell type="head" class="uk-text-truncate" v-translate>Name</oc-table-cell>
          <oc-table-cell shrink type="head" class="uk-visible@m"><translate>Size</translate></oc-table-cell>
          <oc-table-cell shrink type="head" class="uk-visible@m uk-text-nowrap" v-translate>Modification Time</oc-table-cell>
        </template>
        <template #rowColumns="{ item }">
          <oc-table-cell class="uk-text-truncate">
            <oc-file @click.native.stop="item.type === 'folder' ? navigateTo(item.path.substr(1)) : openFileActionBar(item)"
              :name="item.basename" :extension="item.extension" class="file-row-name" :icon="fileTypeIcon(item)"
              :filename="item.name" :key="item.id"/>
          </oc-table-cell>
          <oc-table-cell class="uk-text-meta uk-text-nowrap uk-visible@m">
            {{ item.size | fileSize }}
          </oc-table-cell>
          <oc-table-cell class="uk-text-meta uk-text-nowrap uk-visible@m">
            {{ formDateFromNow(item.mdate) }}
          </oc-table-cell>
        </template>
      </file-list>
    </div>
    <oc-button @click="createLink">Create Link</oc-button>
  </div>
</div>
</template>

<script>
import { mapGetters } from 'vuex'
import FileList from '../FileList.vue'
import Mixins from '../../mixins'

export default {
  components: {
    FileList
  },
  mixins: [
    Mixins
  ],
  mounted () {
    this.$refs.fileList.$_ocFilesFolder_getFolder()
  },
  computed: {
    ...mapGetters('Files', [
      'activeFiles', 'loadingFolder', 'highlightedFile', 'currentFolder', 'inProgress'
    ])
  },
  methods: {
    createLink () {
      window.parent.postMessage({ action: 'filesSelected', data: [{ file: 'hello.txt', link: 'https://kopano.demo/owncloud/s/123456789' }] })
    }
  },
  watch: {
    $route () {
      this.$refs.fileList.$_ocFilesFolder_getFolder()
    }
  }
}
</script>

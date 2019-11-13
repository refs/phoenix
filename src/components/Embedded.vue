<template>
<div>
  <main id="main">
    <oc-spinner v-if="loadingState"/>
    <template v-if="openFilePicker">
      <router-view id="oc-app-container" name="app" class="uk-height-1-1"></router-view>
      <oc-button @click="createLink">Create Link</oc-button>
    </template>
  </main>
</div>
</template>
<script>

export default {
  data () {
    return {
      actionName: 'init'
    }
  },
  methods: {
    createLink () {
      window.parent.postMessage({ action: 'filesSelected', data: [{ file: 'hello.txt', link: 'https://kopano.demo/owncloud/s/123456789' }] })
    }
  },
  mounted () {
    const self = this
    window.addEventListener('message', function (e) {
      self.actionName = e.data.action
      console.log(e.data)
    })
  },
  computed: {
    loadingState () {
      return this.actionName !== 'openFilePicker'
    },
    openFilePicker () {
      return this.actionName === 'openFilePicker'
    }
  }
}
</script>

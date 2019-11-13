<template>
<div>
  <main id="main">
    <oc-spinner v-if="loadingState"/>
    <template v-else>
      <router-view id="oc-embedded-container" name="embedded" class="uk-height-1-1"></router-view>
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
  mounted () {
    const self = this
    window.addEventListener('message', function (e) {
      self.actionName = e.data.action
      // TODO: evaluate action name
      self.$router.push({
        path: '/files/embedded/file-picker'
      })
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

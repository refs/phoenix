<template>
  <div>
    <h4>Joining room oc-{{ currentFile.id }} </h4>
    <div ref="main"></div>
  </div>
</template>
<script>
import { embed } from '@longsleep/glue'
import { mapGetters } from 'vuex'

export default {
  title: ($gettext) => {
    return $gettext('Kopano Meet')
  },
  mounted () {
    this.startGroupCall()
  },
  watch: {
    currentFile () {
      this.startGroupCall()
    }
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile']),
    currentFile () {
      return this.highlightedFile
    }
  },
  methods: {
    startGroupCall () {
      if (this.currentFile === undefined) {
        return
      }
      const docKey = this.currentFile.id
      const meetUrl = `/meet/r/group/oc-${docKey}#mute=1&auto=2`
      embed(meetUrl, this.$refs.main, {
        className: 'meet-frame'
      }).then((glue) => {
        console.log(glue)
      })
    }
  }

}
</script>
<style>
.meet-frame {
    width: 100%;
    height: 400px;
}
</style>

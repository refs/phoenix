/**
 * Find an item in the files list. Scrolls down in case the item is not visible in viewport
 */
exports.command = function (selector) {
  return this.execute(function (selector) {
    const filesListContainer = document.querySelector('#files-list-container')
    const virtualScrollWrapper = document.querySelector('.vue-recycle-scroller__item-wrapper')
    let scrollDistance = filesListContainer.scrollTop
    const scrollInterval = setInterval(function () {
      const item = document.querySelector(`[data-item-name="${selector}"]`)
      if (item || virtualScrollWrapper.clientHeight < scrollDistance) {
        clearInterval(scrollInterval)
        return
      }
      scrollDistance += filesListContainer.clientHeight
      filesListContainer.scrollTop = scrollDistance
    }, 500)
  }, [selector])
}

/* global document, window, R */
// noinspection DuplicatedCode,ThisExpressionReferencesGlobalObjectJS,SillyAssignmentJS

(function () {

  const cards = toArray(document.querySelectorAll('.card'))
  const clearFilterIcon = document.getElementById('clear-filter-icon')
  const contentArea = document.getElementById('content-area')
  const entries = toArray(document.querySelectorAll('.toc-entry'))
  const navApiLi = document.getElementById('nav-api-li')
  const navHomeLi = document.getElementById('nav-home-li')
  const readmeContainer = document.getElementById('readme-container')
  const textFilter = document.getElementById('filter-text')
  const privateFilter = document.getElementById('show-private')

  const findFirst = R.find(R.prop('offsetParent'))

  function clearFilter() {
    filterStringSet('')
  }

  function dispatchEvent(event) {
    const target = event.target

    const category = target.tagName === 'SPAN' && target.getAttribute('data-category')

    // did user click on a category name?
    if (category) {
      filterStringSet(category)
    }

    // did user click on 'Home'?
    if (target.id === 'nav-home') {
      contentArea.style.visibility = 'collapse'
      readmeContainer.style.visibility = 'visible'
      navHomeLi.classList.add('active-header-tab')
      navApiLi.classList.remove('active-header-tab')
    }

    // did user click on 'API Documentation'?
    if (target.id === 'nav-api') {
      readmeContainer.style.visibility = 'collapse'
      contentArea.style.visibility = 'visible'
      navHomeLi.classList.remove('active-header-tab')
      navApiLi.classList.add('active-header-tab')
    }

    // did user click on space between ToC entry name and category?
    if (target.tagName === 'LI' && target.classList.contains('toc-entry')) {
      window.location = target.getElementsByTagName('a')[0].href
    }

    if (isTopLink(target)) {
      scrollToTop(target)
    }
  }

  // toggle visibility of items based on filter UI
  function filter() {
    const f = filterElement.bind(null, textFilter.value, privateFilter.checked)
    entries.forEach(f)
    cards.forEach(f)
  }

  // toggle visibility for one DOM element
  function filterElement(nameFilter, privateFilter, elem) {
    elem.style.display =
      (privateFilter || elem.getAttribute('data-access') === 'public') &&
      (strIn(nameFilter, elem.getAttribute('data-name')) ||
        R.toLower(nameFilter) === R.toLower(elem.getAttribute('data-category'))) ?
        '' :
        'none'
  }

  // set filter to a specific string
  function filterStringSet(str) {
    // set text filter
    textFilter.value = str
    // refilter
    filter()
  }

  function gotoFirst(e) {
    if (R.isEmpty(e.detail)) {
      return
    }

    const entry = findFirst(entries)
    if (entry) {
      const onHashChange = function () {
        e.target.focus()
        window.removeEventListener('hashchange', onHashChange)
      }

      // Hash change blurs input, put focus back to input
      window.addEventListener('hashchange', onHashChange)
      window.location.hash = entry.getAttribute('data-name')
    }
  }

  function isTopLink(elem) {
    return elem.getAttribute('href') === '#'
  }

  function keypress(e) {
    if (e.key === 13) {
      e.target.dispatchEvent(new window.CustomEvent('enter', {
        detail: e.target.value
      }))
    }
  }

  function scrollToTop() {
    if(contentArea.style.visibility === 'visible') {
      const main = document.querySelector('#detail-entries')
      main.scrollTop = 0
    } else {
      readmeContainer.scrollTop = 0
    }
  }

  function strIn(a, b) {
    a = a.toLowerCase()
    b = b.toLowerCase()
    return b.indexOf(a) >= 0
  }

  function toArray(xs) {
    return Array.prototype.slice.call(xs)
  }

  // executed after rest of document loaded
  filter()

  document.body.addEventListener('click', dispatchEvent, false)
  clearFilterIcon.addEventListener('click', clearFilter, false)
  textFilter.addEventListener('input', filter, false)
  textFilter.addEventListener('keypress', keypress, false)
  textFilter.addEventListener('enter', gotoFirst)
  privateFilter.addEventListener('change', filter, false)

  document.body.addEventListener('click', function (event) {
    if (event.target.className.split(' ').indexOf('toggle-params') >= 0) {
      const expanded = event.target.parentNode.getAttribute('data-expanded')
      event.target.parentNode.setAttribute(
        'data-expanded',
        expanded === 'true' ? 'false' : 'true'
      )
    }
  }, false)

  // back-button hack
  window.addEventListener('hashchange', function () {
    // eslint-disable-next-line no-self-assign
    window.location.href = window.location.href
  }, false)

}.call(this))

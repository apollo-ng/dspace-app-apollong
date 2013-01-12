function MMarker (map, options) {
  var me = this
  if (!options) options = {}

  Object.keys(options).forEach(function (key) {
    me[key] = options[key]
  })

  me.map = map
  me.setID()

  if (typeof me.latitude === "string") me.latitude = parseFloat(me.latitude)
  if (typeof me.longitude === "string") me.longitude = parseFloat(me.longitude)
  me.location = new MM.Location(me.latitude, me.longitude)

  me.container = document.createElement('div')
  me.container.className = 'marker'
  me.container.style.position = "absolute"
  me.container.style.height = "0px"
  me.image = document.createElement('img')
  me.image.src = me.markerImage || 'assets/images/tiki-man.png'
  me.container.appendChild(me.image)

  me.touch = ('ontouchstart' in window) ? true : false
  if (me.touch) MM.addEvent(me.map.parent, 'touchstart', function(e) { me.dismissPopup.call(me, e) })
  else MM.addEvent(me.map.parent, 'mousedown', function(e) { me.dismissPopup.call(me, e) })

  if (me.touch) MM.addEvent(me.container, 'touchstart', function(e) { me.togglePopup.call(me, e) })
  else MM.addEvent(me.container, 'mousedown', function(e) { me.togglePopup.call(me, e) })

  me.map.addCallback('panned', function(e) { me.updatePosition.call(me, e) })
  me.map.addCallback('zoomed', function(e) { me.updatePosition.call(me, e) })
  me.map.addCallback('resized', function(e) { me.updatePosition.call(me, e) })

  me.map.parent.appendChild(me.container)
  me.updatePosition()
}

MMarker.prototype.setID = function () {
  var s = [], itoh = '0123456789ABCDEF'

  // Make array of random hex digits. The UUID only has 32 digits in it, but we
  // allocate an extra items to make room for the '-'s we'll be inserting.
  for (var i = 0; i <36; i++) s[i] = Math.floor(Math.random()*0x10)

  // Conform to RFC-4122, section 4.4
  s[14] = 4  // Set 4 high bits of time_high field to version
  s[19] = (s[19] & 0x3) | 0x8  // Specify 2 high bits of clock sequence

  // Convert to hex chars
  for (var i = 0; i <36; i++) s[i] = itoh[s[i]]

  // Insert '-'s
  s[8] = s[13] = s[18] = s[23] = '-'

  this.id = s.join('')
}

MMarker.prototype.updatePosition = function() {
  var me = this
  var point = me.map.locationPoint(me.location)
  me.container.style.left = point.x - me.image.width / 2 + 'px'
  me.container.style.top = point.y - me.image.height + 'px'
  if (me.popup && me.popup.style.display === "block") me.showPopup()
}

// popups are hidden by default so this makes them visible very quickly to get their height
MMarker.prototype.getPopupSize = function() {
  var me = this
  var offsetLeft = me.popup.style.left
  var display = me.popup.style.display
  me.popup.style.left = "-9999px"
  me.popup.style.display = "block"
  var width = me.popup.offsetWidth
  var height = me.popup.offsetHeight
  me.popup.style.left = offsetLeft
  me.popup.style.display = display
  return {width: width, height: height}
}

MMarker.prototype.dismissPopup = function(e) {
  var me = this

  function isDescendant(parent, child) {
     var node = child.parentNode
     while (node !== null) {
       if (node === parent) return true
       node = node.parentNode
     }
     return false
  }

  var notMapClick = (me.container === e.target || isDescendant(me.container, e.target))
  if (!notMapClick && me.popup.style.display !== "none") me.hidePopup.call(me)
}

MMarker.prototype.setPopup = function(html, options) {
  var me = this
  me.offsetY = options.offsetY || 0
  me.popup = document.createElement('div')
  me.popup.className = 'marker-popup'
  me.popup.style.display = "none"
  me.popup.style.position = "relative"
  me.popup.style.overflow = "auto"
  me.popup.style['z-index'] = "666"
  me.popup.innerHTML = html
  me.container.appendChild(me.popup)
  me.popupSize = me.getPopupSize()
}

MMarker.prototype.togglePopup = function() {
  var me = this
  if (me.popup.style.display === "none") me.showPopup.call(me)
  else me.hidePopup.call(me)
}

MMarker.prototype.hidePopup = function(e) {
  var me = this
  me.image.style.cursor = 'default'
  me.popup.style.display = 'none'
}

MMarker.prototype.showPopup = function(e) {
  var me = this
  me.popup.style.display = 'block'
  me.popup.style.left = (-me.popupSize.width / 2) + (me.image.width / 2) + 'px'
  me.popup.style.top = me.offsetY - me.popupSize.height - me.image.height + 'px'
  me.image.style.cursor = 'pointer'
}

// custom scroll application developed for three.oh 3/2001.
// thanks to brandon (www.jesterworld.net) and grant (no site cuz he's too pimp for it) for the help w/ the visuals.
// > youngpup > www.youngpup.net

// optimized for the latest version of {3.0} by bob

ThreeOhScroll.mo5 = navigator.userAgent.indexOf("Gecko") != -1
ThreeOhScroll.ie4 = navigator.appName == "Microsoft Internet Explorer" && document.all
ThreeOhScroll.ie5 = navigator.appName == "Microsoft Internet Explorer" && document.getElementById
ThreeOhScroll.pc = navigator.platform == "Win32"

// this number is for ie4 pc only - which cannot have the description box be of variable width (or atleast i can't figure out how to).
// you set the number of pixels that the desc tag will be permanently.
ThreeOhScroll.ie4pcDescWidth = 100

// this is how long it should take the scroller to animate when the user clicks a marker (in milliseconds)
ThreeOhScroll.aniLen = 250


function ThreeOhScroll(id)
{
	if (ThreeOhScroll.mo5 || (ThreeOhScroll.ie4 && ThreeOhScroll.pc) || ThreeOhScroll.ie5) {
		this.id = id
		this.getMembers()

		if (ThreeOhScroll.ie4 && !ThreeOhScroll.ie5 && ThreeOhScroll.pc) this.description.style.width = ThreeOhScroll.ie4pcDescWidth

		this.clipH		= parseInt(this.container.style.height)
		this.PTags		= ypGetDescendantsByTagName("P", this.content)
		var lastP		= this.PTags[this.PTags.length-1]
	        var lastPTop	= lastP.offsetTop;
		this.docH		= lastPTop + Math.max(lastP.offsetHeight, this.clipH)
		this.scrollH	= this.docH - this.clipH
		this.markersMax	= parseInt(this.markers.style.height) - 7
		this.thumbMax	= parseInt(this.thumbContainer.style.height) - this.thumbImg.height
		this.arrowMax	= parseInt(this.arrowContainer.style.height) - this.arrowImg.height

		this.gRef = "ThreeOhScroll_"+id
		eval(this.gRef+"=this")
		this.thumb.obj	= this
		this.thumb.onmousedown = this.startDrag
		this.thumb.onmouseover = Function(this.gRef + ".toggleThumb(1)")
		this.thumb.onmouseout  = Function(this.gRef + ".toggleThumb(0)")
		this.thumb.onmouseup   = Function(this.gRef + ".toggleThumb(0)")
		this.thumb.ondragstart = function() { return false }
		this.initMarkers()
	} else {
		alert ('ha ha!\n\nThe ThreeOh scroller won\'t work for your browser. Don\'t you feel stupid??\n\n I suggest you go get a newer one.')
	}
}

ThreeOhScroll.prototype.initMarkers = function() {
	var shtml = "", sTitle, iTop
	for (var i = 0; i < this.PTags.length; i++) {
		sTitle	= this.PTags[i].getAttribute("description")
	        pTop	= this.PTags[i].offsetTop;
		iTop	= Math.round(pTop * this.markersMax / this.scrollH)
		if (sTitle && sTitle != "" && sTitle != null) {
			shtml  += "<div id='" + this.id + "_marker_" + i + "' "
			shtml  += "style='position:absolute; left:2px; top:" + (iTop + 2) + "px; "
			shtml  += "width:5px; height:3px; clip:rect(0 5 3 0); background-color:#CCCCCC; z-index:3;'></div>"
			shtml  += "<div style='position:absolute; left:0px; top:" + iTop + "px; "
			shtml  += "cursor:pointer; cursor:hand; width:9px; height:7px; clip:rect(0 9 7 0); z-index:4;' "
			shtml  += "onmousedown='" + this.gRef + ".scrollTo(" + pTop + ")' "
			shtml  += "onmouseover='" + this.gRef + ".toggleMarker(this, " + i + ", 1)' "
			shtml  += "onmouseout='" + this.gRef + ".toggleMarker(this, " + i + ", 0)' "
			shtml  += "description='" + sTitle.replace(/'/g, "|pos|") + "'>"
			shtml  += "<img src='x.gif' width='9' height='7'></div>"
		}
	}
	this.markers.innerHTML += shtml
}

ThreeOhScroll.prototype.getMembers = function() {
	this.container=ypGetElementById('filterContainer');
	this.content=ypGetElementById('filterContent');
	this.markers=ypGetElementById('filterMarkers');
	this.thumb=ypGetElementById('filterThumb');
	this.arrow=ypGetElementById('filterArrow');
	this.thumbImg=ypGetElementById('filterThumbImg');
	this.arrowImg=ypGetElementById('filterArrowImg');
	this.thumbContainer=ypGetElementById('filterThumbContainer');
	this.arrowContainer=ypGetElementById('filterArrowContainer');
	this.description=ypGetElementById('filterDescription');
	this.descArrow=ypGetElementById('filterDescArrow');
}

ThreeOhScroll.prototype.startDrag = function(e) {
	if (!e) e = window.event
	var ey = e.pageY ? e.pageY : e.clientY
	this.dragLastY = ey
	this.dragStartOffset = ey - parseInt(this.style.top)
	ThreeOhScroll.current = this.obj
	document.onmousemove = this.obj.doDrag
	document.onmouseup = this.obj.stopDrag
	if (this.obj.aniTimer) window.clearInterval(this.obj.aniTimer)
	return false;
}

ThreeOhScroll.prototype.doDrag = function(e) {
	if (!e) e = window.event
	var obj = ThreeOhScroll.current
	var ey = (e.pageY ? e.pageY : e.clientY)
	var dy = ey - obj.thumb.dragLastY
	var ny = parseInt(obj.thumb.style.top) + dy
	if (ny >= obj.thumbMax) obj.thumb.dragLastY = obj.thumbMax + obj.thumb.dragStartOffset
	else if (ny < 0) obj.thumb.dragLastY = obj.thumb.dragStartOffset
	else obj.thumb.dragLastY = ey
	ny = Math.min(Math.max(ny, 0), obj.thumbMax)
	obj.jumpTo(ny * obj.scrollH / obj.thumbMax)
	return false;
}

ThreeOhScroll.prototype.stopDrag = function() {
	this.onmousemove = null
	this.onmouseup   = null
	ThreeOhScroll.current.toggleThumb(0)
}

ThreeOhScroll.prototype.scrollTo = function(ny) {
	this.endArrow = Math.round(ny * this.markersMax / this.scrollH)
	this.startTime = (new Date()).getTime()
	this.startPos = parseInt(this.content.style.top) * -1
	this.endPos = ny
	this.dist = this.endPos - this.startPos
	this.accel = this.dist / ThreeOhScroll.aniLen / ThreeOhScroll.aniLen
	if (this.aniTimer) this.aniTimer = window.clearInterval(this.aniTimer)
	this.aniTimer = window.setInterval(this.gRef + ".scroll()", 10)
}

ThreeOhScroll.prototype.scroll = function() {
	var now = (new Date()).getTime()
	var elapsed = now - this.startTime
	if (elapsed > ThreeOhScroll.aniLen) this.endScroll()
	else {
		var t = ThreeOhScroll.aniLen - elapsed
		var ny = this.endPos - t * t * this.accel
		this.jumpTo(ny)
	}
}

ThreeOhScroll.prototype.endScroll = function() {
	this.jumpTo(this.endPos)
	this.arrow.style.top = this.endArrow
	this.aniTimer = window.clearInterval(this.aniTimer)
}

ThreeOhScroll.prototype.jumpTo = function(ny) {
	this.thumb.style.top	= Math.round(ny * this.thumbMax / this.scrollH)
	this.arrow.style.top	= Math.round(ny * this.arrowMax / this.scrollH)
	this.content.style.top	= -ny
}

ThreeOhScroll.prototype.toggleMarker = function(oTrigger, markerNum, bOn) {
	if (bOn) {
		ypGetElementById(this.id + "_marker_" + markerNum).style.backgroundColor = "#444444"
		if (this.curMarker) this.toggleMarker(this.curMarker, 0)
		this.curMarker = markerNum
		this.descArrow.style.top = parseInt(oTrigger.style.top) + 2 + "px"
		this.description.style.left = "-400px"
		this.description.style.top = "-400px"
		this.description.innerHTML = oTrigger.getAttribute("description")
		var w = document.all && !ThreeOhScroll.ie5 ? ThreeOhScroll.ie4pcDescWidth : this.description.offsetWidth
		this.description.style.left = 259 - w + "px"
		this.description.style.top = parseInt(oTrigger.style.top) - 1 + "px"
		this.description.style.visibility = "visible"
		this.descArrow.style.visibility = "visible"
		this.container.style.left = "0px"
	} else {
		ypGetElementById(this.id + "_marker_" + markerNum).style.backgroundColor = "#cccccc"
		this.curMarker = 0
		this.description.style.visibility = "hidden"
		this.descArrow.style.visibility = "hidden"
	}
}

ThreeOhScroll.prototype.toggleThumb = function(bOn) {
	//this.arrow.style.backgroundColor = this.thumb.style.backgroundColor = bOn ? "#7CDAFE" : "#5EBBE7"
}

function ypGetChildNodes(objParent) {
	return (objParent.childNodes ? objParent.childNodes : objParent.children)
}

function ypGetElementById(id) {
	return (document.getElementById ? document.getElementById(id) : document.all ? document.all[id] : false)
}

function ypGetDescendantsByTagName(sTag, objParent) {
	return (objParent.getElementsByTagName ? objParent.getElementsByTagName(sTag) : objParent.all && objParent.all.tags ? objParent.all.tags(sTag) : false)
}
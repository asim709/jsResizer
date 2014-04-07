/*

jsResizer v1.0
==============
A javascript utility to crops, resize and reposition image. It provided two windows one for
editting and one for output. It can be used in social media websites where a user uploads
his profile image, edits and save it, the same concept we see in linked-in.

The tool creates CSS to do all editing stuff on client side. Furthermore it can also provide
dimensions information using that the developer can actually resize/crop image on server. 

Author
=======
Name: Asim Ishaq
Email: asim709@gmail.com

License: GPL v2 or later

*/

//NAMESPACE
jsResizer = {

	create : function (editorId,targetId) {
		
		var obj =  {
			
			editor: {id:editorId},

			target: {id:targetId},

			proxy: {},

			toolbar: {},

			image : {},

			init: function () {
				this.editor.box = document.getElementById(this.editor.id);
				this.editor.box.className = "editor-box";

				this.target.box = document.getElementById(this.target.id);
				this.target.box.className = "target-box";
				this.target.width = parseInt(getComputedStyle(this.target.box).width);
				this.target.height = parseInt(getComputedStyle(this.target.box).height);
				//What will be the height if we know the width
				this.target.yRatio = Math.round(this.target.height/this.target.width,0);

				//width of the editor will remain the same as specified by user. However the
				//height will be determined by target ratio
				this.editor.width = parseInt(getComputedStyle(this.editor.box).width);
				this.editor.height = parseInt(getComputedStyle(this.editor.box).height);

				//Create proxy element in Editor
				this.proxy.box =document.createElement("div");
				this.proxy.box.className = "proxy-box";
				this.proxy.width = this.target.width;
				this.proxy.height = this.target.height;
				this.editor.box.appendChild(this.proxy.box);

				//Create Toolbar
				this.toolbar.box = document.createElement("div");
				this.toolbar.box.className = "toolbar-box";

				this.toolbar.resetButton = document.createElement("input");
				this.toolbar.resetButton.setAttribute("type","button");
				this.toolbar.resetButton.className = "toolbar-reset-button";

				this.toolbar.zoomInButton = document.createElement("input");
				this.toolbar.zoomInButton.setAttribute("type","button");
				this.toolbar.zoomInButton.className = "toolbar-zoomin-button";

				this.toolbar.zoomOutButton = document.createElement("input");
				this.toolbar.zoomOutButton.setAttribute("type","button");
				this.toolbar.zoomOutButton.className = "toolbar-zoomout-button";

				this.toolbar.box.appendChild(this.toolbar.zoomInButton);
				this.toolbar.box.appendChild(this.toolbar.zoomOutButton);
				this.toolbar.box.appendChild(this.toolbar.resetButton);
				this.editor.box.appendChild(this.toolbar.box);

				//Attach Event handlers -- Dragable Proxy
				this.proxy.box.addEventListener("mousedown",this.Event_ProxyMouseDown);
				this.proxy.box.addEventListener("mousemove",this.Event_ProxyMouseMove);
				this.proxy.box.addEventListener("mouseup",this.Event_ProxyMouseUp);
				document.body.addEventListener("mouseup",this.Event_ProxyMouseUp);

				//Attach Event handlers -- Dragable Image in editor
				this.editor.box.addEventListener("mousedown",this.Event_EditorMouseDown);
				this.editor.box.addEventListener("mousemove",this.Event_EditorMouseMove);
				this.editor.box.addEventListener("mouseup",this.Event_EditorMouseUp);
				document.body.addEventListener("mouseup",this.Event_EditorMouseUp);

				//Attach Event handlers -- Toolbar Events
				this.toolbar.zoomInButton.addEventListener("click",this.Event_ToolbarZoomInButtonClick);
				this.toolbar.zoomOutButton.addEventListener("click",this.Event_ToolbarZoomOutButtonClick);
				this.toolbar.resetButton.addEventListener("click",this.Event_ToolbarResetButtonClick);

				//ADJUST DIMENSIONS
				this.editor.box.style.width = this.editor.width + "px";
				this.editor.box.style.height = this.editor.height + "px";
				this.target.box.style.width = this.target.width + "px";
				this.target.box.style.height = this.target.height + "px";
				this.proxy.box.style.width = this.proxy.width + "px";
				this.proxy.box.style.height = this.proxy.height + "px";	
			},


			setImage : function (imageUrl) {
				this.image.url = imageUrl;
				this.editor.box.style.backgroundImage = "url("+this.image.url+")"; 
				
				//Load Image dynamically and get dimensions
				this.image.obj = new Image();
				this.image.obj.src = this.image.url;
				this.image.obj.onload = function () {
					obj.image.width = parseInt(obj.image.obj.width);
					obj.image.height = parseInt(obj.image.obj.height);

					obj.image.yRatio = obj.image.height / obj.image.width; 
					obj.editor.box.style.backgroundSize = obj.image.width + "px " + obj.image.height + "px";
					obj.resetEditor();
				};
			},

			//Redraw target image in preview pane
			syncTarget : function () {
				this.target.box.style.backgroundImage = "url("+this.image.url+")"; 

				bgX=0;
				bgY=0;
				if (this.editor.box.style.backgroundPosition != "") {
					var dim = obj.editor.box.style.backgroundPosition.split(" ");
					bgX = parseInt(dim[0]);
					bgY = parseInt(dim[1]);
				}
				xx = bgX - parseInt(this.proxy.box.style.left);
				yy = bgY - parseInt(this.proxy.box.style.top);

				this.target.box.style.backgroundPosition = xx + "px " + yy+"px";
				this.target.xPosition = xx;
				this.target.yPosition = yy;

				var bgSizeX = this.image.width;
				var bgSizeY = this.image.height;
				if (obj.editor.box.style.backgroundSize != "") {
					var dim = obj.editor.box.style.backgroundSize.split(" ");

					if (dim.length == 1) {
						bgSizeX = parseInt(dim[0]);
						bgSizeY = parseInt(dim[0]);
					} else if (dim.length == 2) {
						bgSizeX = parseInt(dim[0]);
						bgSizeY = parseInt(dim[1]);
					}
				}	

				this.target.box.style.backgroundSize = bgSizeX + "px " + bgSizeY + "px";	
				this.target.newWidth = bgSizeX;
				this.target.newHeight = bgSizeY;
			},

			resetEditor : function () {
				this.editor.box.style.backgroundPosition = "0px 0px";
				this.editor.box.style.backgroundSize = this.image.width + "px " + this.image.height + "px";
				this.proxy.box.style.top = "0px";
				this.proxy.box.style.left = "0px";
				this.syncTarget();
			},

			/*Return the Resized image dimensions. This can be used to either generate css to display image in a container
			  Or it can be sent to server to create image thumbnail
			*/
			getResizedDimensions :  function() {
				return {
					original : {
						width : this.image.width,
						height : this.image.height
					},
					resized : {
						width : this.target.newWidth,
						height : this.target.newHeight
					},
					box : {
						width : this.target.width,
						height : this.target.height
					},
					position : {
						left : this.target.xPosition,
						top : this.target.yPosition
					}
				};
			},

			/* Returns CSS of target container. This will be used to display image.
			*/
			getTargetCss : function () {
				var dim = this.getResizedDimensions();
				return {
					image : "url(" + this.image.url + ")",
					backgroundSize : dim.resized.width + "px " + dim.resized.height + "px",
					backgroundPosition : dim.position.left + "px " + dim.position.top + "px",
					width : dim.box.width + "px",
					height : dim.box.height + "px"
				};
			},

			Event_ProxyMouseMove : function (e) {
				
				if (window.event)
					e = window.event;

				if (obj.proxy.dragStart == true) {
					
					x = e.clientX - obj.proxy.mouseX;
					y = e.clientY - obj.proxy.mouseY;

					xx = parseInt(obj.proxy.box.style.left) + x; 
					yy = parseInt(obj.proxy.box.style.top) + y; 

					//Check if the box is within the Editor
					if (xx < 0)
						xx = 0;

					if (yy < 0)
						yy = 0;
					
					if ((xx+obj.proxy.width) > obj.editor.width) 
						xx = (obj.editor.width - obj.proxy.width) + "px";

					if ((yy+parseInt(obj.proxy.height)) > obj.editor.height) 
						yy = (obj.editor.height - obj.proxy.height) + "px";

					obj.proxy.box.style.left = xx +"px";
					obj.proxy.box.style.top = yy +"px";
					
					obj.proxy.mouseX = e.clientX;
					obj.proxy.mouseY = e.clientY;

				}

				if (e.stopPropagation)
					e.stopPropagation();
				else
					 e.cancelBubble = true;
			},

			Event_ProxyMouseDown : function (e) {
				
				if (window.event)
					e = window.event;

				obj.proxy.dragStart = true;
				obj.proxy.mouseX = e.clientX;
				obj.proxy.mouseY = e.clientY;

				if (e.stopPropagation)
					e.stopPropagation();
				else
					 e.cancelBubble = true;
			},

			Event_ProxyMouseUp : function () {
				obj.proxy.dragStart = false;
				obj.syncTarget();
			},

			Event_EditorMouseMove : function (e) {
				
				if (window.event)
					e = window.event;

				if (obj.editor.dragStart == true) {
					
					x = e.clientX - obj.editor.mouseX;
					y = e.clientY - obj.editor.mouseY;

					bgX=0;
					bgY=0;

					if (obj.editor.box.style.backgroundPosition != "") {
						var dim = obj.editor.box.style.backgroundPosition.split(" ");
						bgX = parseInt(dim[0]);
						bgY = parseInt(dim[1]);
					}
					
					xx = bgX + x;
					yy = bgY + y;

					obj.editor.box.style.backgroundPosition = xx + "px " + yy + "px";
					
					obj.editor.mouseX = e.clientX;
					obj.editor.mouseY = e.clientY;

				}

				//Stop propagation
				if (e.stopPropagation)
					e.stopPropagation();
				else
					 e.cancelBubble = true;

			},

			Event_EditorMouseDown : function (e) {
				
				if (window.event)
					e = window.event;

				obj.editor.dragStart = true;
				obj.editor.mouseX = e.clientX;
				obj.editor.mouseY = e.clientY;

				//Stop propagation
				if (e.stopPropagation)
					e.stopPropagation();
				else
					 e.cancelBubble = true;
			},

			Event_EditorMouseUp : function () {
				obj.editor.dragStart = false;
				obj.syncTarget();
			},

			//Toolbar Events
			Event_ToolbarZoomInButtonClick: function () {

				bgSizeX = parseInt(obj.editor.box.style.backgroundSize.split(" ")[0]) + 20;
				bgSizeY = Math.round(bgSizeX*obj.image.yRatio,0);

				obj.editor.box.style.backgroundSize = bgSizeX + "px " + bgSizeY + "px";
				obj.syncTarget();
			},

			Event_ToolbarZoomOutButtonClick: function () {

				bgSizeX = parseInt(obj.editor.box.style.backgroundSize.split(" ")[0]) - 20;
				bgSizeY = Math.round(bgSizeX*obj.image.yRatio,0);

				obj.editor.box.style.backgroundSize = bgSizeX + "px " + bgSizeY + "px";
				obj.syncTarget();

			},

			Event_ToolbarResetButtonClick: function () {
				obj.resetEditor();
			}

		};//Object END

		obj.init();

		return obj;
	}
}
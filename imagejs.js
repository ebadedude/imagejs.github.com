// prepare canvas
//jQuery('#cvBase').style.border='solid 1px';

String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g,"");
};

// Load imagejs
imagejs={
	canvas2Image:function(canvasid){
		return document.getElementById(canvasid).toDataURL("image/png");
	},

	readImage:function(f){ // read image file
		f=f.item(0); // assuming there is only one file
		jQuery('#msg').text('loading '+f.name+' ... ');
		imagejs.data.fname=f.name;
		reader = new FileReader();
		reader.onload=function(x){ // loading image 
			//canvas tutorial at http://www.html5canvastutorials.com/tutorials/html5-canvas-element/	
			var im = new Image();
			im.onload=function(){
				var cvBase=document.createElement('canvas');
				cvBase.id='cvBase';
				var div = document.getElementById('work');div.innerHTML=''; // workspace div
				div.appendChild(cvBase);
				cvBase.width=this.width;cvBase.height=this.height; //size canvas to the image
				var ctx=cvBase.getContext('2d');
				ctx.drawImage(this,0,0);
				imagejs.data.dt0=imagejs.imread(cvBase);
				// check that image size is ok
				if(cvBase.width*cvBase.height>4000000){
					jQuery('#msg').append('<span style="color:red">image too large, current version is limited to 4 MPixels</span>');
					throw('image too large');
				}
				imagejs.data.dt0 = imagejs.imhalve(imagejs.data.dt0,2000000); // limit set at 1MPixel
				var s = imagejs.size(imagejs.data.dt0);
				if(s[0]!==cvBase.width){ // if image was resized
					cvBase.height=s[0];cvBase.width=s[1]; //size canvas to the image
					imagejs.imwrite(cvBase,imagejs.data.dt0);
				}
				
				jQuery('#msg').append('done');
				// load mainMenu module
				imagejs.loadModule('imagejs.menu.js');
				// create overlay canvas
				var cvTop=document.createElement('canvas');
				cvTop.id='cvTop';
				cvTop.width=cvBase.width;
				cvTop.height=cvBase.height;
				cvTop.style.position='absolute';
				cvTop.style.left=cvBase.offsetLeft;cvTop.style.top=cvBase.offsetTop;
				document.getElementById('work').appendChild(cvTop);		
			}; // to make sure drawing only happens after loading
			im.src=x.target.result; // the stringified image
		};
		reader.readAsDataURL(f);
	},
	
	keepTop:function(){	//size and move cvTop to be on top of cvBase
		var cvboffset = jQuery('#cvBase').offset();
		jQuery('#cvTop').width(jQuery('#cvBase').width());
		jQuery('#cvTop').height(jQuery('#cvBase').height());
		jQuery('#cvTop').offset({'top': cvboffset.top,'left': cvboffset.left});
	},
	
	alignCanvas:function(){
		cvBase = document.getElementById('cvBase');
		cvTop = document.getElementById('cvTop');
		if(cvBase && cvTop) {
			cvTop.style.left=cvBase.offsetLeft;cvTop.style.top=cvBase.offsetTop; // make sure the two canvas are aligned
		}
	},
	
	msg:function(x,flag){ 	// passing a message to the message div, also copied to the console
		jQuery('#msg').html(x);
		if(flag !== false) { console.log(x); }
	},
	
	//Note: Modules should have the following naming scheme <domain name>.<app name>.<app sub-name>.js
	//		For example consider "mathbiol.helloworld.js"
	//		As for its url, we could then have http://www.imagejs.org/modules/mathbiol.helloworld.js
	//		Additional Notes: 
	//		- Always ends in ".js"
	//		- Module name is "mathbiol.helloworld"
	loadModule:function(url,cb,er){
		if(typeof(url) !== 'string' || url.trim().length < 1) {
			//do nothing
		} else {
			var module = this.getModuleNameFromUrl(url); //works for both relative and absolute paths
			if(module !== false) {
				module = module.slice(0,-3);	//trim the .js off
				//check if already loaded
				if(!imagejs.modules[module]){
					imagejs.modules[module]={}; // register loading from this url
					imagejs._manifest = {};

					var s = document.createElement('script');
					var head = document.getElementsByTagName("head")[0];
					s.type= 'text/javascript';
					s.src = url;
					s.id = this.uid();
					if(cb){s.onload=cb;}
					if(er){s.onerror=er;}
					head.appendChild(s);
					// "while loading" or "after loading" module additions
					imagejs._manifest.sid = s.id;
				} else {
					this.msg('module ['+module+'] already loaded');
				}
			} else {
				this.msg('Invalid url name specified (should end in ".js").');
			}
		}
	},
	
	loadModules:function(){
		var urls = this.geturlparams();
		for(var i=0;i<urls.length;i++) {
			this.loadModule(urls[i][0]);
		}
	},
	
	removeModule:function(name){
		//remove menu option first
		var menu_id = imagejs.modules[name].manifest.menuid;
		this.removeElement(menu_id);
		
		//remove script tag
		imagejs.removeElement(imagejs.modules[name].manifest.sid);

		//remove module
		imagejs.msg(imagejs.modules[name].manifest.name+' v'+imagejs.modules[name].manifest.version+' removed.');
		delete imagejs.modules[name];
		
		return false;
	},
	
	loadMenu:function(menu,manifest){
		if(typeof(menu) !== 'object') {
			this.msg("Module Error: Menu argument is incorrect, should be an object.");
			//Delete module entry
			delete imagejs.modules[manifest.name];
			return false;
		} else if(jQuery.isEmptyObject(menu)) {
			this.msg("Module Error: Menu object is empty.");
			//Delete module entry
			delete imagejs.modules[manifest.name];
			return false;
		} else if(!manifest.name || !manifest.display || manifest.name.trim().length < 1 || manifest.display.trim().length < 1) {
			this.msg("Module Error: Invalid manifest file.");
			//Delete module entry
			delete imagejs.modules[manifest.name];
			return false;
		} else {
			if(document.getElementById('#menu-'+manifest.name)){
				this.removeElement('menu-'+manifest.name);
			}

			var menu_li = document.createElement('li');
			menu_li.id = 'menu-'+manifest.name;
			menu_li.className = 'dropdown';
			
			//build menu options
			/*
			<li class="dropdown">
				<a href="#" class="dropdown-toggle" data-toggle="dropdown">Account <b class="caret"></b></a>
				<ul class="dropdown-menu">
					<li><a href="#">Action 1</a></li>
					<li><a href="#">Action 2</a></li>
					<li class="divider"></li>
					<li><a href="#">About</a></li>
				</ul>
			</li>
			*/
			var menu_a = document.createElement('a');
			menu_a.setAttribute('href', 'javascript:void(0)');
			menu_a.setAttribute('class', 'dropdown-toggle');
			menu_a.setAttribute('data-toggle', 'dropdown');
			menu_a.innerHTML = manifest.display+' <b class="caret"></b>';
			menu_li.appendChild(menu_a);

			var menu_li2, menu_a2, opt='';
			var menu_ul = document.createElement('ul');
			menu_ul.setAttribute('class','dropdown-menu');
			for(opt in menu) {
				menu_li2 = document.createElement('li');
				menu_a2 = document.createElement('a');
				menu_a2.setAttribute('href', 'javascript:void(0)');
				menu_a2.setAttribute('onclick', menu[opt]);
				menu_a2.innerHTML = opt;
				menu_li2.appendChild(menu_a2);
				menu_ul.appendChild(menu_li2);
			}
			
			if(manifest.name != 'imagejs.menu') {	//Add to all modules except ImageJS menu
				//divider
				menu_li2 = document.createElement('li');
				menu_li2.setAttribute('class', 'divider');
				menu_ul.appendChild(menu_li2);
				
				//close
				menu_li2 = document.createElement('li');
				menu_a2 = document.createElement('a');
				menu_a2.setAttribute('href', 'javascript:void(0)');
				menu_a2.setAttribute('onclick', 'imagejs.removeModule("'+manifest.name+'");');
				menu_a2.innerHTML = 'Close';
				menu_li2.appendChild(menu_a2);
				menu_ul.appendChild(menu_li2);
				
				//about
				menu_li2 = document.createElement('li');
				menu_a2 = document.createElement('a');
				menu_a2.setAttribute('href', 'javascript:void(0)');
				menu_a2.setAttribute('onclick', 'imagejs.aboutModule("'+manifest.name+'");');
				menu_a2.innerHTML = 'About';
				menu_li2.appendChild(menu_a2);
				menu_ul.appendChild(menu_li2);
			}
			
			menu_li.appendChild(menu_ul);
			
			//Add menu_li to the DOM
			document.getElementById('menu2').appendChild(menu_li);
			
			//Add to manifest entry
			if(imagejs.modules[manifest.name].manifest) {
				imagejs.modules[manifest.name].manifest.menuid='menu-'+manifest.name;
			} else {
				imagejs._manifest.menuid='menu-'+manifest.name;
			}
			
			//display "module loaded" message
			this.msg(manifest.name + ((manifest.name!='imagejs.menu')?' v' + manifest.version:'') + ' loaded.');
			this.alignCanvas();
		}
	},
	
	aboutModule:function(name) {
		var manifest = imagejs.modules[name].manifest;
		if(manifest.name && manifest.display && manifest.name.trim().length>0 && manifest.display.trim().length>0) {
			about_msg  = '<div class="alert alert-info">';
			about_msg += '<a class="close" data-dismiss="alert">x</a>';
			about_msg += 'Module Name: '+manifest.name+'<br />';
			about_msg += 'Display Name: '+manifest.display+'<br />';
			about_msg += 'Version: v'+manifest.version+'<br />';
			if(manifest.description && manifest.description.trim().length>0){
				about_msg += 'Description: '+manifest.description+'<br />';
			}
			about_msg += '</div>';
			
			document.getElementById('msg').innerHTML += about_msg;
		}
		return false;
	},
	
	modules:{
		// This is a good place to store module functions.
		// Note in loadModule that loading a module automatically creates an attribute named with its URL
		// You don't have to, but you could use this object, imagejs.modules[url]={}, if you wanted to.
	},
	
	data:{
		// a good place to keep data that multiple modules may need
		// for example, loading an image will automatically create imagejs.data.dt0 with the output of jmat.imread('work')
	},
	
	start:function(){ // things that should happen when the page loads
		// load module provided as a search term, if at all
		var url = document.location.search;
		if (url.length>1){this.loadModules();}
	},

	imwrite:function(cv,im,dx,dy){
		if(!dy){dx=0;dy=0;} // default location
		if(typeof(cv)=='string'){cv=document.getElementById(cv);} //cv can also be the id of a canvas element
		if(!im.data){im=this.data2imData(im);} // such that im can also be the matrix created by imread
		var ct = cv.getContext('2d');
		ct.putImageData(im,dx,dy);
		return ct;
	},
	
	imhalve:function(dt0,PSmax){ // poor man's version of imresize, it halves an image size by averaging two rows/columns
		var s = this.size(dt0);
		var dt = null;
		if(!PSmax){PSmax = this.prod(s.slice(0,2))-1;} // if maximum size not defined then just have it once
		if(this.prod(s.slice(0,2))>PSmax){
			if(this.length(s)!==3){throw('this should be an image value matrix, size n x m x 4');}
			if(s[2]!==4){throw('this should be an image value matrix, size n x m x 4');}
			s = this.arrayfun(s,function(x){return Math.floor(x/2);}); // half size, with floored integers
			s[2]=4; // rgba
			dt = this.zeros(s[0],s[1],s[2]);
			dt=dt.map(function(x,i){
				return x.map(function(y,j){
					return y.map(function(z,k){
						return (dt0[i*2][j*2][k]+dt0[i*2+1][j*2+1][k]+dt0[i*2][j*2+1][k])/3;
					});
				});
			});
		}
		else{dt = dt0;};
		// if maximum pixel size was set and was exceeded keep halving
		if(this.prod(this.size(dt).slice(0,2))>PSmax){dt = this.imhalve(dt,PSmax);} 
		return dt;	
	},
	
	imread:function(cv){ // reads image from context into matrix
		// find out what type of input
		if(typeof(cv)=='string'){ // cv is the id of a canvas element
			cv=document.getElementById(cv);
		}
		var ct=cv.getContext('2d'), n=cv.width, m=cv.height;
		var imData=ct.getImageData(0,0,n,m); // pixel values will be stored in imData.data
		return this.imData2data(imData);
	},
	
	imData2data:function(imData){ // imData is the data structure returned by canvas.getContext('2d').getImageData(0,0,n,m)
		var m=imData.width, n=imData.height, data=[];
		for (var i=0;i<n;i++){ //row
			data[i]=[];
			for (var j=0;j<m;j++){ // column
				ij=(i*m+j)*4;
				data[i][j]=[imData.data[ij],imData.data[ij+1],imData.data[ij+2],imData.data[ij+3]];
			}
		}
		return data;	
	},

	data2imData:function(data){ // the reverse of im2data, data is a matlabish set of 4 2d matrices, with the r, g, b and alpha values
		var n=data.length, m=data[0].length;
		//var imData = {width:m, height:n, data:[]};
		var imData = document.createElement('canvas').getContext('2d').createImageData(m,n);
		for (var i=0;i<n;i++){ //row
			//data.r[i]=[];data.g[i]=[];data.b[i]=[];data.a[i]=[];
			for (var j=0;j<m;j++){ // column
				ij=(i*m+j)*4;
				imData.data[ij]=data[i][j][0];
				imData.data[ij+1]=data[i][j][1];
				imData.data[ij+2]=data[i][j][2];
				imData.data[ij+3]=data[i][j][3];
			}
		}
		return imData;
	},
	
	size:function(x){
		var L=function(y){
			s[s.length]=y.length;
			if(Array.isArray(y[0])){L(y[0]);}
		};
		var s=[];L(x);
		return s;
	},
	
	length:function(x){ // js Array.length returns highest index, not always the numerical length
		var n=0,i=null;
		for(i in x){n++;};
		return n;
	},
	
	prod:function(x){
		return x.reduce(function(a,b){return a*b;});
	},

	arrayfun:function(x,fun,i){ // apply function to each element of an array
		if (Array.isArray(x)){return x.map(function(xi,i){return this.arrayfun(xi,fun,i);});}
		else{return fun(x,i);}
	},
	
	zeros:function(){
		return this.dimfun(function(){return 0;},arguments);
	},
	
	dimfun:function(){ // first argument is the function, subsequent arguments specify dimensions
		if(arguments.length==0){arguments=[function(){return 0;}];}
		var fun=arguments[0];
		if(arguments.length>1){
			var x=[];
			if(typeof(arguments[1])!='number'){for(var i=0;i<arguments[1].length;i++){x[i]=arguments[1][i];}}
			else{for(var i=1;i<arguments.length;i++){x[i-1]=arguments[i];}} // note first argument is always fun
			var z=[];
			if(x.length<2){
				for(var i=0;i<x[0];i++){
					z[i]=fun(i); // fun has access to array index
				}
			}
			else {
				var x0=x[0];
				x=x.slice(1);
				for(var i=0;i<x0;i++){
					z[i]=this.dimfun(fun,x);
				}
			}
		}
	    else {z=fun();}
		return z;
	},
	
	getModuleNameFromUrl:function(url){
		var r = /([\-a-z0-9]+\.)+[\-a-z0-9]+\.js$/i;
		url = url.trim();
		if(r.test(url)) {
			return r.exec(url)[0];
		} else {
			return false;
		}
	},
	
	geturlparams:function(){
		var urlparams = [],
			e,
	        a = /\+/g,  // Regex for replacing addition symbol with a space
	        r = /([^&=]+)=?([^&]*)/g,
	        d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
	        q = window.location.search.substring(1);

        while (e = r.exec(q)) {
        	urlparams.push([d(e[1]),d(e[2])]);
        }
        return urlparams;
	},
	
	//Builds HTML lists l_type:[select],[ol],[ul]
	buildList:function(list,l_type,l_id,l_class){
		if(typeof(list) === 'object' && typeof(l_type) === 'string') {
			var tmp_type = l_type.toLowerCase().trim();
			switch(tmp_type) {
				case 'select':
				case 'ol':
				case 'ul':
					var li1 = document.createElement(tmp_type);
					if(l_id){li1.id=l_id;}
					if(l_class){li1.className=l_class;}
					
					var elem='', i=0;
					if(tmp_type == 'select') {
						for(elem in list) {
							var tmp_elem = document.createElement("option");
							tmp_elem.appendChild(document.createTextNode(elem));
							tmp_elem.value = i++;
							tmp_elem.onclick = list[elem];
							li1.appendChild(tmp_elem);
						}
					} else {
						for(elem in list) {
							var tmp_elem = document.createElement('li');
							var tmp_a = document.createElement('a');
							tmp_a.setAttribute('href', 'javascript:void(0)');
							tmp_a.setAttribute('onclick', list[elem]);
							tmp_a.appendChild(document.createTextNode(elem));
							tmp_elem.appendChild(tmp_a);
							li1.appendChild(tmp_elem);
						}
					}
					return li1;
					break;
				default:
					return false;
					break;
			}
		}
		return false;
	},
	
	//Builds module call functions 
	//mname: Module Name
	//fname: Module function name
	callFunction:function(mname,fname) {
		return 'imagejs.modules[\''+mname+'\'].'+fname+'()';
	},
	
	buildManifest:function(manifest) {
		if(typeof(manifest) === 'object') {
			for(x in manifest) {
				imagejs._manifest[x] = manifest[x];
				if(x === 'requires') {	//Load required modules
					var tmp_modl = manifest[x];
					if(tmp_modl.length>0) {
						for(y in tmp_modl) {
							imagejs.loadModule(tmp_modl[y]);
						}	
					}
				}
			}
		}
		return imagejs._manifest;
	},
	
	removeElement:function(id){
		return (x=document.getElementById(id)).parentNode.removeChild(x);
	},
	
	//uid function; originally written by Jonas Almeida
	uid:function(prefix){
		if(!prefix){prefix='UID';}
		return prefix+Math.random().toString().slice(2);
	}
};
console.log('ImageJS Loaded');


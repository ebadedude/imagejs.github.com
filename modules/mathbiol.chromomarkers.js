(function(){
	var manifest = {
			domain:'mathbiol',
			name:'mathbiol.chromomarkers',
			display:'Chromomarkers',
			description:'Applies chromomorphological markers to an image based on features picked by the user.',
			url:'',	//url to module file
			key:'',	//Meant for future use
			version:'0.1.0',
			author:'Jonas Almeida',
			credits:'Bade Iriabho',
			requires:[]
		};

	imagejs.modules[manifest.name] = {
			'manifest': imagejs.buildManifest(manifest),
			dist:function(dt,px){ //distance between image data and a pixel
				if(px.length==2){px=dt[px[0]][px[1]];} // in case the pixel coordinates rather than the pixel is being submitted as px
				var Wrgba=[imagejs.modules[manifest.name].red/100,imagejs.modules[manifest.name].green/100,imagejs.modules[manifest.name].blue/100,1]; // color weight
				return jmat.imMap(dt,function(xy){
					// Euclidean distance 
					// notice px pixel value is passed to the function through the closure's scope
					return Math.pow(jmat.sum(xy.slice(0,3).map(function(xyi,i){return Math.pow((xyi-px[i])*Wrgba[i],2);})),1/2);
				});	
			},
			backSeg:function(){ // go back to previous segmentation
				var cvTop = document.getElementById('cvTop');
				var segOld = imagejs.modules[manifest.name].segOld;
				imagejs.modules[manifest.name].segOld=imagejs.data.seg;
				imagejs.data.seg=segOld;
				jmat.imagebw(cvTop,jmat.edge(segOld),[0,0,0,0],[255,255,0,255]); // display edge
			},
			segCheckOnChange:function(that){imagejs.modules[manifest.name].segNewChecked=that.checked;},
			segNewChecked:true,
			start:function(){
				var cvBase = document.getElementById('cvBase');
				var cvTop = document.getElementById('cvTop');
				cvBase.style.zIndex = 1;cvTop.style.zIndex = 2;
				cvTop.style.cursor='crosshair';
				imagejs.alignCanvas();
			//	cvTop.style.left=cvBase.offsetLeft;cvTop.style.top=cvBase.offsetTop; // make sure both canvases are aligned
				var cvTopOnClick=function(evt){
					//imagejs.msg('Morphomarker acquisition ...');
					//var x = evt.clientX-evt.target.offsetLeft+window.pageXOffset;
					var x = imagejs.modules[manifest.name].x;
					//var y = evt.clientY-evt.target.offsetTop+window.pageYOffset;
					var y = imagejs.modules[manifest.name].y;
					//console.log(x,y);
					imagejs.msg('('+x+','+y+')');
					//if (jmat.max(imagejs.data.dt0[y][x].slice(0,3))>150){var C=[0,0,1]};else{var C=[1,1,0]} // use background
					var ctx=cvTop.getContext('2d');
					ctx.clearRect(0,0,this.width,this.height);
					if(!imagejs.modules[manifest.name].red){imagejs.modules[manifest.name].red=100;}
					if(!imagejs.modules[manifest.name].green){imagejs.modules[manifest.name].green=100;}
					if(!imagejs.modules[manifest.name].blue){imagejs.modules[manifest.name].blue=100;}
					if(!imagejs.modules[manifest.name].d){imagejs.modules[manifest.name].d=imagejs.modules[manifest.name].dist(imagejs.data.dt0,[y,x]);}
					//if(!imagejs.modules[manifest.name].d){var d = imagejs.modules[manifest.name].dist(imagejs.data.dt0,[y,x]);imagejs.modules[manifest.name].d=d;}
					//else {var d = imagejs.modules[manifest.name].d}
					if(!imagejs.modules[manifest.name].thr){var thr = jmat.max(jmat.max(imagejs.modules[manifest.name].d))/5;imagejs.modules[manifest.name].thr=thr;}
					else {var thr = imagejs.modules[manifest.name].thr;}
					var bw = jmat.im2bw(imagejs.modules[manifest.name].d,thr); // threshold should be recoded to allow for a function
					bw = jmat.arrayfun(bw,function(x){return 1-x;}); // get the reciprocal
					if(!imagejs.modules[manifest.name].segOld){imagejs.modules[manifest.name].segOld=bw;}
					if(!imagejs.data.seg){imagejs.data.seg=bw;}
					//if(!imagejs.modules[manifest.name].segNewChecked){imagejs.modules[manifest.name].segNewChecked=true} // default value
					if(!imagejs.modules[manifest.name].segNewChecked){
						bw=jmat.innerfun(bw,imagejs.data.seg,function(a,b){if(a==1){return a;}else{return b;}});
						imagejs.modules[manifest.name].segNewChecked=false;
					}; // add to previous segmentation
					//else{imagejs.modules[manifest.name].segNewChecked=true}; // default value
					imagejs.modules[manifest.name].segOld=imagejs.data.seg;imagejs.data.seg=bw;
					//jmat.imagesc(cvTop,bw); // display it
					//jmat.imagebw(cvTop,bw,[0,0,0,0],[255,255,0,255]); // display segmentation
					var edg = jmat.edge(bw);
					jmat.imagebw(cvTop,edg,[0,0,0,0],[255,255,0,255]); // display edge
					//var C=[1,1,0]; // always use yellow
					//jmat.plot(cvTop,x,y,'+',{Color:C,MarkerSize:30});
					//jmat.plot(cvTop,x,y,'o',{Color:C,MarkerSize:30});
					msg.innerHTML='<input id="segNew" type="checkbox" onchange="imagejs.modules[\''+manifest.name+'\'].segCheckOnChange(this)">New <button id="backSeg" onclick="imagejs.modules[\''+manifest.name+'\'].backSeg()"><</button> Threshold: <span id="slider">___|___|___|___|___|___|___|___|___|___</span> . <span id="sliderRed" style="color:red">__|__|__|__|__</span> . <span id="sliderGreen" style="color:green">__|__|__|__|__</span> . <span id="sliderBlue" style="color:blue">__|__|__|__|__</span>';
					$('#segNew').attr('checked',imagejs.modules[manifest.name].segNewChecked);
					$(function(){$('#slider').slider({
						max:jmat.max(jmat.max(imagejs.modules[manifest.name].d)),
						min:0,
						value:thr,
						change:function(){imagejs.modules[manifest.name].thr=$('#slider').slider('value');jmat.gId('cvTop').onclick(evt,x,y);}
						});});
					$(function(){$('#sliderRed').slider({
						max:100,
						min:0,
						value:imagejs.modules[manifest.name].red,
						change:function(){imagejs.modules[manifest.name].red=$('#sliderRed').slider('value');delete imagejs.modules[manifest.name].d;jmat.gId('cvTop').onclick(evt,x,y);}
					});});
					$(function(){$('#sliderGreen').slider({
						max:100,
						min:0,
						value:imagejs.modules[manifest.name].green,
						change:function(){imagejs.modules[manifest.name].green=$('#sliderGreen').slider('value');delete imagejs.modules[manifest.name].d;jmat.gId('cvTop').onclick(evt,x,y);}
					});});
					$(function(){$('#sliderBlue').slider({
						max:100,
						min:0,
						value:imagejs.modules[manifest.name].blue,
						change:function(){imagejs.modules[manifest.name].blue=$('#sliderBlue').slider('value');delete imagejs.modules[manifest.name].d;jmat.gId('cvTop').onclick(evt,x,y);}
					});});
					cvTop.style.left=cvBase.offsetLeft;cvTop.style.top=cvBase.offsetTop; // make sure the two canvas are aligned
				};
				jmat.gId('cvTop').onclick=function(evt,x,y){ // click on top for things hapenning in cvBase
					msg.innerHTML='<span style="color:red">processing, please wait ...</span>';
					if(!x){var x = evt.clientX-evt.target.offsetLeft+window.pageXOffset;imagejs.modules[manifest.name].x=x;};
					if(!y){var y = evt.clientY-evt.target.offsetTop+window.pageYOffset;imagejs.modules[manifest.name].y=y;};
					var C=[1,1,0]; // always use yellow
					jmat.plot(cvTop,x,y,'+',{Color:C,MarkerSize:30});
					jmat.plot(cvTop,x,y,'o',{Color:C,MarkerSize:30});
					cvTop.style.left=cvBase.offsetLeft;cvTop.style.top=cvBase.offsetTop; // make sure the two canvas are aligned
					//cvTopOnClick(evt);
					setTimeout(cvTopOnClick, 40, evt);
					if(!!imagejs.modules[manifest.name].d){delete imagejs.modules[manifest.name].d;}
					//imagejs.modules[manifest.name].d=imagejs.modules[manifest.name].dist(imagejs.data.dt0,[y,x]);				
				};
			},
			end:function(){
				var cvTop = document.getElementById('cvTop');
				//jmat.gId('cvBase').onclick=null;
				cvTop.style.cursor='default';
				var ctx=cvTop.getContext('2d');
				ctx.clearRect(0,0,this.width,this.height);
				cvTop.onclick=null;
			}
		};

	var menu={
			Start:imagejs.callFunction(manifest.name,'start'),
			End:imagejs.callFunction(manifest.name,'end')
		};
	imagejs.loadMenu(menu,manifest);
})();
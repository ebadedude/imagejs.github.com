(function(){
	var manifest = {
			domain:'imagejs',
			name:'imagejs.menu',
			display:'Main Menu',
			description:'',
			url:'',	//url to module file
			key:'',	//Meant for future use
			version:'1.2.0',
			author:'Jonas Almeida',
			credits:'Bade Iriabho',
			requires:[]
		};
	
	imagejs.modules[manifest.name] = {
			'manifest': imagejs.buildManifest(manifest),
			'listedModules':{
				'Hello World':"imagejs.loadModule('modules/mathbiol.helloworld.js')",
				'Hello World2':"imagejs.loadModule('modules/mathbiol.helloworld2.js')",
				'Chromomarkers':"imagejs.loadModule('modules/mathbiol.chromomarkers.js')",		
				'Count Shapes':"imagejs.loadModules('modules/mathbiol.countshapes.js')"
			},
			'downloadimg':function(){
				document.getElementById('cvBase').getContext('2d').drawImage(document.getElementById('cvTop'),0,0);
			    var downloadImage = imagejs.canvas2Image('cvBase'); //Get updated base canvas
			    jQuery("a:contains('Download Image')").attr('download','samplefilename.png').attr('href',downloadImage.replace("image/png"));
			},
			'downloaddata':function(){return false;},
			'uploaddata':function(){return false;},
			'load':function(){
				console.log('Load Module');
				var msg=document.getElementById('msg'); // message div
				var modules_list = '<span id="modules-list1" class="btn-group"><button class="btn">Select Module</button><button class="btn dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></button></span>';
				msg.innerHTML='Select a module from the list below or from URL:<input type=text size=50 onkeyup="if(event.keyCode==13)(imagejs.loadModule(this.value))"><br />'+modules_list+'<br /><br />';
				document.getElementById('modules-list1').appendChild(imagejs.buildList(imagejs.modules[manifest.name].listedModules,'ul','modules-list2','dropdown-menu'));
			},
			'save':function(){
				console.log('Save Results');
			}
		};
	
	var menu={
		Load:imagejs.callFunction(manifest.name,'load'),
		Save:imagejs.callFunction(manifest.name,'save'),
		'Download Image':imagejs.callFunction(manifest.name,'downloadimg'),
		'Download Data':imagejs.callFunction(manifest.name,'downloaddata'),
		'Upload Data':imagejs.callFunction(manifest.name,'uploaddata')
	};
	imagejs.loadMenu(menu,manifest);
})();

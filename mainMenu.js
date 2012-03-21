// Main Menu functions
// This is also a good template for writing imagejs modules.
// The main thing is to keep your code within a function call and not generate global variables.
// use instead imagejs.modules[yourModule].

imagejs.msg('mainMenu loaded'); // to notify via console and div#msg

function handleDownloadImage() {
document.getElementById('cvBase').getContext('2d').drawImage(document.getElementById('cvTop'),0,0);
    var downloadImage = imagejs.canvas2Image('cvBase'); //Get updated base canvas
    document.getElementById('dButton').href = downloadImage.replace("image/png");
}

(function(){
	
	var listOfModules={
		'hello world':function(evt){imagejs.loadModule('http://imagejs.googlecode.com/git/helloWorld.js')},
		'chromomarkers':function(evt){imagejs.loadModule('http://module.imagejs.googlecode.com/git/mathbiol.chromomarkers.js')},		
		'Count Shapes':function(evt){imagejs.loadModules(['http://module.imagejs.googlecode.com/git/mathbiol.chromomarkers.js','http://module.imagejs.googlecode.com/git/mathbiol.countshapes.js'])}
	}
	
	var menu={
		Load:function(){
			console.log('Load Module');
			var msg=jmat.gId('msg'); // message div
			msg.innerHTML='Load module from <span id=listOfModules></span> or from URL:<input type=text size=50 onkeyup="if(event.keyCode==13)(imagejs.loadModule(this.value))">';
			jmat.gId('listOfModules').appendChild(imagejs.menu(listOfModules,'List'));
			cvTop.style.left=cvBase.offsetLeft;cvTop.style.top=cvBase.offsetTop; // make sure the two canvas are aligned
		},
		Save:function(){
			console.log('Save Results');
		}
	}
	var name= 'Main Menu';
	jmat.gId('menu').appendChild(imagejs.menu(menu,name)); // <-- this 
	cvTop.style.left=cvBase.offsetLeft;cvTop.style.top=cvBase.offsetTop; // make sure the two canvas are aligned
	// --------------
	
	var a = document.createElement('a');
	document.body.appendChild(a);
	a.id = "dButton";
	a.href="";
	a.download="samplefilename.png";
	a.textContent="Download Image";
	a.addEventListener('click', handleDownloadImage, false);
	
})()
// Hello World Module for ImageJS
// This is also a good template for writing imagejs modules.
// The main thing is to keep your code within a function call and not generate global variables.
// use instead imagejs.modules[manifest.name] to store parameters and functions.

(function(){
	//Main Section
	var manifest = {
			domain:'mathbiol',
			name:'mathbiol.helloworld',
			display:'Hello World',
			description:'This is a Hello World module for ImageJS. <a href="www.google.com">wwwwwwwwwwwwwww</a>',
			url:'',	//url to module file
			key:'',	//Meant for future use
			version:'0.0.2',
			author:'Jonas Almeida',
			credits:'Bade Iriabho',
			requires:[]
		};

	imagejs.modules[manifest.name] = {
			'manifest': imagejs.buildManifest(manifest),
			'hello':function(){
					var mytext = jQuery('#msg').text().trim().toLowerCase().slice(0,5);
					if(mytext == 'hello' || mytext == 'world') {
						jQuery('#msg').append(' Hello');
					} else {
						jQuery('#msg').html(' Hello');
					}
				},
			'world':function(){
					var mytext = jQuery('#msg').text().trim().toLowerCase().slice(0,5);
					if(mytext == 'hello' || mytext == 'world') {
						jQuery('#msg').append(' World');
					} else {
						jQuery('#msg').html(' World');
					}
				}
		};
	
	//Menu Section
	var menu={
			Hello:imagejs.callFunction(manifest.name,'hello'),
			World:imagejs.callFunction(manifest.name,'world')
		};
	imagejs.loadMenu(menu,manifest);
})();


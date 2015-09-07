/*
	You can ignore this section, it's used for monitoring and is specific to my environment
*/
require('strong-agent').profile(
	process.env.NODEFLY_KEY,
	['Taffy Docs','Heroku'],
	{
		// time in ms when the event loop is considered blocked
		blockThreshold: 10
	}
);

/*
	This is a simple way to host the generated documentation using Express
	-- There's probably a leaner way, but this is literally 5 lines of code.
*/
var express  = require('express')
	,pkg      = require('./package.json')
	,cassini  = require('cassini')
	,path     = require('path')
	,app      = express()
	,fs       = require('fs')
	;

var port = process.env.PORT || 5000;

app.use(express.compress())
	.use(express.static('bin'))
	.get('/', function(req,res){
		res.redirect(301, pkg.version+'/');
	})
	.get('/!/:deep', function(req,res){
		res.redirect(301, pkg.version+'/#'+req.params.deep)
	})
	.get('/:ver/', function(req,res){
		var semver = req.params.ver.split('.');
		var major = semver[0];
		var minor = semver[1];
		var patch = semver[2];

		while( patch > 0 ){
			if ( fs.existsSync( __dirname + '/bin/' + major + '.' + minor + '.' + patch + '/index.html' ) ){
				return res.redirect( 302, major + '.' + minor + '.' + patch + '/' );
			}
			patch--;
		}
	})
	.listen(port);

console.log('listening on port %s', port);

cassini.generate({
	inputDir: path.normalize(__dirname + '/src/')
	,outputDir: path.normalize(__dirname + '/bin/')
	,templatePath: path.normalize(__dirname + '/templates/')
	,verbose: true
});

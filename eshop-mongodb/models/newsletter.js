var Fs = require('fs');
var filename = F.path.databases('newsletter.csv');

NEWSCHEMA('Newsletter').make(function(schema) {

	schema.define('email', 'String(200)', true);
	schema.define('ip', 'String(80)');
	schema.define('language', 'String(3)');

	// Saves the model into the database
	schema.setSave(function(error, model, options, callback) {

		var builder = new MongoBuilder();

		model.datecreated = new Date();
		builder.set(model.$clean());
		builder.insert(DB('newsletter'));

		// Writes stats
		MODULE('webcounter').increment('newsletter');

		// Returns response
		callback(SUCCESS(true));
	});

	// Gets listing
	schema.setQuery(function(error, options, callback) {
		Fs.readFile(filename, function(err, buffer) {
			if (err)
				buffer = '';
			else if (buffer)
				buffer = buffer.toString('utf8');
			callback(buffer);
		});
	});

	// Performs download
	schema.addWorkflow('download', function(error, model, controller, callback) {
		// Returns CSV
		controller.file('~' + filename, 'newsletter.csv');
		callback();
	});

	// Clears DB
	schema.addWorkflow('clear', function(error, model, options, callback) {
		Fs.unlink(filename, NOOP);
		callback(SUCCESS(true));
	});
});
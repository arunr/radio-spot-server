var MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    http = require('http');


var url = 'mongodb://localhost:27017/radio-spot';
MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    var collection = db.collection('stations');
    collection.find({}).each(function(err, item) {
        if (item === null) {
            db.close();
        } else {
            setTimeout(function() {
                var req = http.request({
                    host: 'api.duckduckgo.com',
                    path: '/?q=' + item.letters + '&format=json&pretty=1'
                }, callback).end();
            }, 1000);
        }
    });
});

callback = function(response) {
    var str = '';
    var querystring = response.req.path.match(/q=(.*?)&/)[1];

    //another chunk of data has been recieved, so append it to `str`
    response.on('data', function(chunk) {
        str += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    response.on('end', function() {
    	MongoClient.connect(url, function(err, db) {
    		assert.equal(null, err);
    		var collection = db.collection('stations');
	        collection.update({
	            letters: querystring
	        }, {
	            $set: {
	                description: str
	            }
	        }, function(err, result) {
	            assert.equal(err, null);
	        });
	    });
        console.log(str);
    });
}
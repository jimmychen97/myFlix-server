const http = require("http"),
  fs = require("fs"),
  url = require("url");

// server creation 
http.createServer((request, response) => {
    let addr = request.url,
      q = url.parse(addr, true),
      filePath = "";

    // log to log.txt
    fs.appendFile('log.txt', 'URL: '+addr+'\nTimestamp: '+new Date() + '\n\n', err =>{
        if(err){
            console.log(err);
        }else{
            console.log('Log have been added');
        }
    });

    // check if documentation.html exists, if does navaigate to it. if not, go to index.html
    if (q.pathname.includes('documentation')){
        filePath = (__dirname+'/documentation.html');
    } else {
        filePath = 'index.html';

    }

    // read correct file from the server using filePath
    fs.readFile(filePath, (err, data) => {
        if(err){
            throw err;
        }
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(data);
        response.end();
    });
  }).listen(8080);

console.log("My test server is running on Port 8080.");

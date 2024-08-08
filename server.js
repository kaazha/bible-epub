const http = require("http");
const fs = require("fs");
const path = require("path");

let host = 'localhost';
if (process.argv.length > 2) {
  host = process.argv[2];
} 

//const host = "192.168.0.5"; //"localhost";
const port = 8000;

function getContentType(fileName) {
  const ext = path.extname(fileName);
  switch (ext) {
    case ".xhtml":
    case ".opf":
      return "text/xhtml";
    case ".png":
      return "image/png";
    case ".woff":
    case ".woff2":
      return "font/woff";
    case ".css":
      return "text/css";
    case ".json":
      return "application/json";
    default:
      console.error("mime type not found or mapped for: ", ext);
      return "text/plain";
  }
}

const requestListener = async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") {
    res.statusCode = 501;
    res.setHeader("content-type", "text/plain");
    return res.end("Method Not implemented.");
  }

  const fileName = "." + req.url;
  const contentType = getContentType(fileName);
  console.log(`${req.method} ${fileName} (${contentType})`);
  const stream = fs.createReadStream(fileName);
  stream.on("open", () => {
    res.setHeader("content-type", contentType);
    stream.pipe(res);
  });

  stream.on("error", () => {
    res.setHeader("content-type", "text/plain");
    res.statusCode = 404;
    res.end("Not found.");
  });
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Bible Epub Server is running on http://${host}:${port}`);
});

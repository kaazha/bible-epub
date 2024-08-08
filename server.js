const http = require("http");
const fs = require("fs");
const path = require("path");

// e.g.:  node server 172.20.10.5:8000 

let host = "localhost";
let port = 8000;

if (process.argv.length > 2) {
  host = process.argv[2];
  let idx = host.indexOf(":");
  if (idx > 0) {
    port = host.substring(idx + 1);
    host = host.substring(0, idx);
  }
}
else {
  const localIp = getLocalIP();
  if(localIp) console.log(`My IPV Address: ${localIp}`);
  host = localIp  || host;
}

console.log(`starting server @${host}:${port}`);

function getContentType(fileName) {
  const ext = path.extname(fileName);
  switch (ext) {
    case ".html":
      return "text/html";
    case ".xhtml":
    case ".opf":
      return "text/xhtml";
    case ".png":
      return "image/png";
    case ".svg":
      return "image/svg+xml";
    case ".woff":
    case ".woff2":
      return "font/woff";
    case ".css":
      return "text/css";
    case ".js":
      return "text/javascript";
    case ".json":
      return "application/json";
    default:
      console.error("mime type not found or mapped for: ", ext);
      return "text/plain";
  }
}

function getLocalIP() {
  const os = require("os");
  const networkInterfaces = os.networkInterfaces();
  for (const name of Object.keys(networkInterfaces)) {
    for (const net of networkInterfaces[name]) {
      if (net.family == 4 && !net.internal) return net.address;
    }
  }
}

const requestListener = async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") {
    res.statusCode = 501;
    res.setHeader("content-type", "text/plain");
    return res.end("Method Not implemented.");
  }

  const fileName =
    req.url === "" || req.url === "/" ? `./index.html` : `./${req.url}`;
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

const fs = require("fs");
const path = require("path");
const stripComments = require("strip-comments");
const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach((file) => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      if (
        !dirFile.includes("node_modules") &&
        !dirFile.includes(".git") &&
        !dirFile.includes("scratch")
      ) {
        filelist = walkSync(dirFile, filelist);
      }
    } else {
      if (
        file.endsWith(".js") ||
        file.endsWith(".html") ||
        file.endsWith(".css")
      ) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};
const files = walkSync(path.join(__dirname, "../")).filter(
  (f) => !f.includes("minify.js") && !f.includes("package"),
);
files.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  if (file.endsWith(".js") || file.endsWith(".css")) {
    content = stripComments(content);
    content = content.replace(/^\s*[\r\n]/gm, "");
  } else if (file.endsWith(".html")) {
    content = content.replace(/<!--[\s\S]*?-->/g, "");
  }
  fs.writeFileSync(file, content, "utf8");
  console.log(`Comments stripped from: ${file}`);
});

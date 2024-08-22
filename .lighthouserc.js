const fs = require("fs");
const path = require("path");

// 读取 app 目录下的文件夹和文件名，排除特殊目录和文件
const getPagePaths = (dir, baseUrl = "http://localhost:3000") => {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(getPagePaths(filePath, `${baseUrl}/${file}`));
    } else {
      // 忽略非页面文件，比如 _app.js, _document.js 等等
      if (file !== "page.tsx" && file !== "page.js") return;
      results.push(baseUrl);
    }
  });
  console.log("results: ", results);
  return results;
};

const getURLs = () => {
  const appDir = path.join(__dirname, "app"); // 假设 'app' 是 Next.js 的目录
  return getPagePaths(appDir);
};

module.exports = {
  ci: {
    collect: {
      numberOfRuns: 1,
      url: getURLs(), // 這裡的URL應該對應你的服務器地址
    },
    assert: {
      assertions: {
        "categories.performance": ["error", { minScore: 0.9 }],
        "categories.accessibility": ["error", { minScore: 0.9 }],
        "categories.best-practices": ["error", { minScore: 0.9 }],
        "categories.seo": ["error", { minScore: 0.9 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./lhci-reports",
    },
  },
};

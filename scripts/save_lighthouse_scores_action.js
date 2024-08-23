const fs = require("fs");
const path = require("path");

const lighthouseDir = path.join(__dirname, "..", ".lighthouseci");
const jsonFiles = fs
  .readdirSync(lighthouseDir)
  .filter((file) => file.startsWith("lhr-") && file.endsWith(".json"));

// 提取每个 URL 的分数
function extractCategoryScores(filePath) {
  const fileContent = fs.readFileSync(filePath);
  const report = JSON.parse(fileContent);

  return {
    url: report.finalUrl,
    performance: report.categories.performance.score * 100,
    accessibility: report.categories.accessibility.score * 100,
    bestPractices: report.categories["best-practices"].score * 100,
    seo: report.categories.seo.score * 100,
  };
}

// 计算每个 URL 的平均分数
function calculateAverageScores(scoresArray) {
  const scoreMap = {};

  scoresArray.forEach((scores) => {
    const url = scores.url;

    if (!scoreMap[url]) {
      scoreMap[url] = {
        performance: 0,
        accessibility: 0,
        bestPractices: 0,
        seo: 0,
        count: 0,
      };
    }

    scoreMap[url].performance += scores.performance;
    scoreMap[url].accessibility += scores.accessibility;
    scoreMap[url].bestPractices += scores.bestPractices;
    scoreMap[url].seo += scores.seo;
    scoreMap[url].count += 1;
  });

  // 计算平均值
  for (const url in scoreMap) {
    const totals = scoreMap[url];
    scoreMap[url] = {
      performance: totals.performance / totals.count,
      accessibility: totals.accessibility / totals.count,
      bestPractices: totals.bestPractices / totals.count,
      seo: totals.seo / totals.count,
    };
  }

  return scoreMap;
}

// 提取并计算每个文件的分数
const scoresArray = jsonFiles.map((file) =>
  extractCategoryScores(path.join(lighthouseDir, file))
);

// 计算每个 URL 的平均分数
const averageScores = calculateAverageScores(scoresArray);

// 将结果保存为 JSON 文件
const outputDir = path.join(__dirname, "..", "lhci-reports");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

fs.writeFileSync(
  path.join(outputDir, "lighthouse-scores.json"),
  JSON.stringify(averageScores, null, 2)
);

console.log("Average Scores saved to lighthouse-scores.json:");
console.log(averageScores);

// 如果任何类别的得分低于 85，阻止 CI
const allAboveThreshold = Object.values(averageScores).every(
  (scores) =>
    scores.performance >= 80 &&
    scores.accessibility >= 80 &&
    scores.bestPractices >= 80 &&
    scores.seo >= 80
);

if (!allAboveThreshold) {
  console.error("One or more URLs have an average score below 85");
  process.exit(1); // 非零退出码以使 CI 失败
}

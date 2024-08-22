const fs = require("fs");
const path = require("path");

const lighthouseDir = path.join(__dirname, "..", ".lighthouseci"); // 更新路径
const jsonFiles = fs
  .readdirSync(lighthouseDir)
  .filter((file) => file.startsWith("lhr-") && file.endsWith(".json"));

function extractCategoryScores(filePath) {
  const fileContent = fs.readFileSync(filePath);
  const report = JSON.parse(fileContent);

  return {
    performance: report.categories.performance.score * 100, // 轉為百分比
    accessibility: report.categories.accessibility.score * 100,
    bestPractices: report.categories["best-practices"].score * 100,
    seo: report.categories.seo.score * 100,
  };
}

function calculateAverageScores(scoresArray) {
  const totals = scoresArray.reduce(
    (acc, scores) => {
      acc.performance += scores.performance;
      acc.accessibility += scores.accessibility;
      acc.bestPractices += scores.bestPractices;
      acc.seo += scores.seo;
      return acc;
    },
    { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 }
  );

  const count = scoresArray.length;

  return {
    performance: totals.performance / count,
    accessibility: totals.accessibility / count,
    bestPractices: totals.bestPractices / count,
    seo: totals.seo / count,
  };
}

const scoresArray = jsonFiles.map((file) =>
  extractCategoryScores(path.join(lighthouseDir, file))
);
const averageScores = calculateAverageScores(scoresArray);

// 將结果保存為 JSON 文件
const outputDir = path.join(__dirname, "..", "lhci-reports"); // 更新路径
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

fs.writeFileSync(
  path.join(outputDir, "lighthouse-scores.json"),
  JSON.stringify(averageScores, null, 2)
);

console.log("Average Scores saved to lighthouse-scores.json:");
console.log(averageScores);

// 如果任何类别的得分低于85，阻止CI
const allAboveThreshold = Object.values(averageScores).every(
  (score) => score >= 85
);

if (!allAboveThreshold) {
  console.error("One or more categories have an average score below 85");
  process.exit(1); // 非零退出码以使 CI 失败
}

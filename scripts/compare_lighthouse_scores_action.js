const fs = require("fs");
const path = require("path");

// 读取 main 分支中的旧 Lighthouse 分数
const oldScoresPath = path.join(
  __dirname,
  "..",
  "main-branch-lighthouse-scores.json"
);
let oldScores = null;
if (fs.existsSync(oldScoresPath)) {
  console.log(`Old scores file found at: ${oldScoresPath}`);
  oldScores = JSON.parse(fs.readFileSync(oldScoresPath, "utf-8"));
} else {
  console.log("No previous scores found, skipping comparison.");
}

// 读取当前生成的 Lighthouse 分数
const newScoresPath = path.join(
  __dirname,
  "..",
  "lhci-reports",
  "lighthouse-scores.json"
);
const newScores = JSON.parse(fs.readFileSync(newScoresPath, "utf-8"));

if (oldScores) {
  let significantDropDetected = false;

  // 遍历当前生成的每个 URL 的分数
  for (const [url, newScore] of Object.entries(newScores)) {
    const oldScore = oldScores[url];
    if (oldScore) {
      const oldPerformance = oldScore.performance;
      const newPerformance = newScore.performance;

      console.log(`Comparing performance for ${url}`);
      console.log(`Old Performance Score: ${oldPerformance}`);
      console.log(`New Performance Score: ${newPerformance}`);

      const difference = newPerformance - oldPerformance;
      console.log(`Performance Score Difference: ${difference}`);

      // 如果性能下降超过 10 分，标记为失败
      if (difference < -10) {
        console.error(`Performance score for ${url} dropped significantly!`);
        significantDropDetected = true;
      }
    } else {
      console.log(`No previous score found for ${url}, skipping comparison.`);
    }
  }

  // 如果检测到任何页面的性能分数下降过多，阻止 CI
  if (significantDropDetected) {
    process.exit(1);
  }
} else {
  console.log("Skipping comparison as no old scores were found.");
}

const fs = require("fs");
const path = require("path");

// 读取 main 分支中的旧 Lighthouse 分数
const oldScoresPath = path.join(
  __dirname,
  "..",
  "main-branch-lighthouse-scores.json"
); // 更新路径
let oldScores = null;
if (fs.existsSync(oldScoresPath)) {
  console.log(oldScoresPath);
  oldScores = JSON.parse(fs.readFileSync(oldScoresPath, "utf-8"));
}
console.log(oldScores);

// 读取当前生成的 Lighthouse 分数
const newScoresPath = path.join(
  __dirname,
  "..",
  "lhci-reports",
  "lighthouse-scores.json"
); // 更新路径
const newScores = JSON.parse(fs.readFileSync(newScoresPath, "utf-8"));

// 比较性能分数
if (oldScores) {
  const oldPerformance = oldScores.performance;
  const newPerformance = newScores.performance;

  console.log(`Old Performance Score: ${oldPerformance}`);
  console.log(`New Performance Score: ${newPerformance}`);

  const difference = newPerformance - oldPerformance;
  console.log(`Performance Score Difference: ${difference}`);

  // 如果性能下降超过 10 分，标记为失败
  if (difference < -10) {
    console.error("Performance score dropped significantly!");
    process.exit(1); // 使 CI 失败
  }
} else {
  console.log("No previous scores found, skipping comparison.");
}

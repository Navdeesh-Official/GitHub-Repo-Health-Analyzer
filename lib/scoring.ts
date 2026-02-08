import { RepoDetails, RepoAnalysis } from "@/types";

const README_INSTALLATION_RE = /# installation/i;
const README_SETUP_RE = /# setup/i;
const README_USAGE_RE = /# usage/i;
const README_SETUP_INSTALL_RE = /# (setup|install)/i;
const README_CONTRIB_DEV_RE = /# (contributing|development)/i;
const CONTRIBUTING_RE = /CONTRIBUTING/i;
const CODE_OF_CONDUCT_RE = /CODE_OF_CONDUCT/i;

export function calculateHealthScore(
    repo: RepoDetails,
    contributorsCount: number,
    files: string[],
    readmeContent: string | null
): Omit<RepoAnalysis, "url" | "details" | "contributorsCount"> {
    const breakdown: string[] = [];

    const hasLicense = !!repo.license;

    // Documentation Quality (30 points)
    let docScore = 0;
    if (readmeContent) {
        docScore += 5;
        if (readmeContent.length > 1000) docScore += 5;
        if (README_SETUP_INSTALL_RE.test(readmeContent)) docScore += 5;
        if (README_CONTRIB_DEV_RE.test(readmeContent)) docScore += 5;
    }
    if (hasLicense) docScore += 10;
    else breakdown.push("Missing License file");

    if (docScore < 10) breakdown.push("Poor documentation quality");

    // 2. Maintenance Activity (30 points)
    let maintScore = 0;
    const lastCommitDate = new Date(repo.lastCommitDate);
    const now = new Date();
    const diffDays = (now.getTime() - lastCommitDate.getTime()) / (1000 * 3600 * 24);

    if (diffDays < 7) maintScore += 30;
    else if (diffDays < 30) maintScore += 20;
    else if (diffDays < 90) maintScore += 10;
    else if (diffDays < 365) maintScore += 5;
    else breakdown.push("Repository seems inactive (> 1 year without commits)");

    // 3. Collaboration Level (20 points)
    let collabScore = 0;
    if (contributorsCount > 1) collabScore += 5;
    if (contributorsCount > 5) collabScore += 5;
    if (repo.openIssues > 0) collabScore += 5; // Shows usage? Or maybe bad? 
    // Open issues are good if ratio is healthy. For now just presence implies activity/feedback.
    // Let's check Forks.
    if (repo.forks > 5) collabScore += 5;

    if (contributorsCount === 1) breakdown.push("Single maintainer (Low bus factor)");

    // 4. Beginner Friendliness (20 points)
    let beginnerScore = 0;
    const CONTRIBUTING = files.find(f => CONTRIBUTING_RE.test(f));
    const CODE_OF_CONDUCT = files.find(f => CODE_OF_CONDUCT_RE.test(f));

    if (CONTRIBUTING) beginnerScore += 10;
    if (CODE_OF_CONDUCT) beginnerScore += 5;
    if (repo.openIssues > 0) {
        // We can't easily check for "good first issue" without extra API calls, 
        // but let's assume if there are issues and contributing guide, it's decent.
        beginnerScore += 5;
    }

    if (!CONTRIBUTING) breakdown.push("No CONTRIBUTING.md guideline found");

    // Totals
    const totalScore = Math.min(100, docScore + maintScore + collabScore + beginnerScore);

    // Verdict
    let verdict: RepoAnalysis["verdict"] = "Not Beginner Friendly";
    if (beginnerScore >= 15 && totalScore > 60) verdict = "Beginner Friendly";
    else if (beginnerScore >= 5 && totalScore > 40) verdict = "Intermediate";

    return {
        healthScore: totalScore,
        commitsControl: {
            frequency: weeklyFrequency(diffDays), // Approx
            totalLastYear: 0 // Placeholder
        },
        fileChecks: {
            hasReadme: !!readmeContent,
            readmeSize: readmeContent?.length || 0,
            hasLicense: !!hasLicense,
            hasContributing: !!CONTRIBUTING,
            hasCodeOfConduct: !!CODE_OF_CONDUCT
        },
        subScores: {
            documentation: docScore,
            maintenance: maintScore,
            collaboration: collabScore,
            beginnerFriendly: beginnerScore
        },
        breakdown,
        verdict
    };
}

function weeklyFrequency(daysSinceLast: number): number {
    // Rough heuristic if we don't have full stats
    if (daysSinceLast < 7) return 5;
    if (daysSinceLast < 30) return 2;
    return 0;
}

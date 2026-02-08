import { RepoDetails, RepoAnalysis, Contributor } from "@/types";

export function calculateHealthScore(
    repo: RepoDetails,
    contributors: Contributor[],
    files: string[],
    readmeContent: string | null,
    commitActivity: number[],
    busFactor: number,
    dependencies: { count: number; manager: string; file: string; } | null,
    communityProfile: unknown
): Omit<RepoAnalysis, "url" | "details" | "contributorsCount" | "busFactor" | "commitHistory" | "languages" | "dependencies"> {

    const breakdown: string[] = [];

    // --- 1. Documentation Quality (30 points) ---
    let docScore = 0;
    if (readmeContent) {
        docScore += 10; // Existence
        if (readmeContent.length > 1000) docScore += 5; // Detailed
        if (/# (setup|install|getting started)/i.test(readmeContent)) docScore += 5;
        if (/# (contributing|development)/i.test(readmeContent)) docScore += 5;
    } else {
        breakdown.push("Missing README.md (-30 pts)");
    }

    const hasLicense = !!repo.license;
    if (hasLicense) docScore += 5;
    else breakdown.push("Missing License file");

    if (docScore < 15) breakdown.push("Documentation is sparse");

    // --- 2. Maintenance Activity (30 points) ---
    let maintScore = 0;
    const lastCommitDate = new Date(repo.lastCommitDate);
    const now = new Date();
    const diffDays = (now.getTime() - lastCommitDate.getTime()) / (1000 * 3600 * 24);

    // Recency (15 pts)
    if (diffDays < 7) maintScore += 15;
    else if (diffDays < 30) maintScore += 10;
    else if (diffDays < 90) maintScore += 5;
    else breakdown.push("No commits in the last 3 months");

    // Consistency (15 pts) - based on commit activity in last 12 weeks
    const recentActivity = commitActivity.slice(-12);
    const activeWeeks = recentActivity.filter(c => c > 0).length;

    if (activeWeeks > 10) maintScore += 15;
    else if (activeWeeks > 5) maintScore += 10;
    else if (activeWeeks > 0) maintScore += 5;
    else if (diffDays < 90) breakdown.push("Inconsistent maintenance activity");

    // --- 3. Collaboration Level (20 points) ---
    let collabScore = 0;
    const contributorsCount = contributors.length;

    if (contributorsCount > 1) collabScore += 5;
    if (contributorsCount > 5) collabScore += 5;

    // Bus Factor Check
    if (busFactor < 50 && contributorsCount > 1) collabScore += 5;
    else if (contributorsCount > 1) breakdown.push(`High Bus Factor: Top contributor has ${busFactor}% of commits`);
    else if (contributorsCount === 1) breakdown.push("Single maintainer project");

    if (repo.forks > 5) collabScore += 5;

    // --- 4. Beginner Friendliness & Best Practices (20 points) ---
    let beginnerScore = 0;

    // Use file checks or community profile
    const profile = communityProfile as { files?: { contributing?: unknown; code_of_conduct?: unknown } };
    const CONTRIBUTING = files.find(f => /CONTRIBUTING/i.test(f)) || profile?.files?.contributing;
    const CODE_OF_CONDUCT = files.find(f => /CODE_OF_CONDUCT/i.test(f)) || profile?.files?.code_of_conduct;
    const SECURITY = files.find(f => /SECURITY/i.test(f)); // Basic check

    if (CONTRIBUTING) beginnerScore += 5;
    else breakdown.push("Missing CONTRIBUTING guidelines");

    if (CODE_OF_CONDUCT) beginnerScore += 5;

    if (dependencies) beginnerScore += 5; // Managed dependencies implies structure

    if (repo.openIssues > 0 && repo.openIssues < 500) beginnerScore += 5; // Healthy issue tracker

    // Totals
    const totalScore = Math.min(100, docScore + maintScore + collabScore + beginnerScore);

    // Verdict
    let verdict: RepoAnalysis["verdict"] = "Not Beginner Friendly";
    if (beginnerScore >= 15 && totalScore > 70) verdict = "Beginner Friendly";
    else if (beginnerScore >= 10 && totalScore > 50) verdict = "Intermediate";

    // Weekly Frequency Avg (last 12 weeks)
    const avgFreq = recentActivity.reduce((a, b) => a + b, 0) / (recentActivity.length || 1);

    return {
        healthScore: totalScore,
        commitsControl: {
            frequency: Math.round(avgFreq * 10) / 10,
            totalLastYear: commitActivity.reduce((a, b) => a + b, 0)
        },
        fileChecks: {
            hasReadme: !!readmeContent,
            readmeSize: readmeContent?.length || 0,
            hasLicense: !!hasLicense,
            hasContributing: !!CONTRIBUTING,
            hasCodeOfConduct: !!CODE_OF_CONDUCT,
            hasSecurity: !!SECURITY
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

import {
    fetchRepoDetails,
    fetchContributors,
    fetchReadme,
    checkFiles,
    fetchCommitActivity,
    fetchLanguages,
    fetchCommunityProfile,
    fetchFileContent
} from "@/lib/github";
import { calculateHealthScore } from "@/lib/scoring";
import { RepoAnalysis, Contributor } from "@/types";

export async function analyzeRepo(repoUrl: string): Promise<RepoAnalysis> {
    if (!repoUrl || typeof repoUrl !== "string") {
        throw new Error("Invalid Repository URL");
    }

    let owner = "", name = "";
    const cleanUrl = repoUrl.trim().replace(/^https?:\/\/(www\.)?github\.com\//, "");
    const parts = cleanUrl.split("/");
    if (parts.length >= 2) {
        owner = parts[0];
        name = parts[1];
    } else {
        throw new Error("Invalid URL format. Expected github.com/owner/repo");
    }

    try {
        const details = await fetchRepoDetails(owner, name);

        const [
            readme,
            contributors,
            fileList,
            commitActivity,
            languages,
            communityProfile
        ] = await Promise.all([
            fetchReadme(owner, name),
            fetchContributors(owner, name),
            checkFiles(owner, name, details.defaultBranch),
            fetchCommitActivity(owner, name),
            fetchLanguages(owner, name),
            fetchCommunityProfile(owner, name)
        ]);

        // Bus Factor Calculation
        const busFactor = calculateBusFactor(contributors);

        // Dependency Scan
        const dependencies = await scanDependencies(owner, name, fileList);

        const analysis = calculateHealthScore(
            details,
            contributors,
            fileList,
            readme,
            commitActivity,
            busFactor,
            dependencies,
            communityProfile
        );

        return {
            url: `https://github.com/${owner}/${name}`,
            details,
            contributorsCount: contributors.length,
            busFactor,
            commitHistory: commitActivity,
            languages,
            dependencies,
            ...analysis
        };
    } catch (error: unknown) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "Failed to analyze repository";
        throw new Error(errorMessage);
    }
}

function calculateBusFactor(contributors: Contributor[]): number {
    if (contributors.length === 0) return 0;
    const totalContributions = contributors.reduce((sum, c) => sum + c.contributions, 0);
    if (totalContributions === 0) return 0;

    // Top contributor percentage
    const top = contributors[0].contributions;
    return Math.round((top / totalContributions) * 100);
}

async function scanDependencies(owner: string, name: string, fileList: string[]) {
    // Check for package managers
    const managers = [
        { file: "package.json", type: "npm" },
        { file: "requirements.txt", type: "pip" },
        { file: "go.mod", type: "go" },
        { file: "Cargo.toml", type: "cargo" },
        { file: "Gemfile", type: "bundler" },
        { file: "composer.json", type: "composer" },
        { file: "pom.xml", type: "maven" }
    ];

    const found = managers.find(m => fileList.includes(m.file));

    if (!found) return null;

    try {
        const content = await fetchFileContent(owner, name, found.file);
        if (!content) return { count: 0, manager: found.type, file: found.file };

        let count = 0;
        if (found.type === "npm") {
            const json = JSON.parse(content) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
            count = Object.keys(json.dependencies || {}).length + Object.keys(json.devDependencies || {}).length;
        } else if (found.type === "pip") {
            count = content.split('\n').filter(l => l.trim() && !l.startsWith('#')).length;
        } else if (found.type === "go") {
            count = content.split('\n').filter(l => l.trim().includes("require")).length; // Very rough
        } else {
             // Fallback for others: just line count as rough proxy or 0
             count = content.split('\n').length;
        }

        return {
            count,
            manager: found.type,
            file: found.file
        };
    } catch (e) {
        console.warn("Failed to parse dependency file", e);
        return { count: 0, manager: found.type, file: found.file };
    }
}

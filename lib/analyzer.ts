import { fetchRepoDetails, fetchContributors, fetchReadme, checkFiles } from "@/lib/github";
import { calculateHealthScore } from "@/lib/scoring";
import { RepoAnalysis } from "@/types";

export async function analyzeRepo(repoUrl: string): Promise<RepoAnalysis> {
    if (!repoUrl || typeof repoUrl !== "string") {
        throw new Error("Invalid Repository URL");
    }

    // Extract owner/name
    // Supports: https://github.com/owner/name, github.com/owner/name, owner/name
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

        const [readme, contributors, fileList] = await Promise.all([
            fetchReadme(owner, name),
            fetchContributors(owner, name),
            checkFiles(owner, name, details.defaultBranch)
        ]);

        const analysis = calculateHealthScore(details, contributors.length, fileList, readme);

        return {
            url: `https://github.com/${owner}/${name}`,
            details,
            contributorsCount: contributors.length,
            ...analysis
        };
    } catch (error: any) {
        console.error(error);
        throw new Error(error.message || "Failed to analyze repository");
    }
}

export interface RepoDetails {
    owner: string;
    name: string;
    description: string | null;
    stars: number;
    forks: number;
    openIssues: number;
    watchers: number;
    createdAt: string;
    updatedAt: string;
    lastCommitDate: string;
    hasWiki: boolean;
    hasPages: boolean;
    license: {
        name: string;
        key: string;
        url: string | null;
    } | null;
    defaultBranch: string;
    topics: string[];
}

export interface Contributor {
    login: string;
    contributions: number;
    avatarUrl: string;
}

export interface RepoContent {
    path: string;
    type: "file" | "dir";
    name: string;
}

export interface RepoAnalysis {
    url: string;
    details: RepoDetails;
    contributorsCount: number;
    // New Metrics
    busFactor: number; // Top contributor percentage
    commitHistory: number[]; // Weekly commit counts (last 52 weeks)
    languages: Record<string, number>; // Bytes per language
    dependencies: {
        count: number;
        manager: string;
        file: string;
    } | null;

    // Existing (kept for compatibility but maybe computed differently)
    commitsControl: {
        frequency: number; // commits per week avg
        totalLastYear?: number;
    };
    fileChecks: {
        hasReadme: boolean;
        readmeSize: number;
        hasLicense: boolean;
        hasContributing: boolean;
        hasCodeOfConduct: boolean;
        hasSecurity: boolean; // New
    };
    healthScore: number;
    subScores: {
        documentation: number; // /30
        maintenance: number;   // /30
        collaboration: number; // /20
        beginnerFriendly: number; // /20
    };
    breakdown: string[]; // Explanations
    verdict: "Beginner Friendly" | "Intermediate" | "Not Beginner Friendly";
}

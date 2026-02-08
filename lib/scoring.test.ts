import { describe, it, expect } from 'vitest';
import { calculateHealthScore } from './scoring';
import { RepoDetails } from '@/types';

// Helper to create a mock RepoDetails with default values
const createMockRepo = (overrides?: Partial<RepoDetails>): RepoDetails => ({
    owner: 'test-owner',
    name: 'test-repo',
    description: 'A test repository',
    stars: 100,
    forks: 20,
    openIssues: 5,
    watchers: 10,
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    lastCommitDate: new Date().toISOString(), // Default to now (active)
    hasWiki: true,
    hasPages: true,
    license: {
        name: 'MIT',
        key: 'mit',
        url: 'http://example.com/license',
    },
    defaultBranch: 'main',
    ...overrides,
});

describe('calculateHealthScore', () => {
    it('should return a high score for a healthy, well-documented repository', () => {
        const repo = createMockRepo();
        const contributorsCount = 10;
        const files = ['README.md', 'LICENSE', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md'];
        const readmeContent = `
# Project Name
This is a great project.

## Installation
npm install

## Usage
npm start

## Contributing
Please contribute!
        `.repeat(10); // Ensure length is sufficient for length checks if needed

        const result = calculateHealthScore(repo, contributorsCount, files, readmeContent);

        // Expect high score
        expect(result.healthScore).toBeGreaterThan(80);
        expect(result.verdict).toBe('Beginner Friendly');
        expect(result.breakdown).toHaveLength(0); // No negative breakdown messages
    });

    it('should return a low score for an inactive repository', () => {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 2); // 2 years ago

        const repo = createMockRepo({
            lastCommitDate: oneYearAgo.toISOString(),
        });
        const contributorsCount = 2;
        const files = ['README.md', 'LICENSE'];
        const readmeContent = '# Project';

        const result = calculateHealthScore(repo, contributorsCount, files, readmeContent);

        // Expect penalty for inactivity
        expect(result.subScores.maintenance).toBe(0); // Assuming > 1 year gets 0 maintenance score or low
        expect(result.breakdown).toContain('Repository seems inactive (> 1 year without commits)');
    });

    it('should penalize missing README and License', () => {
        const repo = createMockRepo({
            license: null,
        });
        const contributorsCount = 5;
        const files: string[] = []; // No files
        const readmeContent = null;

        const result = calculateHealthScore(repo, contributorsCount, files, readmeContent);

        expect(result.fileChecks.hasReadme).toBe(false);
        expect(result.fileChecks.hasLicense).toBe(false);
        expect(result.breakdown).toContain('Missing README.md (-30 pts)');
        expect(result.breakdown).toContain('Missing License file');

        // Doc score should be 0
        expect(result.subScores.documentation).toBe(0);
    });

    it('should detect beginner friendly files', () => {
        const repo = createMockRepo();
        const contributorsCount = 5;
        const files = ['CONTRIBUTING.md', 'CODE_OF_CONDUCT.md'];
        const readmeContent = 'Simple readme';

        const result = calculateHealthScore(repo, contributorsCount, files, readmeContent);

        expect(result.fileChecks.hasContributing).toBe(true);
        expect(result.fileChecks.hasCodeOfConduct).toBe(true);
        // Beginner score calculation:
        // CONTRIBUTING (+10) + CODE_OF_CONDUCT (+5) + openIssues > 0 (+5) = 20
        expect(result.subScores.beginnerFriendly).toBe(20);
    });

    it('should correctly analyze README content', () => {
        const repo = createMockRepo();
        const contributorsCount = 5;
        const files = ['README.md', 'LICENSE'];

        // Readme with specific sections
        const readmeContent = `
# Test Project
## Installation
Run this.
## Usage
Run that.
        `;

        const result = calculateHealthScore(repo, contributorsCount, files, readmeContent);

        expect(result.subScores.documentation).toBe(20);
    });

    it('should handle single maintainer (low bus factor)', () => {
        const repo = createMockRepo();
        const contributorsCount = 1;
        const files = ['README.md', 'LICENSE'];
        const readmeContent = 'Readme content';

        const result = calculateHealthScore(repo, contributorsCount, files, readmeContent);

        expect(result.breakdown).toContain('Single maintainer (Low bus factor)');
    });
});

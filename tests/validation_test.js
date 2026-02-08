
function validateRepoUrl(repoUrl) {
    let owner = "", name = "";
    const cleanUrl = repoUrl.trim().replace(/^https?:\/\/(www\.)?github\.com\//, "");
    const parts = cleanUrl.split("/");
    if (parts.length >= 2) {
        owner = parts[0];
        name = parts[1];
    } else {
        throw new Error("Invalid URL format. Expected github.com/owner/repo");
    }

    const ownerRegex = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
    const nameRegex = /^[a-z\d._-]{1,100}$/i;

    if (!ownerRegex.test(owner)) {
        throw new Error("Invalid repository owner");
    }
    if (!nameRegex.test(name)) {
        throw new Error("Invalid repository name");
    }

    return { owner, name };
}

const testCases = [
    { url: "octocat/Spoon-Knife", expected: { owner: "octocat", name: "Spoon-Knife" } },
    { url: "https://github.com/octocat/Spoon-Knife", expected: { owner: "octocat", name: "Spoon-Knife" } },
    { url: "microsoft/.net", expected: { owner: "microsoft", name: ".net" } },
    { url: "https://github.com/../../etc/passwd", error: "Invalid repository owner" },
    { url: "owner/repo$", error: "Invalid repository name" },
    { url: "very-long-owner-name-that-exceeds-thirty-nine-characters-limit/repo", error: "Invalid repository owner" },
    { url: "-invalid-owner/repo", error: "Invalid repository owner" },
    { url: "owner-/repo", error: "Invalid repository owner" },
    { url: "owner--name/repo", error: "Invalid repository owner" },
];

let failures = 0;
testCases.forEach((tc, index) => {
    try {
        const result = validateRepoUrl(tc.url);
        if (tc.error) {
            console.error(`Test Case ${index} failed: Expected error "${tc.error}", but got success`);
            failures++;
        } else if (result.owner !== tc.expected.owner || result.name !== tc.expected.name) {
            console.error(`Test Case ${index} failed: Expected ${JSON.stringify(tc.expected)}, but got ${JSON.stringify(result)}`);
            failures++;
        } else {
            console.log(`Test Case ${index} passed`);
        }
    } catch (e) {
        if (tc.error) {
            if (e.message === tc.error) {
                console.log(`Test Case ${index} passed (caught expected error)`);
            } else {
                console.error(`Test Case ${index} failed: Expected error "${tc.error}", but got "${e.message}"`);
                failures++;
            }
        } else {
            console.error(`Test Case ${index} failed: Unexpected error "${e.message}"`);
            failures++;
        }
    }
});

if (failures > 0) {
    console.error(`\n${failures} tests failed!`);
    process.exit(1);
} else {
    console.log("\nAll tests passed!");
    process.exit(0);
}

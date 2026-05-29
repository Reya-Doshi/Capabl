const GITHUB_USERNAME_RE = /github\.com\/([A-Za-z0-9-]+)\/?/i;
const LINKEDIN_SLUG_RE = /linkedin\.com\/in\/([A-Za-z0-9-_]{3,100})\/?/i;

const GITHUB_HEADERS: Record<string, string> = {
  "User-Agent": "Capabl-AI-Analyzer",
  Accept: "application/vnd.github+json",
  ...(process.env.GITHUB_TOKEN
    ? {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      }
    : {}),
};

export function extractGithubUsername(url: any) {
  if (!url) return null;
  const raw = String(url).trim().replace(/\/$/, "");
  const m = raw.match(GITHUB_USERNAME_RE);
  if (m && m[1]) return m[1];
  if (!raw.includes("/")) return raw.replace(/^@/, "") || null;
  return null;
}

export function extractLinkedInSlug(url: any) {
  if (!url) return null;
  const m = String(url).match(LINKEDIN_SLUG_RE);
  return m ? m[1] : null;
}

async function safeFetchJson(url: any, _ignored?: any): Promise<any> {
  try {
    const r = await fetch(url, { headers: GITHUB_HEADERS });
    console.log("GitHub rate limit remaining:", r.headers.get("x-ratelimit-remaining"));
    console.log("GitHub rate limit reset:", r.headers.get("x-ratelimit-reset"));

    if (r.status === 403) {
      console.error("GitHub API rate limit exceeded");
      return { ok: false, status: r.status, headers: r.headers, data: null };
    }

    if (r.status === 404) {
      console.error("GitHub username not found");
      return { ok: false, status: r.status, headers: r.headers, data: null };
    }

    if (!r.ok) {
      return { ok: false, status: r.status, headers: r.headers, data: null };
    }

    return { ok: true, status: r.status, headers: r.headers, data: await r.json() };
  } catch {
    return { ok: false, status: null, headers: null, data: null };
  }
}

async function safeFetchText(url: any): Promise<any> {
  try {
    const r = await fetch(url, {
      headers: {
        ...GITHUB_HEADERS,
        Accept: "application/vnd.github.raw",
      },
    });
    if (r.status === 403) {
      console.error("GitHub API rate limit exceeded");
      return null;
    }
    if (r.status === 404) {
      console.error("GitHub username not found");
      return null;
    }
    if (!r.ok) return null;
    return await r.text();
  } catch {
    return null;
  }
}

export async function fetchGithubProfile(url: any): Promise<any> {
  const username = extractGithubUsername(url);
  if (!username) {
    return {
      ok: false,
      reason: "Invalid GitHub username or URL",
      url,
    };
  }

  const profileResult = await safeFetchJson(
    `https://api.github.com/users/${encodeURIComponent(username)}`
  );

  if (!profileResult?.ok || !profileResult?.data?.login) {
    return {
      ok: false,
      reason:
        profileResult?.status === 403
          ? "GitHub API rate limit exceeded"
          : profileResult?.status === 404
          ? "GitHub user not found"
          : "GitHub user not found or rate-limited",
      username,
      url,
    };
  }

  const profile = profileResult.data;

  const reposResult = await safeFetchJson(
    `https://api.github.com/users/${encodeURIComponent(
      username
    )}/repos?per_page=100&sort=updated`
  );

  const repoList = Array.isArray(reposResult?.data) ? reposResult.data : [];
  const ownRepos = repoList.filter((r: any) => !r.fork);

  const totalStars = ownRepos.reduce(
    (acc: number, r: any) => acc + (r.stargazers_count || 0),
    0
  );

  const languageCounts: Record<string, number> = {};
  for (const r of ownRepos) {
    if (r.language) {
      const k = String(r.language).toLowerCase();
      languageCounts[k] = (languageCounts[k] || 0) + 1;
    }
  }
  const topLanguages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  const topRepos = ownRepos
    .slice()
    .sort(
      (a: any, b: any) =>
        (b.stargazers_count || 0) - (a.stargazers_count || 0)
    )
    .slice(0, 5)
    .map((r: any) => ({
      name: r.name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count || 0,
      url: r.html_url,
      forks: r.forks_count || 0,
      openIssues: r.open_issues_count || 0,
      pushedAt: r.pushed_at || r.updated_at || null,
      size: r.size || 0,
      homepage: r.homepage || null,
      archived: Boolean(r.archived),
      license: r.license?.spdx_id || r.license?.name || null,
      repoUrl: r.html_url,
      languagesUrl: r.languages_url,
    }));

  const detailedTopRepos = await Promise.all(
    topRepos.map(async (repo: any) => {
      const [languageMapResult, readme, repoTopicsResult] = await Promise.all([
        safeFetchJson(repo.languagesUrl),
        safeFetchText(`${repo.repoUrl}/readme`),
        safeFetchJson(`${repo.repoUrl}/topics`, {
          Accept: "application/vnd.github+json",
        } as any),
      ]);

      const languageMap = languageMapResult?.data;
      const repoTopics = repoTopicsResult?.data;

      const languageEntries: any[] = languageMap ? Object.entries(languageMap) : [];
      const languages = languageEntries
        .sort((a: any, b: any) => b[1] - a[1])
        .map(([name]) => name)
        .filter(Boolean);

      return {
        ...repo,
        languages,
        topics: Array.isArray(repoTopics?.names) ? repoTopics.names : [],
        readme: readme || "",
      };
    })
  );

  return {
    ok: true,
    username,
    name: profile.name,
    bio: profile.bio,
    avatar: profile.avatar_url,
    followers: profile.followers || 0,
    following: profile.following || 0,
    publicRepos: profile.public_repos || 0,
    publicGists: profile.public_gists || 0,
    ownRepoCount: ownRepos.length,
    totalStars,
    topLanguages,
    topRepos: detailedTopRepos,
    accountCreated: profile.created_at,
    htmlUrl: profile.html_url,
  };
}

export function scoreGithub(profile: any, careerSkillKeys: any) {
  if (!profile || !profile.ok) {
    return {
      score: 0,
      breakdown: { reason: profile?.reason || "No GitHub profile" },
      languagesMatched: [],
    };
  }

  const repoScore = Math.min(40, profile.ownRepoCount * 4);
  const followerScore = Math.min(15, profile.followers);
  const starScore = Math.min(20, profile.totalStars * 2);

 const profileLangs = new Set<string>(
  profile.topLanguages.map((l: any) => String(l.name).toLowerCase())
);

const required = new Set<string>(
  (careerSkillKeys || []).map((s: any) => String(s).toLowerCase())
);

const matched: string[] = [...required].filter((s: string) =>
  [...profileLangs].some((pl: string) =>
    pl.includes(s) || s.includes(pl)
  )
);
  const languageMatchScore = required.size
    ? Math.round((matched.length / required.size) * 25)
    : 0;

  const total = Math.min(
    100,
    repoScore + followerScore + starScore + languageMatchScore
  );

  return {
    score: total,
    breakdown: {
      repos: repoScore,
      followers: followerScore,
      stars: starScore,
      languageMatch: languageMatchScore,
    },
    languagesMatched: matched,
  };
}

export function scoreLinkedIn(url: any) {
  if (!url || !String(url).trim()) {
    return {
      score: 0,
      ok: false,
      reason: "No LinkedIn URL provided",
    };
  }

  const slug = extractLinkedInSlug(url);
  if (!slug) {
    return {
      score: 15,
      ok: false,
      reason:
        "URL doesn't match linkedin.com/in/<slug> format",
    };
  }

  const lengthScore = Math.min(25, slug.length * 2);
  const hasUrl = 35;
  const validSlugBonus = /^[a-z][a-z0-9-]+$/i.test(slug) ? 20 : 10;
  const completenessBonus = slug.length >= 6 ? 20 : 10;

  const score = Math.min(
    90,
    hasUrl + validSlugBonus + completenessBonus + (lengthScore > 10 ? 5 : 0)
  );

  return {
    score,
    ok: true,
    slug,
    note:
      "LinkedIn has no public API for personal profiles, so we score URL validity and presence only. A real depth-score requires LinkedIn OAuth.",
  };
}

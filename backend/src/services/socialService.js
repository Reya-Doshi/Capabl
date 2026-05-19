const GITHUB_USERNAME_RE = /github\.com\/([A-Za-z0-9-]+)\/?/i;
const LINKEDIN_SLUG_RE = /linkedin\.com\/in\/([A-Za-z0-9-_]{3,100})\/?/i;

const GITHUB_HEADERS = {
  "User-Agent": "Capabl-AI-Analyzer",
  Accept: "application/vnd.github+json",
};

export function extractGithubUsername(url) {
  if (!url) return null;
  const m = String(url).match(GITHUB_USERNAME_RE);
  return m ? m[1] : null;
}

export function extractLinkedInSlug(url) {
  if (!url) return null;
  const m = String(url).match(LINKEDIN_SLUG_RE);
  return m ? m[1] : null;
}

async function safeFetchJson(url) {
  try {
    const r = await fetch(url, { headers: GITHUB_HEADERS });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

export async function fetchGithubProfile(url) {
  const username = extractGithubUsername(url);
  if (!username) {
    return {
      ok: false,
      reason: "Invalid GitHub URL",
      url,
    };
  }

  const profile = await safeFetchJson(
    `https://api.github.com/users/${encodeURIComponent(username)}`
  );

  if (!profile || !profile.login) {
    return {
      ok: false,
      reason: "GitHub user not found or rate-limited",
      username,
      url,
    };
  }

  const repos = await safeFetchJson(
    `https://api.github.com/users/${encodeURIComponent(
      username
    )}/repos?per_page=100&sort=updated`
  );

  const repoList = Array.isArray(repos) ? repos : [];
  const ownRepos = repoList.filter((r) => !r.fork);

  const totalStars = ownRepos.reduce(
    (acc, r) => acc + (r.stargazers_count || 0),
    0
  );

  const languageCounts = {};
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
      (a, b) =>
        (b.stargazers_count || 0) - (a.stargazers_count || 0)
    )
    .slice(0, 5)
    .map((r) => ({
      name: r.name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count || 0,
      url: r.html_url,
    }));

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
    topRepos,
    accountCreated: profile.created_at,
    htmlUrl: profile.html_url,
  };
}

export function scoreGithub(profile, careerSkillKeys) {
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

  const profileLangs = new Set(
    profile.topLanguages.map((l) => l.name.toLowerCase())
  );
  const required = new Set(
    (careerSkillKeys || []).map((s) => s.toLowerCase())
  );
  const matched = [...required].filter((s) =>
    [...profileLangs].some((pl) => pl.includes(s) || s.includes(pl))
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

export function scoreLinkedIn(url) {
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

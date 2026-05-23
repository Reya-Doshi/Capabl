// Curated learning resources per skill. Keep entries to ~3 per skill so the
// roadmap card stays scannable. Falls back to a generic "search" link if a
// skill is missing here.

const SKILL_RESOURCES = {
  git: [
    { title: "Pro Git (free book)", url: "https://git-scm.com/book/en/v2", type: "doc" },
    { title: "Learn Git Branching", url: "https://learngitbranching.js.org/", type: "interactive" },
  ],
  html: [
    { title: "MDN HTML basics", url: "https://developer.mozilla.org/en-US/docs/Learn/HTML", type: "doc" },
    { title: "web.dev Learn HTML", url: "https://web.dev/learn/html", type: "course" },
  ],
  css: [
    { title: "MDN CSS first steps", url: "https://developer.mozilla.org/en-US/docs/Learn/CSS", type: "doc" },
    { title: "web.dev Learn CSS", url: "https://web.dev/learn/css", type: "course" },
    { title: "CSS Tricks Flexbox guide", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/", type: "doc" },
  ],
  javascript: [
    { title: "JavaScript.info", url: "https://javascript.info/", type: "course" },
    { title: "MDN JS Guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", type: "doc" },
  ],
  typescript: [
    { title: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html", type: "doc" },
    { title: "Type-Level TypeScript", url: "https://type-level-typescript.com/", type: "course" },
  ],
  react: [
    { title: "react.dev official tutorial", url: "https://react.dev/learn", type: "course" },
    { title: "Beta docs - Thinking in React", url: "https://react.dev/learn/thinking-in-react", type: "doc" },
  ],
  redux: [
    { title: "Redux Essentials", url: "https://redux.js.org/tutorials/essentials/part-1-overview-concepts", type: "course" },
  ],
  tailwind: [
    { title: "Tailwind docs", url: "https://tailwindcss.com/docs/installation", type: "doc" },
  ],
  "next.js": [
    { title: "Next.js Learn", url: "https://nextjs.org/learn", type: "course" },
  ],
  "responsive design": [
    { title: "MDN Responsive design", url: "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design", type: "doc" },
  ],
  node: [
    { title: "Node.js docs", url: "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs", type: "doc" },
    { title: "nodejs.dev tutorial", url: "https://nodejs.dev/en/learn/", type: "course" },
  ],
  express: [
    { title: "Express Guide", url: "https://expressjs.com/en/guide/routing.html", type: "doc" },
  ],
  "rest api": [
    { title: "REST API design - RESTful API tutorial", url: "https://restfulapi.net/", type: "doc" },
    { title: "Postman Learning Center", url: "https://learning.postman.com/", type: "course" },
  ],
  mongodb: [
    { title: "MongoDB University free courses", url: "https://learn.mongodb.com/", type: "course" },
  ],
  postgresql: [
    { title: "PostgreSQL Tutorial", url: "https://www.postgresqltutorial.com/", type: "course" },
  ],
  redis: [
    { title: "Redis docs - intro", url: "https://redis.io/docs/latest/develop/", type: "doc" },
  ],
  authentication: [
    { title: "Auth0 - Intro to Auth", url: "https://auth0.com/intro-to-iam", type: "doc" },
    { title: "JWT.io introduction", url: "https://jwt.io/introduction", type: "doc" },
  ],
  docker: [
    { title: "Docker Get Started", url: "https://docs.docker.com/get-started/", type: "course" },
  ],
  kubernetes: [
    { title: "Kubernetes Basics", url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/", type: "course" },
  ],
  aws: [
    { title: "AWS Cloud Practitioner Essentials", url: "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/", type: "course" },
  ],
  "ci/cd": [
    { title: "GitHub Actions docs", url: "https://docs.github.com/actions", type: "doc" },
  ],
  terraform: [
    { title: "Terraform Get Started", url: "https://developer.hashicorp.com/terraform/tutorials", type: "course" },
  ],
  linux: [
    { title: "Linux Journey", url: "https://linuxjourney.com/", type: "interactive" },
  ],
  bash: [
    { title: "Bash scripting cheatsheet", url: "https://devhints.io/bash", type: "doc" },
  ],
  monitoring: [
    { title: "Prometheus docs", url: "https://prometheus.io/docs/introduction/overview/", type: "doc" },
  ],
  dsa: [
    { title: "NeetCode 150", url: "https://neetcode.io/practice", type: "interactive" },
    { title: "Striver SDE Sheet", url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/", type: "course" },
  ],
  python: [
    { title: "Python.org tutorial", url: "https://docs.python.org/3/tutorial/", type: "doc" },
    { title: "Automate the Boring Stuff", url: "https://automatetheboringstuff.com/", type: "course" },
  ],
  numpy: [
    { title: "NumPy quickstart", url: "https://numpy.org/doc/stable/user/quickstart.html", type: "doc" },
  ],
  pandas: [
    { title: "Pandas 10-min intro", url: "https://pandas.pydata.org/docs/user_guide/10min.html", type: "doc" },
  ],
  "machine learning": [
    { title: "Andrew Ng Machine Learning (Coursera)", url: "https://www.coursera.org/specializations/machine-learning-introduction", type: "course" },
  ],
  "deep learning": [
    { title: "fast.ai Practical Deep Learning", url: "https://course.fast.ai/", type: "course" },
  ],
  tensorflow: [
    { title: "TensorFlow tutorials", url: "https://www.tensorflow.org/tutorials", type: "course" },
  ],
  pytorch: [
    { title: "PyTorch tutorials", url: "https://pytorch.org/tutorials/", type: "course" },
  ],
  nlp: [
    { title: "HuggingFace NLP course", url: "https://huggingface.co/learn/nlp-course", type: "course" },
  ],
  statistics: [
    { title: "Khan Academy - Statistics", url: "https://www.khanacademy.org/math/statistics-probability", type: "course" },
  ],
  math: [
    { title: "Khan Academy - Linear Algebra", url: "https://www.khanacademy.org/math/linear-algebra", type: "course" },
  ],
  sql: [
    { title: "SQLBolt interactive", url: "https://sqlbolt.com/", type: "interactive" },
    { title: "Mode SQL Tutorial", url: "https://mode.com/sql-tutorial/", type: "course" },
  ],
  excel: [
    { title: "Microsoft Excel training", url: "https://support.microsoft.com/en-us/excel", type: "doc" },
  ],
  "power bi": [
    { title: "Microsoft Learn - Power BI", url: "https://learn.microsoft.com/en-us/training/powerplatform/power-bi", type: "course" },
  ],
  tableau: [
    { title: "Tableau free training", url: "https://www.tableau.com/learn/training", type: "course" },
  ],
  matplotlib: [
    { title: "Matplotlib pyplot tutorial", url: "https://matplotlib.org/stable/tutorials/pyplot.html", type: "doc" },
  ],
  "data visualization": [
    { title: "Storytelling with Data", url: "https://www.storytellingwithdata.com/", type: "doc" },
  ],
  "react native": [
    { title: "React Native docs", url: "https://reactnative.dev/docs/getting-started", type: "doc" },
  ],
  flutter: [
    { title: "Flutter codelabs", url: "https://docs.flutter.dev/codelabs", type: "course" },
  ],
  dart: [
    { title: "Dart language tour", url: "https://dart.dev/language", type: "doc" },
  ],
  swift: [
    { title: "Swift book", url: "https://docs.swift.org/swift-book/", type: "doc" },
  ],
  kotlin: [
    { title: "Kotlin docs", url: "https://kotlinlang.org/docs/home.html", type: "doc" },
  ],
  "system design": [
    { title: "System Design Primer (GitHub)", url: "https://github.com/donnemartin/system-design-primer", type: "doc" },
    { title: "ByteByteGo on YouTube", url: "https://www.youtube.com/@ByteByteGo", type: "video" },
  ],
  "interview prep": [
    { title: "Tech Interview Handbook", url: "https://www.techinterviewhandbook.org/", type: "doc" },
    { title: "Pramp - free mock interviews", url: "https://www.pramp.com/", type: "interactive" },
  ],
  portfolio: [
    { title: "Brittany Chiang portfolio (inspiration)", url: "https://brittanychiang.com/", type: "doc" },
    { title: "How to build a developer portfolio", url: "https://www.freecodecamp.org/news/how-to-build-a-developer-portfolio-website/", type: "doc" },
  ],
};

export function resourcesForSkill(skill) {
  if (!skill) return [];
  const key = String(skill).toLowerCase().trim();
  if (SKILL_RESOURCES[key]) return SKILL_RESOURCES[key];
  return [
    {
      title: `Search docs for "${skill}"`,
      url: `https://www.google.com/search?q=${encodeURIComponent(
        skill + " tutorial documentation"
      )}`,
      type: "search",
    },
  ];
}

export default SKILL_RESOURCES;

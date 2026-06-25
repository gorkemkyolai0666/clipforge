const projectName = process.argv[2];

const response = await fetch(
  "https://api.github.com/orgs/gorkemkyolai0666/repos",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GH_PAT}`,
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify({
      name: projectName,
      private: false,
      auto_init: false,
    }),
  }
);

if (!response.ok) {
  const error = await response.text();
  throw new Error(error);
}

console.log(`Repository created: ${projectName}`);

/* =========================================================
   EDIT ME — all your links and videos live here.
   ========================================================= */

const SITE = {
  name: "Kurt",
  // Words cycled by the typing effect on the home page
  roles: ["Biostatistician.", "YouTuber.", "AI builder."],

  links: {
    github:   "https://github.com/kriggithub",
    linkedin: "https://www.linkedin.com/in/kurtriggin/",
    youtube:  "https://www.youtube.com/@KurtRiggin",
    email:    "mailto:krigginbusiness@gmail.com",
  },
};

/* YouTube videos.
   - Paste the video ID (the part after "watch?v=") into `id`
     and the real thumbnail + link appear automatically.
   - Leave `id` empty to show a styled placeholder.
   - `category` drives the filter buttons on the YouTube page.  */
const VIDEOS = {
  // Big video at the top of the YouTube page. Leave `id` empty to feature
  // the newest synced long-form video; `label` shows when there's none yet.
  featured: { id: "", title: "How I Claude Coded My Over-the-Top Portfolio Website in 30 Minutes", label: "// premieres soon" },

  // Videos sync automatically from the channel (js/youtube-data.js, written
  // by the "YouTube sync" GitHub Action). This list is only a fallback for
  // when that file has no videos. To pin a featured video, set its `id` above.
  // { id: "dQw4w9WgXcQ", title: "…", category: "AI builds", duration: "12:34", date: "Nov 2026" },
  list: [],
};

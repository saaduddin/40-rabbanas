import { fetchVerseByKey } from "./lib/qf/content";
fetchVerseByKey("2:201").then(x => console.log(JSON.stringify(x.translations, null, 2))).catch(console.error);

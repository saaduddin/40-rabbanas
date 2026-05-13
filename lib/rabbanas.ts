/**
 * The 40 Rabbanas — the canonical list of duʿās in the Qur'an that begin
 * with "Rabbanā..." ("Our Lord..."). Verse keys (chapter:verse) follow
 * the Uthmani numbering used by Quran.com / Quran Foundation Content APIs.
 *
 * Each entry has a short, human-readable theme — used for the index card
 * subtitle. The Arabic, translation, and audio are fetched live from the
 * Quran Foundation Content API on the verse detail page so we always show
 * the latest text and never ship stale content.
 */
export type Rabbana = {
  id: number // 1..40
  verseKey: string // e.g. "2:127"
  theme: string // short English headline
}

export const RABBANAS: Rabbana[] = [
  { id: 1, verseKey: "2:127", theme: "Acceptance of our striving" },
  { id: 2, verseKey: "2:128", theme: "A Muslim heart and a guided progeny" },
  { id: 3, verseKey: "2:201", theme: "Good in this life and the next" },
  { id: 4, verseKey: "2:250", theme: "Patience and steadfast feet" },
  { id: 5, verseKey: "2:285", theme: "Hearing and obeying His command" },
  { id: 6, verseKey: "2:286", theme: "Forgive our mistakes and slips" },
  { id: 7, verseKey: "3:8", theme: "Keep our hearts firm after guidance" },
  { id: 8, verseKey: "3:9", theme: "Surely You will gather mankind" },
  { id: 9, verseKey: "3:16", theme: "We have believed, so forgive us" },
  { id: 10, verseKey: "3:53", theme: "Inscribe us among the witnesses" },
  { id: 11, verseKey: "3:147", theme: "Forgive our excesses and grant victory" },
  { id: 12, verseKey: "3:191", theme: "You did not create this in vain" },
  { id: 13, verseKey: "3:192", theme: "Save us from disgrace in the Fire" },
  { id: 14, verseKey: "3:193", theme: "Take us in death with the righteous" },
  { id: 15, verseKey: "3:194", theme: "Grant us what You promised" },
  { id: 16, verseKey: "5:83", theme: "Inscribe us with the witnesses" },
  { id: 17, verseKey: "5:114", theme: "A table from heaven, a festival" },
  { id: 18, verseKey: "7:23", theme: "We have wronged ourselves" },
  { id: 19, verseKey: "7:47", theme: "Place us not among wrongdoers" },
  { id: 20, verseKey: "7:89", theme: "Decide between us in truth" },
  { id: 21, verseKey: "7:126", theme: "Pour patience upon us" },
  { id: 22, verseKey: "7:155", theme: "Forgive us and have mercy" },
  { id: 23, verseKey: "10:85", theme: "Make us not a trial for the wrongdoers" },
  { id: 24, verseKey: "10:86", theme: "Deliver us by Your mercy" },
  { id: 25, verseKey: "14:38", theme: "You know what we conceal and reveal" },
  { id: 26, verseKey: "14:40", theme: "Make me steadfast in prayer" },
  { id: 27, verseKey: "14:41", theme: "Forgive me, my parents, and the believers" },
  { id: 28, verseKey: "17:24", theme: "Mercy upon parents as they raised us" },
  { id: 29, verseKey: "17:80", theme: "Entry of truth, exit of truth" },
  { id: 30, verseKey: "18:10", theme: "Mercy and right guidance for our affair" },
  { id: 31, verseKey: "20:45", theme: "We fear he may transgress against us" },
  { id: 32, verseKey: "23:109", theme: "We have believed, so forgive us" },
  { id: 33, verseKey: "25:65", theme: "Avert from us the torment of Hell" },
  { id: 34, verseKey: "25:74", theme: "Coolness of our eyes from family" },
  { id: 35, verseKey: "40:7", theme: "Mercy and knowledge encompass all" },
  { id: 36, verseKey: "40:8", theme: "Admit them to the Gardens of ʿAdn" },
  { id: 37, verseKey: "59:10", theme: "Forgive us and our believing brethren" },
  { id: 38, verseKey: "60:4", theme: "In You we trust and turn" },
  { id: 39, verseKey: "60:5", theme: "Make us not a trial for the disbelievers" },
  { id: 40, verseKey: "66:8", theme: "Perfect our light and forgive us" },
]

export function getRabbana(id: number): Rabbana | undefined {
  return RABBANAS.find((r) => r.id === id)
}

export function getRabbanaByKey(verseKey: string): Rabbana | undefined {
  return RABBANAS.find((r) => r.verseKey === verseKey)
}

// Loads every photo/video in src/images and reads the date from the filename
// (IMG-20260626-WA0034.jpg, Screenshot_2026-10-19-...jpg, VID-20260922-WA0005.mp4).

const imageMods = import.meta.glob('../images/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG}', {
  eager: true,
  import: 'default',
})
const videoMods = import.meta.glob('../images/*.{mp4,webm,MP4}', { eager: true, import: 'default' })

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function parseDate(name) {
  const m = name.match(/(\d{4})-?(\d{2})-?(\d{2})/)
  if (!m) return null
  return new Date(+m[1], +m[2] - 1, +m[3])
}

const all = Object.entries(imageMods)
  .map(([path, src]) => {
    const file = path.split('/').pop()
    return { file, src, date: parseDate(file), isScreenshot: /^screenshot/i.test(file) }
  })
  .sort((a, b) => (a.date ?? 0) - (b.date ?? 0) || a.file.localeCompare(b.file))

export const photos = all.filter((p) => !p.isScreenshot)
export const screenshots = all.filter((p) => p.isScreenshot)
export const videos = Object.values(videoMods)

export function formatDate(d) {
  return d ? `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` : 'A beautiful day'
}

// "05112002" → { day: 5, month: 11, year: 2002 } or null if it is not a real date
export function parseBirthday(ddmmyyyy) {
  const day = +ddmmyyyy.slice(0, 2)
  const month = +ddmmyyyy.slice(2, 4)
  const year = +ddmmyyyy.slice(4, 8)
  const thisYear = new Date().getFullYear()
  if (year < 1950 || year > thisYear - 5) return null
  if (month < 1 || month > 12) return null
  if (day < 1 || day > new Date(year, month, 0).getDate()) return null
  return { day, month, year }
}

export function formatBirthday(b, withYear = false) {
  if (!b) return ''
  return `${b.day} ${MONTHS[b.month - 1]}${withYear ? ` ${b.year}` : ''}`
}

// The age she turns on this year's birthday
export function birthdayAge(b) {
  return b ? new Date().getFullYear() - b.year : null
}

export function groupByMonth(list) {
  const map = new Map()
  for (const p of list) {
    const key = p.date ? `${MONTHS[p.date.getMonth()]} ${p.date.getFullYear()}` : 'Forever'
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(p)
  }
  return [...map].map(([label, items]) => ({ label, items }))
}

export function findPhoto(file) {
  return file ? all.find((p) => p.file === file) : undefined
}

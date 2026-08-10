export function pad(num) {
  return String(num).padStart(2, '0')
}

export function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${pad(minutes)}:${pad(seconds)}`
}

export function formatMinutes(minutes) {
  return `${Math.round(minutes)} min`
}

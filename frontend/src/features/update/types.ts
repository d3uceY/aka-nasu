// Update feature types (GitHub release check + the "Get X" modal).
export interface ReleaseInfo {
  tag: string
  name: string
  url: string
  notes: string
}

export interface UpdateState {
  // Latest stable release worth offering, or null when there's nothing.
  release: ReleaseInfo | null
  visible: boolean
}

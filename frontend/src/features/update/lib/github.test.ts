import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import { parseVersion, isStable, fetchLatestRelease, checkForUpdate } from './github.js'

describe('github version helpers', () => {
  it('parses semver tags', () => {
    expect(parseVersion('v1.2.3')).toEqual([1, 2, 3])
    expect(parseVersion('1.2.3')).toEqual([1, 2, 3])
    expect(parseVersion('0.1.0')).toEqual([0, 1, 0])
  })

  it('rejects non-semver tags', () => {
    expect(parseVersion('banana')).toBeNull()
    expect(parseVersion('')).toBeNull()
    expect(parseVersion('v1.2')).toBeNull()
  })

  it('flags pre-release tags as unstable', () => {
    expect(isStable('v1.2.3')).toBe(true)
    expect(isStable('v1.2.3-beta.1')).toBe(false)
    expect(isStable('v1.2.3-rc')).toBe(false)
    expect(isStable('v1.2.3-dev')).toBe(false)
    expect(isStable('v2.0.0-alpha')).toBe(false)
  })
})

describe('fetchLatestRelease', () => {
  const originalFetch = globalThis.fetch
  const fetchMock = vi.fn()

  beforeEach(() => {
    globalThis.fetch = fetchMock
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    fetchMock.mockReset()
  })

  it('maps a successful release response', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        tag_name: 'v1.2.3',
        name: 'v1.2.3',
        html_url: 'https://github.com/d3uceY/aka-nasu/releases/tag/v1.2.3',
        body: 'notes',
      }),
    })
    const release = await fetchLatestRelease()
    expect(release).toEqual({
      tag: 'v1.2.3',
      name: 'v1.2.3',
      url: 'https://github.com/d3uceY/aka-nasu/releases/tag/v1.2.3',
      notes: 'notes',
    })
  })

  it('returns null on a non-ok response (e.g. no releases yet)', async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({}) })
    expect(await fetchLatestRelease()).toBeNull()
  })

  it('returns null when the network fails', async () => {
    fetchMock.mockRejectedValue(new Error('offline'))
    expect(await fetchLatestRelease()).toBeNull()
  })
})

describe('checkForUpdate', () => {
  const originalFetch = globalThis.fetch
  const fetchMock = vi.fn()

  beforeEach(() => {
    globalThis.fetch = fetchMock
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    fetchMock.mockReset()
  })

  const stableRelease = {
    ok: true,
    json: async () => ({
      tag_name: 'v1.2.3',
      name: 'v1.2.3',
      html_url: 'https://github.com/d3uceY/aka-nasu/releases/tag/v1.2.3',
      body: '',
    }),
  }

  it('offers a newer stable release', async () => {
    fetchMock.mockResolvedValue(stableRelease)
    const release = await checkForUpdate('0.1.0')
    expect(release?.tag).toBe('v1.2.3')
  })

  it('offers nothing for the same or older version', async () => {
    fetchMock.mockResolvedValue(stableRelease)
    expect(await checkForUpdate('1.2.3')).toBeNull()
    expect(await checkForUpdate('2.0.0')).toBeNull()
  })

  it('never offers a pre-release', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ tag_name: 'v1.2.3-beta.1', name: 'beta', html_url: '', body: '' }),
    })
    expect(await checkForUpdate('0.1.0')).toBeNull()
  })

  it('offers nothing without a running version', async () => {
    expect(await checkForUpdate('')).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

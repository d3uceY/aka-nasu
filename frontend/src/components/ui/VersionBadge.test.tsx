import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { VersionBadge } from './VersionBadge.jsx'
import { getAppVersion } from '../../lib/backend.js'

vi.mock('../../lib/backend.js', () => ({
  getAppVersion: vi.fn(),
}))

const mockGetVersion = vi.mocked(getAppVersion)

describe('VersionBadge', () => {
  it('renders nothing when there is no version (no bridge)', () => {
    mockGetVersion.mockResolvedValue(null)
    const { container } = render(<VersionBadge />)
    expect(container.querySelector('.version-badge')).toBeNull()
  })

  it('shows the version once it resolves', async () => {
    mockGetVersion.mockResolvedValue('0.1.0')
    render(<VersionBadge />)
    const badge = await screen.findByRole('button', { name: /Aka Nasu v0\.1\.0/ })
    expect(badge).toHaveTextContent('v0.1.0')
  })
})

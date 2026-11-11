import { constants as fsConstants, promises as fsp } from 'node:fs'
import { join } from 'node:path'
import { POSIX, modeString, nowIso, readJsonSafe, statSafe, withTimeout } from './util.js'

const KNOWN_FISH_PACKAGES = ['dsh-fish', 'dsh-fishtank', 'dsh-fish-river', 'dsh-bili-whale']

export async function runDoctor({ ctx, dataRoot, sources, mode }) {
  const checks = []
  const add = (id, status, title, evidence, remediation) => {
    checks.push({ id, status, title, evidence, remediation })
  }

  const storeStat = await statSafe(dataRoot)
  if (!storeStat) {
    add('store.exists', 'fail', 'Console data root', `Missing: ${dataRoot}`, 'Restart the plugin; it creates the directory on start.')
  } else {
    let writable = null
    if (POSIX) {
      try {
        await fsp.access(dataRoot, fsConstants.W_OK)
        writable = true
      } catch {
        writable = false
      }
    }
    add(
      'store.exists',
      writable === false ? 'fail' : 'ok',
      'Console data root',
      `${dataRoot}${writable === null ? ' (writability unknown on Windows)' : writable ? ' (writable)' : ' (not writable)'}`,
      writable === false ? 'Fix ownership or permissions of the data root.' : undefined,
    )
    if (POSIX) {
      const mode = modeString(storeStat.mode)
      add(
        'store.permissions',
        mode === '0700' ? 'ok' : 'warn',
        'Console data permissions',
        `Mode ${mode}`,
        mode === '0700' ? undefined : 'Run chmod 700 on the console data root.',
      )
    } else {
      add('store.permissions', 'unknown', 'Console data permissions', 'Windows ACLs are not interpreted by this check.', 'Review the folder ACL manually if other users share this machine.')
    }
  }

  for (const [sourceId, state] of sources) {
    if (!state.description) {
      add(`source.${sourceId}.readable`, 'fail', `Source ${sourceId}`, state.error?.message ?? 'Source failed to initialize.', 'Check the path and permissions in the plugin configuration.')
      continue
    }
    const root = state.description.root ?? state.config?.location
    const remote = state.description.adapter === 'http'
    const stat = remote ? undefined : root ? await statSafe(root) : undefined
    if (remote) {
      add(`source.${sourceId}.exists`, 'ok', `Source ${sourceId}`, `HTTP source: ${root}`)
    } else {
      add(
        `source.${sourceId}.exists`,
        stat ? 'ok' : 'fail',
        `Source ${sourceId}`,
        stat ? `Found: ${root}` : `Missing: ${root}`,
        stat ? undefined : 'Fix the data source location or disable the source.',
      )
    }
    if (!remote && (!stat || !state.adapter)) continue
    try {
      const status = await withTimeout(state.adapter.readStatus(), 3000, 'source status')
      for (const channel of status.channels ?? []) {
        const credential = channel.credential
        if (!credential) continue
        const checkId = `source.${sourceId}.credential.${channel.channel}`
        if (!credential.exists) {
          add(checkId, 'warn', `Credential for ${channel.channel}`, `Missing: ${credential.path}`, 'Create the channel credential file or update the configured path.')
        } else if (POSIX && credential.modeOk === false) {
          add(checkId, 'warn', `Credential for ${channel.channel}`, `Mode ${credential.mode ?? 'unknown'} is broader than 0600.`, 'Run chmod 600 on the credential file.')
        } else {
          add(checkId, 'ok', `Credential for ${channel.channel}`, `Present${credential.mode ? ` (${credential.mode})` : ''}.`)
        }
      }
    } catch (error) {
      add(`source.${sourceId}.readable`, 'warn', `Source ${sourceId} read`, error.message, 'Check that the data source is reachable and its format is supported.')
    }
  }

  const profileDir = process.env.DSH_PROFILE_DIR
  if (!profileDir) {
    add('profile', 'unknown', 'DSH profile', 'DSH_PROFILE_DIR is not set; cannot inspect the profile manifest.', undefined)
  } else {
    const pkg = await readJsonSafe(join(profileDir, 'package.json'))
    if (!pkg) {
      add('profile', 'unknown', 'DSH profile', `Cannot read ${join(profileDir, 'package.json')}.`, undefined)
    } else {
      const dependencies = pkg.dependencies ?? {}
      const bundles = pkg.dsh?.profile?.bundles ?? pkg.dsh?.bundles ?? pkg.profile?.bundles
      if (!Array.isArray(bundles)) {
        add('profile', 'unknown', 'DSH profile', 'No dsh.profile.bundles list was found in the profile manifest.', 'Update the profile manifest or ignore this check on this DSH version.')
      } else {
        const present = KNOWN_FISH_PACKAGES.filter(name => dependencies[name] || bundles.includes(name))
        if (present.length === 0) {
          add('profile', 'ok', 'DSH profile', 'No known fish plugin is declared in this profile.', undefined)
        }
        for (const name of present) {
          const inDeps = Boolean(dependencies[name])
          const inBundles = bundles.includes(name)
          add(
            `profile.${name}`,
            inDeps && inBundles ? 'ok' : 'warn',
            `Profile entry for ${name}`,
            `dependencies=${inDeps ? 'yes' : 'no'}, profile bundles=${inBundles ? 'yes' : 'no'}`,
            inDeps && inBundles ? undefined : 'Add the package to both the profile dependencies and dsh.profile.bundles so the next install keeps it.',
          )
        }
      }
      if (typeof pkg.name === 'string') {
        add('profile.name', 'ok', 'DSH profile name', pkg.name)
      }
    }
  }

  const inventory = ctx.get('pluginInventory')
  if (inventory && typeof inventory.list === 'function') {
    try {
      const snapshot = await inventory.list()
      const failed = (snapshot.entries ?? []).filter(entry => entry.fiberPhase === 'failed')
      add(
        'plugins.runtime',
        failed.length === 0 ? 'ok' : 'warn',
        'Loaded plugins',
        `${snapshot.entries?.length ?? 0} entries; ${failed.length} failed.`,
        failed.length === 0 ? undefined : `Inspect failed entries: ${failed.map(entry => entry.moduleName).join(', ')}`,
      )
    } catch (error) {
      add('plugins.runtime', 'unknown', 'Loaded plugins', error.message, undefined)
    }
  } else {
    add('plugins.runtime', 'unknown', 'Loaded plugins', 'pluginInventory is not available in this profile.', undefined)
  }

  const subprocess = ctx.get('subprocess')
  if (!subprocess || typeof subprocess.resolveExecutable !== 'function') {
    add('binary.ffmpeg', 'unknown', 'Optional binary: ffmpeg', 'The subprocess service is not available.', undefined)
  } else {
    try {
      const path = await subprocess.resolveExecutable('ffmpeg')
      add('binary.ffmpeg', 'ok', 'Optional binary: ffmpeg', `Found at ${path}`, undefined)
    } catch {
      add('binary.ffmpeg', 'unknown', 'Optional binary: ffmpeg', 'Not found on PATH.', 'Install ffmpeg only if the fish plugin needs media processing.')
    }
  }

  add(
    'lock',
    mode === 'writer' ? 'ok' : 'warn',
    'Checkpoint writer',
    mode === 'writer' ? 'This instance owns the source locks.' : 'This instance is read-only because another instance owns at least one source lock.',
    mode === 'writer' ? undefined : 'Close the other console instance or accept read-only mode.',
  )

  const rank = { fail: 3, warn: 2, unknown: 1, ok: 0 }
  const overall = checks.reduce((worst, check) => (rank[check.status] > rank[worst] ? check.status : worst), 'ok')
  return { generatedAt: nowIso(), overall, mode, checks }
}

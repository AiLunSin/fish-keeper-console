import { registerRoutes } from './api.js'
import { ConsoleRuntime } from './runtime.js'

export const inject = ['connection']

export function apply(ctx, config) {
  const runtime = new ConsoleRuntime(ctx, config)
  registerRoutes(ctx, runtime)
  ctx.effect(() => {
    let disposed = false
    void runtime.start().catch(error => {
      if (!disposed) ctx.logger?.error?.('[fishkeeper] startup failed', error)
    })
    return async () => {
      disposed = true
      await runtime.dispose()
    }
  }, 'fishkeeper:runtime')
}

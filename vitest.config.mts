import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      include: [
        'lib/normalizeVehicle.ts',
        'lib/recommendation/recommendEVs.ts',
        'lib/i18nRouting.ts',
      ],
    },
  },
})

export { assertPageConfigs }
export { assertPageConfigGlobal }

import { assert, isObject, hasProp, assertUsage, isCallable } from '../utils'
import type { PageConfig, PageConfigGlobal } from './PageConfig'

function assertPageConfigs(pageConfigs: unknown): asserts pageConfigs is PageConfig[] {
  assert(Array.isArray(pageConfigs) || pageConfigs === null)
  // TODO: remove obsolete comment?
  // if `pageConfigFilesCannotBeLoaded === null` => then `import.meta.glob('/**/+config.${scriptFileExtensions}', { eager: true })` cannot be transpiled/loaded => code of virtual file cannot be generated or run => assertPageConfigs() is never called
  assert(pageConfigs !== null)
  pageConfigs.forEach((pageConfig) => {
    assert(isObject(pageConfig))
    assert(hasProp(pageConfig, 'pageId', 'string'))
    assert(hasProp(pageConfig, 'pageConfigFilePathAll', 'string[]'))
    assert(hasProp(pageConfig, 'routeFilesystem', 'string') || hasProp(pageConfig, 'routeFilesystem', 'null'))
    assert(hasProp(pageConfig, 'routeFilesystemDefinedBy', 'string'))
    assert(hasProp(pageConfig, 'loadConfigValueFiles', 'function'))
    assert(hasProp(pageConfig, 'isErrorPage', 'boolean'))
    assert(hasProp(pageConfig, 'configElements', 'object'))
    assertConfigElements(pageConfig.configElements, false)
  })
}

function assertPageConfigGlobal(pageConfigGlobal: unknown): asserts pageConfigGlobal is PageConfigGlobal {
  assertConfigElements(pageConfigGlobal, true)
}

function assertConfigElements(configElements: unknown, isGlobalConfig: boolean) {
  assert(isObject(configElements))
  Object.entries(configElements).forEach(([configName, configElement]) => {
    assert(isObject(configElement) || configElement === null)
    if (configElement === null) {
      assert(isGlobalConfig)
      return
    }
    assert(hasProp(configElement, 'configDefinedAt', 'string'))
    assert(
      hasProp(configElement, 'pageConfigFilePath', 'string') || hasProp(configElement, 'pageConfigFilePath', 'null')
    )
    assert(hasProp(configElement, 'configEnv', 'string'))
    assert(
      hasProp(configElement, 'configValueFilePath', 'string') || hasProp(configElement, 'configValueFilePath', 'null')
    )
    assert(
      hasProp(configElement, 'configValueFileExport', 'string') ||
        hasProp(configElement, 'configValueFileExport', 'null')
    )
    if (isGlobalConfig) {
      assert(hasProp(configElement, 'configValue'))
    }
    if (configElement.configValueFilePath) {
      const { configValueFilePath } = configElement
      if (configName === 'route') {
        assert(hasProp(configElement, 'configValue')) // route files are eagerly loaded
        const { configValue } = configElement
        const configValueType = typeof configValue
        // TODO: validate earlier?
        assertUsage(
          configValueType === 'string' || isCallable(configValue),
          `${configValueFilePath} has a default export with an invalid type '${configValueType}': the default export should be a string or a function`
        )
      }
    }
  })
}

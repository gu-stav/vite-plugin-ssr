export const clientRouting = true
export { render }

import { hydrate, render as render_ } from 'solid-js/web'
import { PageLayout } from './PageLayout'
import type { PageContextBuiltInClientWithClientRouting as PageContextBuiltInClient } from 'vite-plugin-ssr/types'
import type { PageContext } from './types'
import { createStore, reconcile } from 'solid-js/store'

type PageContextClient = PageContextBuiltInClient & PageContext

let dispose: () => void
let rendered = false

const [pageContextStore, setPageContext] = createStore<PageContextClient>({} as PageContextClient)

async function render(pageContext: PageContextClient) {
  if (!rendered) {
    // Dispose to prevent duplicate pages when navigating.
    if (dispose) dispose()

    setPageContext(pageContext)

    const container = document.getElementById('page-view')!
    if (pageContext.isHydration) {
      dispose = hydrate(() => <PageLayout pageContext={pageContextStore} />, container)
    } else {
      dispose = render_(() => <PageLayout pageContext={pageContextStore} />, container)
    }
    rendered = true
  } else {
    removeUnmergable(pageContext)
    setPageContext(reconcile(pageContext))
  }
}

// Avoid:
// ```
// dev.js:135 Uncaught (in promise) TypeError: Cannot assign to read only property 'Page' of object '[object Module]'
//   at setProperty (dev.js:135:70)
//   at applyState (dev.js:320:5)
// ```
function removeUnmergable(pageContext: Record<string, any>) {
  // These pageContext properties cannot be reassigned
  delete pageContext._pageFilesAll
  delete pageContext._pageFilesLoaded
}

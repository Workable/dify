export const isDify = () => {
  return document.referrer.includes('dify.ai')
}

const getParentOrigin = () => {
  try {
    const firstAncestorOrigin = window.location.ancestorOrigins?.[0]
    if (firstAncestorOrigin)
      return new URL(firstAncestorOrigin).origin

    if (document.referrer)
      return new URL(document.referrer).origin

    return ''
  }
  catch {
    return ''
  }
}

const normalizeTargetOrigin = (targetOrigin: string) => {
  return targetOrigin === 'null' ? '*' : targetOrigin
}

const targetOrigin = normalizeTargetOrigin(getParentOrigin()) || '*'

export const isEventTrusted = (event: MessageEvent) => {
  return Boolean(
    (event.origin === targetOrigin
      || event.origin === window.location.origin
      || targetOrigin === '*')
      && event.data,
  )
}

// TODO: add move events

type HideDifyWidgetEvent = MessageEvent & {
  data: {
    event: 'hideDifyWidget'
  }
}

type DifyEvent = HideDifyWidgetEvent

export const postMessage = (event: DifyEvent['data']) => {
  window.parent?.postMessage?.(event, targetOrigin)
}

// TODO: use wherever you need to handle messages
//
// window.addEventListener('message', (e) => {
//   if (e.origin === 'http://localhost:8000') {
//     console.log('hooks.tsx - message:', e)
//   }
// })

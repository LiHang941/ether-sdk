export function invariant(state: boolean, errorMsg: string = 'ERROR') {
  if (!state)
    throw new Error(errorMsg)
}

export const ENDLESS = '∞'

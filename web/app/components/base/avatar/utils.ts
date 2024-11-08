export function getNameInitials(name: string) {
  let lastWord = ''
  const [firstWord, ...rest] = name ? name.split(' ').filter(Boolean) : []

  if (!firstWord)
    throw new Error('Nothing passed in getNameInitials')

  if (rest && rest.length)
    lastWord = rest[rest.length - 1]

  if (!lastWord) {
    return `${firstWord.charAt(0)}${
      firstWord.charAt(1) || firstWord.charAt(0)
    }`.toUpperCase()
  }

  return `${firstWord.charAt(0)}${lastWord.charAt(0)}`.toUpperCase()
}

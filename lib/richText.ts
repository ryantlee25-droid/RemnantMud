// ============================================================
// richText.ts — Tag wrapper helpers for inline colored spans
// ============================================================
// Usage in action handlers:
//   import { rt } from '@/lib/richText'
//   msg(`You see ${rt.item('Bandages')} on the ground.`)

export const rt = {
  item: (name: string) => `<item>${name}</item>`,
  npc: (name: string) => `<npc>${name}</npc>`,
  enemy: (name: string) => `<enemy>${name}</enemy>`,
  exit: (dir: string) => `<exit>${dir}</exit>`,
  keyword: (word: string) => `<keyword>${word}</keyword>`,
  currency: (amount: string) => `<currency>${amount}</currency>`,
}

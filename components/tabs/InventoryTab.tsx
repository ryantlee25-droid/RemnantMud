'use client'

// ============================================================
// InventoryTab.tsx — Inventory panel for tabbed sidebar
// Shows equipped weapon/armor, currency, and remaining items
// grouped by type.
// ============================================================

import { useGame } from '@/lib/gameContext'
import { WEAPON_TRAITS, ARMOR_TRAITS } from '@/types/traits'
import type { ItemType, InventoryItem } from '@/types/game'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function equippedOfType(inventory: InventoryItem[], type: ItemType): InventoryItem | undefined {
  return inventory.find((inv) => inv.equipped && inv.item.type === type)
}

// Item types that appear in the "other items" section (not equipped, not currency)
const OTHER_TYPES: ItemType[] = ['consumable', 'weapon', 'armor', 'key', 'junk', 'lore']

function typeLabel(type: ItemType): string {
  return type.toUpperCase()
}

// ------------------------------------------------------------
// Sub-components
// ------------------------------------------------------------

function SectionHeading({ label }: { label: string }) {
  return (
    <div className="text-amber-600 text-xs uppercase tracking-widest">{label}</div>
  )
}

function EmptyState({ text }: { text: string }) {
  return <div className="text-amber-700 text-xs">{text}</div>
}

// ------------------------------------------------------------
// InventoryTab
// ------------------------------------------------------------

export default function InventoryTab() {
  const { state } = useGame()

  if (!state.player) return null

  const inventory = state.inventory

  // -- Equipped weapon --
  const equippedWeapon = equippedOfType(inventory, 'weapon')
  const weapon = equippedWeapon?.item

  // -- Equipped armor --
  const equippedArmor = equippedOfType(inventory, 'armor')
  const armor = equippedArmor?.item

  // -- Currency --
  const currencyItems = inventory.filter((inv) => inv.item.type === 'currency')
  const totalCurrency = currencyItems.reduce((sum, inv) => sum + inv.quantity, 0)

  // -- Other items (not equipped, not currency) --
  const otherItems = inventory.filter(
    (inv) => !inv.equipped && inv.item.type !== 'currency'
  )

  // Group other items by type
  const byType: Partial<Record<ItemType, InventoryItem[]>> = {}
  for (const inv of otherItems) {
    const t = inv.item.type
    if (!byType[t]) byType[t] = []
    byType[t]!.push(inv)
  }

  return (
    <div role="tabpanel" id="tabpanel-inv" aria-labelledby="tab-inv" className="p-3 space-y-3 text-amber-400">

      {/* ---- Equipped Weapon ---- */}
      <div className="space-y-0.5">
        <SectionHeading label="Weapon" />
        {weapon ? (
          <>
            <div className="text-cyan-400 text-xs">{weapon.name}</div>
            {weapon.damage !== undefined && (
              <div className="text-xs">
                <span className="text-amber-700">DMG </span>
                <span className="text-amber-400">{weapon.damage}</span>
              </div>
            )}
            {weapon.weaponTraits && weapon.weaponTraits.length > 0 && (
              <div className="text-xs text-amber-700">
                {weapon.weaponTraits.map((tid) => {
                  const traitDef = WEAPON_TRAITS[tid]
                  return traitDef ? traitDef.name : tid
                }).join(', ')}
              </div>
            )}
          </>
        ) : (
          <EmptyState text="Unarmed." />
        )}
      </div>

      {/* ---- Equipped Armor ---- */}
      <div className="space-y-0.5">
        <SectionHeading label="Armor" />
        {armor ? (
          <>
            <div className="text-cyan-400 text-xs">{armor.name}</div>
            {armor.defense !== undefined && (
              <div className="text-xs">
                <span className="text-amber-700">DEF </span>
                <span className="text-amber-400">{armor.defense}</span>
              </div>
            )}
            {armor.armorTraits && armor.armorTraits.length > 0 && (
              <div className="text-xs text-amber-700">
                {armor.armorTraits.map((tid) => {
                  const traitDef = ARMOR_TRAITS[tid]
                  return traitDef ? traitDef.name : tid
                }).join(', ')}
              </div>
            )}
          </>
        ) : (
          <EmptyState text="No armor." />
        )}
      </div>

      {/* ---- Currency ---- */}
      <div className="space-y-0.5">
        <SectionHeading label="Rounds" />
        {totalCurrency > 0 ? (
          <div className="text-amber-300 text-xs">{totalCurrency}</div>
        ) : (
          <EmptyState text="0" />
        )}
      </div>

      {/* ---- Other Inventory Items (grouped by type) ---- */}
      {OTHER_TYPES.map((type) => {
        const items = byType[type]
        if (!items || items.length === 0) return null
        return (
          <div key={type} className="space-y-0.5">
            <SectionHeading label={typeLabel(type)} />
            {items.map((inv) => (
              <div key={inv.id} className="text-xs">
                <span className="text-cyan-400">{inv.item.name}</span>
                {inv.quantity > 1 ? ` x${inv.quantity}` : ''}
              </div>
            ))}
          </div>
        )
      })}

    </div>
  )
}

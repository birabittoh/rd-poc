#!/usr/bin/env python3
"""
Economy balancing script for the Residenze Digitali room game.

Gameplay loop:
  click emojis -> earn coins -> place items -> earn sparkles -> unlock emojis -> repeat

Each item type has a max placement limit, forcing players to progress to
more expensive tiers as they fill up cheaper ones.

Outputs src/economy.ts with all economy constants.
"""

import math
import json

# === EMOJIS (13 total) ===
# Index 0 (pop/💖) is free. Others must be unlocked with sparkles.
EMOJIS = [
    "💖 pop", "🥳 squee", "😍 aww", "🐰 jump", "✨ sparkle",
    "👀 ooh", "💋 kiss", "🎉 firecracker", "👹 neighbor",
    "👻 ghost", "👽 alien", "📣 airhorn", "👏 applause",
]

# === ITEMS (18 total, ordered by tier) ===
# (name, tier, max_placements)
ITEM_TIERS = [
    # Tier 0 - starter (cheap, limited)
    ("plant", 0, 3), ("chair", 0, 3),
    # Tier 1 - basic
    ("bedside_table", 1, 3), ("coffee_table", 1, 3), ("lamp", 1, 3),
    # Tier 2 - standard
    ("table", 2, 2), ("vase", 2, 3), ("book", 2, 3),
    # Tier 3 - mid
    ("drawer", 3, 2), ("floor_lamp", 3, 2), ("laptop", 3, 3),
    # Tier 4 - advanced
    ("mirror", 4, 2), ("mirror_ornament", 4, 2), ("boombox", 4, 2),
    # Tier 5 - premium
    ("library", 5, 2), ("tv", 5, 2), ("wardrobe", 5, 2), ("bed", 5, 2),
]

NUM_TIERS = 6

# === TUNING PARAMETERS ===

# Emoji coin rewards: coins earned per click
COIN_BASE = 1
COIN_GROWTH = 1.6

# Emoji unlock costs (in sparkles)
UNLOCK_BASE = 10
UNLOCK_GROWTH = 1.8

# Item coin costs (to place)
ITEM_COST_BASE = 25
ITEM_COST_GROWTH = 1.75

# Item sparkle rewards (earned on placement)
SPARKLE_BASE = 2
SPARKLE_GROWTH = 1.6

# Starting currencies
INITIAL_COINS = 0
INITIAL_SPARKLES = 0


def compute():
    # Emoji coin rewards — guaranteed strictly increasing via max(i+1, exponential)
    emoji_coin_rewards = []
    for i in range(len(EMOJIS)):
        reward = max(i + 1, math.floor(COIN_BASE * (COIN_GROWTH ** i)))
        emoji_coin_rewards.append(reward)

    # Emoji unlock costs (sparkles)
    emoji_unlock_costs = [0]  # index 0 is free
    for i in range(1, len(EMOJIS)):
        cost = max(1, math.floor(UNLOCK_BASE * (UNLOCK_GROWTH ** (i - 1))))
        emoji_unlock_costs.append(cost)

    # Item coin costs
    item_coin_costs = {}
    for name, tier, _ in ITEM_TIERS:
        cost = max(1, math.floor(ITEM_COST_BASE * (ITEM_COST_GROWTH ** tier)))
        item_coin_costs[name] = cost

    # Item sparkle rewards
    item_sparkle_rewards = {}
    for name, tier, _ in ITEM_TIERS:
        reward = max(1, math.floor(SPARKLE_BASE * (SPARKLE_GROWTH ** tier)))
        item_sparkle_rewards[name] = reward

    # Item max placements
    item_max_placements = {}
    for name, _, max_p in ITEM_TIERS:
        item_max_placements[name] = max_p

    return emoji_coin_rewards, emoji_unlock_costs, item_coin_costs, item_sparkle_rewards, item_max_placements


def print_tables(emoji_rewards, emoji_costs, item_costs, item_rewards, item_limits):
    print("=" * 70)
    print("EMOJI ECONOMY")
    print("=" * 70)
    print(f"{'Idx':<4} {'Emoji':<18} {'Coins/click':<12} {'Unlock (✨)':<12}")
    print("-" * 46)
    for i, name in enumerate(EMOJIS):
        status = "FREE" if i == 0 else str(emoji_costs[i])
        print(f"{i:<4} {name:<18} {emoji_rewards[i]:<12} {status:<12}")

    print()
    print("=" * 70)
    print("ITEM ECONOMY")
    print("=" * 70)
    print(f"{'Item':<18} {'Tier':<5} {'Cost (🪙)':<10} {'Reward (✨)':<12} {'Max':<5}")
    print("-" * 50)
    for name, tier, _ in ITEM_TIERS:
        print(f"{name:<18} {tier:<5} {item_costs[name]:<10} {item_rewards[name]:<12} {item_limits[name]:<5}")

    print()
    print("=" * 70)
    print("PROGRESSION SIMULATION")
    print("=" * 70)
    print("(Simulates optimal play: use best emoji, buy cheapest available item,")
    print(" unlock next emoji ASAP, respect placement limits)")

    # Simulate: start with INITIAL_COINS coins, emoji[0] unlocked
    coins = INITIAL_COINS
    sparkles = INITIAL_SPARKLES
    unlocked = [0]
    total_clicks = 0
    total_placements = 0
    placements_used = {}  # item_name -> count

    # Group items by tier
    tiers = {}
    for name, tier, _ in ITEM_TIERS:
        tiers.setdefault(tier, []).append(name)

    for tier_num in range(NUM_TIERS):
        tier_items = tiers[tier_num]

        print(f"\n{'─' * 50}")
        print(f"  TIER {tier_num}")
        print(f"{'─' * 50}")

        # Best available emoji
        best_emoji = max(unlocked)
        reward_per_click = emoji_rewards[best_emoji]
        print(f"  Best emoji: [{best_emoji}] earning {reward_per_click} 🪙/click")

        # Find cheapest available item in this tier (respecting limits)
        available = [n for n in tier_items if placements_used.get(n, 0) < item_limits[n]]
        if not available:
            print(f"  ⚠ All items in tier {tier_num} maxed out!")
            continue

        cheapest_item = min(available, key=lambda n: item_costs[n])
        cost = item_costs[cheapest_item]
        sparkle_gain = item_rewards[cheapest_item]

        # Buy one item to start earning sparkles from this tier
        clicks_needed = max(0, math.ceil((cost - coins) / reward_per_click))
        coins += clicks_needed * reward_per_click
        total_clicks += clicks_needed
        coins -= cost
        sparkles += sparkle_gain
        placements_used[cheapest_item] = placements_used.get(cheapest_item, 0) + 1
        total_placements += 1

        print(f"  First item: {cheapest_item} costs {cost} 🪙, rewards {sparkle_gain} ✨")
        print(f"  Clicks for first: {clicks_needed}")
        print(f"  After first: {coins} 🪙, {sparkles} ✨")

        # Now unlock next emoji by buying more items from this tier
        next_emoji = best_emoji + 1
        if next_emoji < len(EMOJIS):
            unlock_cost = emoji_costs[next_emoji]
            tier_clicks = clicks_needed

            while sparkles < unlock_cost:
                # Find cheapest available item (may exhaust this tier, use any available)
                all_available = []
                for t in range(tier_num + 1):
                    for n in tiers[t]:
                        if placements_used.get(n, 0) < item_limits[n]:
                            all_available.append(n)
                if not all_available:
                    print(f"  ⚠ No items available to place!")
                    break
                buy_item = min(all_available, key=lambda n: item_costs[n])
                buy_cost = item_costs[buy_item]
                buy_sparkle = item_rewards[buy_item]

                c = max(0, math.ceil((buy_cost - coins) / reward_per_click))
                coins += c * reward_per_click
                total_clicks += c
                tier_clicks += c
                coins -= buy_cost
                sparkles += buy_sparkle
                placements_used[buy_item] = placements_used.get(buy_item, 0) + 1
                total_placements += 1

            if sparkles >= unlock_cost:
                sparkles -= unlock_cost
                unlocked.append(next_emoji)
                print(f"  → Unlocked emoji [{next_emoji}] for {unlock_cost} ✨")
                print(f"    Tier total: {tier_clicks} clicks, {sum(1 for n,t,_ in ITEM_TIERS if t <= tier_num and placements_used.get(n,0) > 0)} items placed")
                print(f"    Remaining: {coins} 🪙, {sparkles} ✨")

    print(f"\n{'=' * 70}")
    print(f"TOTALS: {total_clicks} clicks, {total_placements} placements")
    print(f"{'=' * 70}")

    # Placement summary
    print(f"\nPlacement breakdown:")
    for name, tier, _ in ITEM_TIERS:
        used = placements_used.get(name, 0)
        if used > 0:
            print(f"  {name}: {used}/{item_limits[name]}")


def generate_ts(emoji_rewards, emoji_costs, item_costs, item_rewards, item_limits):
    lines = [
        "// Auto-generated by scripts/balance.py — do not edit manually",
        "import type { ItemType } from './types.ts';",
        "",
        f"export const INITIAL_COINS = {INITIAL_COINS};",
        f"export const INITIAL_SPARKLES = {INITIAL_SPARKLES};",
        f"export const DEFAULT_UNLOCKED_EMOJIS: number[] = [0];",
        "",
        f"export const EMOJI_COIN_REWARDS: number[] = {json.dumps(emoji_rewards)};",
        "",
        f"export const EMOJI_UNLOCK_COSTS: number[] = {json.dumps(emoji_costs)};",
        "",
        "export const ITEM_COIN_COSTS: Record<ItemType, number> = {",
    ]
    for name, _, _ in ITEM_TIERS:
        lines.append(f"  {name}: {item_costs[name]},")
    lines.append("};")
    lines.append("")
    lines.append("export const ITEM_SPARKLE_REWARDS: Record<ItemType, number> = {")
    for name, _, _ in ITEM_TIERS:
        lines.append(f"  {name}: {item_rewards[name]},")
    lines.append("};")
    lines.append("")
    lines.append("export const ITEM_MAX_PLACEMENTS: Record<ItemType, number> = {")
    for name, _, _ in ITEM_TIERS:
        lines.append(f"  {name}: {item_limits[name]},")
    lines.append("};")
    lines.append("")
    return "\n".join(lines)


if __name__ == "__main__":
    emoji_rewards, emoji_costs, item_costs, item_rewards, item_limits = compute()
    print_tables(emoji_rewards, emoji_costs, item_costs, item_rewards, item_limits)

    ts_content = generate_ts(emoji_rewards, emoji_costs, item_costs, item_rewards, item_limits)
    output_path = "src/economy.ts"
    with open(output_path, "w") as f:
        f.write(ts_content)
    print(f"\n✅ Written to {output_path}")

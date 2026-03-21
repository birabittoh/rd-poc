#!/usr/bin/env python3
"""
Economy balancing script for the Residenze Digitali room game.

Gameplay loop:
  click emojis -> earn coins -> place items -> earn sparkles -> unlock emojis -> repeat

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
ITEM_TIERS = [
    # Tier 0 - starter
    ("plant", 0), ("chair", 0),
    # Tier 1 - basic
    ("bedside_table", 1), ("coffee_table", 1), ("lamp", 1),
    # Tier 2 - standard
    ("table", 2), ("vase", 2), ("book", 2),
    # Tier 3 - mid
    ("drawer", 3), ("floor_lamp", 3), ("laptop", 3),
    # Tier 4 - advanced
    ("mirror", 4), ("mirror_ornament", 4), ("boombox", 4),
    # Tier 5 - premium
    ("library", 5), ("tv", 5), ("wardrobe", 5), ("bed", 5),
]

NUM_TIERS = 6

# === TUNING PARAMETERS ===

# Emoji coin rewards: coins earned per click
# emoji[0] earns BASE, scales up exponentially
COIN_BASE = 1
COIN_GROWTH = 1.45  # each emoji earns ~45% more than previous

# Emoji unlock costs (in sparkles)
# emoji[0] = free, emoji[1] = UNLOCK_BASE, scales exponentially
UNLOCK_BASE = 5
UNLOCK_GROWTH = 1.7

# Item coin costs (to place)
ITEM_COST_BASE = 15
ITEM_COST_GROWTH = 1.55  # per tier

# Item sparkle rewards (earned on placement)
SPARKLE_BASE = 3
SPARKLE_GROWTH = 1.5  # per tier

# Starting currencies
INITIAL_COINS = 0
INITIAL_SPARKLES = 0

# Target clicks to afford first item (roughly)
# With emoji[0] earning 1 coin and cheapest item ~15 coins, takes ~15 clicks


def compute():
    # Emoji coin rewards
    emoji_coin_rewards = []
    for i in range(len(EMOJIS)):
        reward = max(1, math.floor(COIN_BASE * (COIN_GROWTH ** i)))
        emoji_coin_rewards.append(reward)

    # Emoji unlock costs (sparkles)
    emoji_unlock_costs = [0]  # index 0 is free
    for i in range(1, len(EMOJIS)):
        cost = max(1, math.floor(UNLOCK_BASE * (UNLOCK_GROWTH ** (i - 1))))
        emoji_unlock_costs.append(cost)

    # Item coin costs
    item_coin_costs = {}
    for name, tier in ITEM_TIERS:
        cost = max(1, math.floor(ITEM_COST_BASE * (ITEM_COST_GROWTH ** tier)))
        item_coin_costs[name] = cost

    # Item sparkle rewards
    item_sparkle_rewards = {}
    for name, tier in ITEM_TIERS:
        reward = max(1, math.floor(SPARKLE_BASE * (SPARKLE_GROWTH ** tier)))
        item_sparkle_rewards[name] = reward

    return emoji_coin_rewards, emoji_unlock_costs, item_coin_costs, item_sparkle_rewards


def print_tables(emoji_rewards, emoji_costs, item_costs, item_rewards):
    print("=" * 60)
    print("EMOJI ECONOMY")
    print("=" * 60)
    print(f"{'Idx':<4} {'Emoji':<18} {'Coins/click':<12} {'Unlock (✨)':<12}")
    print("-" * 46)
    for i, name in enumerate(EMOJIS):
        status = "FREE" if i == 0 else str(emoji_costs[i])
        print(f"{i:<4} {name:<18} {emoji_rewards[i]:<12} {status:<12}")

    print()
    print("=" * 60)
    print("ITEM ECONOMY")
    print("=" * 60)
    print(f"{'Item':<18} {'Tier':<5} {'Cost (🪙)':<10} {'Reward (✨)':<12}")
    print("-" * 45)
    for name, tier in ITEM_TIERS:
        print(f"{name:<18} {tier:<5} {item_costs[name]:<10} {item_rewards[name]:<12}")

    print()
    print("=" * 60)
    print("PROGRESSION SIMULATION")
    print("=" * 60)

    # Simulate: start with INITIAL_COINS coins, emoji[0] unlocked
    coins = INITIAL_COINS
    sparkles = INITIAL_SPARKLES
    unlocked = [0]
    total_clicks = 0
    total_placements = 0

    # Group items by tier
    tiers = {}
    for name, tier in ITEM_TIERS:
        tiers.setdefault(tier, []).append(name)

    for tier_num in range(NUM_TIERS):
        tier_items = tiers[tier_num]
        cheapest_item = min(tier_items, key=lambda n: item_costs[n])
        cost = item_costs[cheapest_item]

        # Best available emoji
        best_emoji = max(unlocked)
        reward_per_click = emoji_rewards[best_emoji]

        # Clicks needed to afford cheapest item in this tier
        clicks_needed = max(0, math.ceil((cost - coins) / reward_per_click))
        coins += clicks_needed * reward_per_click
        total_clicks += clicks_needed

        # Place the item
        coins -= cost
        sparkle_gain = item_rewards[cheapest_item]
        sparkles += sparkle_gain
        total_placements += 1

        print(f"\n--- Tier {tier_num} ---")
        print(f"  Best emoji: [{best_emoji}] earning {reward_per_click} 🪙/click")
        print(f"  Cheapest item: {cheapest_item} costs {cost} 🪙, rewards {sparkle_gain} ✨")
        print(f"  Clicks to afford: {clicks_needed}")
        print(f"  After purchase: {coins} 🪙, {sparkles} ✨")

        # Check if we can unlock next emoji
        next_emoji = best_emoji + 1
        if next_emoji < len(EMOJIS):
            unlock_cost = emoji_costs[next_emoji]
            # How many more placements needed for unlock?
            if sparkles >= unlock_cost:
                sparkles -= unlock_cost
                unlocked.append(next_emoji)
                print(f"  → Unlocked emoji [{next_emoji}] for {unlock_cost} ✨ (remaining: {sparkles} ✨)")
            else:
                # Need more sparkles - place more items
                extra_placements = math.ceil((unlock_cost - sparkles) / sparkle_gain)
                extra_clicks = extra_placements * math.ceil(cost / reward_per_click)
                print(f"  → Need {unlock_cost} ✨ to unlock emoji [{next_emoji}], have {sparkles}")
                print(f"    Extra placements needed: {extra_placements} ({extra_clicks} more clicks)")

                # Do the extra placements
                for _ in range(extra_placements):
                    clicks_for_item = math.ceil(cost / reward_per_click)
                    coins += clicks_for_item * reward_per_click
                    coins -= cost
                    sparkles += sparkle_gain
                    total_clicks += clicks_for_item
                    total_placements += 1

                sparkles -= unlock_cost
                unlocked.append(next_emoji)
                print(f"    → Unlocked emoji [{next_emoji}]! (remaining: {sparkles} ✨)")

    print(f"\n{'=' * 60}")
    print(f"TOTALS: {total_clicks} clicks, {total_placements} placements to reach tier {NUM_TIERS-1}")
    print(f"{'=' * 60}")


def generate_ts(emoji_rewards, emoji_costs, item_costs, item_rewards):
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
    for name, _ in ITEM_TIERS:
        lines.append(f"  {name}: {item_costs[name]},")
    lines.append("};")
    lines.append("")
    lines.append("export const ITEM_SPARKLE_REWARDS: Record<ItemType, number> = {")
    for name, _ in ITEM_TIERS:
        lines.append(f"  {name}: {item_rewards[name]},")
    lines.append("};")
    lines.append("")
    return "\n".join(lines)


if __name__ == "__main__":
    emoji_rewards, emoji_costs, item_costs, item_rewards = compute()
    print_tables(emoji_rewards, emoji_costs, item_costs, item_rewards)

    ts_content = generate_ts(emoji_rewards, emoji_costs, item_costs, item_rewards)
    output_path = "src/economy.ts"
    with open(output_path, "w") as f:
        f.write(ts_content)
    print(f"\n✅ Written to {output_path}")

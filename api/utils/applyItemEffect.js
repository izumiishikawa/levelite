const applyItemEffect = (effect, user, itemData) => {
  console.log(effect);

  switch (effect) {
    case 'healing':
      const healthRestored = Math.min(user.maxHealth, user.health + itemData.baseValue);
      const healthGained = healthRestored - user.health; // Apenas o valor realmente restaurado
      user.health = healthRestored;
      return `Recuperou ${healthGained} de vida!`;

    case 'mana_recover':
      const manaRestored = Math.min(user.maxMana, user.mana + itemData.baseValue);
      const manaGained = manaRestored - user.mana; // Apenas o valor realmente restaurado
      user.mana = manaRestored;
      return `Recuperou ${manaGained} de mana!`;

    case 'exp_boost':
      user.currentXP += itemData.baseValue;
      return `Ganhou ${itemData.baseValue} de experiência!`;

    case 'level_up':
      user.level += 1;
      return 'Upou um nível';

    case 'stamina_boost':
      const staminaRestored = Math.min(user.maxStamina, user.stamina + itemData.baseValue);
      const staminaGained = staminaRestored - user.stamina; // Apenas o valor realmente restaurado
      user.stamina = staminaRestored;
      return `Recuperou ${staminaGained} de stamina!`;

    case 'damage_boost':
      const maxAttackBoost = 100; // Limite máximo para aumento de ataque (personalizável)
      const damageBoosted = Math.min(itemData.baseValue, maxAttackBoost - user.attackPower);
      user.attackPower = Math.min(user.attackPower + itemData.baseValue, maxAttackBoost);
      return `Aumentou o ataque em ${damageBoosted}!`;

    case 'defense_boost':
      const maxDefenseBoost = 100; // Limite máximo para aumento de defesa (personalizável)
      const defenseBoosted = Math.min(itemData.baseValue, maxDefenseBoost - user.defensePower);
      user.defensePower = Math.min(user.defensePower + itemData.baseValue, maxDefenseBoost);
      return `Aumentou a defesa em ${defenseBoosted}!`;

    // Remove o usuário da zona de penalidade
    case 'escape_penalty':
      if (user.inPenaltyZone) {
        user.inPenaltyZone = false;
        return 'Você escapou da zona de penalidade!';
      } else {
        return 'Você já está fora da zona de penalidade.';
      }

    // Aumenta a vida máxima do usuário
    case 'max_health_increase':
      const maxHealthBoost = itemData.baseValue;
      user.maxHealth += maxHealthBoost;
      return `Aumentou sua vida máxima em ${maxHealthBoost}!`;

    // Adiciona ouro ao usuário
    case 'add_gold':
      const goldAdded = itemData.baseValue;
      user.coins += goldAdded;
      return `Você recebeu ${goldAdded} moedas de ouro!`;

    default:
      throw new Error('Efeito desconhecido do item.');
  }
};

module.exports = applyItemEffect;

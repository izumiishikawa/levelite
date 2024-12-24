const checkNodeRequirements = async (user, requirements) => {
    for (const req of requirements) {
      switch (req.type) {
        case "task-streak":
          if (user.streak < req.value) {
            return {
              success: false,
              message: req.description || "Streak de tarefas insuficiente."
            };
          }
          break;
  
        case "xp":
          if (user.totalExp < req.value) {
            return {
              success: false,
              message: req.description || "XP insuficiente."
            };
          }
          break;
  
        case "level":
          if (user.level < req.value) {
            return {
              success: false,
              message: req.description || "Nível insuficiente."
            };
          }
          break;
  
        case "node-completion":
          if (!user.completedNodes.includes(req.value)) {
            return {
              success: false,
              message: req.description || `Node ${req.value} não foi concluído.`
            };
          }
          break;
  
        case "all-nodes-completed":
          for (const nodeId of req.value) {
            if (!user.completedNodes.includes(nodeId)) {
              return {
                success: false,
                message: req.description || `Você precisa completar todos os nodes anteriores.`
              };
            }
          }
          break;
  
        default:
          return {
            success: false,
            message: `Requisito desconhecido: ${req.type}.`
          };
      }
    }
  
    return { success: true };
  };
  
  module.exports = checkNodeRequirements;
  
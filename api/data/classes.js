const classes = [
    {
        id: 'shadow',
        name: 'The Shadow',
        description: 'Um estrategista invisível, mestre em persuasão e manipulação, controlando tudo nas sombras.',
        specialAbility: {
            name: 'Maestria Sombria',
            description: 'Ganha +20% de eficiência ao completar tarefas relacionadas à Aura.'
        },
        aiPrompt: `
Crie tarefas que enfatizem o uso da inteligência estratégica, persuasão e controle sutil. Foque em habilidades sociais, análise e manipulação situacional. Exemplos (apenas exemplos, crie seus proprios):
- "Leia sobre as 48 leis do poder"
- "Aprenda sinais de linguagem corporal"
- "Aprenda sobre teoria dos jogos e jogos de poder"
        `
    },
    {
        id: 'guardian',
        name: 'The Guardian',
        description: 'Um defensor incansável, focado em vitalidade, resistência e perseverança.',
        specialAbility: {
            name: 'Proteção Divina',
            description: 'Recebe uma penalidade reduzida ao falhar em tarefas diárias.'
        },
        aiPrompt: `
Crie tarefas que destaquem resistência física, consistência e cuidado com a saúde. Exemplos:
- "Corrida de 5km." (Attribute: vitality, Intensity: medium)
- "Corrida no lugar com pulos." (Attribute: vitality, Intensity: high)
- "30 min de bicicleta." (Attribute: vitality, Intensity: low)
        `
    },
    {
        id: 'visionary',
        name: 'The Visionary',
        description: 'Um estrategista brilhante, mestre em previsões e autocontrole, sempre enxergando o futuro.',
        specialAbility: {
            name: 'Clarividência',
            description: 'Recebe bônus de XP ao completar tarefas consecutivamente.'
        },
        aiPrompt: `
Crie tarefas que enfatizem criatividade, planejamento e visão de longo prazo. Exemplos:
- "Desenvolva um plano detalhado para alcançar um objetivo pessoal." (Attribute: focus, Intensity: high)
- "Resolva um quebra-cabeça complexo ou desafio lógico." (Attribute: focus, Intensity: medium)
- "Escreva sobre sua visão de futuro para os próximos 5 anos." (Attribute: aura, Intensity: low)
        `
    },
    {
        id: 'titan',
        name: 'The Titan',
        description: 'Uma força implacável, com poder físico e habilidade de superar qualquer desafio.',
        specialAbility: {
            name: 'Renascimento',
            description: 'Recupera streaks com metade do esforço habitual.'
        },
        aiPrompt: `
Crie tarefas que desafiem força física e resistência extrema. Exemplos:
- "200 flexões." (Attribute: vitality, Intensity: high)
- "Treine todos os dias da semana." (Attribute: vitality, Intensity: medium)
- "Treine artes de luta (seja especifico) em casa" (Attribute: vitality, Intensity: high)
        `
    },
    {
        id: 'mindbreaker',
        name: 'The Mindbreaker',
        description: 'Um gênio mental, dominando a criação, raciocínio e habilidades cognitivas avançadas.',
        specialAbility: {
            name: 'Impacto Mental',
            description: 'Aplica efeitos de status extras ao completar tarefas.'
        },
        aiPrompt: `
Crie tarefas que desafiem a capacidade mental e a criatividade. Exemplos:
- "Resolva 3 problemas de lógica complexos." (Attribute: focus, Intensity: high)
- "Aprenda lógica de programação" (Attribute: focus, Intensity: medium)
- "Crie uma solução inovadora para um problema do dia a dia." (Attribute: aura, Intensity: high)
        `
    }
];

module.exports = classes;
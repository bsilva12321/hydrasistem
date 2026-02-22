const promptArchitectRAG = {
    "versao_rag": "2.0_Elite_Prompt_Engineer",
    "data_conhecimento": "Fevereiro_2026",
    "objetivo_agente": "Atuar como arquiteto de instruções full-stack, gerando contextos determinísticos para IAs de codificação autônoma.",
    "frameworks_de_construcao": [
        {
            "id": "CO-STAR",
            "nome": "Context, Objective, Style, Tone, Audience, Response",
            "uso": "Ideal para estruturar prompts arquiteturais do zero.",
            "vetores": {
                "contexto": "Define o ecossistema tecnológico (ex: React 19, Supabase, Tailwind).",
                "estilo": "Determina padrões de Clean Code e JSDoc.",
                "resposta": "Especifica contratos de dados rígidos (JSON/TypeScript)."
            }
        },
        {
            "id": "ROSES",
            "nome": "Role, Objective, Scenario, Expected Solution, Steps",
            "uso": "Focado em situações de negócio complexas. Introduz 'Cenário' para mitigar tensões de lógica em pagamentos ou autenticação.",
            "passos": "Exige que o modelo siga uma sequência sistêmica para evitar erros de lógica."
        },
        {
            "id": "CRISP",
            "nome": "Context, Role, Input, Steps, Parameters",
            "uso": "Framework de alta precisão para geração de CRUDs e middlewares.",
            "parametros": "Define restrições de latência, complexidade Big O e dependências específicas."
        }
    ],
    "topologias_de_raciocinio": {
        "chain_of_thought_cot": {
            "comando": "Think step-by-step",
            "impacto": "Reduz alucinações em 40% em tarefas de raciocínio simbólico e matemático.",
            "fluxo": "Analise requisitos -> Defina estrutura de dados -> Planeje rotas de API -> Gere código."
        },
        "tree_of_thoughts_tot": {
            "uso": "Decisões de arquitetura crítica (ex: SQL vs NoSQL).",
            "mecanismo": "Gera múltiplos caminhos, avalia prós/contras simultaneamente e realiza backtracking."
        },
        "skeleton_of_thought_sot": {
            "uso": "Manutenção de coerência em grandes bases de código.",
            "mecanismo": "Fornece um esqueleto estruturado (Imports, State, UI, Handlers) para o modelo preencher, evitando omissão de funcionalidades."
        },
        "react_reason_act": {
            "fluxo": "Intercalação contínua entre Pensamento -> Ação (Function Call) -> Observação.",
            "beneficio": "Melhora a interpretabilidade humana e a precisão em tarefas de integração externa."
        }
    },
    "engenharia_de_contexto_e_memoria": {
        "mitigacao_context_rot": [
            "Context Caching (XC-Cache): 'Pin' de documentações pesadas (API specs) para evitar re-computação de embeddings.",
            "Agentic Memory: Uso de arquivos persistentes (ex: NOTES.md ou .cursorrules) para manter padrões de design em sessões longas."
        ],
        "marcacao_estrutural": {
            "tags_xml": "<instructions>, <background_information>, <constraints>, <thinking>.",
            "headers_markdown": "Separação clara entre Lógica de Negócio, Regras de Backend e Estilo de Frontend."
        },
        "goldilocks_zone": "O equilíbrio entre instruções excessivamente rígidas (brittle logic) e orientações vagas."
    },
    "especificacao_de_app_prd_ia": {
        "arquitetura_de_prompt": {
            "fase_1": "Mental Model (Data, User Roles, Flows).",
            "fase_2": "Schema Lock (Bloqueio do esquema de banco antes da UI).",
            "fase_3": "Atomic API (Endpoints CRUD e validação).",
            "fase_4": "UI & Auth Integration."
        },
        "secao_do_not_change": "Define arquivos ou esquemas que a IA está proibida de alterar para manter estabilidade incremental.",
        "fidelidade_de_esquema": "JSON prompting atinge >99% de fidelidade na adesão ao contrato de dados quando o esquema de saída é definido."
    },
    "seguranca_cyber_prompting": {
        "promptware_kill_chain": [
            "Access Inicial: Injeção indireta via inputs do usuário ou arquivos externos.",
            "Escalada de Privilegios: Manipulação do modelo para acessar ferramentas administrativas via Tool Calling.",
            "Exfiltracao: Envio de dados via chamadas ocultas ou webhooks."
        ],
        "medidas_defensivas": {
            "proibicao_funcoes": "Barrar explicitamente o uso de eval() e Function().",
            "least_privilege": "Limitar a capacidade de ferramentas (Tool Calling) ao mínimo necessário.",
            "validacao_pydantic_zod": "Tratar todo output da IA como 'untrusted' e validar contra esquemas rígidos."
        }
    },
    "psicologia_e_ux_no_prompting": {
        "gatilhos_de_conversao": [
            "Visibilidade do Status do Sistema: Feedback imediato da IA.",
            "Zeigarnik Effect: Usar progress bars e loops inacabados para manter o engajamento do usuário."
        ],
        "leis_do_ux": {
            "hicks_law": "Reduzir opções no prompt para facilitar a escolha do usuário.",
            "millers_law": "Agrupar informações em blocos de no máximo sete itens.",
            "aesthetic_usability": "Designs atraentes são percebidos como mais funcionais e confiáveis."
        },
        "acessibilidade_wcag_2_2": [
            "Perceptível: Textos descritivos para todos os inputs e outputs.",
            "Operável: Navegação por teclado e sem armadilhas de foco.",
            "Robusto: Compatibilidade total com leitores de tela."
        ]
    },
    "metacognicao_e_agentes_paralelos": {
        "selecao_dinamica": "O sistema avalia a complexidade do pedido e escolhe entre frameworks simples (RTF) ou arquiteturais (TRACI/RISEN).",
        "parallel_execution": "Uso de sub-agentes especializados (Orquestrador, Contexto, Code, Debug, Reviewer).",
        "supervised_autonomy": "IA gera e executa código, mas o humano atua como validador de cada checkpoint."
    },
    "instrucoes_core_agente": [
        "Prioridade de Framework: Para aplicações full-stack, use sempre o framework CO-STAR combinado com a topologia Tree of Thoughts (ToT) para planejar a arquitetura.",
        "Ciclo de Desenvolvimento: Instrua o agente a nunca gerar código sem antes produzir um esquema JSON dos dados e uma Cadeia de Raciocínio (CoT) passo a passo.",
        "Segurança por Padrão: Insira tags de restrição <security_constraints> em cada prompt gerado, proibindo funções de execução dinâmica de strings (eval).",
        "Foco no Usuário: Utilize as Leis de UX (Hick/Miller) para ditar como a IA deve organizar a interface e o microcopy."
    ]
};

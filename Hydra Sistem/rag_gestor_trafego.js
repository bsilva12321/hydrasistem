const gestorTrafegoRAG = {
    "agente": {
        "identidade": "Gestor de Tráfego de Elite - Especialista em Meta Ads 2026",
        "missão": "Maximizar o ROAS e a escala de contas de anúncios através de análise preditiva, controle rigoroso de lances manuais e otimização criativa baseada em dados.",
        "framework_cognitivo": "RAG (Retrieval-Augmented Generation)",
        "instrucoes_sistema": [
            "Analise os dados sempre de baixo para cima no funil (ROAS -> CPA -> CTR -> Hook Rate -> CPM).",
            "Ignore métricas de vaidade. A única métrica definitiva é o lucro.",
            "Isole variáveis em testes (metodologia científica aplicada ao tráfego). Teste apenas um elemento (Hook, Imagem, Texto) de cada vez.",
            "Tenha sangue frio em dias de CPM alto ou instabilidade da plataforma; não edite campanhas na fase de aprendizado sem motivo de força maior.",
            "Sugira sempre criativos baseados em dados (Creative Analytics). Se o Hook Rate for baixo e o Hold Rate for alto, o criativo precisa apenas de uma nova introdução."
        ]
    },
    "base_de_conhecimento_rag": {
        "leilao_e_algoritmo": {
            "equacao_fundamental": "V_total = (B * EAR) + Q",
            "variaveis": {
                "B": "Bid (Lance financeiro)",
                "EAR": "Estimated Action Rate (Probabilidade de conversão)",
                "Q": "Ad Quality (Qualidade e relevância do criativo)"
            },
            "logica": "Qualidade alta (Q) subsidia lances menores; baixa qualidade gera 'taxa de irrelevância'."
        },
        "estatisticas_de_lances": {
            "cost_cap": {
                "objetivo": "Volume máximo com custo médio controlado.",
                "indicacao": "E-commerce e geração de leads estável.",
                "alerta": "Pode causar 'delivery stall' se o teto for irrealista."
            },
            "bid_cap": {
                "objetivo": "Controle absoluto de margem por leilão individual.",
                "protocolo_escala": {
                    "passo_1": "Analisar CPR histórico de 30 dias.",
                    "passo_2": "Definir Bid inicial 5% a 15% abaixo da média para filtrar inventário barato.",
                    "passo_3": "Se não houver entrega em 24h, subir em incrementos de $5 até estabilizar volume."
                }
            }
        },
        "protocolos_de_escala": {
            "escala_vertical": {
                "regra_ouro": "Aumento de 10-20% no orçamento a cada 48-72 horas.",
                "gatilhos": [
                    "CPA estável e 15% a 20% abaixo do CPA limite nos últimos 3 dias.",
                    "Frequência do anúncio abaixo de 2.0 nos últimos 7 dias.",
                    "ROAS global da campanha mantendo-se lucrativo consistente."
                ]
            },
            "escala_horizontal": {
                "metodo": "Duplicação de conjuntos vencedores para novos públicos (Broad ou LAL 1-10%).",
                "uso": "Quando a escala vertical atingir retornos decrescentes."
            },
            "alocacao_orcamentaria": {
                "sandbox_testes": "30%",
                "escala_controle": "50%",
                "retargeting": "20%"
            }
        },
        "analise_criativa": {
            "metricas_funil_vsl": {
                "hook_rate": {
                    "calculo": "3s views / impressões",
                    "benchmark": "> 25%",
                    "acao": "Se < 25%, trocar os primeiros 3 segundos do vídeo."
                },
                "hold_rate": {
                    "calculo": "15s views / total",
                    "acao": "Se baixo, revisar a narrativa e o ritmo do vídeo."
                },
                "ctr_link": {
                    "benchmark": "> 1.0%",
                    "acao": "Se baixo, ajustar a oferta ou o Call to Action (CTA)."
                }
            }
        },
        "infraestrutura_tecnica": {
            "sinais": [
                "Implementação impecável da CAPI (API de Conversões) para mitigar a perda de dados (iOS 14+).",
                "Event Quality Match Score de pelo menos no mínimo 6.0 a 8.0.",
                "Uso rígido de UTMs padronizadas (utm_source, utm_medium, utm_campaign, utm_content, utm_term) para rastreamento no backend."
            ]
        }
    },
    "regras_de_automacao_json": {
        "stop_loss_diario": {
            "condicao": "Se gasto > 1.5x CPA Ideal E resultados == 0",
            "acao": "Pausar anúncio",
            "frequencia": "A cada 30 minutos"
        },
        "escala_agressiva": {
            "condicao": "Se ROAS > Metrificar x2 E compras > 3 hoje",
            "acao": "Aumentar orçamento diário em 15%",
            "frequencia": "Diariamente, meia-noite"
        },
        "reviver_vencedores": {
            "condicao": "Se CPA < CPA Ideal E CPA dos últimos 3 dias for ruim, mas o Lifetime ROAS é bom",
            "acao": "Duplicar e testar novamente com CBO ou novo público.",
            "frequencia": "Manual / Alerta"
        }
    }
};

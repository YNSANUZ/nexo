<?php
return [
  'read_key' => getenv('PRIMUS_ANALYTICS_READ_KEY') ?: '',
  'data_dir' => __DIR__ . '/data',
  'allowed_sites' => [
    'nexo-vagas' => ['name' => 'NEXO Vagas', 'url' => 'https://nexovagas.com.br/'],
    'nexo-eventos' => ['name' => 'NEXO Eventos', 'url' => 'https://nexovagas.com.br/eventos'],
    'nexo-corridas' => ['name' => 'NEXO Corridas', 'url' => 'https://nexovagas.com.br/corridas'],
    'nexo-copa' => ['name' => 'NEXO Copa', 'url' => 'https://nexovagas.com.br/copa/'],
    'primus-home' => ['name' => 'Primus DF', 'url' => 'https://primusdf.com.br/'],
    'primus-nexo' => ['name' => 'Nexo', 'url' => 'https://primusdf.com.br/nexo/'],
    'primus-contas' => ['name' => 'Contas', 'url' => 'https://primusdf.com.br/contas/'],
    'nexo-contas' => ['name' => 'NEXO Contas Firebase', 'url' => 'https://nexo-contas.web.app/'],
    'primus-credencial' => ['name' => 'Credencial', 'url' => 'https://primusdf.com.br/credencial/'],
    'primus-card' => ['name' => 'NEXO Card', 'url' => 'https://primusdf.com.br/card/'],
    'primus-jogos' => ['name' => 'NEXO Jogos', 'url' => 'https://primusdf.com.br/jogos'],
    'primus-social' => ['name' => 'NEXO Social', 'url' => 'https://primusdf.com.br/NEXOsocial/'],
    'primus-user' => ['name' => 'NEXO User', 'url' => 'https://primusdf.com.br/user/'],
    'ponto-sem-filtro' => ['name' => 'Ponto Sem Filtro', 'url' => 'https://www.pontosemfiltro.com.br/'],
    'ponto-sem-filtro-bio' => ['name' => 'Bio do Tiago', 'url' => 'https://www.pontosemfiltro.com.br/bio'],
    'nexo-shopping' => ['name' => 'NEXO Shopping', 'url' => ''],
    'nexo-cubo' => ['name' => 'Cubo Interativo', 'url' => '']
  ]
];

<?php
declare(strict_types=1);

const NEXO_RISK_RULE_VERSION = '2026.08.1';

function nexo_news_risk_config(): array
{
  $enabled = filter_var((string)getenv('NEXO_AUTOPUBLISH_ENABLED'), FILTER_VALIDATE_BOOLEAN);
  $trustedHosts = nexo_risk_env_list('NEXO_AUTOPUBLISH_TRUSTED_HOSTS', [
    'agenciabrasilia.df.gov.br',
    'www.agenciabrasilia.df.gov.br'
  ]);
  $lowRiskCategories = nexo_risk_env_list('NEXO_AUTOPUBLISH_CATEGORIES', [
    'empregos', 'eventos', 'esportes', 'transito', 'transporte'
  ]);

  return [
    'enabled' => $enabled,
    'trustedHosts' => array_map('strtolower', $trustedHosts),
    'lowRiskCategories' => array_map('nexo_risk_normalize', $lowRiskCategories)
  ];
}

function nexo_risk_env_list(string $key, array $fallback): array
{
  $raw = trim((string)getenv($key));
  if ($raw === '') return $fallback;
  return array_values(array_filter(array_map('trim', preg_split('/[,;]+/', $raw) ?: [])));
}

function nexo_risk_normalize($value): string
{
  $text = trim((string)$value);
  $text = function_exists('mb_strtolower') ? mb_strtolower($text, 'UTF-8') : strtolower($text);
  $ascii = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $text);
  $text = is_string($ascii) ? $ascii : $text;
  return preg_replace('/[^a-z0-9]+/', ' ', $text) ?: '';
}

function nexo_risk_contains_any(string $text, array $terms): array
{
  $found = [];
  foreach ($terms as $term) {
    $term = nexo_risk_normalize($term);
    if ($term !== '' && preg_match('/\b' . preg_quote($term, '/') . '\b/i', $text)) $found[] = $term;
  }
  return array_values(array_unique($found));
}

function nexo_risk_source_host(array $item): string
{
  $url = trim((string)($item['sourceUrl'] ?? ''));
  return strtolower((string)(parse_url($url, PHP_URL_HOST) ?: ''));
}

function nexo_classify_news_item(array $item, array $config): array
{
  $text = nexo_risk_normalize(implode(' ', [
    $item['title'] ?? '',
    $item['summary'] ?? '',
    $item['body'] ?? '',
    $item['category'] ?? ''
  ]));
  $category = nexo_risk_normalize($item['category'] ?? '');
  $host = nexo_risk_source_host($item);
  $sourceType = strtolower((string)($item['sourceType'] ?? 'manual'));
  $trustedSource = $sourceType === 'agencia' && in_array($host, $config['trustedHosts'] ?? [], true);
  $categoryEligible = in_array($category, $config['lowRiskCategories'] ?? [], true);

  $criticalTerms = nexo_risk_contains_any($text, [
    'estupro', 'abuso sexual', 'feminicidio', 'homicidio', 'assassinato', 'sequestro',
    'suicidio', 'pedofilia', 'terrorismo', 'massacre', 'crianca morta', 'morte de crianca'
  ]);
  $highTerms = nexo_risk_contains_any($text, [
    'denuncia', 'acusacao', 'acusado', 'investigacao', 'investigado', 'corrupcao', 'fraude',
    'crime', 'preso', 'prisao', 'suspeito', 'policia', 'operacao policial', 'violencia',
    'morte', 'morto', 'vitima', 'eleicao', 'eleitoral', 'candidato', 'candidata',
    'governador', 'governadora', 'presidente', 'prefeito', 'prefeita', 'deputado', 'deputada',
    'senador', 'senadora', 'vereador', 'vereadora', 'tribunal', 'justica', 'condenado',
    'condenada', 'processo judicial', 'improbidade'
  ]);
  $mediumTerms = nexo_risk_contains_any($text, [
    'acidente', 'atropelamento', 'emergencia', 'alerta', 'tempestade', 'alagamento',
    'desabamento', 'interdicao', 'seguranca publica', 'saude', 'doenca', 'surto', 'vacina', 'medicamento',
    'banco', 'investimento', 'credito', 'imposto', 'tarifa', 'reajuste', 'demissao'
  ]);

  $reasons = [];
  $riskLevel = 'low';
  if ($criticalTerms) {
    $riskLevel = 'critical';
    $reasons[] = 'Tema crítico identificado: ' . implode(', ', array_slice($criticalTerms, 0, 4));
  } elseif ($highTerms) {
    $riskLevel = 'high';
    $reasons[] = 'Tema sensível identificado: ' . implode(', ', array_slice($highTerms, 0, 5));
  } elseif ($mediumTerms) {
    $riskLevel = 'medium';
    $reasons[] = 'Tema que exige conferência: ' . implode(', ', array_slice($mediumTerms, 0, 5));
  }

  if (!$trustedSource) $reasons[] = 'Fonte fora da lista de publicação automática';
  if (!$categoryEligible) $reasons[] = 'Categoria fora da lista de baixo risco';
  if (trim((string)($item['summary'] ?? '')) === '') $reasons[] = 'Resumo ausente';
  if (trim((string)($item['author'] ?? '')) === '') $reasons[] = 'Autoria ausente';
  if ($host === '') $reasons[] = 'URL de origem ausente ou inválida';

  $eligible = $riskLevel === 'low'
    && $trustedSource
    && $categoryEligible
    && trim((string)($item['summary'] ?? '')) !== ''
    && trim((string)($item['author'] ?? '')) !== ''
    && $host !== '';

  $decision = $eligible
    ? (!empty($config['enabled']) ? 'auto_publish' : 'ready_but_disabled')
    : 'awaiting_validation';

  $item['riskLevel'] = $riskLevel;
  $item['riskReasons'] = array_values(array_unique($reasons));
  $item['automationEligible'] = $eligible;
  $item['automationDecision'] = $decision;
  $item['classificationVersion'] = NEXO_RISK_RULE_VERSION;
  $item['classifiedAt'] = date(DATE_ATOM);
  return $item;
}

function nexo_apply_import_policy(array $item, array $config): array
{
  $item = nexo_classify_news_item($item, $config);
  if ($item['automationDecision'] === 'auto_publish') {
    $item['status'] = 'published';
    $item['publishedAt'] = date(DATE_ATOM);
    $item['lastEditedBy'] = 'automacao@nexo';
  } elseif ($item['automationDecision'] === 'awaiting_validation') {
    $item['status'] = 'awaiting_validation';
  } else {
    $item['status'] = 'draft';
  }
  return $item;
}

function nexo_public_news_items(array $items): array
{
  return array_values(array_filter(
    $items,
    fn($item) => is_array($item) && ($item['status'] ?? '') === 'published'
  ));
}

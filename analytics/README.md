# Central de Metricas Primus

## Publicar

Envie a pasta `analytics` para:

```text
https://primusdf.com.br/analytics/
```

Depois publique tambem os sites que receberam a tag:

```html
<script src="https://primusdf.com.br/analytics/track.js" data-site-id="..." data-site-name="..." defer></script>
```

## Abrir no celular

Configure a chave de leitura no servidor antes de abrir a central:

```text
PRIMUS_ANALYTICS_READ_KEY=sua-chave-forte-aqui
```

Depois use esta URL uma vez no celular, trocando a chave pelo valor configurado no servidor:

```text
https://primusdf.com.br/analytics/?key=SUA_CHAVE
```

A chave fica salva no navegador do celular. Depois pode abrir apenas:

```text
https://primusdf.com.br/analytics/
```

## Onde ficam os dados

Os eventos entram em arquivos `.jsonl` dentro de:

```text
analytics/data/
```

Essa pasta tem `.htaccess` para bloquear leitura direta pelo navegador. O painel le os dados por `api.php` usando a chave privada.

## Privacidade

O coletor nao salva IP cru. Ele salva apenas um hash do IP e a localizacao aproximada enviada pelo tracker quando disponivel.

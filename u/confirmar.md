---
title: Confirmar
layout: page
sitemap: false
---

{% include block_container_start.html %}

Te hemos mandado un correo electrónico a

<p>
<strong><span id="api-user-email"></span></strong>
<script type="text/javascript">
  const urlParams = new URLSearchParams(window.location.search);
  const emailParam = urlParams.get('email');
  const emailLocal = localStorage.getItem("API-User-Email");
  const el = document.getElementById("api-user-email");
  el.textContent = emailParam || emailLocal;
</script>
</p>

En ese correo electrónico tienes un enlace para confirmar que tu email es correcto . Recuerda que puede que te haya llegado a la carpeta de Spam.

{% include block_container_end.html %}

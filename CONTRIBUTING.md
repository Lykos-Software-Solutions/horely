# Contribuciones

¡Gracias por tu interés en Horely! 🎉

## Qué es este proyecto

Horely es un **demo / portfolio showcase** de [Lykos Software Solutions](https://lykos.com.ar) — una plataforma de reserva de turnos online construida con Next.js 16, TypeScript, Tailwind CSS v4 y Prisma.

El foco del proyecto es mostrar código de calidad y una buena experiencia de usuario, **no** ser un producto SaaS completo.

## Cómo contribuir

### 🐛 Reportar un bug

Usá el [template de Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) al abrir un issue. Incluí pasos para reproducirlo, comportamiento esperado y entorno.

### 💡 Sugerir una mejora

Abrí un issue con el [template de Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) describiendo tu idea.

### 🔧 Enviar un Pull Request

1. Hacé un fork del repositorio
2. Creá una rama descriptiva: `git checkout -b fix/nombre-del-bug` o `feat/nombre-del-feature`
3. Hacé tus cambios y asegurate de que el build pase: `npm run build`
4. Abrí un Pull Request con una descripción clara de los cambios

#### Qué aceptamos

- ✅ Bug fixes
- ✅ Mejoras de UI/UX dentro del scope del demo
- ✅ Mejoras de documentación
- ✅ Optimizaciones de rendimiento
- ❌ Features de producción (auth, pagos, multi-negocio) — esas son parte de la versión comercial

## Setup local

```bash
npm install
cp .env.example .env
npm run db:setup
npm run dev
```

Ver el [README](README.md) para más detalle.

## Contacto

¿Preguntas, propuestas comerciales o querés el producto completo?

📧 **hola@lykos.com.ar** · 🌐 **[lykos.com.ar](https://lykos.com.ar)**

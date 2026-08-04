# Changelog

Todos los cambios notables de este proyecto se documentan acá.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] — 2026-08-04

### Agregado
- Vista pública de reserva mobile-first: selección de servicio, profesional, día y horario con ticket de confirmación
- Panel de administración en `/admin`: agenda del día y semana, acciones de completar/cancelar turnos
- Métricas semanales: turnos totales, ingresos estimados, servicio más pedido y horarios pico
- Stack: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Prisma + SQLite
- Server Actions para reservas y cambios de estado, sin librerías de UI externas
- Seed con datos de ejemplo relativos a la fecha actual (siempre se ve poblado)
- Soporte de deploy en [Dokploy](https://dokploy.com/) con SQLite en volumen persistente
- Seed inteligente: solo se ejecuta si la base está vacía en producción (`--if-empty`)
- README bilingüe (español e inglés), badges de tecnologías y link a demo en vivo
- GitHub Actions CI: lint + build en cada push y PR
- SECURITY.md con política de reporte de vulnerabilidades
- Licencia MIT

[0.1.0]: https://github.com/Lykos-Software-Solutions/horely/releases/tag/v0.1.0

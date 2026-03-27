# Kobro - WhatsApp B2B Messaging Platform

![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

Plataforma de mensajería automatizada de WhatsApp para empresas. Gestiona comunicación con clientes, automatiza recordatorios de pago, envía campañas promocionales y valida comprobantes de pago con OCR.

## Características

- **CRM Básico**: Gestión completa de clientes con historial de mensajes
- **Mensajes Promocionales**: Campañasmasivas con segmentación por tags
- **Recordatorios Automatizados**: Cobros programados con APScheduler
- **Validación de Pagos**: Flujo de confirmación parcial con OCR (EasyOCR)
- **Dashboard en Tiempo Real**: Estadísticas y gestión de aprobaciones
- **Webhook WhatsApp**: Procesamiento de mensajes entrantes

## Stack Tecnológico

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| Frontend | Next.js 14 (App Router) | UI del dashboard |
| Backend | FastAPI (Python 3.11+) | API REST + Webhooks |
| Base de Datos | Supabase (PostgreSQL) | Datos + Auth |
| Mensajería | WhatsApp Cloud API | Mensajes |
| OCR | EasyOCR | Extracción de códigos |
| Scheduler | APScheduler | Tareas programadas |
| Estilos | Tailwind CSS | Diseño |

## Requisitos Previos

- **Python 3.11+**
- **Node.js 18+**
- **npm o yarn**
- Cuenta en [Supabase](https://supabase.com)
- Cuenta de [Meta for Developers](https://developers.facebook.com) (WhatsApp Business)
- Docker (opcional)

## Instalación Rápida

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/kobro.git
cd kobro
```

### 2. Instalar dependencias

```bash
make install
```

O manualmente:

```bash
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate  # Linux/Mac | venv\Scripts\activate  # Windows
pip install -r requirements.txt
pip install easyocr torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Frontend
cd ../frontend
npm install
```

### 3. Configurar variables de entorno

**Backend (`backend/.env`):**
```env
# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=tu-service-role-key
SUPABASE_JWT_SECRET=tu-jwt-secret

# WhatsApp (Meta Developer Console)
WHATSAPP_PHONE_NUMBER_ID=tu-phone-number-id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=tu-verify-token
WHATSAPP_ACCESS_TOKEN=tu-facebook-access-token

# OCR (EasyOCR - ya incluido)
OCR_PROVIDER=easyocr

# Security
SECRET_KEY=genera-una-clave-secreta-larga
DEBUG=true
ALLOWED_ORIGINS=["http://localhost:3000"]
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Configurar Base de Datos

1. Crear proyecto en [Supabase](https://app.supabase.com)
2. Ir a **SQL Editor**
3. Ejecutar el contenido de `supabase/migrations/001_initial_schema.sql`
4. Copiar credenciales al `.env`

### 5. Configurar WhatsApp

1. Crear app en [Meta Developers](https://developers.facebook.com)
2. Agregar producto **WhatsApp**
3. Configurar Webhook:
   - URL: `https://tu-dominio.com/api/v1/webhooks/whatsapp`
   - Verify Token: Debe coincidir con `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
4. Obtener **Phone Number ID** y **Access Token**

### 6. Ejecutar

```bash
make start
```

O manualmente:

```bash
# Terminal 1 - Backend
cd backend && ./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend && npm run dev
```

**Urls:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs

## Uso con Docker

```bash
# Copiar y editar variables de entorno
cp .env.example .env

# Construir e iniciar
make docker-build
make docker-up

# Detener
make docker-down
```

## Comandos Makefile

```bash
make help              # Mostrar ayuda
make install           # Instalar todas las dependencias
make start            # Iniciar todo (backend + frontend)
make stop             # Detener servicios
make restart          # Reiniciar
make clean            # Limpiar archivos temporales
make docker-up        # Iniciar con Docker
make test             # Ejecutar tests
make lint             # Verificar código
```

## Estructura del Proyecto

```
kobro/
├── backend/                    # FastAPI API
│   ├── app/
│   │   ├── api/v1/           # Endpoints REST
│   │   │   ├── clients.py    # CRUD clientes
│   │   │   ├── transactions.py # Gestión pagos
│   │   │   ├── campaigns.py  # Campañasmasivas
│   │   │   └── messages.py   # Logs de mensajes
│   │   ├── core/              # Config, security
│   │   ├── services/          # Lógica de negocio
│   │   │   ├── whatsapp_service.py   # API WhatsApp
│   │   │   ├── ocr_service.py       # EasyOCR
│   │   │   ├── message_handler.py    # Procesamiento
│   │   │   └── reminder_service.py  # Recordatorios
│   │   ├── tasks/             # APScheduler jobs
│   │   └── webhooks/          # Handlers webhooks
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                   # Next.js 14
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   │   ├── auth/         # Login, register
│   │   │   └── dashboard/    # Panel principal
│   │   ├── components/       # Componentes React
│   │   │   ├── ui/          # shadcn/ui base
│   │   │   └── dashboard/    # Componentes dashboard
│   │   ├── lib/              # Utilidades
│   │   └── types/            # TypeScript types
│   ├── package.json
│   └── Dockerfile
│
├── supabase/
│   └── migrations/           # Schema SQL
│       └── 001_initial_schema.sql
│
├── docker-compose.yml
├── Makefile
└── README.md
```

## API Endpoints

### Clientes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/clients` | Listar clientes |
| POST | `/api/v1/clients` | Crear cliente |
| GET | `/api/v1/clients/{id}` | Ver cliente |
| PATCH | `/api/v1/clients/{id}` | Actualizar |
| DELETE | `/api/v1/clients/{id}` | Eliminar |

### Transacciones
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/transactions` | Listar transacciones |
| GET | `/api/v1/transactions/pending` | Pendientes de aprobación |
| POST | `/api/v1/transactions` | Crear transacción |
| POST | `/api/v1/transactions/{id}/approve` | Aprobar/rechazar |

### Campañas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/campaigns` | Listar campañas |
| POST | `/api/v1/campaigns` | Crear campaña |
| POST | `/api/v1/campaigns/{id}/send` | Enviar campaña |

### Webhooks
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/webhooks/whatsapp` | Verificar webhook |
| POST | `/api/v1/webhooks/whatsapp` | Recibir mensajes |

## Flujo de Pago con OCR

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Cliente   │     │   Webhook   │     │  EasyOCR    │
│  envía foto │────▶│  recibe     │────▶│  extrae     │
│  comprobante│     │  imagen     │     │  código ref │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Cliente   │◀────│  WhatsApp   │◀────│ Dashboard   │
│  recibe     │     │  envía msg  │     │  Admin      │
│  confirmación│     │             │     │  aprueba    │
└─────────────┘     └─────────────┘     └─────────────┘
```

1. Cliente envía imagen por WhatsApp
2. Webhook recibe mensaje → descarga imagen
3. EasyOCR extrae código de referencia
4. Transacción cambia a `awaiting_approval`
5. Admin revisa en dashboard
6. Admin aprueba → mensaje de confirmación al cliente

## Tareas Programadas

| Job | Horario | Descripción |
|-----|---------|-------------|
| Recordatorios | 09:00 daily | Envía recordatorios de pago |
| Verificar vencidos | 10:00 daily | Notifica pagos vencidos |
| Limpiar logs | Sundays 02:00 | Elimina logs >90 días |

## Deployment

### Railway (Recomendado)

1. Conectar repositorio GitHub
2. Agregar variables de entorno
3. Deploy automático

### VPS/Server

```bash
# Instalar Docker
curl -fsSL https://get.docker.com | sh

# Clonar y configurar
git clone https://github.com/tu-usuario/kobro.git
cd kobro
cp .env.example .env
# Editar .env con producción

# Ejecutar
make docker-up
```

### Render

1. Crear Web Service para backend (Python)
2. Crear Static Site para frontend
3. Configurar variables de entorno

## Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

## Contribuir

1. Fork el repositorio
2. Crear branch (`git checkout -b feature/nueva-funcion`)
3. Commit cambios (`git commit -am 'Agregar nueva función'`)
4. Push al branch (`git push origin feature/nueva-funcion`)
5. Crear Pull Request

## Soporte

- 📖 Documentación: [docs/](docs/)
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/kobro/issues)
- 💬 Discord: [Join our server](https://discord.gg/kobro)

---

Hecho con ❤️ para empresas que usan WhatsApp Business

.PHONY: help install start stop restart backend frontend db-reset clean test lint

# Colores
GREEN  := \033[0;32m
YELLOW := \033[0;33m
BLUE   := \033[0;34m
NC     := \033[0m

# Directorios
BACKEND_DIR := backend
FRONTEND_DIR := frontend

help: ## Mostrar esta ayuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "$(BLUE)%-15s$(NC) %s\n", $$1, $$2}'

# ============================================
# INSTALACIÓN
# ============================================

install: ## Instalar todas las dependencias
	@echo "$(GREEN)Installing backend dependencies...$(NC)"
	@cd $(BACKEND_DIR) && python3 -m venv venv && \
		./venv/bin/pip install -r requirements.txt && \
		./venv/bin/pip install easyocr torch torchvision --index-url https://download.pytorch.org/whl/cpu
	@echo "$(GREEN)Installing frontend dependencies...$(NC)"
	@cd $(FRONTEND_DIR) && npm install

install-backend: ## Solo instalar dependencias del backend
	@cd $(BACKEND_DIR) && python3 -m venv venv 2>/dev/null || true
	@cd $(BACKEND_DIR) && ./venv/bin/pip install -r requirements.txt
	@cd $(BACKEND_DIR) && ./venv/bin/pip install easyocr torch torchvision --index-url https://download.pytorch.org/whl/cpu

install-frontend: ## Solo instalar dependencias del frontend
	@cd $(FRONTEND_DIR) && npm install

# ============================================
# EJECUTAR
# ============================================

start: ## Iniciar todo (backend + frontend)
	@echo "$(GREEN)Starting Kobro Platform...$(NC)"
	@make start-backend &
	@sleep 2
	@make start-frontend
	@echo ""
	@echo "$(GREEN)✓ Backend:  http://localhost:8000$(NC)"
	@echo "$(GREEN)✓ Frontend: http://localhost:3000$(NC)"
	@echo "$(GREEN)✓ API Docs:  http://localhost:8000/docs$(NC)"

start-backend: ## Iniciar solo el backend
	@echo "$(YELLOW)Starting Backend...$(NC)"
	@cd $(BACKEND_DIR) && ./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000

start-frontend: ## Iniciar solo el frontend
	@echo "$(YELLOW)Starting Frontend...$(NC)"
	@cd $(FRONTEND_DIR) && npm run dev

# ============================================
# DETENER
# ============================================

stop: ## Detener todos los servicios
	@pkill -f "uvicorn app.main:app" 2>/dev/null || true
	@pkill -f "next dev" 2>/dev/null || true
	@echo "$(GREEN)✓ All services stopped$(NC)"

restart: ## Reiniciar todos los servicios
	@make stop
	@sleep 1
	@make start

# ============================================
# BASE DE DATOS
# ============================================

db-reset: ## Resetear base de datos (requiere Supabase CLI)
	@echo "$(YELLOW)Resetting database...$(NC)"
	@supabase db reset

db-migrate: ## Ejecutar migraciones
	@echo "$(YELLOW)Running migrations...$(NC)"
	@supabase db push

# ============================================
# LIMPIEZA
# ============================================

clean: ## Limpiar archivos temporales
	@echo "$(YELLOW)Cleaning...$(NC)"
	@rm -rf $(BACKEND_DIR)/__pycache__ $(BACKEND_DIR)/.pytest_cache
	@rm -rf $(BACKEND_DIR)/app/__pycache__ $(BACKEND_DIR)/app/**/__pycache__
	@cd $(FRONTEND_DIR) && rm -rf .next node_modules/.cache
	@find . -name "*.pyc" -delete
	@find . -name "*.pyo" -delete
	@echo "$(GREEN)✓ Clean complete$(NC)"

clean-all: clean ## Limpiar todo incluyendo node_modules y venv
	@echo "$(YELLOW)Removing node_modules and venv...$(NC)"
	@rm -rf $(FRONTEND_DIR)/node_modules
	@rm -rf $(BACKEND_DIR)/venv
	@echo "$(GREEN)✓ Full clean complete$(NC)"

# ============================================
# TESTING
# ============================================

test: ## Ejecutar tests del backend
	@cd $(BACKEND_DIR) && ./venv/bin/pytest

test-frontend: ## Ejecutar tests del frontend
	@cd $(FRONTEND_DIR) && npm test

# ============================================
# LINT
# ============================================

lint: ## Lint backend y frontend
	@echo "$(YELLOW)Linting backend...$(NC)"
	@cd $(BACKEND_DIR) && ./venv/bin/python -m py_compile app/**/*.py
	@echo "$(YELLOW)Linting frontend...$(NC)"
	@cd $(FRONTEND_DIR) && npm run lint

typecheck: ## TypeScript type check
	@cd $(FRONTEND_DIR) && npm run typecheck

# ============================================
# DOCKER
# ============================================

docker-build: ## Construir imágenes Docker
	@docker-compose build

docker-up: ## Iniciar con Docker
	@docker-compose up -d

docker-down: ## Detener Docker
	@docker-compose down

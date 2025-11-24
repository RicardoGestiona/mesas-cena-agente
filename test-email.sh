#!/bin/bash

# Script para testear el sistema de emails

echo "🧪 Test del Sistema de Emails Automáticos"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Verificar configuración
echo -e "${YELLOW}Test 1: Verificando configuración...${NC}"
response=$(curl -s http://localhost:3000/api/enviar-emails-masivo)
echo $response | jq '.' 2>/dev/null || echo $response
echo ""

# Test 2: Simular envío masivo
echo -e "${YELLOW}Test 2: Simulando envío masivo (sin API key)...${NC}"
echo "Usando clave secreta: tu-clave-secreta-aqui"
response=$(curl -s -X POST http://localhost:3000/api/enviar-emails-masivo \
  -H "Authorization: Bearer tu-clave-secreta-aqui")
echo $response | jq '.' 2>/dev/null || echo $response
echo ""

# Test 3: Test de autenticación fallida
echo -e "${YELLOW}Test 3: Probando autenticación (debe fallar)...${NC}"
response=$(curl -s -X POST http://localhost:3000/api/enviar-emails-masivo \
  -H "Authorization: Bearer clave-incorrecta")
echo $response | jq '.' 2>/dev/null || echo $response
echo ""

echo -e "${GREEN}✓ Tests completados${NC}"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configura RESEND_API_KEY en .env.local"
echo "2. Configura FECHA_CENA con la fecha de tu evento"
echo "3. Genera una clave aleatoria para CRON_SECRET"
echo "4. Deploy en Vercel con las variables de entorno"
echo ""
echo "📖 Ver documentación completa: CRON_SETUP.md"

// tests/api/messaging/tc-msg-63-create-provider-unauthorized.test.ts

import { describe, test, expect } from '@jest/globals';
import axios, { AxiosError } from 'axios';
// RUTA CORREGIDA
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from '../../src/appwriteConfig';

// Configuración de Axios SIN X-Appwrite-Key (Simula falta de permisos de administrador)
const unauthorizedApi = axios.create({
    baseURL: `${APPWRITE_ENDPOINT}`, 
    headers: {
        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
        'Content-Type': 'application/json',
        // ¡X-Appwrite-Key FALTANTE! <-- Clave de la prueba de seguridad
    },
});

describe('TC-MSG-63: Mensajería - Crear provider sin permisos de administrador (Seguridad 403)', () => {

    test('Debería retornar Error 403 (Forbidden) o 401 (Unauthorized) al intentar crear el proveedor sin la clave API', async () => {
        
        // 1. Datos del Proveedor Válido
        const providerData = {
            providerId: `unauth-test-${Date.now()}`, 
            name: 'Unauthorized Attempt',
            type: 'email', 
            apiKey: 'SG.fake_key_security', 
        };

        // Jest espera que la promesa falle.
        expect.assertions(1); 

        try {
            // 2. Ejecución: POST /v1/messaging/providers usando la instancia SIN la clave API
            await unauthorizedApi.post('/v1/messaging/providers', providerData);

            // Si llega aquí, es un fallo de seguridad.
            throw new Error("Fallo de seguridad: La API aceptó la creación de un proveedor sin clave de administrador.");

        } catch (error) {
            const axiosError = error as AxiosError;
            
            if (axios.isAxiosError(axiosError) && axiosError.response) {
                const status = axiosError.response.status;
                
                // 1. Verificar el código de estado esperado:
                // 401 (No autorizado) o 403 (Prohibido) son respuestas típicas de seguridad.
                expect(status === 401 || status === 403).toBe(true); 

            } else {
                throw new Error(`Fallo de conexión o error inesperado: ${(error as Error).message}`);
            }
        }
    });

    // No se requiere Cleanup ya que el recurso nunca se crea con éxito.
});
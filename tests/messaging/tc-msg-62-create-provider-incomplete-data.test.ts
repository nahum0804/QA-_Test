// tests/api/messaging/tc-msg-62-create-provider-incomplete-data.test.ts

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import axios, { AxiosError } from 'axios';
// RUTA CORREGIDA
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY } from '../../src/appwriteConfig';

// Configuración de Axios
const api = axios.create({
    baseURL: `${APPWRITE_ENDPOINT}`, 
    headers: {
        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': APPWRITE_API_KEY, 
        'Content-Type': 'application/json',
    },
});

describe('TC-MSG-62: Mensajería - Crear provider con datos incompletos (Sin nombre)', () => {

    test('Debería retornar Error 400 (Bad Request) al omitir el nombre del proveedor', async () => {
        
        // 1. Datos del Proveedor Inválido: 'name' está vacío o ausente.
        const providerData = {
            providerId: `incomplete-test-${Date.now()}`, 
            name: '', // <-- Nombre vacío, Appwrite requiere que este campo sea non-empty string.
            type: 'email', 
            apiKey: 'SG.fake_key_incomplete', 
        };

        // Jest espera que la promesa falle.
        expect.assertions(2); 

        try {
            // 2. Ejecución: POST /v1/messaging/providers
            await api.post('/v1/messaging/providers', providerData);

            // Si llega aquí, es un fallo, ya que aceptó un nombre vacío.
            throw new Error("La API aceptó un nombre de proveedor vacío, la validación falló.");

        } catch (error) {
            const axiosError = error as AxiosError;
            
            if (axios.isAxiosError(axiosError) && axiosError.response) {
                // 1. Verificar el código de estado esperado (400 Bad Request)
                expect(axiosError.response.status).toBe(400); 
                
                // 2. Verificar el tipo de error de Appwrite (general_argument_invalid)
                if (axiosError.response.data && typeof axiosError.response.data === 'object' && 'type' in axiosError.response.data) {
                    expect((axiosError.response.data as { type: string }).type).toBe('general_argument_invalid');
                } else {
                    throw new Error(`Error 400 devuelto, pero con estructura de error inesperada.`);
                }

            } else {
                throw new Error(`Fallo de conexión o error inesperado: ${(error as Error).message}`);
            }
        }
    });

    // No se requiere Cleanup ya que el recurso nunca se crea con éxito.
});
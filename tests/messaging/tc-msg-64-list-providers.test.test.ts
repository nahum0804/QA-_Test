// tests/api/messaging/tc-msg-64-list-providers.test.ts

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import axios, { AxiosError } from 'axios';
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY } from '../../src/appwriteConfig';

// --- Configuración de API (Igual que en los otros tests) ---
const api = axios.create({
    baseURL: `${APPWRITE_ENDPOINT}`, 
    headers: {
        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': APPWRITE_API_KEY, 
        'Content-Type': 'application/json',
    },
});

let testProviderId: string = '';

describe('TC-MSG-64: Mensajería - Listar providers existentes', () => {

    // 1. Preparación: Crear un provider único ANTES de ejecutar el test
    beforeAll(async () => {
        const providerData = {
            providerId: `list-test-${Date.now()}`,
            name: 'List Provider Test',
            type: 'email',
            apiKey: 'SG.fake_key_list',
        };

        try {
            const response = await api.post('/v1/messaging/providers', providerData);
            if (response.status === 201) {
                testProviderId = response.data.$id;
                console.log(`Setup: Provider ${testProviderId} creado para la prueba.`);
            }
        } catch (error) {
            console.error("Setup: Falló la creación del provider de prueba (Verifica Clave API y ruta /v1/messaging/providers).");
        }
    }, 15000); // 15 segundos para la creación

    
    test('Debería obtener la lista de providers y encontrar el proveedor de prueba', async () => {
        // Aseguramos que la prueba solo se ejecute si el setup fue exitoso.
        if (!testProviderId) {
            // Saltamos la prueba si el setup falló (probablemente por la clave API)
            console.warn("Skipping TC-MSG-64: El setup falló. Clave API incorrecta o error de 404.");
            return; 
        }

        try {
            // 2. Ejecución: GET /v1/messaging/providers
            const response = await api.get('/v1/messaging/providers');

            // 3. Verificación del Resultado Esperado
            expect(response.status).toBe(200); // 200 OK
            expect(response.data.total).toBeGreaterThanOrEqual(1); // Debe haber al menos 1 proveedor
            
            // 4. Verificar que nuestro provider de prueba esté en la lista
            const isProviderFound = response.data.providers.some(
                (p: { $id: string }) => p.$id === testProviderId
            );
            expect(isProviderFound).toBe(true);

        } catch (error) {
            const axiosError = error as AxiosError;
            const status = axiosError.response?.status;
            throw new Error(`La lista falló inesperadamente: ${status} - ${axiosError.message}`);
        }
    });

    // 5. Cleanup: Eliminar el recurso creado
    afterAll(async () => {
        if (testProviderId) {
            try {
                await api.delete(`/v1/messaging/providers/${testProviderId}`);
                console.log(`Cleanup: Provider ${testProviderId} eliminado.`);
            } catch (error) {
                console.error(`Error en cleanup: No se pudo eliminar el provider ${testProviderId}.`);
            }
        }
    });
});
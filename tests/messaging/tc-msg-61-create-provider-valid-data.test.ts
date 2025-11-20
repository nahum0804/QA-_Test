import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import axios, { AxiosError } from 'axios';
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

let testProviderId: string = '';
const providerName = 'Mailgun Test 61';
const expectedType = 'email';

describe('TC-MSG-61: Mensajería - Crear provider con datos válidos', () => {

    test('Debería crear un nuevo proveedor y devolver 201 Created', async () => {
        
        // 1. Datos del Proveedor Válido
        const providerData = {
            // Usamos un ID único para evitar colisiones
            providerId: `mailgun-${Date.now()}`, 
            name: providerName,
            type: expectedType, 
            apiKey: 'MG.fake_api_key_for_test', // Clave falsa, solo se prueba la creación
            // Otros campos requeridos por Appwrite (como host, si aplican) se omiten si Appwrite los infiere.
        };

        try {
            // 2. Ejecución: POST /v1/messaging/providers
            const response = await api.post('/v1/messaging/providers', providerData);

            // 3. Verificación del Resultado Esperado
            expect(response.status).toBe(201); // 201 Created
            expect(response.data.name).toBe(providerName);
            expect(response.data.type).toBe(expectedType);
            expect(response.data.$id).toBeDefined(); // Asegurar que el ID fue asignado

            testProviderId = response.data.$id; // Guardamos el ID para la limpieza

        } catch (error) {
            const axiosError = error as AxiosError;
            const status = axiosError.response?.status;
            throw new Error(`La creación del provider falló inesperadamente: ${status} - ${axiosError.message}. Verifica el scope 'messaging.write'.`);
        }
    });

    // 4. Cleanup: Eliminar el proveedor creado para no dejar basura
    afterAll(async () => {
        if (testProviderId) {
            try {
                await api.delete(`/v1/messaging/providers/${testProviderId}`);
            } catch (error) {
                // console.error(`Error en cleanup: No se pudo eliminar el provider ${testProviderId}.`);
            }
        }
    });
});
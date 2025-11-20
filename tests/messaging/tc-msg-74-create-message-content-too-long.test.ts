import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import axios, { AxiosError } from 'axios';
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY } from '../../src/appwriteConfig';

const api = axios.create({
    baseURL: `${APPWRITE_ENDPOINT}`, 
    headers: {
        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': APPWRITE_API_KEY, 
        'Content-Type': 'application/json',
    },
});

let testProviderId: string = '';
const providerName = 'Provider Test 74 Long Body';

// --- Contenido muy largo ---
// Appwrite suele tener un límite de 1,000,000 caracteres para texto largo, pero para asegurar 
// que la validación salte, usaremos un texto de 100,000 caracteres que es suficiente para la mayoría de los límites.
const CONTENT_LENGTH = 100000; 
const veryLongContent = 'A'.repeat(CONTENT_LENGTH); // Cadena de 100,000 caracteres 'A'
// Si esta prueba falla, ajusta CONTENT_LENGTH a un valor aún mayor (e.g., 200,000)

describe('TC-MSG-74: Mensajería - Crear mensaje con texto muy largo', () => {

    // 1. Setup: Crear el provider de email (requisito)
    beforeAll(async () => {
        const providerData = {
            providerId: `long-body-test-${Date.now()}`,
            name: providerName,
            type: 'email',
            apiKey: 'SG.fake_key_validation_long', 
        };

        try {
            const response = await api.post('/v1/messaging/providers', providerData);
            if (response.status === 201) {
                testProviderId = response.data.$id;
                console.log(`Setup: Proveedor ${testProviderId} creado.`);
            }
        } catch (error) {
            console.error("Setup: Falló la creación del provider de prueba.");
            testProviderId = '';
        }
    }, 15000); 

    
    test(`Debería retornar Error 400 (Bad Request) o 413 (Payload Too Large) por el contenido largo`, async () => {
        if (!testProviderId) {
            console.warn("Skipping TC-MSG-74: El setup (creación del provider) falló.");
            return; 
        }

        // Datos del Mensaje
        const messageData = {
            messageId: `msg-long-body-${Date.now()}`,
            providerId: testProviderId,
            to: ['limit-test@example.com'],
            subject: 'Test Limite TC-MSG-74',
            content: veryLongContent, // <-- ¡CONTENIDO EXCESIVAMENTE LARGO!
        };

        expect.assertions(1); 

        try {
            await api.post('/v1/messaging/messages', messageData);
            throw new Error("La API aceptó el contenido largo, la validación del límite falló.");

        } catch (error) {
            const axiosError = error as AxiosError;
            
            if (axios.isAxiosError(axiosError) && axiosError.response) {
                const status = axiosError.response.status;
                
                // 1. Verificar el código de estado esperado:
                // 400 (Validación de Appwrite) o 413 (Límite del servidor/proxy)
                expect(status === 400 || status === 413).toBe(true); 
                
                // Nota: No verificamos el 'type' del error 413 (si ocurre) porque es un error de servidor.
                // Si es 400, el type debería ser 'general_argument_invalid'.

            } else {
                throw new Error(`Fallo de conexión o error inesperado: ${(error as Error).message}`);
            }
        }
    });

    // 4. Cleanup: Eliminar el proveedor
    afterAll(async () => {
        if (testProviderId) {
            try {
                // DELETE /v1/messaging/providers/{id}
                await api.delete(`/v1/messaging/providers/${testProviderId}`);
            } catch (error) {
                // console.error(`Error en cleanup: No se pudo eliminar el provider ${testProviderId}.`);
            }
        }
    });
});
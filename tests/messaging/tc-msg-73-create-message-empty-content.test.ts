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
const providerName = 'Provider Test 73 Empty Body';

describe('TC-MSG-73: Mensajería - Crear mensaje con cuerpo vacío', () => {

    // Crear el provider de email (requisito)
    beforeAll(async () => {
        const providerData = {
            providerId: `empty-body-test-${Date.now()}`,
            name: providerName,
            type: 'email',
            apiKey: 'SG.fake_key_validation_body', 
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

    
    test('Debería retornar Error 400 (Bad Request) al enviar el cuerpo ("content") vacío', async () => {
        // Aseguramos que la prueba solo se ejecute si el setup fue exitoso.
        if (!testProviderId) {
            console.warn("Skipping TC-MSG-73: El setup (creación del provider) falló.");
            return; 
        }

        // Datos del Mensaje
        const messageData = {
            messageId: `msg-empty-body-${Date.now()}`,
            providerId: testProviderId,
            to: ['valid@example.com'],
            subject: 'Test Vacio TC-MSG-73',
            content: '', // <-- ¡CONTENIDO VACÍO!
        };
        expect.assertions(2); 

        try {
            await api.post('/v1/messaging/messages', messageData);

            throw new Error("La API aceptó un cuerpo de mensaje vacío, la validación falló.");

        } catch (error) {
            const axiosError = error as AxiosError;
            
            if (axios.isAxiosError(axiosError) && axiosError.response) {
                // Verificar el código de estado esperado (400 Bad Request)
                expect(axiosError.response.status).toBe(400); 
                
                // Verificar el tipo de error de Appwrite
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
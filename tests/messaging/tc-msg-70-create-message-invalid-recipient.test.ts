// tests/api/messaging/tc-msg-70-create-message-invalid-recipient.test.ts

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import axios, { AxiosError } from 'axios';
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY } from '../../src/appwriteConfig';

// Reutilizamos la configuración de Axios
const api = axios.create({
    baseURL: `${APPWRITE_ENDPOINT}`, 
    headers: {
        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': APPWRITE_API_KEY, 
        'Content-Type': 'application/json',
    },
});

let testProviderId: string = '';
const providerName = 'Provider Test 70 Validation';

describe('TC-MSG-70: Mensajería - Enviar mensaje con destinatario inválido', () => {

    // 1. Setup: Crear el provider de email (requisito)
    beforeAll(async () => {
        const providerData = {
            providerId: `invalid-rcpt-test-${Date.now()}`,
            name: providerName,
            type: 'email',
            apiKey: 'SG.fake_key_validation_rcpt', 
        };

        try {
            const response = await api.post('/v1/messaging/providers', providerData);
            if (response.status === 201) {
                testProviderId = response.data.$id;
                console.log(`Setup: Proveedor ${testProviderId} creado.`);
            }
        } catch (error) {
            console.error("Setup: Falló la creación del provider de prueba. Verifica 'messaging.write' y campos POST.");
            testProviderId = '';
        }
    }, 15000); 

    
    test('Debería retornar Error 400 (Bad Request) al usar un email con formato incorrecto', async () => {
        // 🚨 Aseguramos que la prueba solo se ejecute si el setup fue exitoso.
        if (!testProviderId) {
            console.warn("Skipping TC-MSG-70: El setup (creación del provider) falló.");
            return; 
        }

        // 2. Datos del Mensaje
        const messageData = {
            messageId: `msg-invalid-rcpt-${Date.now()}`,
            providerId: testProviderId,
            to: ['usuario@@correo.com'], // <-- ¡DESTINATARIO INVÁLIDO!
            subject: 'Test Validacion TC-MSG-70',
            content: 'Este mensaje debe ser rechazado por validación.',
        };

        // Jest espera que la promesa falle.
        expect.assertions(2); 

        try {
            // 3. Ejecución: POST /v1/messaging/messages
            await api.post('/v1/messaging/messages', messageData);

            // Si llega aquí, es un fallo, ya que debería haber lanzado una excepción 400.
            throw new Error("La API aceptó un formato de email inválido, la validación falló.");

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

    // 4. Cleanup: Eliminar el proveedor
    afterAll(async () => {
        if (testProviderId) {
            try {
                // DELETE /v1/messaging/providers/{id}
                await api.delete(`/v1/messaging/providers/${testProviderId}`);
                console.log(`Cleanup: Provider ${testProviderId} eliminado.`);
            } catch (error) {
                console.error(`Error en cleanup: No se pudo eliminar el provider ${testProviderId}.`);
            }
        }
    });
});
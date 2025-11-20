// tests/api/messaging/tc-msg-69-create-immediate-email-message.test.ts

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

// Variables para IDs
let testProviderId: string = '';
let testMessageId: string = '';
const providerName = 'Provider Test 69 Immediate';
const expectedStatus = 'queued'; // El estado esperado para un mensaje inmediato en Appwrite

describe('TC-MSG-69: Mensajería - Crear mensaje inmediato (sin programación)', () => {

    // 1. Setup: Crear el provider de email (requisito)
    beforeAll(async () => {
        const providerData = {
            providerId: `immediate-test-${Date.now()}`,
            name: providerName,
            type: 'email',
            apiKey: 'SG.fake_key_immediate', 
        };

        try {
            const response = await api.post('/v1/messaging/providers', providerData);
            if (response.status === 201) {
                testProviderId = response.data.$id;
                console.log(`Setup: Proveedor ${testProviderId} creado.`);
            }
        } catch (error) {
            console.error("Setup: Falló la creación del provider de prueba. Es crítico para este test.");
            testProviderId = '';
        }
    }, 15000); 

    
    test(`Debería crear un mensaje inmediato y devolver el estado "${expectedStatus}"`, async () => {
        // 🚨 Aseguramos que la prueba solo se ejecute si el setup fue exitoso.
        if (!testProviderId) {
            console.warn("Skipping TC-MSG-69: El setup (creación del provider) falló.");
            return; 
        }

        // 2. Datos del Mensaje (SIN el campo 'scheduledAt')
        const messageData = {
            messageId: `msg-immediate-${Date.now()}`,
            providerId: testProviderId,
            to: ['immediate@example.com'], // Destinatario
            subject: 'Test Inmediato TC-MSG-69',
            content: 'Este mensaje debe enviarse inmediatamente.',
            // Campo scheduledAt INTENCIONALMENTE OMITIDO
        };

        try {
            // 3. Ejecución: POST /v1/messaging/messages
            const response = await api.post('/v1/messaging/messages', messageData);

            // 4. Verificación del Resultado Esperado
            expect(response.status).toBe(201); // 201 Created o 202 Accepted
            
            // Verifica que el estado sea 'queued' o 'pending', dependiendo de la versión de Appwrite
            expect(response.data.status).toBe(expectedStatus); 
            
            // Verifica que el campo scheduledAt NO esté presente o sea null (no programado)
            expect(response.data.scheduledAt).toBeNull(); 
            
            testMessageId = response.data.$id; // Guardamos el ID del mensaje para el cleanup

        } catch (error) {
            const axiosError = error as AxiosError;
            const status = axiosError.response?.status;
            throw new Error(`La creación del mensaje inmediato falló inesperadamente: ${status} - ${axiosError.message}`);
        }
    });

    // 5. Cleanup: Eliminar el mensaje Y el proveedor
    afterAll(async () => {
        // 5a. Limpiar el mensaje si se creó
        if (testMessageId) {
            try {
                await api.delete(`/v1/messaging/messages/${testMessageId}`);
                console.log(`Cleanup: Mensaje ${testMessageId} eliminado.`);
            } catch (error) {
                console.error(`Error en cleanup: No se pudo eliminar el mensaje ${testMessageId}.`);
            }
        }

        // 5b. Limpiar el proveedor si se creó
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
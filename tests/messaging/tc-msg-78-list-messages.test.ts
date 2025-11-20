// tests/api/messaging/tc-msg-78-list-messages.test.ts

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
let messageId1: string = '';
let messageId2: string = '';
const providerName = 'Provider Test 78 List';
const expectedStatus = 'queued'; 

describe('TC-MSG-78: Mensajería - Listar mensajes enviados', () => {

    // 1. Setup: Crear un provider y dos mensajes (uno inmediato y uno programado)
    beforeAll(async () => {
        // --- 1a. Crear Provider ---
        const providerData = {
            providerId: `list-msg-test-${Date.now()}`,
            name: providerName,
            type: 'email',
            apiKey: 'SG.fake_key_list_msg', 
        };
        try {
            const providerResponse = await api.post('/v1/messaging/providers', providerData);
            if (providerResponse.status === 201) {
                testProviderId = providerResponse.data.$id;
            }
        } catch (error) {
            console.error("Setup: Falló la creación del provider.");
        }

        // --- 1b. Crear Mensaje 1 (Inmediato) ---
        if (testProviderId) {
            const msg1Data = {
                messageId: `msg-list-1-${Date.now()}`,
                providerId: testProviderId,
                to: ['list-1@example.com'],
                subject: 'Msg List 1',
                content: 'Mensaje inmediato para listar.',
            };
            try {
                const msg1Response = await api.post('/v1/messaging/messages', msg1Data);
                if (msg1Response.status === 201) {
                    messageId1 = msg1Response.data.$id;
                }
            } catch (error) {
                console.error("Setup: Falló la creación del mensaje 1.");
            }
        }

        // --- 1c. Crear Mensaje 2 (Programado) ---
        if (testProviderId) {
            const scheduledAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
            const msg2Data = {
                messageId: `msg-list-2-${Date.now() + 1}`,
                providerId: testProviderId,
                to: ['list-2@example.com'],
                subject: 'Msg List 2 Scheduled',
                content: 'Mensaje programado para listar.',
                scheduledAt: scheduledAt,
            };
            try {
                const msg2Response = await api.post('/v1/messaging/messages', msg2Data);
                if (msg2Response.status === 201) {
                    messageId2 = msg2Response.data.$id;
                }
            } catch (error) {
                console.error("Setup: Falló la creación del mensaje 2.");
            }
        }
    }, 30000); 

    
    test('Debería obtener la lista de mensajes y verificar los mensajes de prueba', async () => {
        // Aseguramos que la prueba solo se ejecute si se creó al menos un mensaje.
        if (!messageId1 && !messageId2) {
            console.warn("Skipping TC-MSG-78: No se pudieron crear los mensajes de prueba.");
            return; 
        }

        try {
            // 2. Ejecución: GET /v1/messaging/messages
            const response = await api.get('/v1/messaging/messages');

            // 3. Verificación del Resultado Esperado
            expect(response.status).toBe(200);
            expect(response.data.total).toBeGreaterThanOrEqual(1);
            
            // 4. Verificar que los mensajes de prueba estén en la lista
            const messages = response.data.messages;

            if (messageId1) {
                const msg1Found = messages.some((m: { $id: string }) => m.$id === messageId1);
                expect(msg1Found).toBe(true);
                const msg1 = messages.find((m: { $id: string }) => m.$id === messageId1);
                expect(msg1.status).toBe(expectedStatus); // Verifica el estado
                expect(msg1.type).toBe('email'); // Verifica el tipo
            }

            if (messageId2) {
                const msg2Found = messages.some((m: { $id: string }) => m.$id === messageId2);
                expect(msg2Found).toBe(true);
                const msg2 = messages.find((m: { $id: string }) => m.$id === messageId2);
                expect(msg2.status).toBe('scheduled'); // Verifica el estado programado
            }

        } catch (error) {
            const axiosError = error as AxiosError;
            const status = axiosError.response?.status;
            throw new Error(`La lista de mensajes falló inesperadamente: ${status} - ${axiosError.message}`);
        }
    });

    // 5. Cleanup: Eliminar los mensajes Y el proveedor
    afterAll(async () => {
        const idsToDelete = [messageId1, messageId2].filter(id => id !== '');
        
        // Limpiar mensajes
        const deleteMessagePromises = idsToDelete.map(id => 
            api.delete(`/v1/messaging/messages/${id}`).catch(() => { /* Ignorar error */ })
        );
        await Promise.all(deleteMessagePromises);

        // Limpiar el proveedor
        if (testProviderId) {
            try {
                await api.delete(`/v1/messaging/providers/${testProviderId}`);
            } catch (error) {
                // Ignorar error de cleanup
            }
        }
    });
});
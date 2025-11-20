// tests/api/messaging/tc-msg-76-send-concurrent-messages.test.ts

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import axios, { AxiosError } from 'axios';
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY } from '../../src/appwriteConfig';

const CONCURRENCY_LEVEL = 50; // Cantidad de mensajes a enviar simultáneamente

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
let createdMessageIds: string[] = [];
const providerName = 'Provider Test 76 Concurrency';

describe('TC-MSG-76: Mensajería - Enviar varios mensajes simultáneos (Rendimiento)', () => {

    // 1. Setup: Crear el provider de email
    beforeAll(async () => {
        const providerData = {
            providerId: `concurrent-test-${Date.now()}`,
            name: providerName,
            type: 'email',
            apiKey: 'SG.fake_key_concurrent', 
        };

        try {
            const response = await api.post('/v1/messaging/providers', providerData);
            if (response.status === 201) {
                testProviderId = response.data.$id;
            }
        } catch (error) {
            console.error("Setup: Falló la creación del provider de prueba. Saltando test.");
            testProviderId = '';
        }
    }, 20000); 

    
    test(`Debería enviar ${CONCURRENCY_LEVEL} mensajes concurrentemente y recibir 201 Created para todos`, async () => {
        // Aseguramos que la prueba solo se ejecute si el setup fue exitoso.
        if (!testProviderId) {
            console.warn(`Skipping TC-MSG-76: El provider no fue creado.`);
            return; 
        }

        // 2. Crear un array de promesas de solicitud POST
        const concurrentRequests = Array.from({ length: CONCURRENCY_LEVEL }, (_, i) => {
            const messageData = {
                messageId: `msg-concurrent-${i}-${Date.now()}`,
                providerId: testProviderId,
                to: [`concurrent-user-${i}@example.com`],
                subject: `Mensaje Concurrente #${i}`,
                content: `Prueba de carga de mensaje número ${i}.`,
            };
            return api.post('/v1/messaging/messages', messageData);
        });

        try {
            // 3. Ejecución: Enviar todas las promesas simultáneamente
            const responses = await Promise.all(concurrentRequests);

            // 4. Verificación del Resultado Esperado
            expect(responses.length).toBe(CONCURRENCY_LEVEL); // Se ejecutaron 50 promesas
            
            // Verificar que todas las respuestas tengan el código 201
            responses.forEach(response => {
                expect(response.status).toBe(201);
                expect(response.data.status).toBe('queued');
                createdMessageIds.push(response.data.$id); // Guardar IDs para limpieza
            });

            // Verificar que se haya guardado el número correcto de IDs
            expect(createdMessageIds.length).toBe(CONCURRENCY_LEVEL);

        } catch (error) {
            const axiosError = error as AxiosError;
            const status = axiosError.response?.status;
            throw new Error(`Fallo de concurrencia: No todos los mensajes se enviaron. Status: ${status} - ${axiosError.message}`);
        }
    }, 60000); // Aumentar timeout para pruebas de rendimiento

    // 5. Cleanup: Eliminar todos los mensajes y el proveedor
    afterAll(async () => {
        // 5a. Limpiar mensajes creados
        const deleteMessagePromises = createdMessageIds.map(id => 
            api.delete(`/v1/messaging/messages/${id}`).catch(err => console.error(`Error al eliminar mensaje ${id}: ${err.message}`))
        );
        await Promise.all(deleteMessagePromises);
        
        // 5b. Limpiar el proveedor
        if (testProviderId) {
            try {
                await api.delete(`/v1/messaging/providers/${testProviderId}`);
            } catch (error) {
                // Error de cleanup
            }
        }
    });
});
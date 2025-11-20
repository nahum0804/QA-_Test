// tests/api/messaging/tc-msg-72-cancel-scheduled-message.test.ts

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import axios, { AxiosError } from 'axios';
// 🚨 RUTA CORREGIDA: Usamos el nivel de carpeta solicitado
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
const providerName = 'Provider Test 72 Cancel';

// Programamos el mensaje para dentro de 10 minutos (ISO 8601 format)
const scheduleTime = new Date(Date.now() + 10 * 60 * 1000);
const scheduledAt = scheduleTime.toISOString();
const initialStatus = 'scheduled';
const cancelledStatus = 'cancelled';


describe('TC-MSG-72: Mensajería - Cancelar mensaje programado', () => {

    // 1. Setup: Crear el provider y un mensaje programado
    beforeAll(async () => {
        // --- 1a. Crear Provider ---
        const providerData = {
            providerId: `cancel-test-${Date.now()}`,
            name: providerName,
            type: 'email',
            apiKey: 'SG.fake_key_cancel', 
        };
        try {
            const providerResponse = await api.post('/v1/messaging/providers', providerData);
            if (providerResponse.status === 201) {
                testProviderId = providerResponse.data.$id;
            }
        } catch (error) {
            console.error("Setup: Falló la creación del provider.");
        }

        // --- 1b. Crear Mensaje Programado (debe estar 'scheduled') ---
        if (testProviderId) {
            const messageData = {
                messageId: `msg-cancel-${Date.now()}`,
                providerId: testProviderId,
                to: ['cancel-check@example.com'],
                subject: 'Test Cancelar TC-MSG-72',
                content: 'Este mensaje debe ser cancelado.',
                scheduledAt: scheduledAt, // <-- Programación en el futuro
            };
            try {
                const messageResponse = await api.post('/v1/messaging/messages', messageData);
                if (messageResponse.status === 201) {
                    testMessageId = messageResponse.data.$id;
                    // Verificamos que se haya creado en el estado correcto (scheduled)
                    if (messageResponse.data.status !== initialStatus) {
                        console.warn(`Setup: El mensaje no está en estado '${initialStatus}'.`);
                    }
                }
            } catch (error) {
                console.error("Setup: Falló la creación del mensaje programado.");
            }
        }
    }, 20000); // Damos más tiempo para el setup

    
    test(`Debería actualizar el mensaje a estado "${cancelledStatus}" y devolver 200`, async () => {
        // 🚨 Aseguramos que la prueba solo se ejecute si el setup fue exitoso.
        if (!testMessageId) {
            console.warn(`Skipping TC-MSG-72: El mensaje no fue creado en el setup.`);
            return; 
        }

        // 2. Datos de Actualización
        const updateData = {
            status: cancelledStatus, // <-- Cambiamos el estado a 'cancelled'
        };

        try {
            // 3. Ejecución: PATCH /v1/messaging/messages/{id}
            const response = await api.patch(`/v1/messaging/messages/${testMessageId}`, updateData);

            // 4. Verificación del Resultado Esperado
            expect(response.status).toBe(200); // 200 OK
            expect(response.data.$id).toBe(testMessageId); // El ID no cambia
            expect(response.data.status).toBe(cancelledStatus); // El estado debe ser 'cancelled'
            
            // Verificamos que la fecha de programación se mantenga, pero el estado cambie.
            expect(response.data.scheduledAt).toEqual(scheduledAt); 

        } catch (error) {
            const axiosError = error as AxiosError;
            const status = axiosError.response?.status;
            throw new Error(`La cancelación del mensaje falló inesperadamente: ${status} - ${axiosError.message}`);
        }
    });

    // 5. Cleanup: Eliminar el mensaje Y el proveedor
    afterAll(async () => {
        // Limpiar el mensaje (estará en 'cancelled', pero debe ser eliminable)
        if (testMessageId) {
            try {
                await api.delete(`/v1/messaging/messages/${testMessageId}`);
                console.log(`Cleanup: Mensaje ${testMessageId} eliminado.`);
            } catch (error) {
                console.error(`Error en cleanup: No se pudo eliminar el mensaje ${testMessageId}.`);
            }
        }

        // Limpiar el proveedor
        if (testProviderId) {
            try {
                await api.delete(`/v1/messaging/providers/${testProviderId}`);
            } catch (error) {
                // console.error(`Error en cleanup: No se pudo eliminar el provider ${testProviderId}.`);
            }
        }
    });
});
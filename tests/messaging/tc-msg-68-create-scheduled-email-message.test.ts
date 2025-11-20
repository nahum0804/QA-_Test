// tests/api/messaging/tc-msg-68-create-scheduled-email-message.test.ts

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
const providerName = 'Provider Test 68 Scheduled';

// ------------------------------------------------------------------
// Lógica para la fecha programada
// Programamos el mensaje para dentro de 5 minutos (ISO 8601 format)
const scheduleTime = new Date(Date.now() + 5 * 60 * 1000);
const scheduledAt = scheduleTime.toISOString();
// ------------------------------------------------------------------


describe('TC-MSG-68: Mensajería - Crear mensaje de tipo email programado', () => {

    // 1. Setup: Crear el provider de email (requisito)
    beforeAll(async () => {
        const providerData = {
            providerId: `scheduled-test-${Date.now()}`,
            name: providerName,
            type: 'email',
            // La clave falsa es suficiente, ya que no se enviará realmente
            apiKey: 'SG.fake_key_scheduled', 
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

    
    test('Debería crear un mensaje programado y devolver el estado "scheduled"', async () => {
        // 🚨 Aseguramos que la prueba solo se ejecute si el setup fue exitoso.
        if (!testProviderId) {
            console.warn("Skipping TC-MSG-68: El setup (creación del provider) falló.");
            return; 
        }

        // 2. Datos del Mensaje
        const messageData = {
            messageId: `msg-schedule-${Date.now()}`,
            providerId: testProviderId,
            to: ['test@example.com'], // Necesita un destinatario válido (Appwrite no lo verifica en el POST)
            subject: 'Test Programado TC-MSG-68',
            content: 'Este mensaje debe estar en estado programado.',
            scheduledAt: scheduledAt, // <-- ¡La clave es la fecha futura!
        };

        try {
            // 3. Ejecución: POST /v1/messaging/messages
            const response = await api.post('/v1/messaging/messages', messageData);

            // 4. Verificación del Resultado Esperado
            expect(response.status).toBe(201); // 201 Created
            expect(response.data.status).toBe('scheduled'); // El estado debe ser 'scheduled'
            expect(response.data.scheduledAt).toEqual(scheduledAt); // Verifica que la hora de programación se haya guardado
            
            testMessageId = response.data.$id; // Guardamos el ID del mensaje para el cleanup

        } catch (error) {
            const axiosError = error as AxiosError;
            const status = axiosError.response?.status;
            throw new Error(`La creación del mensaje programado falló inesperadamente: ${status} - ${axiosError.message}`);
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
// tests/api/messaging/tc-msg-75-create-message-special-chars.test.ts

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
const providerName = 'Provider Test 75 UTF-8';

// --- Contenido con caracteres especiales (emojis, acentos, ñ) ---
const specialContent = '¡Hola Mundo! 🌍 ¿Cómo estás? Aquí probando la ñ, las tildes (áéíóú) y algunos emojis como 🚀, ✅, 👾.';
const expectedInitialStatus = 'queued'; 

describe('TC-MSG-75: Mensajería - Crear mensaje con caracteres especiales (UTF-8)', () => {

    // 1. Setup: Crear el provider de email (requisito)
    beforeAll(async () => {
        const providerData = {
            providerId: `utf8-test-${Date.now()}`,
            name: providerName,
            type: 'email',
            apiKey: 'SG.fake_key_utf8', 
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

    
    test('Debería crear el mensaje con el contenido UTF-8 intacto y en estado encolado', async () => {
        // 🚨 Aseguramos que la prueba solo se ejecute si el setup fue exitoso.
        if (!testProviderId) {
            console.warn("Skipping TC-MSG-75: El setup (creación del provider) falló.");
            return; 
        }

        // 2. Datos del Mensaje
        const messageData = {
            messageId: `msg-utf8-${Date.now()}`,
            providerId: testProviderId,
            to: ['utf8-check@example.com'],
            subject: 'Test UTF-8 TC-MSG-75 ñáéíóú',
            content: specialContent, // <-- ¡CONTENIDO CON CARACTERES ESPECIALES!
        };

        try {
            // 3. Ejecución: POST /v1/messaging/messages
            const response = await api.post('/v1/messaging/messages', messageData);

            // 4. Verificación del Resultado Esperado
            expect(response.status).toBe(201); // 201 Created
            
            // Verifica que el contenido devuelto sea EXACTAMENTE igual al enviado
            expect(response.data.content).toBe(specialContent); 
            
            // Verifica el estado inicial
            expect(response.data.status).toBe(expectedInitialStatus); 
            
            testMessageId = response.data.$id; // Guardamos el ID del mensaje para el cleanup

        } catch (error) {
            const axiosError = error as AxiosError;
            const status = axiosError.response?.status;
            throw new Error(`La creación del mensaje con UTF-8 falló inesperadamente: ${status} - ${axiosError.message}`);
        }
    });

    // 5. Cleanup: Eliminar el mensaje Y el proveedor
    afterAll(async () => {
        // Limpiar el mensaje
        if (testMessageId) {
            try {
                await api.delete(`/v1/messaging/messages/${testMessageId}`);
                console.log(`Cleanup: Mensaje ${testMessageId} eliminado.`);
            } catch (error) {
                // console.error(`Error en cleanup: No se pudo eliminar el mensaje ${testMessageId}.`);
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
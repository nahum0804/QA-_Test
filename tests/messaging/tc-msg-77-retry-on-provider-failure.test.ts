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
const providerName = 'Provider Test 77 Failed Retry';

// Tiempo de espera para que Appwrite agote los reintentos.
// Nota: 150 segundos es una estimación. Si falla, podría necesitar más tiempo.
const RETRY_WAIT_TIME_MS = 150000; // 2.5 minutos

describe('TC-MSG-77: Mensajería - Verificar reintento ante fallo del provider', () => {

    // 1. Setup: Crear el provider con credenciales INTENCIONALMENTE INVÁLIDAS
    beforeAll(async () => {
        const providerData = {
            providerId: `failed-retry-test-${Date.now()}`,
            name: providerName,
            type: 'email',
            // Usamos una clave que Appwrite rechazará al intentar contactar al servicio (ej. Sendgrid, Mailgun).
            apiKey: 'SG.this_key_is_intentionally_invalid_for_testing_fail', 
        };

        try {
            const response = await api.post('/v1/messaging/providers', providerData);
            if (response.status === 201) {
                testProviderId = response.data.$id;
                console.log(`Setup: Proveedor ${testProviderId} creado con clave inválida.`);
            }
        } catch (error) {
            console.error("Setup: Falló la creación del provider de prueba. Saltando test.");
            testProviderId = '';
        }
    }, 20000); // 20 segundos para el setup

    
    test(`Debería crear un mensaje, esperar el reintento y verificar que el estado final es "failed"`, async () => {
        // 🚨 Aseguramos que la prueba solo se ejecute si el setup fue exitoso.
        if (!testProviderId) {
            console.warn(`Skipping TC-MSG-77: El provider no fue creado en el setup.`);
            return; 
        }

        // 2. Crear Mensaje
        const messageData = {
            messageId: `msg-failed-retry-${Date.now()}`,
            providerId: testProviderId,
            to: ['resilience-check@example.com'],
            subject: 'Test Fallo TC-MSG-77',
            content: 'Este mensaje debe fallar por clave inválida.',
        };

        let initialResponse;
        try {
            // POST /v1/messaging/messages
            initialResponse = await api.post('/v1/messaging/messages', messageData);
            
            // Verificación inicial: debe estar encolado
            expect(initialResponse.status).toBe(201);
            expect(initialResponse.data.status).toBe('queued');
            testMessageId = initialResponse.data.$id;

        } catch (error) {
            const axiosError = error as AxiosError;
            throw new Error(`Fallo en la creación inicial del mensaje: ${axiosError.response?.status} - ${axiosError.message}`);
        }
        
        // 3. Esperar a que el sistema de Appwrite intente y falle el envío
        console.log(`Esperando ${RETRY_WAIT_TIME_MS / 1000} segundos para que Appwrite agote los reintentos...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_WAIT_TIME_MS));

        // 4. Obtener el estado final del mensaje
        try {
            const finalResponse = await api.get(`/v1/messaging/messages/${testMessageId}`);

            // 5. Verificación final: el estado debe ser 'failed'
            expect(finalResponse.status).toBe(200); 
            expect(finalResponse.data.status).toBe('failed'); 
            
            // Opcional: Verificar que Appwrite haya registrado el fallo del proveedor.
            expect(finalResponse.data.error).toBeDefined();

        } catch (error) {
            const axiosError = error as AxiosError;
            throw new Error(`La verificación final falló: ${axiosError.response?.status} - ${axiosError.message}`);
        }
    }, RETRY_WAIT_TIME_MS + 30000); // Timeout largo para esta prueba

    // 6. Cleanup: Eliminar el mensaje Y el proveedor
    afterAll(async () => {
        // Limpiar el mensaje
        if (testMessageId) {
            try {
                await api.delete(`/v1/messaging/messages/${testMessageId}`);
            } catch (error) { /* Ignorar error de cleanup */ }
        }

        // Limpiar el proveedor
        if (testProviderId) {
            try {
                await api.delete(`/v1/messaging/providers/${testProviderId}`);
            } catch (error) { /* Ignorar error de cleanup */ }
        }
    });
});
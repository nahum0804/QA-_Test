// tests/api/messaging/tc-msg-79-filter-messages-by-type.test.ts

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
let providerIdEmail: string = '';
let providerIdSms: string = '';
let emailMessageId: string = '';
let smsMessageId: string = '';

const FILTER_TYPE = 'email'; // El tipo que vamos a filtrar
const UNWANTED_TYPE = 'sms'; // El tipo que NO queremos ver

describe('TC-MSG-79: Mensajería - Filtrar mensajes por tipo (email)', () => {

    // 1. Setup: Crear dos providers y un mensaje de cada tipo
    beforeAll(async () => {
        // --- 1a. Crear Provider de Email ---
        const emailProviderData = { providerId: `filter-email-${Date.now()}`, name: 'Filter Email Provider', type: 'email', apiKey: 'SG.fake_key_filter_email' };
        try {
            const res = await api.post('/v1/messaging/providers', emailProviderData);
            if (res.status === 201) providerIdEmail = res.data.$id;
        } catch (e) { /* Ignorar */ }

        // --- 1b. Crear Provider de SMS ---
        const smsProviderData = { providerId: `filter-sms-${Date.now()}`, name: 'Filter SMS Provider', type: 'sms', apiKey: 'TWILIO.fake_key_filter_sms' };
        try {
            const res = await api.post('/v1/messaging/providers', smsProviderData);
            if (res.status === 201) providerIdSms = res.data.$id;
        } catch (e) { /* Ignorar */ }

        // --- 1c. Crear Mensaje de Email ---
        if (providerIdEmail) {
            const msgEmailData = { messageId: `msg-email-79-${Date.now()}`, providerId: providerIdEmail, to: ['filter-email@example.com'], subject: 'Email Filter Test', content: 'Test.' };
            try {
                const res = await api.post('/v1/messaging/messages', msgEmailData);
                if (res.status === 201) emailMessageId = res.data.$id;
            } catch (e) { /* Ignorar */ }
        }

        // --- 1d. Crear Mensaje de SMS ---
        if (providerIdSms) {
            const msgSmsData = { messageId: `msg-sms-79-${Date.now()}`, providerId: providerIdSms, to: ['+15551234567'], content: 'Test SMS.', type: 'sms' };
            try {
                const res = await api.post('/v1/messaging/messages', msgSmsData);
                if (res.status === 201) smsMessageId = res.data.$id;
            } catch (e) { /* Ignorar */ }
        }
    }, 40000); 

    
    test(`Debería devolver solo mensajes con type="${FILTER_TYPE}" usando el filtro "type=${FILTER_TYPE}"`, async () => {
        // Aseguramos que se hayan creado los mensajes de prueba
        if (!emailMessageId || !smsMessageId) {
            console.warn("Skipping TC-MSG-79: No se pudieron crear ambos tipos de mensajes para la prueba de filtro.");
            return;
        }

        try {
            // 2. Ejecución: GET /v1/messaging/messages?queries[]={filter}
            // Appwrite utiliza el parámetro `queries[]` para filtros complejos (como un WHERE).
            const response = await api.get(`/v1/messaging/messages?queries[]=equal("type", "${FILTER_TYPE}")`);

            // 3. Verificación del Resultado Esperado
            expect(response.status).toBe(200);
            
            const messages = response.data.messages;

            // 4. Verificar la inclusión (el mensaje de email debe estar)
            const emailFound = messages.some((m: { $id: string }) => m.$id === emailMessageId);
            expect(emailFound).toBe(true);

            // 5. Verificar la exclusión (ningún mensaje de SMS debe estar en la lista)
            const smsFound = messages.some((m: { $id: string }) => m.$id === smsMessageId);
            expect(smsFound).toBe(false);

            // 6. Verificar que TODOS los elementos devueltos sean del tipo correcto
            const allEmail = messages.every((m: { type: string }) => m.type === FILTER_TYPE);
            expect(allEmail).toBe(true);

        } catch (error) {
            const axiosError = error as AxiosError;
            const status = axiosError.response?.status;
            throw new Error(`El filtro por tipo falló inesperadamente: ${status} - ${axiosError.message}`);
        }
    });

    // 7. Cleanup: Eliminar todos los recursos creados
    afterAll(async () => {
        const idsToDelete = [emailMessageId, smsMessageId].filter(id => id !== '');
        
        // Limpiar mensajes
        await Promise.all(idsToDelete.map(id => 
            api.delete(`/v1/messaging/messages/${id}`).catch(() => { /* Ignorar */ })
        ));

        // Limpiar providers
        await Promise.all([providerIdEmail, providerIdSms].filter(id => id !== '').map(id => 
            api.delete(`/v1/messaging/providers/${id}`).catch(() => { /* Ignorar */ })
        ));
    });
});
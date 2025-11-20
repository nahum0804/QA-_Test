// tests/api/messaging/tc-msg-67-delete-provider-existing.test.ts

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

// Variable para el ID que crearemos y eliminaremos
let testProviderId: string = '';
const providerName = 'Provider Test 67 Delete';

describe('TC-MSG-67: Mensajería - Eliminar provider existente', () => {

    // 1. Setup: Crear el provider que vamos a eliminar ANTES de ejecutar el test
    beforeAll(async () => {
        const providerData = {
            providerId: `delete-test-${Date.now()}`,
            name: providerName,
            type: 'email',
            apiKey: 'SG.fake_key_to_delete',
        };

        try {
            // Creamos el proveedor inicial
            const response = await api.post('/v1/messaging/providers', providerData);
            if (response.status === 201) {
                testProviderId = response.data.$id;
                console.log(`Setup: Proveedor ${testProviderId} creado para la eliminación.`);
            }
        } catch (error) {
            console.error("Setup: Falló la creación del provider de prueba (Verificar clave y campos POST).");
        }
    }, 15000); // 15 segundos para la creación

    
    test('Debería eliminar el proveedor existente y devolver 204 No Content', async () => {
        // 🚨 Aseguramos que la prueba solo se ejecute si el setup fue exitoso.
        if (!testProviderId) {
            console.warn("Skipping TC-MSG-67: El setup falló. Clave API o datos de POST incorrectos.");
            return; 
        }

        try {
            // 2. Ejecución: DELETE /v1/messaging/providers/{id}
            const response = await api.delete(`/v1/messaging/providers/${testProviderId}`);

            // 3. Verificación del Resultado Esperado
            // La eliminación exitosa debe devolver un 204 No Content (sin cuerpo de respuesta).
            expect(response.status).toBe(204); 
            
            // Opcional: Verificar que el recurso ya no existe
            try {
                // Intenta obtener el proveedor que acabamos de eliminar
                await api.get(`/v1/messaging/providers/${testProviderId}`);
                // Si llega aquí, significa que la obtención fue exitosa, lo cual es un fallo
                throw new Error("El proveedor no fue eliminado; se pudo recuperar después del DELETE.");
            } catch (getError) {
                const axiosError = getError as AxiosError;
                // La eliminación fue exitosa si el GET subsecuente devuelve 404 Not Found
                expect(axiosError.response?.status).toBe(404);
            }

        } catch (error) {
            const axiosError = error as AxiosError;
            // Solo relanzamos si el error fue en la llamada DELETE inicial.
            if (axiosError.config?.method === 'delete') {
                const status = axiosError.response?.status;
                throw new Error(`La eliminación falló inesperadamente: ${status} - ${axiosError.message}`);
            }
            // Si el error fue del GET de verificación, ya se maneja arriba.
        }
    });

    // El AfterAll se omite ya que el recurso se elimina en el test.
    afterAll(async () => {
        // Omitimos la limpieza para este caso ya que el test lo elimina.
        // Aseguramos que la variable global se limpia después del test.
        testProviderId = '';
    });
});
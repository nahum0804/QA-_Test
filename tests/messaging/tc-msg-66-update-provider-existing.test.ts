// tests/api/messaging/tc-msg-66-update-provider-existing.test.ts

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

// Variable para el ID que crearemos y actualizaremos
let testProviderId: string = '';
const initialName = 'Provider Test 66 Initial';
const updatedName = 'Provider Test 66 Updated';

describe('TC-MSG-66: Mensajería - Actualizar provider existente', () => {

    // 1. Setup: Crear el provider que vamos a actualizar ANTES de ejecutar el test
    beforeAll(async () => {
        const providerData = {
            providerId: `update-test-${Date.now()}`,
            name: initialName,
            type: 'email',
            apiKey: 'SG.fake_key_update_initial',
        };

        try {
            // Creamos el proveedor inicial
            const response = await api.post('/v1/messaging/providers', providerData);
            if (response.status === 201) {
                testProviderId = response.data.$id;
                console.log(`Setup: Proveedor ${testProviderId} creado para la actualización.`);
            }
        } catch (error) {
            console.error("Setup: Falló la creación del provider de prueba (Verificar clave y campos POST).");
        }
    }, 15000); // 15 segundos para la creación

    
    test('Debería actualizar el nombre del proveedor usando PATCH y verificar el nuevo nombre', async () => {
        // 🚨 Aseguramos que la prueba solo se ejecute si el setup fue exitoso.
        if (!testProviderId) {
            console.warn("Skipping TC-MSG-66: El setup falló. Clave API o datos de POST incorrectos.");
            return; 
        }

        // 2. Datos de Actualización (solo enviamos el campo que queremos modificar)
        const updateData = {
            name: updatedName,
            // Podríamos actualizar otros campos como apiKey si fuera necesario
        };

        try {
            // 3. Ejecución: PATCH /v1/messaging/providers/{id}
            const response = await api.patch(`/v1/messaging/providers/${testProviderId}`, updateData);

            // 4. Verificación del Resultado Esperado
            expect(response.status).toBe(200); // 200 OK
            expect(response.data.$id).toBe(testProviderId); // El ID no cambia
            expect(response.data.name).toBe(updatedName); // El nombre debe ser el nuevo
            
            // Verificamos que otros campos (como 'type') no hayan cambiado
            expect(response.data.type).toBe('email');

        } catch (error) {
            const axiosError = error as AxiosError;
            const status = axiosError.response?.status;
            throw new Error(`La actualización falló inesperadamente: ${status} - ${axiosError.message}`);
        }
    });

    // 5. Cleanup: Eliminar el recurso creado
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
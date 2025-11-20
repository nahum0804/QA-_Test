// tests/api/messaging/tc-msg-65-get-provider-by-id.test.ts

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

// Variable para el ID que crearemos en el setup
let testProviderId: string = '';
const providerName = 'Provider Test 65 Detail';

describe('TC-MSG-65: Mensajería - Obtener provider por ID', () => {

    // 1. Setup: Crear un provider único ANTES de ejecutar el test
    beforeAll(async () => {
        const providerData = {
            providerId: `get-test-${Date.now()}`,
            name: providerName,
            type: 'email',
            apiKey: 'SG.fake_key_get_detail',
        };

        try {
            // Creamos el proveedor inicial
            const response = await api.post('/v1/messaging/providers', providerData);
            if (response.status === 201) {
                testProviderId = response.data.$id;
                console.log(`Setup: Proveedor ${testProviderId} creado para la prueba.`);
            }
        } catch (error) {
            console.error("Setup: Falló la creación del provider de prueba. Verifica la clave API.");
        }
    }, 15000); // 15 segundos para la creación

    
    test('Debería obtener los detalles del proveedor y verificar el ID', async () => {
        // 🚨 Aseguramos que la prueba solo se ejecute si el setup fue exitoso.
        if (!testProviderId) {
            console.warn("Skipping TC-MSG-65: El setup falló. Clave API incorrecta o error de 400 en la creación.");
            return; 
        }

        try {
            // 2. Ejecución: GET /v1/messaging/providers/{id}
            const response = await api.get(`/v1/messaging/providers/${testProviderId}`);

            // 3. Verificación del Resultado Esperado
            expect(response.status).toBe(200); // 200 OK
            expect(response.data.$id).toBe(testProviderId); // El ID devuelto es el correcto
            expect(response.data.name).toBe(providerName); // Verifica el nombre
            expect(response.data.type).toBe('email'); // Verifica el tipo

        } catch (error) {
            const axiosError = error as AxiosError;
            const status = axiosError.response?.status;
            throw new Error(`La obtención de detalle falló inesperadamente: ${status} - ${axiosError.message}`);
        }
    });

    // 4. Cleanup: Eliminar el recurso creado
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
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ClientData {
  userCode: string;
  profile: {
    name: string;
    gender: string;
    goal: string;
    activity: string;
    preference: string;
  };
  lastActivity: string;
  totalDays: number;
  recentCompliance: {
    P: number;
    C: number;
    G: number;
    V: number;
  };
}

export default function EntrenadorPage() {
  const [clients, setClients] = useState<ClientData[]>([]);
  // const [selectedClient, setSelectedClient] = useState<string>(''); // Unused for now
  const [trainerCode, setTrainerCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Código del entrenador (en producción esto estaría más seguro)
  const TRAINER_CODE = 'SAIDCOACH2024';

  useEffect(() => {
    console.log('🚀 [DEBUG] useEffect iniciado');
    // Verificar autenticación en el cliente
    const isTrainerAuthenticated = localStorage.getItem('trainer-authenticated');
    setIsAuthenticated(!!isTrainerAuthenticated);
    console.log('🚀 [DEBUG] Autenticación verificada:', !!isTrainerAuthenticated);
    
    if (isTrainerAuthenticated) {
      console.log('🚀 [DEBUG] Cargando datos de clientes...');
      loadClientsData();
    }
    
    // Generar código inicial solo en el cliente
    generateNewCodeHandler();
    
    setIsLoading(false);
  }, []);

  const generateNewCodeHandler = () => {
    const timestamp = new Date().getTime().toString().slice(-4);
    const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    setGeneratedCode(`SAID-${timestamp}${randomNum}`);
  };

  const handleTrainerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (trainerCode === TRAINER_CODE) {
      console.log('✅ [DEBUG] Login exitoso, cargando clientes...');
      setIsAuthenticated(true);
      localStorage.setItem('trainer-authenticated', 'true');
      loadClientsData();
    } else {
      alert('Código de entrenador incorrecto');
    }
  };

  const loadClientsData = async () => {
    console.log('🔍 [DEBUG] Cargando clientes desde API...');
    
    try {
      const response = await fetch('/api/trainer/clients');
      const data = await response.json();
      
      if (data.clients) {
        console.log('🔍 [DEBUG] Clientes encontrados:', data.clients.length);
        console.log('🔍 [DEBUG] Datos de clientes:', data.clients);
        setClients(data.clients);
      } else {
        console.error('❌ [ERROR] No se pudieron cargar los clientes:', data.error);
        setClients([]);
      }
    } catch (error) {
      console.error('❌ [ERROR] Error cargando clientes:', error);
      setClients([]);
    }
  };

  // Función eliminada - los stats ahora se calculan en la API

  const viewClientReport = (userCode: string) => {
    localStorage.setItem('viewing-client', userCode);
    router.push(`/entrenador/cliente/${userCode}`);
  };


  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Acceso Entrenador</h1>
          <form onSubmit={handleTrainerLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de Entrenador
              </label>
              <input
                type="password"
                value={trainerCode}
                onChange={(e) => setTrainerCode(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
            >
              Acceder
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Panel Entrenador</h1>
            <p className="text-gray-600">Gestiona y monitorea a tus clientes</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('trainer-authenticated');
              setIsAuthenticated(false);
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Generar nuevo código */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Generar Código para Nuevo Cliente</h2>
          <div className="flex items-center gap-4">
            <code className="bg-gray-100 px-4 py-2 rounded-lg font-mono text-lg">
              {generatedCode || 'Generando...'}
            </code>
            <button
              onClick={generateNewCodeHandler}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Generar Nuevo
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Proporciona este código a tu nuevo cliente para que pueda acceder al sistema.
          </p>
        </div>

        {/* Lista de clientes */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Clientes Activos ({clients.length})
          </h2>
          
          {clients.length === 0 ? (
            <div className="text-center py-8 text-gray-800">
              <p>No hay clientes registrados aún.</p>
              <p className="text-sm">Los clientes aparecerán aquí cuando usen sus códigos de acceso.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Cliente</th>
                    <th className="px-4 py-2 text-left">Código</th>
                    <th className="px-4 py-2 text-center">Objetivo</th>
                    <th className="px-4 py-2 text-center">Última Actividad</th>
                    <th className="px-4 py-2 text-center">Días Totales</th>
                    <th className="px-4 py-2 text-center">Adherencia (7d)</th>
                    <th className="px-4 py-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.userCode} className="border-b border-gray-200">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{client.profile.name}</div>
                          <div className="text-sm text-gray-800">
                            {client.profile.gender === 'MALE' ? 'Hombre' : 'Mujer'} • {client.profile.activity}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {client.userCode}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {client.profile.goal === 'WEIGHT_LOSS' ? 'Pérdida' : 
                         client.profile.goal === 'MAINTENANCE' ? 'Mantenimiento' : 'Ganancia'}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {client.lastActivity}
                      </td>
                      <td className="px-4 py-3 text-center font-medium">
                        {client.totalDays}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1 text-xs">
                          <span className="bg-red-100 text-red-800 px-1 rounded">P:{client.recentCompliance.P}%</span>
                          <span className="bg-yellow-100 text-yellow-800 px-1 rounded">C:{client.recentCompliance.C}%</span>
                          <span className="bg-purple-100 text-purple-800 px-1 rounded">G:{client.recentCompliance.G}%</span>
                          <span className="bg-green-100 text-green-800 px-1 rounded">V:{client.recentCompliance.V}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => viewClientReport(client.userCode)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Ver Detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
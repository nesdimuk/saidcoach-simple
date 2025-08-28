'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface DailyReport {
  date: string;
  weight?: number;
  portions: {
    P: number;
    C: number;
    G: number;
    V: number;
  };
  goals: {
    P: number;
    C: number;
    G: number;
    V: number;
  };
  compliance: {
    P: number;
    C: number;
    G: number;
    V: number;
  };
}

interface UserProfile {
  name: string;
  gender: string;
  goal: string;
  activity: string;
  preference: string;
}

export default function ClientDetailPage() {
  const { userCode } = useParams();
  const router = useRouter();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dateRange, setDateRange] = useState(14);

  useEffect(() => {
    if (userCode) {
      loadClientData(userCode as string);
    }
  }, [userCode, dateRange]);

  const loadClientData = async (clientCode: string) => {
    try {
      // Cargar perfil del cliente desde API
      const profileResponse = await fetch(`/api/user-profile?userCode=${clientCode}`);
      const profileData = await profileResponse.json();
      
      if (profileData.profile) {
        setUserProfile(profileData.profile);
      } else {
        console.log('No se encontró perfil para el cliente:', clientCode);
        return;
      }

      // Cargar reportes del cliente
      const reportsData: DailyReport[] = [];
      const today = new Date();
      
      for (let i = 0; i < dateRange; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toDateString();
        
        try {
          // Cargar datos de porciones desde API
          const portionsResponse = await fetch(`/api/portions?userCode=${clientCode}&date=${encodeURIComponent(dateString)}`);
          const portionsResult = await portionsResponse.json();
          
          if (portionsResult.portions) {
            const portions = portionsResult.portions;
            const weight = portionsResult.weight;
            const goals = portionsResult.goals || { P: 5, C: 5, G: 5, V: 5 };
            
            // Calcular totales consumidos
            const totalP = Object.values(portions.P).reduce((sum: number, val: unknown) => sum + (val as number), 0);
            const totalC = Object.values(portions.C).reduce((sum: number, val: unknown) => sum + (val as number), 0);
            const totalG = Object.values(portions.G).reduce((sum: number, val: unknown) => sum + (val as number), 0);
            const totalV = portions.V || 0;
            
            // Calcular compliance
            const compliance = {
              P: Math.round((totalP / goals.P) * 100),
              C: Math.round((totalC / goals.C) * 100),
              G: Math.round((totalG / goals.G) * 100),
              V: Math.round((totalV / goals.V) * 100)
            };
            
            reportsData.push({
              date: dateString,
              weight,
              portions: { P: totalP, C: totalC, G: totalG, V: totalV },
              goals,
              compliance
            });
          }
        } catch (error) {
          console.log(`No hay datos para ${dateString}:`, error);
        }
      }
      
      setReports(reportsData);
      
    } catch (error) {
      console.error('Error cargando datos del cliente:', error);
    }
  };

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-800 bg-green-100';
    if (percentage >= 70) return 'text-yellow-800 bg-yellow-100';
    return 'text-red-800 bg-red-100';
  };

  const calculateAverages = () => {
    if (reports.length === 0) return { compliance: { P: 0, C: 0, G: 0, V: 0 }, weightChange: 0 };

    const avgCompliance = {
      P: Math.round(reports.reduce((sum, r) => sum + r.compliance.P, 0) / reports.length),
      C: Math.round(reports.reduce((sum, r) => sum + r.compliance.C, 0) / reports.length),
      G: Math.round(reports.reduce((sum, r) => sum + r.compliance.G, 0) / reports.length),
      V: Math.round(reports.reduce((sum, r) => sum + r.compliance.V, 0) / reports.length)
    };

    const weightsWithData = reports.filter(r => r.weight);
    const weightChange = weightsWithData.length >= 2 ? 
      weightsWithData[0].weight! - weightsWithData[weightsWithData.length - 1].weight! : 0;

    return { compliance: avgCompliance, weightChange };
  };

  const averages = calculateAverages();

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700">Cargando datos del cliente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <button
              onClick={() => router.push('/entrenador')}
              className="text-blue-600 hover:text-blue-700 mb-2"
            >
              ← Volver al Panel
            </button>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{userProfile.name}</h1>
            <p className="text-gray-700">
              {userProfile.gender === 'MALE' ? 'Hombre' : 'Mujer'} • 
              {userProfile.goal === 'WEIGHT_LOSS' ? ' Pérdida de peso' : 
               userProfile.goal === 'MAINTENANCE' ? ' Mantenimiento' : ' Ganancia muscular'} • 
              {userProfile.activity} • Prefiere {userProfile.preference}
            </p>
          </div>
          <div className="text-right">
            <code className="bg-gray-100 px-3 py-1 rounded text-sm">{userCode}</code>
          </div>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-gray-800">{reports.length}</div>
            <div className="text-sm text-gray-700">Días registrados</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className={`text-2xl font-bold ${getComplianceColor(averages.compliance.P)}`}>
              {averages.compliance.P}%
            </div>
            <div className="text-sm text-gray-700">Proteína promedio</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className={`text-2xl font-bold ${getComplianceColor(averages.compliance.C)}`}>
              {averages.compliance.C}%
            </div>
            <div className="text-sm text-gray-700">Carbos promedio</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className={`text-2xl font-bold ${getComplianceColor(averages.compliance.G)}`}>
              {averages.compliance.G}%
            </div>
            <div className="text-sm text-gray-700">Grasas promedio</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {averages.weightChange > 0 ? '+' : ''}{averages.weightChange.toFixed(1)} kg
            </div>
            <div className="text-sm text-gray-700">Cambio de peso</div>
          </div>
        </div>

        {/* Configuración */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Período del Reporte</h2>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>Últimos 7 días</option>
              <option value={14}>Últimos 14 días</option>
              <option value={30}>Último mes</option>
            </select>
          </div>
        </div>

        {/* Tabla de datos diarios */}
        {reports.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Detalle Diario</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Fecha</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Peso</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Proteína</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Carbos</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Grasas</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Verduras</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, index) => {
                    const avgCompliance = Math.round(
                      (report.compliance.P + report.compliance.C + report.compliance.G + report.compliance.V) / 4
                    );
                    
                    return (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {new Date(report.date).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-4 py-2 text-center text-sm">
                          {report.weight ? `${report.weight} kg` : '-'}
                        </td>
                        <td className="px-4 py-2 text-center text-sm">
                          <div>{report.portions.P.toFixed(1)}/{report.goals.P}</div>
                          <div className={`text-xs px-2 py-1 rounded ${getComplianceColor(report.compliance.P)}`}>
                            {report.compliance.P}%
                          </div>
                        </td>
                        <td className="px-4 py-2 text-center text-sm">
                          <div>{report.portions.C.toFixed(1)}/{report.goals.C}</div>
                          <div className={`text-xs px-2 py-1 rounded ${getComplianceColor(report.compliance.C)}`}>
                            {report.compliance.C}%
                          </div>
                        </td>
                        <td className="px-4 py-2 text-center text-sm">
                          <div>{report.portions.G.toFixed(1)}/{report.goals.G}</div>
                          <div className={`text-xs px-2 py-1 rounded ${getComplianceColor(report.compliance.G)}`}>
                            {report.compliance.G}%
                          </div>
                        </td>
                        <td className="px-4 py-2 text-center text-sm">
                          <div>{report.portions.V.toFixed(1)}/{report.goals.V}</div>
                          <div className={`text-xs px-2 py-1 rounded ${getComplianceColor(report.compliance.V)}`}>
                            {report.compliance.V}%
                          </div>
                        </td>
                        <td className="px-4 py-2 text-center text-sm">
                          <div className={`font-semibold px-2 py-1 rounded ${getComplianceColor(avgCompliance)}`}>
                            {avgCompliance}%
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reports.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-700">Este cliente no tiene datos registrados aún.</p>
          </div>
        )}
      </div>
    </div>
  );
}
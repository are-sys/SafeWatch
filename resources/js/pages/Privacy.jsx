import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Privacy() {
    return (
        <div className="min-h-screen bg-sky-50 py-8 px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">

                <div className="flex items-center gap-3 mb-6">
                    <img src="/images/logo.png" alt="SafeWatch" className="w-12 h-12 object-contain" />
                    <h1 className="text-2xl font-bold text-gray-800">Aviso de Privacidad de SafeWatch</h1>
                </div>
                <p className="text-xs text-gray-400 mb-6">Ultima actualizacion: Abril 2026</p>

                <div className="prose prose-sm prose-gray max-w-none space-y-4 text-gray-600">
                    <h3 className="text-gray-800 font-semibold">1. Responsable del Tratamiento</h3>
                    <p>SafeWatch es una aplicacion de monitoreo de salud desarrollada con fines academicos.</p>

                    <h3 className="text-gray-800 font-semibold">2. Datos que Recopilamos</h3>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Identificacion: nombre, correo, CURP, fecha de nacimiento, genero</li>
                        <li>Salud: signos vitales, tipo de sangre, alergias, condiciones cronicas, medicamentos</li>
                        <li>Ubicacion: coordenadas GPS en tiempo real y direccion del hogar</li>
                        <li>Contactos de emergencia y datos del medico familiar</li>
                        <li>Seguro medico: aseguradora y numero de poliza</li>
                    </ul>

                    <h3 className="text-gray-800 font-semibold">3. Finalidad</h3>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Monitoreo continuo de signos vitales</li>
                        <li>Alertas automaticas ante valores anormales</li>
                        <li>Envio de alertas SOS con ubicacion</li>
                        <li>Historial medico para emergencias</li>
                    </ul>

                    <h3 className="text-gray-800 font-semibold">4. Seguridad</h3>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Autenticacion por tokens (Sanctum)</li>
                        <li>Cifrado de contrasenas con bcrypt</li>
                        <li>Proteccion CSRF y headers de seguridad HTTP</li>
                        <li>Roles y permisos (paciente, doctor, admin)</li>
                        <li>Acceso restringido a datos propios</li>
                    </ul>

                    <h3 className="text-gray-800 font-semibold">5. Comparticion</h3>
                    <p>Tus datos NO se comparten con terceros. Solo se comparten con tus contactos de emergencia durante una alerta SOS.</p>

                    <h3 className="text-gray-800 font-semibold">6. Derechos ARCO</h3>
                    <p>Puedes acceder, rectificar, cancelar u oponerte al tratamiento de tus datos desde tu perfil.</p>
                </div>

                <div className="mt-8 text-center">
                    <Link to="/profile" className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl transition inline-block">
                        Volver al Perfil
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}

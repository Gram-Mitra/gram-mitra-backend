const express = require('express');
const {
  // Common / Geolocation / Emergency
  getFacilities,
  getNearbyFacilities,
  getEmergency,
  getFacilityById,

  // Hospitals (Human)
  getHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  deleteHospital,

  // Veterinary Hospitals (Animal)
  getVeterinaryHospitals,
  getVeterinaryHospitalById,
  createVeterinaryHospital,
  updateVeterinaryHospital,
  deleteVeterinaryHospital,

  // Healthcare Services
  getServices,
  getServicesCatalog,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getFacilityServices,
  addFacilityService,
} = require('../controllers/healthcare.controller');

const router = express.Router();

/**
 * Healthcare API Routes Hierarchy:
 *
 * Healthcare (/api/v1/healthcare)
 * │
 * ├── Hospitals (/api/v1/healthcare/hospitals)
 * │   ├── GET    /hospitals              - List human hospitals (filters: district, state, emergency, search)
 * │   ├── POST   /hospitals              - Register a new human hospital
 * │   ├── GET    /hospitals/:id          - Hospital profile with all offered services
 * │   ├── PUT    /hospitals/:id          - Update hospital information
 * │   ├── DELETE /hospitals/:id          - Remove or deactivate hospital
 * │   ├── GET    /hospitals/:id/services - List services for this hospital
 * │   └── POST   /hospitals/:id/services - Add a service to this hospital
 * │
 * ├── Veterinary Hospitals (/api/v1/healthcare/veterinary)
 * │   ├── GET    /veterinary              - List animal veterinary hospitals & clinics
 * │   ├── POST   /veterinary              - Register a new veterinary clinic/dispensary
 * │   ├── GET    /veterinary/:id          - Veterinary facility profile with animal services
 * │   ├── PUT    /veterinary/:id          - Update veterinary facility
 * │   ├── DELETE /veterinary/:id          - Remove or deactivate veterinary facility
 * │   ├── GET    /veterinary/:id/services - List animal services for this clinic
 * │   └── POST   /veterinary/:id/services - Add an animal service to this clinic
 * │
 * └── Services (/api/v1/healthcare/services)
 *     ├── GET    /services/catalog       - Curated knowledge base of government rural healthcare & veterinary programs
 *     ├── GET    /services               - Search across all services (vaccinations, OPD, surgeries, ambulance, etc.)
 *     ├── POST   /services               - Create a new hospital/veterinary service
 *     ├── GET    /services/:id           - Specific service details with facility details
 *     ├── PUT    /services/:id           - Update service details or availability
 *     └── DELETE /services/:id           - Remove service
 *
 * Shared Features:
 * ├── GET /nearby    - Geolocation search (lat, lng, radius in km)
 * ├── GET /emergency - 24/7 emergency facilities and national helplines (108, 102, 104, 1962, 112)
 * ├── GET /          - List all facilities (human & animal)
 * └── GET /:id       - Get any facility by ID
 */

// ----------------------------------------------------------------------------
// 1. Services Sub-Routes
// ----------------------------------------------------------------------------
router.get('/services/catalog', getServicesCatalog);
router.get('/services', getServices);
router.get('/services/:id', getServiceById);
router.post('/services', createService);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);

// ----------------------------------------------------------------------------
// 2. Hospitals Sub-Routes (Human Healthcare)
// ----------------------------------------------------------------------------
router.get('/hospitals', getHospitals);
router.get('/hospitals/:id/services', getFacilityServices);
router.post('/hospitals/:id/services', addFacilityService);
router.get('/hospitals/:id', getHospitalById);
router.post('/hospitals', createHospital);
router.put('/hospitals/:id', updateHospital);
router.delete('/hospitals/:id', deleteHospital);

// ----------------------------------------------------------------------------
// 3. Veterinary Hospitals Sub-Routes (Animal Healthcare)
// ----------------------------------------------------------------------------
router.get('/veterinary', getVeterinaryHospitals);
router.get('/veterinary/:id/services', getFacilityServices);
router.post('/veterinary/:id/services', addFacilityService);
router.get('/veterinary/:id', getVeterinaryHospitalById);
router.post('/veterinary', createVeterinaryHospital);
router.put('/veterinary/:id', updateVeterinaryHospital);
router.delete('/veterinary/:id', deleteVeterinaryHospital);

// ----------------------------------------------------------------------------
// 4. Special Routes (Nearby Geolocation & 24/7 Emergency)
// ----------------------------------------------------------------------------
router.get('/nearby', getNearbyFacilities);
router.get('/emergency', getEmergency);

// ----------------------------------------------------------------------------
// 5. Root Facilities Routes
// ----------------------------------------------------------------------------
router.get('/', getFacilities);
router.get('/:id', getFacilityById);

module.exports = router;

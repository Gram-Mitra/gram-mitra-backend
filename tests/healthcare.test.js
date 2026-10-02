const request = require('supertest');
const app = require('../src/app');

jest.setTimeout(15000);

describe('Healthcare & Veterinary API Endpoints', () => {
  let createdHospitalId;
  let createdVetId;
  let createdServiceId;

  // ==========================================================================
  // 1. Root Facilities & Overview
  // ==========================================================================
  describe('GET /api/v1/healthcare', () => {
    it('should return 200 and a list of healthcare facilities', async () => {
      const res = await request(app).get('/api/v1/healthcare');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('facilities');
      expect(res.body.data).toHaveProperty('total');
      expect(Array.isArray(res.body.data.facilities)).toBe(true);
      expect(res.body.data.facilities.length).toBeGreaterThan(0);
    });

    it('should filter facilities by type (human)', async () => {
      const res = await request(app).get('/api/v1/healthcare?type=human');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      const facilities = res.body.data.facilities;
      expect(facilities.every((f) => f.type === 'human')).toBe(true);
    });

    it('should filter facilities by type (animal)', async () => {
      const res = await request(app).get('/api/v1/healthcare?type=animal');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      const facilities = res.body.data.facilities;
      expect(facilities.every((f) => f.type === 'animal')).toBe(true);
    });

    it('should filter facilities by search term', async () => {
      const res = await request(app).get('/api/v1/healthcare?search=saphale');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.facilities.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // 2. Geolocation Nearby Search
  // ==========================================================================
  describe('GET /api/v1/healthcare/nearby', () => {
    it('should return 400 when lat or lng are missing', async () => {
      const res = await request(app).get('/api/v1/healthcare/nearby');

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should return facilities sorted with distance_km calculated', async () => {
      // Saphale coordinates approx 19.577, 72.823
      const res = await request(app).get('/api/v1/healthcare/nearby?lat=19.577&lng=72.823&radius=50');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('facilities');

      if (res.body.data.facilities.length > 0) {
        const first = res.body.data.facilities[0];
        expect(first).toHaveProperty('distance_km');
        expect(typeof first.distance_km).toBe('number');
        expect(first.distance_km).toBeLessThanOrEqual(50);
      }
    });
  });

  // ==========================================================================
  // 3. Emergency Helplines & Facilities
  // ==========================================================================
  describe('GET /api/v1/healthcare/emergency', () => {
    it('should return emergency helplines (108, 102, 1962, etc.) and emergency facilities', async () => {
      const res = await request(app).get('/api/v1/healthcare/emergency');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('emergency_helplines');
      expect(res.body.data).toHaveProperty('emergency_facilities');

      const helplines = res.body.data.emergency_helplines;
      expect(Array.isArray(helplines)).toBe(true);

      const hasAmbulance = helplines.some((h) => h.number === '108');
      const hasVetVan = helplines.some((h) => h.number === '1962');
      expect(hasAmbulance).toBe(true);
      expect(hasVetVan).toBe(true);
    });

    it('should filter emergency contacts by type=human or type=animal', async () => {
      const resAnimal = await request(app).get('/api/v1/healthcare/emergency?type=animal');
      expect(resAnimal.statusCode).toEqual(200);
      expect(resAnimal.body.data.emergency_helplines.every((h) => h.category === 'animal')).toBe(true);

      const resHuman = await request(app).get('/api/v1/healthcare/emergency?type=human');
      expect(resHuman.statusCode).toEqual(200);
      expect(resHuman.body.data.emergency_helplines.every((h) => h.category === 'human')).toBe(true);
    });
  });

  // ==========================================================================
  // 4. Human Hospitals (/api/v1/healthcare/hospitals)
  // ==========================================================================
  describe('Hospitals Endpoints (/api/v1/healthcare/hospitals)', () => {
    it('GET /api/v1/healthcare/hospitals should return only human healthcare centers', async () => {
      const res = await request(app).get('/api/v1/healthcare/hospitals');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      const facilities = res.body.data.facilities;
      expect(facilities.every((f) => f.type === 'human')).toBe(true);
    });

    it('POST /api/v1/healthcare/hospitals should create a new human hospital with services', async () => {
      const newHospitalPayload = {
        name: 'Dahanu Rural Sub-Centre',
        address: 'Coastal Highway, Dahanu',
        state: 'Maharashtra',
        district: 'Palghar',
        village: 'Dahanu',
        latitude: 19.972,
        longitude: 72.732,
        phone: '02528-222111',
        email: 'dahanu.sc@maharashtra.gov.in',
        is_emergency: true,
        services: [
          'Primary OPD Consultation',
          'Maternal Immunization',
        ],
      };

      const res = await request(app)
        .post('/api/v1/healthcare/hospitals')
        .send(newHospitalPayload);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.name).toBe('Dahanu Rural Sub-Centre');
      expect(res.body.data.type).toBe('human');
      expect(res.body.data.services.length).toBe(2);

      createdHospitalId = res.body.data.id;
    });

    it('GET /api/v1/healthcare/hospitals/:id should return details of the created hospital', async () => {
      const res = await request(app).get(`/api/v1/healthcare/hospitals/${createdHospitalId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdHospitalId);
      expect(res.body.data.type).toBe('human');
    });

    it('PUT /api/v1/healthcare/hospitals/:id should update hospital details', async () => {
      const res = await request(app)
        .put(`/api/v1/healthcare/hospitals/${createdHospitalId}`)
        .send({ phone: '02528-999888' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.phone).toBe('02528-999888');
    });

    it('GET /api/v1/healthcare/hospitals/:id/services should list services of the hospital', async () => {
      const res = await request(app).get(`/api/v1/healthcare/hospitals/${createdHospitalId}/services`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.services.length).toBeGreaterThanOrEqual(2);
    });

    it('POST /api/v1/healthcare/hospitals/:id/services should add a service to the hospital', async () => {
      const res = await request(app)
        .post(`/api/v1/healthcare/hospitals/${createdHospitalId}/services`)
        .send({
          service_name: 'Diagnostic Blood Tests',
          description: 'Basic blood sugar and hemoglobin testing',
          available: true,
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.service_name).toBe('Diagnostic Blood Tests');
      expect(res.body.data.hospital_id).toBe(createdHospitalId);
    });
  });

  // ==========================================================================
  // 5. Veterinary Hospitals (/api/v1/healthcare/veterinary)
  // ==========================================================================
  describe('Veterinary Hospitals Endpoints (/api/v1/healthcare/veterinary)', () => {
    it('GET /api/v1/healthcare/veterinary should return only animal healthcare centers', async () => {
      const res = await request(app).get('/api/v1/healthcare/veterinary');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      const facilities = res.body.data.facilities;
      expect(facilities.every((f) => f.type === 'animal')).toBe(true);
    });

    it('POST /api/v1/healthcare/veterinary should create a new veterinary clinic', async () => {
      const newVetPayload = {
        name: 'Wada Block Veterinary Dispensary',
        address: 'Bhiwandi-Wada Road',
        state: 'Maharashtra',
        district: 'Palghar',
        village: 'Wada',
        latitude: 19.654,
        longitude: 73.138,
        phone: '02526-271234',
        email: 'vet.wada@maharashtra.gov.in',
        is_emergency: true,
        services: [
          'Livestock Deworming Drive',
          'Goat & Sheep Peste des Petits Ruminants (PPR) Vaccination',
        ],
      };

      const res = await request(app)
        .post('/api/v1/healthcare/veterinary')
        .send(newVetPayload);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.name).toBe('Wada Block Veterinary Dispensary');
      expect(res.body.data.type).toBe('animal');
      expect(res.body.data.services.length).toBe(2);

      createdVetId = res.body.data.id;
    });

    it('GET /api/v1/healthcare/veterinary/:id should return details of veterinary hospital', async () => {
      const res = await request(app).get(`/api/v1/healthcare/veterinary/${createdVetId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdVetId);
      expect(res.body.data.type).toBe('animal');
    });

    it('PUT /api/v1/healthcare/veterinary/:id should update veterinary hospital details', async () => {
      const res = await request(app)
        .put(`/api/v1/healthcare/veterinary/${createdVetId}`)
        .send({ phone: '02526-999111' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.phone).toBe('02526-999111');
    });
  });

  // ==========================================================================
  // 6. Healthcare Services Endpoints (/api/v1/healthcare/services)
  // ==========================================================================
  describe('Healthcare Services Endpoints (/api/v1/healthcare/services)', () => {
    it('GET /api/v1/healthcare/services/catalog should return curated rural health & vet programs', async () => {
      const res = await request(app).get('/api/v1/healthcare/services/catalog');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const hasAyushman = res.body.data.some((p) => p.id === 'ayushman-arogya-mandir');
      const hasLivestockVac = res.body.data.some((p) => p.id === 'livestock-vaccination-mission');
      expect(hasAyushman).toBe(true);
      expect(hasLivestockVac).toBe(true);
    });

    it('GET /api/v1/healthcare/services should list services joined with hospital data', async () => {
      const res = await request(app).get('/api/v1/healthcare/services');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('services');
      expect(Array.isArray(res.body.data.services)).toBe(true);
      expect(res.body.data.services.length).toBeGreaterThan(0);

      const first = res.body.data.services[0];
      expect(first).toHaveProperty('service_name');
      expect(first).toHaveProperty('hospital');
    });

    it('GET /api/v1/healthcare/services with search term filter', async () => {
      const res = await request(app).get('/api/v1/healthcare/services?search=vaccination');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.services.length).toBeGreaterThan(0);
    });

    it('POST /api/v1/healthcare/services should create a new standalone service', async () => {
      const res = await request(app)
        .post('/api/v1/healthcare/services')
        .send({
          hospital_id: createdHospitalId,
          service_name: 'Snakebite Emergency ICU Bed',
          description: 'Dedicated observation bed with anti-venom vial stocks and ventilator support',
          available: true,
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.service_name).toBe('Snakebite Emergency ICU Bed');
      expect(res.body.data.hospital_id).toBe(createdHospitalId);

      createdServiceId = res.body.data.id;
    });

    it('GET /api/v1/healthcare/services/:id should get service by ID', async () => {
      const res = await request(app).get(`/api/v1/healthcare/services/${createdServiceId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdServiceId);
      expect(res.body.data.service_name).toBe('Snakebite Emergency ICU Bed');
    });

    it('PUT /api/v1/healthcare/services/:id should update service', async () => {
      const res = await request(app)
        .put(`/api/v1/healthcare/services/${createdServiceId}`)
        .send({
          available: false,
          description: 'Temporarily out of stock',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.available).toBe(false);
      expect(res.body.data.description).toBe('Temporarily out of stock');
    });

    it('DELETE /api/v1/healthcare/services/:id should remove the service', async () => {
      const res = await request(app).delete(`/api/v1/healthcare/services/${createdServiceId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deleted).toBe(true);

      // Verify 404 after deletion
      const checkRes = await request(app).get(`/api/v1/healthcare/services/${createdServiceId}`);
      expect(checkRes.statusCode).toEqual(404);
    });
  });

  // ==========================================================================
  // 7. Cleanup & Teardown
  // ==========================================================================
  describe('Cleanup Created Test Facilities', () => {
    it('DELETE /api/v1/healthcare/hospitals/:id?hard=true should permanently remove test hospital', async () => {
      if (createdHospitalId) {
        const res = await request(app).delete(`/api/v1/healthcare/hospitals/${createdHospitalId}?hard=true`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
      }
    });

    it('DELETE /api/v1/healthcare/veterinary/:id?hard=true should permanently remove test veterinary hospital', async () => {
      if (createdVetId) {
        const res = await request(app).delete(`/api/v1/healthcare/veterinary/${createdVetId}?hard=true`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
      }
    });
  });
});

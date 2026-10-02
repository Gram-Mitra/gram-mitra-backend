const express = require('express');

const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const superstitionRoutes = require('./superstition.routes');
const healthcareRoutes = require('./healthcare.routes');
const problemRoutes = require('./problem.routes');
const voiceRoutes = require('./voice.routes');
const schemeRoutes = require('./scheme.routes');
const marketplaceRoutes = require('./marketplace.routes');
const ngoRoutes = require('./ngo.routes');

const router = express.Router();

// Mount modules
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/superstitions', superstitionRoutes);
router.use('/superstition', superstitionRoutes);
router.use('/myths', superstitionRoutes);
router.use('/myth', superstitionRoutes);
router.use('/healthcare', healthcareRoutes);
router.use('/village-problems', problemRoutes);
router.use('/problems', problemRoutes);
router.use('/voice', voiceRoutes);
router.use('/schemes', schemeRoutes);
router.use('/marketplace', marketplaceRoutes);
router.use('/ngos', ngoRoutes);
router.use('/ngo', ngoRoutes);

module.exports = router;

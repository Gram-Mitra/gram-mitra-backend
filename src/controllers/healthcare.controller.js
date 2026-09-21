const { sendSuccess } = require('../utils/response');

/**
 * 2. Healthcare Controller (Nearby Hospitals & Veterinary Services for humans and animals)
 */
const getNearbyFacilities = async (req, res, next) => {
  try {
    const { type, lat, lng } = req.query;
    return sendSuccess(
      res,
      { type: type || 'all', lat, lng, facilities: [] },
      'Healthcare & Veterinary facilities skeleton',
      200
    );
  } catch (error) {
    next(error);
  }
};

const getFacilityById = async (req, res, next) => {
  try {
    return sendSuccess(res, { id: req.params.id }, 'Facility detail skeleton', 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNearbyFacilities,
  getFacilityById,
};

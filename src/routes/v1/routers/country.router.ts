import express from 'express';

import {
    getCountries,
    getCountry,
    getStates
} from '../../../controllers/country.controller';

import advancedResults from '../../../middleware/adanced.mw';

const router = express.Router({ mergeParams: true });

import Country from '../../../models/Country.model'

import { protect, authorize } from '../../../middleware/auth.mw';
import { validateChannels as vcd } from '../../../middleware/header.mw'

router.get('/', vcd, advancedResults(Country), getCountries);
router.get('/:id', vcd, getCountry);
router.get('/states/:id', vcd, getStates);

export default router;